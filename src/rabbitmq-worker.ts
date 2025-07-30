import amqp from 'amqplib';
import { createLogger } from './shared/logger';
import { MonitoringService } from './services/monitoring';
import { localCache } from './local-cache';
import { locationDetector } from './worker-ant-location';
import { getMetricsCollector } from './shared/metrics';
import { UpdateManager } from './update-manager';
import { PointsTracker } from './points-tracker';
import { detectRegion } from './utils/region-detector';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as crypto from 'crypto';
import * as path from 'path';
// Redis not needed for standalone worker

// Types
interface Service {
  id: string;
  nestId: string;
  name: string;
  type: string;
  target: string;
  interval: number;
  config: Record<string, any>;
  monitoring: {
    regions: string[];
  };
}

interface WorkerCommand {
  command: string;
  data: any;
  timestamp: number;
}

// Configuration
const config = {
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  workerId: process.env.WORKER_ID || `worker-${Date.now()}`,
  region: process.env.WORKER_REGION || 'unknown',
};

// Services
const logger = createLogger('worker-rabbitmq');
const metricsCollector = getMetricsCollector('guardant_workers');

// Redis not needed - results sent via RabbitMQ

// Initialize monitoring service
let monitoringService: MonitoringService;

// Active monitoring intervals
const activeMonitoring = new Map<string, NodeJS.Timeout>();

// RabbitMQ channel reference
let rabbitmqChannel: amqp.Channel | null = null;

// Update manager
const updateManager = new UpdateManager();

// Worker stats
let checksCompleted = 0;

// Points tracker
let pointsTracker: PointsTracker;

// Worker keys
let workerKeys: { publicKey: string; privateKey: string } | null = null;

// Standalone workers don't restore state - they receive tasks from scheduler

// Sign data with worker's private key
function signData(data: string): string {
  if (!workerKeys) {
    logger.warn('Worker keys not available for signing');
    return '';
  }
  
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(workerKeys.privateKey, 'base64');
}

// Send heartbeat to main server
async function sendHeartbeat() {
  if (!rabbitmqChannel) return;
  
  try {
    const stats = pointsTracker?.getStats();
    const earnings = pointsTracker?.getEarningsEstimate();
    
    const heartbeat = {
      workerId: config.workerId,
      region: config.region,
      version: updateManager.getCurrentVersion() || 'unknown',
      lastSeen: Date.now(),
      checksCompleted,
      totalPoints: stats?.totalPoints || 0,
      currentPeriodPoints: stats?.currentPeriod.points || 0,
      earnings,
      timestamp: Date.now()
    };
    
    // Sign the heartbeat
    const heartbeatData = JSON.stringify(heartbeat);
    const signature = signData(heartbeatData);
    
    const signedHeartbeat = {
      ...heartbeat,
      signature
    };
    
    await rabbitmqChannel.assertExchange('worker_heartbeat', 'fanout');
    await rabbitmqChannel.publish(
      'worker_heartbeat',
      '',
      Buffer.from(JSON.stringify(signedHeartbeat)),
      { expiration: '60000' } // Message expires in 1 minute
    );
    
    logger.debug('💓 Heartbeat sent', { 
      version: heartbeat.version,
      points: stats?.totalPoints 
    });
  } catch (error) {
    logger.error('Failed to send heartbeat', error);
  }
}

// Generate or load worker keypair
async function getWorkerKeypair(): Promise<{ publicKey: string; privateKey: string }> {
  const keyDir = process.env.KEY_DIR || '.';
  const publicKeyPath = path.join(keyDir, 'worker.pub');
  const privateKeyPath = path.join(keyDir, 'worker.key');

  try {
    // Try to load existing keys
    const publicKey = await fs.readFile(publicKeyPath, 'utf8');
    const privateKey = await fs.readFile(privateKeyPath, 'utf8');
    logger.info('🔑 Loaded existing worker keys');
    return { publicKey, privateKey };
  } catch (error) {
    // Generate new keypair
    logger.info('🔐 Generating new worker keypair...');
    
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      }, async (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          // Save keys to files
          await fs.writeFile(publicKeyPath, publicKey, { mode: 0o644 });
          await fs.writeFile(privateKeyPath, privateKey, { mode: 0o600 });
          logger.info('✅ Worker keypair generated and saved');
          resolve({ publicKey, privateKey });
        } catch (saveError) {
          reject(saveError);
        }
      });
    });
  }
}

async function checkWorkerStatus(): Promise<boolean> {
  try {
    const response = await fetch(`https://guardant.me/api/public/workers/register/${config.workerId}/status`);
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    
    if (result.approved && result.rabbitmqUrl) {
      process.env.RABBITMQ_URL = result.rabbitmqUrl;
      config.rabbitmqUrl = result.rabbitmqUrl;
      logger.info('✅ Worker approved! Got RabbitMQ credentials');
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Failed to check worker status', error);
    return false;
  }
}

async function registerWorker() {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    logger.error('OWNER_EMAIL not set in environment');
    return false;
  }

  try {
    // First check if already registered and approved
    if (await checkWorkerStatus()) {
      return true;
    }
    
    logger.info('📝 Registering worker...', { workerId: config.workerId, ownerEmail });
    
    // Get or generate keypair
    workerKeys = await getWorkerKeypair();
    const { publicKey } = workerKeys;
    
    const registrationData = {
      workerId: config.workerId,
      hostname: os.hostname(),
      platform: os.platform(),
      ip: 'auto', // Will be detected by server
      publicKey: publicKey,
      ownerEmail: ownerEmail
    };

    const response = await fetch('https://guardant.me/api/public/workers/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Registration failed', { status: response.status, error });
      return false;
    }

    const result = await response.json();
    logger.info('✅ Worker registered successfully', { approved: result.approved });
    
    // If already approved, update RabbitMQ URL
    if (result.approved && result.rabbitmqUrl) {
      process.env.RABBITMQ_URL = result.rabbitmqUrl;
      config.rabbitmqUrl = result.rabbitmqUrl;
      logger.info('📡 Got RabbitMQ credentials from registration');
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to register worker', error);
    return false;
  }
}

async function startWorker() {
  try {
    logger.info('🚀 RabbitMQ Worker starting...', { workerId: config.workerId });
    
    // Load or generate worker keys (needed for signing)
    try {
      workerKeys = await getWorkerKeypair();
    } catch (error) {
      logger.error('Failed to load worker keys', error);
    }
    
    // Register worker if not already registered
    const registered = await registerWorker();
    
    // If not approved yet, wait for approval
    if (!config.rabbitmqUrl || config.rabbitmqUrl === 'amqp://localhost:5672') {
      logger.info('⏳ Worker registered but waiting for approval...');
      logger.info('📋 Please approve the worker in the admin panel');
      
      // Check status every 30 seconds
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        if (await checkWorkerStatus()) {
          logger.info('🎉 Worker approved! Starting...');
          break;
        }
        
        logger.info('⏳ Still waiting for approval...');
      }
    }
    
    // Initialize points tracker
    pointsTracker = new PointsTracker(config.workerId);

    // Detect location
    const location = await locationDetector.detectLocation();
    let region = location.region || config.region;
    
    // If still 'unknown' or 'auto', try IP-based detection
    if (region === 'unknown' || region === 'auto') {
      const detectedRegion = await detectRegion();
      if (detectedRegion !== 'auto') {
        region = detectedRegion;
        logger.info('🌍 Region detected via IP geolocation', { region });
      }
    }
    
    // Update config with detected region
    config.region = region;
    
    logger.info('📍 Worker location detected', { region, city: location.city });

    // Initialize monitoring service
    monitoringService = new MonitoringService(region);
    
    // Standalone workers receive all tasks from scheduler via RabbitMQ

    // Connect to RabbitMQ
    const connection = await amqp.connect(config.rabbitmqUrl);
    const channel = await connection.createChannel();
    rabbitmqChannel = channel; // Set global reference

    // Declare exchange and shared queue
    await channel.assertExchange('worker_commands', 'direct');
    
    // Use a shared queue for all workers (not exclusive)
    const queueName = 'monitoring_workers';
    const q = await channel.assertQueue(queueName, { 
      durable: true,
      exclusive: false  // Shared between workers
    });
    
    // Set prefetch to 1 to ensure fair distribution
    await channel.prefetch(1);
    
    // Bind queue to commands
    await channel.bindQueue(q.queue, 'worker_commands', 'monitor_service');
    await channel.bindQueue(q.queue, 'worker_commands', 'stop_monitoring');
    await channel.bindQueue(q.queue, 'worker_commands', 'check_service_once');
    await channel.bindQueue(q.queue, 'worker_commands', 'update_worker');
    await channel.bindQueue(q.queue, 'worker_commands', 'rebuild_worker');

    logger.info('✅ Connected to RabbitMQ and ready to receive commands');
    
    // Start heartbeat
    sendHeartbeat();
    setInterval(sendHeartbeat, 30000); // Send heartbeat every 30 seconds

    // Consume messages
    await channel.consume(q.queue, async (msg) => {
      if (!msg) return;

      try {
        const command: WorkerCommand = JSON.parse(msg.content.toString());
        logger.info('📨 Received command', { 
          command: command.command, 
          timestamp: command.timestamp 
        });

        switch (command.command) {
          case 'monitor_service':
            await handleMonitorService(command.data);
            break;
          
          case 'stop_monitoring':
            await handleStopMonitoring(command.data);
            break;
            
          case 'check_service_once':
            await handleSingleCheck(command.data);
            break;
            
          case 'update_worker':
            await updateManager.handleUpdateCommand(command.data);
            break;
            
          case 'rebuild_worker':
            await updateManager.handleRebuildCommand(command.data);
            break;
          
          default:
            logger.warn('Unknown command', { command: command.command });
        }

        channel.ack(msg);
      } catch (error) {
        logger.error('Failed to process command', error);
        channel.nack(msg, false, false);
      }
    });
    
    logger.info('🌍 Worker region', { region, queue: queueName });

    // Handle connection events
    connection.on('error', (error) => {
      logger.error('RabbitMQ connection error', error);
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed, exiting...');
      updateManager.cancel();
      pointsTracker?.cleanup();
      process.exit(1);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Shutting down worker...');
      updateManager.cancel();
      pointsTracker?.cleanup();
      connection.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      logger.info('Shutting down worker...');
      updateManager.cancel();
      pointsTracker?.cleanup();
      connection.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start worker', error);
    process.exit(1);
  }
}

async function handleMonitorService(data: any) {
  const { serviceId, nestId, type, target, config, regions, interval } = data;
  
  logger.info('🔍 Starting monitoring for service', { 
    serviceId, 
    type, 
    target, 
    interval 
  });

  // Create service object
  const service: Service = {
    id: serviceId,
    nestId,
    name: target,
    type,
    target,
    interval,
    config: config || {},
    monitoring: {
      regions: regions || [],
    },
  };

  // Stop existing monitoring if any
  const existingInterval = activeMonitoring.get(serviceId);
  if (existingInterval) {
    clearInterval(existingInterval);
  }

  // Start monitoring
  const checkService = async () => {
    try {
      const result = await monitoringService.checkService(service);
      
      // Results sent to local cache and RabbitMQ

      // Send result to local cache (which will forward to RabbitMQ)
      await localCache.storeCheckResult({
        id: `${serviceId}-${Date.now()}`,
        serviceId,
        nestId,
        timestamp: Date.now(),
        result,
      });

      logger.info('✅ Check completed', { 
        serviceId, 
        status: result.status 
      });

      // Record metrics
      metricsCollector.recordMonitoringCheck(
        nestId,
        serviceId,
        result.status,
        config.region || 'unknown',
        result.responseTime || 0,
        type
      );

    } catch (error) {
      logger.error('Check failed', error, { serviceId });
    }
  };

  // Run first check immediately
  await checkService();

  // Schedule periodic checks
  const intervalId = setInterval(checkService, interval * 1000);
  activeMonitoring.set(serviceId, intervalId);
}

async function handleStopMonitoring(data: any) {
  const { serviceId } = data;
  
  logger.info('🛑 Stopping monitoring for service', { serviceId });

  const interval = activeMonitoring.get(serviceId);
  if (interval) {
    clearInterval(interval);
    activeMonitoring.delete(serviceId);
    logger.info('✅ Monitoring stopped', { serviceId });
  } else {
    logger.warn('No active monitoring found', { serviceId });
  }
}

// Handle single check (from scheduler)
async function handleSingleCheck(data: any) {
  const { serviceId, nestId, type, target, config, regions, cacheKey } = data;
  
  logger.info('🔍 Performing single check', { serviceId, type, target });
  
  const service: Service = {
    id: serviceId,
    nestId,
    name: target,
    type,
    target,
    interval: 0, // Not used for single check
    config: config || {},
    monitoring: {
      regions: regions || [],
    },
  };
  
  try {
    const result = await monitoringService.checkService(service);
    
    // Results sent via RabbitMQ, not stored locally
    
    // Send result back to scheduler
    if (rabbitmqChannel) {
      await rabbitmqChannel.assertExchange('monitoring_results', 'direct');
      
      const resultMessage = JSON.stringify({
        serviceId,
        nestId,
        status: result.status,
        responseTime: result.responseTime,
        timestamp: Date.now(),
        workerId: config.workerId,
        region: config.region,
        cacheKey, // Include cache key for deduplication
      });
      
      await rabbitmqChannel.publish(
        'monitoring_results',
        'check_completed',
        Buffer.from(resultMessage),
        { persistent: true }
      );
    }
    
    logger.info('✅ Single check completed', { 
      serviceId, 
      status: result.status,
      responseTime: result.responseTime 
    });
    
    checksCompleted++;
    
    // Record points
    const points = pointsTracker.recordCheck(
      type,
      result.status === 'up',
      result.responseTime
    );
    
    logger.debug('💰 Points earned', { points, type });
    
    // Record metrics
    metricsCollector.recordMonitoringCheck(
      nestId,
      serviceId,
      result.status,
      config.region || 'unknown',
      result.responseTime || 0,
      type
    );
    
  } catch (error) {
    logger.error('Single check failed', error, { serviceId });
    
    // Send failure result to scheduler
    if (rabbitmqChannel) {
      const failureMessage = JSON.stringify({
        serviceId,
        nestId,
        status: 'error',
        error: error.message,
        timestamp: Date.now(),
        workerId: config.workerId,
      });
      
      await rabbitmqChannel.publish(
        'monitoring_results',
        'check_completed',
        Buffer.from(failureMessage),
        { persistent: true }
      );
    }
  }
}

// Start the worker
startWorker().catch((error) => {
  logger.error('Worker startup failed', error);
  process.exit(1);
});