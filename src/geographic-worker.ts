import * as amqp from 'amqplib';
import { Channel, Connection, ConsumeMessage } from 'amqplib';
import axios from 'axios';
import { createLogger } from './simple-logger';
import {
  WorkerRegistration,
  GeographicLocation,
  CheckTask,
  ClaimRequest,
  ClaimResponse,
  RoutingKeyBuilder,
  EXCHANGES,
  QUEUE_PREFIXES
} from './geographic-hierarchy';
import { setupGeoFairConsumer } from './utils/geo-fair-consumer';

const logger = createLogger('geographic-worker');

export interface WorkerConfig {
  workerId: string;
  location: GeographicLocation;
  rabbitmqUrl: string;
  capabilities?: string[];
  version?: string;
}

export class GeographicWorker {
  private connection: amqp.Connection | null = null;
  private channelWrapper: amqp.ChannelModel | null = null;
  private channel: Channel | null = null;
  private registration: WorkerRegistration;
  private activeChecks = new Map<string, NodeJS.Timeout>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cachedIP: string | null = null;
  private cachedIPTime: number = 0;
  private checksCompleted: number = 0;
  private totalPoints: number = 0;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly CHECK_TIMEOUT = 30000; // 30 seconds
  private readonly CLAIM_TIMEOUT = 2000; // 2 seconds
  
  constructor(private config: WorkerConfig) {
    this.registration = {
      workerId: config.workerId,
      location: config.location,
      capabilities: config.capabilities || ['http', 'https'],
      version: config.version || '1.0.0',
      registeredAt: Date.now(),
      lastHeartbeat: Date.now()
    };
  }
  
  async start() {
    try {
      // Connect to RabbitMQ
      await this.connectToRabbitMQ();
      
      // Setup exchanges first (before registration)
      await this.setupExchanges();
      
      // Setup queues and bindings
      await this.setupQueues();
      
      // Register with scheduler (after exchanges exist)
      await this.register();
      
      // Start heartbeat
      this.startHeartbeat();
      
      // Start listening for checks
      await this.listenForChecks();
      
      logger.info(`✅ Worker ${this.config.workerId} started`, {
        location: this.config.location
      });
    } catch (error: any) {
      logger.error('Failed to start worker', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  }
  
  
  private async connectToRabbitMQ() {
    this.channelWrapper = await amqp.connect(this.config.rabbitmqUrl);
    this.connection = this.channelWrapper.connection;
    
    this.channelWrapper.on('error', (err) => {
      logger.error('RabbitMQ connection error', err);
      this.reconnect();
    });
    
    this.channelWrapper.on('close', () => {
      logger.warn('RabbitMQ connection closed');
      this.reconnect();
    });
    
    this.channel = await this.channelWrapper.createChannel();
    logger.info('✅ Connected to RabbitMQ');
  }
  
  private async reconnect() {
    logger.info('Attempting to reconnect...');
    setTimeout(() => this.start(), 5000);
  }
  
  private async register() {
    if (!this.channel) throw new Error('Channel not initialized');
    
    let attempts = 0;
    const maxAttempts = 10;
    const ackTimeoutMs = 60000; // 60 seconds per attempt
    
    while (attempts < maxAttempts) {
      attempts++;
      logger.info(`📤 Sending registration (attempt ${attempts}/${maxAttempts})...`);
      
      // First setup ACK queue BEFORE sending registration
      const ackQueue = await this.channel.assertQueue('', { exclusive: true });
      const ackRoutingKey = `ack.${this.config.workerId}`;
      await this.channel.bindQueue(ackQueue.queue, EXCHANGES.REGISTRATION, ackRoutingKey);
      
      logger.info(`📮 ACK queue ready: ${ackQueue.queue} bound to ${EXCHANGES.REGISTRATION} with key: ${ackRoutingKey}`);
      
      // NOW send registration message (after ACK queue is ready)
      await this.channel.publish(
        EXCHANGES.REGISTRATION,
        'register',
        Buffer.from(JSON.stringify(this.registration))
      );
      
      logger.info(`⏳ Waiting for ACK on ${ackRoutingKey} (timeout: ${ackTimeoutMs/1000}s)`);
      
      const ackReceived = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          logger.warn(`⏱️ ACK timeout for ${this.config.workerId} after ${ackTimeoutMs/1000} seconds (attempt ${attempts}/${maxAttempts})`);
          resolve(false);
        }, ackTimeoutMs);
        
        this.channel!.consume(ackQueue.queue, (msg) => {
          logger.debug(`🔔 Message received on ACK queue`);
          if (msg) {
            try {
              logger.debug(`📦 Message details:`, {
                exchange: msg.fields.exchange,
                routingKey: msg.fields.routingKey,
                contentType: msg.properties.contentType
              });
              const ackData = JSON.parse(msg.content.toString());
              logger.info(`📨 Received ACK:`, ackData);
              clearTimeout(timeout);
              this.channel!.ack(msg);
              resolve(true);
            } catch (err) {
              logger.error(`❌ Failed to parse ACK message:`, err);
              logger.error(`Raw message:`, msg.content.toString());
            }
          } else {
            logger.debug(`⚠️ Null message received`);
          }
        }, { noAck: false }).then(result => {
          logger.debug(`👂 Consumer started with tag: ${result.consumerTag}`);
        });
      });
      
      if (ackReceived) {
        logger.info(`✅ Worker registered with scheduler after ${attempts} attempt(s)`);
        return;
      }
      
      // Clean up failed queue before retry
      await this.channel.deleteQueue(ackQueue.queue);
      
      if (attempts < maxAttempts) {
        logger.warn(`⚠️ Registration not acknowledged, retrying in 10 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    // After all attempts failed
    logger.error(`❌ Failed to register after ${maxAttempts} attempts. Worker will continue without scheduler confirmation.`);
    logger.info(`💪 Worker proceeding in standalone mode - will process any incoming check requests`);
    // Don't throw error - let worker continue running
  }
  
  private async setupExchanges() {
    if (!this.channel) throw new Error('Channel not initialized');
    
    // Create all needed exchanges
    const exchanges = [
      { name: 'tasks.regional', type: 'direct' },  // Add regional exchange
      { name: EXCHANGES.CHECKS, type: 'topic' },
      { name: EXCHANGES.CLAIMS, type: 'direct' },
      { name: EXCHANGES.RESULTS, type: 'topic' },
      { name: EXCHANGES.REGISTRATION, type: 'topic' },
      { name: EXCHANGES.HEARTBEATS, type: 'topic' }
    ];
    
    for (const ex of exchanges) {
      try {
        await this.channel.assertExchange(ex.name, ex.type, { durable: true });
        logger.debug(`Created/verified exchange ${ex.name} (${ex.type})`);
      } catch (error: any) {
        // If exchange exists with wrong type, log and continue
        if (error.message && error.message.includes('inequivalent')) {
          logger.warn(`Exchange ${ex.name} exists with different type, using existing`);
        } else {
          logger.error(`Failed to create exchange ${ex.name}:`, error.message);
          throw error;
        }
      }
    }
    
    logger.info('✅ Exchanges configured');
  }
  
  private async setupQueues() {
    if (!this.channel) throw new Error('Channel not initialized');
    
    // Create worker-specific check queue
    const checkQueue = `${QUEUE_PREFIXES.WORKER_CHECKS}${this.config.workerId}`;
    await this.channel.assertQueue(checkQueue, { durable: true });
    
    // Bind to regional exchange based on location
    const continent = this.config.location.continent || 'europe';
    await this.channel.bindQueue(checkQueue, 'tasks.regional', continent.toLowerCase());
    logger.info(`✅ Bound to regional exchange with key: ${continent.toLowerCase()}`);
    
    // Also bind country and city if available
    if (this.config.location.country) {
      const countryKey = `country.${this.config.location.country.toLowerCase().replace(/ /g, '-')}`;
      await this.channel.bindQueue(checkQueue, 'tasks.regional', countryKey);
      logger.debug(`Bound to country key: ${countryKey}`);
    }
    
    if (this.config.location.city) {
      const cityKey = `city.${this.config.location.city.toLowerCase().replace(/ /g, '-')}`;
      await this.channel.bindQueue(checkQueue, 'tasks.regional', cityKey);
      logger.debug(`Bound to city key: ${cityKey}`);
    }
    
    // Keep compatibility - bind to all relevant routing keys based on location
    const bindings = RoutingKeyBuilder.getWorkerBindings(this.config.location);
    for (const binding of bindings) {
      await this.channel.bindQueue(checkQueue, EXCHANGES.CHECKS, binding);
      logger.debug(`Compatibility binding: ${binding}`);
    }
    
    // Create claim response queue
    const claimQueue = `${QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
    await this.channel.assertQueue(claimQueue, { durable: true });
    await this.channel.bindQueue(claimQueue, EXCHANGES.CLAIMS, `response.${this.config.workerId}`);
    
    // Setup geo-fair consumer for regional and global queues
    try {
      const geoFairResult = await setupGeoFairConsumer(
        this.channel,
        this.config.workerId,
        this.config.location,
        async (task) => {
          // Process task received from geo-fair queues
          logger.info(`📥 [GEO-FAIR] Received check task ${task.id}`, {
            serviceId: task.serviceId,
            target: task.target,
            targetRegion: task.targetRegion
          });
          
          // Claim and execute the task
          const claimed = await this.claimTask(task);
          if (!claimed) {
            logger.warn(`Task ${task.id} claimed by another worker`);
            return;
          }
          
          await this.executeCheck(task);
        }
      );
      
      logger.info(`🌍 Geo-fair setup complete for region: ${geoFairResult.region}`);
    } catch (error) {
      logger.warn('Geo-fair queues not available, using standard routing only', error);
    }
    
    logger.info(`✅ Queues and bindings configured`);
  }
  
  private async listenForChecks() {
    if (!this.channel) throw new Error('Channel not initialized');
    
    const checkQueue = `${QUEUE_PREFIXES.WORKER_CHECKS}${this.config.workerId}`;
    
    await this.channel.consume(checkQueue, async (msg) => {
      if (!msg) return;
      
      try {
        const task: CheckTask = JSON.parse(msg.content.toString());
        
        logger.info(`📥 Received check task ${task.id}`, {
          serviceId: task.serviceId,
          target: task.target
        });
        
        // Claim the task
        const claimed = await this.claimTask(task);
        
        if (!claimed) {
          logger.info(`❌ Task ${task.id} claimed by another worker, skipping`);
          this.channel!.ack(msg);
          return;
        }
        
        // Execute the check
        const result = await this.executeCheck(task);
        
        // Send result
        await this.sendResult(task, result);
        
        this.channel!.ack(msg);
      } catch (error) {
        logger.error('Failed to process check', error);
        this.channel!.nack(msg, false, false);
      }
    });
    
    logger.info('👂 Listening for check tasks');
  }
  
  private async claimTask(task: CheckTask): Promise<boolean> {
    if (!this.channel) throw new Error('Channel not initialized');
    
    const claimRequest: ClaimRequest = {
      taskId: task.id,
      workerId: this.config.workerId,
      timestamp: Date.now()
    };
    
    // Send claim request
    await this.channel.publish(
      EXCHANGES.CLAIMS,
      'request',
      Buffer.from(JSON.stringify(claimRequest))
    );
    
    // Wait for response
    const claimQueue = `${QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logger.warn(`Claim timeout for task ${task.id}, skipping check`);
        resolve(false); // Don't proceed on timeout - scheduler didn't approve
      }, this.CLAIM_TIMEOUT);
      
      this.channel!.consume(claimQueue, async (msg) => {
        if (!msg) return;
        
        try {
          const response: ClaimResponse = JSON.parse(msg.content.toString());
          
          if (response.taskId === task.id) {
            clearTimeout(timeout);
            this.channel!.ack(msg);
            // Consumer will be cancelled automatically when channel closes
            // or we can store consumerTag from the promise result
            resolve(response.approved);
          }
        } catch (error) {
          logger.error('Failed to parse claim response', error);
        }
      }).then(({ consumerTag }) => {
        // Store consumerTag for later cancellation if needed
        setTimeout(() => {
          // Cancel consumer after timeout to clean up
          if (this.channel && consumerTag) {
            this.channel.cancel(consumerTag).catch(() => {});
          }
        }, this.CLAIM_TIMEOUT + 1000);
      });
    });
  }
  
  private async executeCheck(task: CheckTask): Promise<any> {
    const startTime = Date.now();
    
    try {
      const response = await axios({
        method: task.config?.method || 'GET',
        url: task.target,
        timeout: this.CHECK_TIMEOUT,
        headers: task.config?.headers || {},
        validateStatus: () => true // Accept any status
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.status < 400 ? 'up' : 'down',
        statusCode: response.status,
        responseTime,
        timestamp: Date.now(),
        workerId: this.config.workerId,
        location: this.config.location,
        region: this.config.location.city || this.config.location.country || this.config.location.region || 'unknown'
      };
    } catch (error: any) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        workerId: this.config.workerId,
        location: this.config.location,
        region: this.config.location.city || this.config.location.country || this.config.location.region || 'unknown',
        error: error.message || 'Check failed'
      };
    }
  }
  
  private async sendResult(task: CheckTask, result: any) {
    if (!this.channel) throw new Error('Channel not initialized');
    
    const fullResult = {
      taskId: task.id,
      serviceId: task.serviceId,
      nestId: task.nestId,
      ...result
    };
    
    await this.channel.publish(
      EXCHANGES.RESULTS,
      `check.${this.config.workerId}`,
      Buffer.from(JSON.stringify(fullResult)),
      { persistent: true }
    );
    
    logger.info(`✅ Result sent for task ${task.id}`, {
      status: result.status,
      responseTime: result.responseTime
    });
  }
  
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      // If channel is closed, try to recreate it
      if (!this.channel || this.channel.closed) {
        try {
          logger.warn('Channel not available for heartbeat, attempting to recreate...');
          if (this.channelWrapper && this.channelWrapper.connection) {
            this.channel = await this.channelWrapper.createChannel();
            logger.info('Channel recreated for heartbeat');
          } else {
            logger.error('Cannot recreate channel - no connection available');
            return;
          }
        } catch (error) {
          logger.error('Failed to recreate channel for heartbeat:', error);
          return;
        }
      }
      
      try {
        // Try to get public IP (cached for efficiency)
        let publicIP = null;
        if (!this.cachedIP || Date.now() - this.cachedIPTime > 3600000) { // Refresh every hour
          try {
            const response = await fetch('https://api.ipify.org?format=json', { 
              signal: AbortSignal.timeout(5000) 
            });
            const data = await response.json() as { ip: string };
            this.cachedIP = data.ip;
            this.cachedIPTime = Date.now();
            publicIP = data.ip;
          } catch (err) {
            // Use cached IP if fetch fails
            publicIP = this.cachedIP;
          }
        } else {
          publicIP = this.cachedIP;
        }

        const heartbeatData = {
          workerId: this.config.workerId,
          location: this.config.location,
          ip: publicIP, // Include IP for server-side geolocation
          timestamp: Date.now(),
          lastSeen: Date.now(),
          activeChecks: this.activeChecks.size,
          uptime: Date.now() - this.registration.registeredAt,
          // Required fields for HeartbeatVerifier
          region: this.config.location.region || 'unknown',
          version: this.config.version || '6.4.4',
          checksCompleted: 0, // TODO: track actual checks completed
          totalPoints: 0, // TODO: track actual points
          currentPeriodPoints: 0,
          earnings: {
            points: 0,
            estimatedUSD: 0,
            estimatedCrypto: 0
          }
        };
        
        await this.channel.publish(
          EXCHANGES.HEARTBEATS,
          'worker',
          Buffer.from(JSON.stringify(heartbeatData))
        );
        
        logger.info('💓 Heartbeat sent', {
          workerId: this.config.workerId,
          timestamp: heartbeatData.timestamp
        });
      } catch (error) {
        logger.error('Failed to send heartbeat', error);
      }
    }, this.HEARTBEAT_INTERVAL);
  }
  
  async stop() {
    logger.info('Stopping worker...');
    
    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Unregister from scheduler
    if (this.channel) {
      await this.channel.publish(
        EXCHANGES.REGISTRATION,
        'unregister',
        Buffer.from(JSON.stringify({ workerId: this.config.workerId }))
      );
    }
    
    // Close connections
    if (this.channel) await this.channel.close();
    if (this.channelWrapper) await this.channelWrapper.close();
    
    logger.info('Worker stopped');
  }
}