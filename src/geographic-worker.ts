import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import Redis from 'ioredis';
import axios from 'axios';
import { createLogger } from './logger';
import {
  WorkerRegistration,
  GeographicLocation,
  CheckTask,
  ClaimRequest,
  ClaimResponse,
  RoutingKeyBuilder,
  EXCHANGES,
  QUEUE_PREFIXES
} from '../../shared/geographic-hierarchy';

const logger = createLogger('geographic-worker');

export interface WorkerConfig {
  workerId: string;
  location: GeographicLocation;
  redisUrl: string;
  rabbitmqUrl: string;
  capabilities?: string[];
  version?: string;
}

export class GeographicWorker {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private redis: Redis | null = null;
  private registration: WorkerRegistration;
  private activeChecks = new Map<string, NodeJS.Timeout>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
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
      // Connect to Redis
      await this.connectToRedis();
      
      // Connect to RabbitMQ
      await this.connectToRabbitMQ();
      
      // Register with scheduler
      await this.register();
      
      // Setup queues and bindings
      await this.setupQueues();
      
      // Start heartbeat
      this.startHeartbeat();
      
      // Start listening for checks
      await this.listenForChecks();
      
      logger.info(`✅ Worker ${this.config.workerId} started`, {
        location: this.config.location
      });
    } catch (error) {
      logger.error('Failed to start worker', error);
      throw error;
    }
  }
  
  private async connectToRedis() {
    const redisUrl = new URL(this.config.redisUrl);
    this.redis = new Redis({
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port) || 6379,
      password: redisUrl.password || undefined,
    });
    
    await this.redis.ping();
    logger.info('✅ Connected to Redis');
  }
  
  private async connectToRabbitMQ() {
    this.connection = await amqp.connect(this.config.rabbitmqUrl);
    
    this.connection.on('error', (err) => {
      logger.error('RabbitMQ connection error', err);
      this.reconnect();
    });
    
    this.connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
      this.reconnect();
    });
    
    this.channel = await this.connection.createChannel();
    logger.info('✅ Connected to RabbitMQ');
  }
  
  private async reconnect() {
    logger.info('Attempting to reconnect...');
    setTimeout(() => this.start(), 5000);
  }
  
  private async register() {
    if (!this.channel) throw new Error('Channel not initialized');
    
    // Send registration message
    await this.channel.publish(
      EXCHANGES.REGISTRATION,
      'register',
      Buffer.from(JSON.stringify(this.registration))
    );
    
    // Wait for acknowledgment
    const ackQueue = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(ackQueue.queue, EXCHANGES.REGISTRATION, `ack.${this.config.workerId}`);
    
    const ackReceived = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);
      
      this.channel!.consume(ackQueue.queue, (msg) => {
        if (msg) {
          clearTimeout(timeout);
          this.channel!.ack(msg);
          resolve(true);
        }
      });
    });
    
    if (!ackReceived) {
      throw new Error('Registration not acknowledged by scheduler');
    }
    
    logger.info(`✅ Worker registered with scheduler`);
  }
  
  private async setupQueues() {
    if (!this.channel) throw new Error('Channel not initialized');
    
    // Assert exchanges
    await this.channel.assertExchange(EXCHANGES.CHECKS, 'topic', { durable: true });
    await this.channel.assertExchange(EXCHANGES.CLAIMS, 'direct', { durable: true });
    await this.channel.assertExchange(EXCHANGES.RESULTS, 'topic', { durable: true });
    
    // Create worker-specific check queue
    const checkQueue = `${QUEUE_PREFIXES.WORKER_CHECKS}${this.config.workerId}`;
    await this.channel.assertQueue(checkQueue, { durable: true });
    
    // Bind to all relevant routing keys based on location
    const bindings = RoutingKeyBuilder.getWorkerBindings(this.config.location);
    for (const binding of bindings) {
      await this.channel.bindQueue(checkQueue, EXCHANGES.CHECKS, binding);
      logger.debug(`Bound to routing key: ${binding}`);
    }
    
    // Create claim response queue
    const claimQueue = `${QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
    await this.channel.assertQueue(claimQueue, { durable: true });
    await this.channel.bindQueue(claimQueue, EXCHANGES.CLAIMS, `response.${this.config.workerId}`);
    
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
        logger.warn(`Claim timeout for task ${task.id}, proceeding anyway`);
        resolve(true); // Proceed if no response (fail-safe)
      }, this.CLAIM_TIMEOUT);
      
      const consumer = this.channel!.consume(claimQueue, (msg) => {
        if (!msg) return;
        
        try {
          const response: ClaimResponse = JSON.parse(msg.content.toString());
          
          if (response.taskId === task.id) {
            clearTimeout(timeout);
            this.channel!.ack(msg);
            this.channel!.cancel(consumer.consumerTag);
            resolve(response.approved);
          }
        } catch (error) {
          logger.error('Failed to parse claim response', error);
        }
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
        location: this.config.location
      };
    } catch (error: any) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        workerId: this.config.workerId,
        location: this.config.location,
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
      if (!this.channel) return;
      
      try {
        await this.channel.publish(
          EXCHANGES.HEARTBEATS,
          'worker',
          Buffer.from(JSON.stringify({
            workerId: this.config.workerId,
            location: this.config.location,
            timestamp: Date.now(),
            activeChecks: this.activeChecks.size,
            uptime: Date.now() - this.registration.registeredAt
          }))
        );
        
        logger.debug('💓 Heartbeat sent');
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
    if (this.connection) await this.connection.close();
    if (this.redis) this.redis.disconnect();
    
    logger.info('Worker stopped');
  }
}