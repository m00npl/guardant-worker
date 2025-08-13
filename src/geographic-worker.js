"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeographicWorker = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
const geographic_hierarchy_1 = require("./geographic-hierarchy");
const logger = (0, logger_1.createLogger)('geographic-worker');
class GeographicWorker {
    constructor(config) {
        this.config = config;
        this.connection = null;
        this.channel = null;
        this.activeChecks = new Map();
        this.heartbeatInterval = null;
        this.HEARTBEAT_INTERVAL = 30000; // 30 seconds
        this.CHECK_TIMEOUT = 30000; // 30 seconds
        this.CLAIM_TIMEOUT = 2000; // 2 seconds
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
        }
        catch (error) {
            logger.error('Failed to start worker', {
                message: error.message,
                stack: error.stack,
                code: error.code
            });
            throw error;
        }
    }
    async connectToRabbitMQ() {
        this.connection = await amqplib_1.default.connect(this.config.rabbitmqUrl);
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
    async reconnect() {
        logger.info('Attempting to reconnect...');
        setTimeout(() => this.start(), 5000);
    }
    async register() {
        if (!this.channel)
            throw new Error('Channel not initialized');
        let attempts = 0;
        const maxAttempts = 10;
        const ackTimeoutMs = 60000; // 60 seconds per attempt
        while (attempts < maxAttempts) {
            attempts++;
            logger.info(`📤 Sending registration (attempt ${attempts}/${maxAttempts})...`);
            // First setup ACK queue BEFORE sending registration
            const ackQueue = await this.channel.assertQueue('', { exclusive: true });
            const ackRoutingKey = `ack.${this.config.workerId}`;
            await this.channel.bindQueue(ackQueue.queue, geographic_hierarchy_1.EXCHANGES.REGISTRATION, ackRoutingKey);
            logger.info(`📮 ACK queue ready: ${ackQueue.queue} bound to ${geographic_hierarchy_1.EXCHANGES.REGISTRATION} with key: ${ackRoutingKey}`);
            // NOW send registration message (after ACK queue is ready)
            await this.channel.publish(geographic_hierarchy_1.EXCHANGES.REGISTRATION, 'register', Buffer.from(JSON.stringify(this.registration)));
            logger.info(`⏳ Waiting for ACK on ${ackRoutingKey} (timeout: ${ackTimeoutMs / 1000}s)`);
            const ackReceived = await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    logger.warn(`⏱️ ACK timeout for ${this.config.workerId} after ${ackTimeoutMs / 1000} seconds (attempt ${attempts}/${maxAttempts})`);
                    resolve(false);
                }, ackTimeoutMs);
                this.channel.consume(ackQueue.queue, (msg) => {
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
                            this.channel.ack(msg);
                            resolve(true);
                        }
                        catch (err) {
                            logger.error(`❌ Failed to parse ACK message:`, err);
                            logger.error(`Raw message:`, msg.content.toString());
                        }
                    }
                    else {
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
    async setupExchanges() {
        if (!this.channel)
            throw new Error('Channel not initialized');
        // Create all needed exchanges
        const exchanges = [
            { name: geographic_hierarchy_1.EXCHANGES.CHECKS, type: 'topic' },
            { name: geographic_hierarchy_1.EXCHANGES.CLAIMS, type: 'direct' },
            { name: geographic_hierarchy_1.EXCHANGES.RESULTS, type: 'topic' },
            { name: geographic_hierarchy_1.EXCHANGES.REGISTRATION, type: 'topic' },
            { name: geographic_hierarchy_1.EXCHANGES.HEARTBEATS, type: 'topic' }
        ];
        for (const ex of exchanges) {
            try {
                await this.channel.assertExchange(ex.name, ex.type, { durable: true });
                logger.debug(`Created/verified exchange ${ex.name} (${ex.type})`);
            }
            catch (error) {
                // If exchange exists with wrong type, log and continue
                if (error.message && error.message.includes('inequivalent')) {
                    logger.warn(`Exchange ${ex.name} exists with different type, using existing`);
                }
                else {
                    logger.error(`Failed to create exchange ${ex.name}:`, error.message);
                    throw error;
                }
            }
        }
        logger.info('✅ Exchanges configured');
    }
    async setupQueues() {
        if (!this.channel)
            throw new Error('Channel not initialized');
        // Create worker-specific check queue
        const checkQueue = `${geographic_hierarchy_1.QUEUE_PREFIXES.WORKER_CHECKS}${this.config.workerId}`;
        await this.channel.assertQueue(checkQueue, { durable: true });
        // Bind to all relevant routing keys based on location
        const bindings = geographic_hierarchy_1.RoutingKeyBuilder.getWorkerBindings(this.config.location);
        for (const binding of bindings) {
            await this.channel.bindQueue(checkQueue, geographic_hierarchy_1.EXCHANGES.CHECKS, binding);
            logger.debug(`Bound to routing key: ${binding}`);
        }
        // Create claim response queue
        const claimQueue = `${geographic_hierarchy_1.QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
        await this.channel.assertQueue(claimQueue, { durable: true });
        await this.channel.bindQueue(claimQueue, geographic_hierarchy_1.EXCHANGES.CLAIMS, `response.${this.config.workerId}`);
        logger.info(`✅ Queues and bindings configured`);
    }
    async listenForChecks() {
        if (!this.channel)
            throw new Error('Channel not initialized');
        const checkQueue = `${geographic_hierarchy_1.QUEUE_PREFIXES.WORKER_CHECKS}${this.config.workerId}`;
        await this.channel.consume(checkQueue, async (msg) => {
            if (!msg)
                return;
            try {
                const task = JSON.parse(msg.content.toString());
                logger.info(`📥 Received check task ${task.id}`, {
                    serviceId: task.serviceId,
                    target: task.target
                });
                // Claim the task
                const claimed = await this.claimTask(task);
                if (!claimed) {
                    logger.info(`❌ Task ${task.id} claimed by another worker, skipping`);
                    this.channel.ack(msg);
                    return;
                }
                // Execute the check
                const result = await this.executeCheck(task);
                // Send result
                await this.sendResult(task, result);
                this.channel.ack(msg);
            }
            catch (error) {
                logger.error('Failed to process check', error);
                this.channel.nack(msg, false, false);
            }
        });
        logger.info('👂 Listening for check tasks');
    }
    async claimTask(task) {
        if (!this.channel)
            throw new Error('Channel not initialized');
        const claimRequest = {
            taskId: task.id,
            workerId: this.config.workerId,
            timestamp: Date.now()
        };
        // Send claim request
        await this.channel.publish(geographic_hierarchy_1.EXCHANGES.CLAIMS, 'request', Buffer.from(JSON.stringify(claimRequest)));
        // Wait for response
        const claimQueue = `${geographic_hierarchy_1.QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                logger.warn(`Claim timeout for task ${task.id}, proceeding anyway`);
                resolve(true); // Proceed if no response (fail-safe)
            }, this.CLAIM_TIMEOUT);
            const consumer = this.channel.consume(claimQueue, (msg) => {
                if (!msg)
                    return;
                try {
                    const response = JSON.parse(msg.content.toString());
                    if (response.taskId === task.id) {
                        clearTimeout(timeout);
                        this.channel.ack(msg);
                        this.channel.cancel(consumer.consumerTag);
                        resolve(response.approved);
                    }
                }
                catch (error) {
                    logger.error('Failed to parse claim response', error);
                }
            });
        });
    }
    async executeCheck(task) {
        const startTime = Date.now();
        try {
            const response = await (0, axios_1.default)({
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
        }
        catch (error) {
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
    async sendResult(task, result) {
        if (!this.channel)
            throw new Error('Channel not initialized');
        const fullResult = {
            taskId: task.id,
            serviceId: task.serviceId,
            nestId: task.nestId,
            ...result
        };
        await this.channel.publish(geographic_hierarchy_1.EXCHANGES.RESULTS, `check.${this.config.workerId}`, Buffer.from(JSON.stringify(fullResult)), { persistent: true });
        logger.info(`✅ Result sent for task ${task.id}`, {
            status: result.status,
            responseTime: result.responseTime
        });
    }
    startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            if (!this.channel)
                return;
            try {
                const heartbeatData = {
                    workerId: this.config.workerId,
                    location: this.config.location,
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
                await this.channel.publish(geographic_hierarchy_1.EXCHANGES.HEARTBEATS, 'worker', Buffer.from(JSON.stringify(heartbeatData)));
                logger.debug('💓 Heartbeat sent');
            }
            catch (error) {
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
            await this.channel.publish(geographic_hierarchy_1.EXCHANGES.REGISTRATION, 'unregister', Buffer.from(JSON.stringify({ workerId: this.config.workerId })));
        }
        // Close connections
        if (this.channel)
            await this.channel.close();
        if (this.connection)
            await this.connection.close();
        logger.info('Worker stopped');
    }
}
exports.GeographicWorker = GeographicWorker;
//# sourceMappingURL=geographic-worker.js.map