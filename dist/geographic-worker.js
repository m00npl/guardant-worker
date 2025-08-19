"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeographicWorker = void 0;
const amqp = __importStar(require("amqplib"));
const axios_1 = __importDefault(require("axios"));
const simple_logger_1 = require("./simple-logger");
const geographic_hierarchy_1 = require("./geographic-hierarchy");
const geo_fair_consumer_1 = require("./utils/geo-fair-consumer");
const logger = (0, simple_logger_1.createLogger)('geographic-worker');
class GeographicWorker {
    config;
    connection = null;
    channelWrapper = null;
    channel = null;
    registration;
    activeChecks = new Map();
    heartbeatInterval = null;
    cachedIP = null;
    cachedIPTime = 0;
    checksCompleted = 0;
    totalPoints = 0;
    HEARTBEAT_INTERVAL = 30000;
    CHECK_TIMEOUT = 30000;
    CLAIM_TIMEOUT = 2000;
    constructor(config) {
        this.config = config;
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
            await this.connectToRabbitMQ();
            await this.setupExchanges();
            await this.setupQueues();
            await this.register();
            this.startHeartbeat();
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
    async reconnect() {
        logger.info('Attempting to reconnect...');
        setTimeout(() => this.start(), 5000);
    }
    async register() {
        if (!this.channel)
            throw new Error('Channel not initialized');
        let attempts = 0;
        const maxAttempts = 10;
        const ackTimeoutMs = 60000;
        while (attempts < maxAttempts) {
            attempts++;
            logger.info(`📤 Sending registration (attempt ${attempts}/${maxAttempts})...`);
            const ackQueue = await this.channel.assertQueue('', { exclusive: true });
            const ackRoutingKey = `ack.${this.config.workerId}`;
            await this.channel.bindQueue(ackQueue.queue, geographic_hierarchy_1.EXCHANGES.REGISTRATION, ackRoutingKey);
            logger.info(`📮 ACK queue ready: ${ackQueue.queue} bound to ${geographic_hierarchy_1.EXCHANGES.REGISTRATION} with key: ${ackRoutingKey}`);
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
            await this.channel.deleteQueue(ackQueue.queue);
            if (attempts < maxAttempts) {
                logger.warn(`⚠️ Registration not acknowledged, retrying in 10 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }
        logger.error(`❌ Failed to register after ${maxAttempts} attempts. Worker will continue without scheduler confirmation.`);
        logger.info(`💪 Worker proceeding in standalone mode - will process any incoming check requests`);
    }
    async setupExchanges() {
        if (!this.channel)
            throw new Error('Channel not initialized');
        const exchanges = [
            { name: 'tasks.regional', type: 'direct' },
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
        const checkQueue = `${geographic_hierarchy_1.QUEUE_PREFIXES.WORKER_CHECKS}${this.config.workerId}`;
        await this.channel.assertQueue(checkQueue, { durable: true });
        const continent = this.config.location.continent || 'europe';
        await this.channel.bindQueue(checkQueue, 'tasks.regional', continent.toLowerCase());
        logger.info(`✅ Bound to regional exchange with key: ${continent.toLowerCase()}`);
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
        const bindings = geographic_hierarchy_1.RoutingKeyBuilder.getWorkerBindings(this.config.location);
        for (const binding of bindings) {
            await this.channel.bindQueue(checkQueue, geographic_hierarchy_1.EXCHANGES.CHECKS, binding);
            logger.debug(`Compatibility binding: ${binding}`);
        }
        const claimQueue = `${geographic_hierarchy_1.QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
        await this.channel.assertQueue(claimQueue, { durable: true });
        await this.channel.bindQueue(claimQueue, geographic_hierarchy_1.EXCHANGES.CLAIMS, `response.${this.config.workerId}`);
        try {
            const geoFairResult = await (0, geo_fair_consumer_1.setupGeoFairConsumer)(this.channel, this.config.workerId, this.config.location, async (task) => {
                logger.info(`📥 [GEO-FAIR] Received check task ${task.id}`, {
                    serviceId: task.serviceId,
                    target: task.target,
                    targetRegion: task.targetRegion
                });
                const claimed = await this.claimTask(task);
                if (!claimed) {
                    logger.warn(`Task ${task.id} claimed by another worker`);
                    return;
                }
                await this.executeCheck(task);
            });
            logger.info(`🌍 Geo-fair setup complete for region: ${geoFairResult.region}`);
        }
        catch (error) {
            logger.warn('Geo-fair queues not available, using standard routing only', error);
        }
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
                const claimed = await this.claimTask(task);
                if (!claimed) {
                    logger.info(`❌ Task ${task.id} claimed by another worker, skipping`);
                    this.channel.ack(msg);
                    return;
                }
                const result = await this.executeCheck(task);
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
        await this.channel.publish(geographic_hierarchy_1.EXCHANGES.CLAIMS, 'request', Buffer.from(JSON.stringify(claimRequest)));
        const claimQueue = `${geographic_hierarchy_1.QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                logger.warn(`Claim timeout for task ${task.id}, skipping check`);
                resolve(false);
            }, this.CLAIM_TIMEOUT);
            this.channel.consume(claimQueue, async (msg) => {
                if (!msg)
                    return;
                try {
                    const response = JSON.parse(msg.content.toString());
                    if (response.taskId === task.id) {
                        clearTimeout(timeout);
                        this.channel.ack(msg);
                        resolve(response.approved);
                    }
                }
                catch (error) {
                    logger.error('Failed to parse claim response', error);
                }
            }).then(({ consumerTag }) => {
                setTimeout(() => {
                    if (this.channel && consumerTag) {
                        this.channel.cancel(consumerTag).catch(() => { });
                    }
                }, this.CLAIM_TIMEOUT + 1000);
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
                validateStatus: () => true
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
        }
        catch (error) {
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
                let publicIP = null;
                if (!this.cachedIP || Date.now() - this.cachedIPTime > 3600000) {
                    try {
                        const response = await fetch('https://api.ipify.org?format=json', {
                            signal: AbortSignal.timeout(5000)
                        });
                        const data = await response.json();
                        this.cachedIP = data.ip;
                        this.cachedIPTime = Date.now();
                        publicIP = data.ip;
                    }
                    catch (err) {
                        publicIP = this.cachedIP;
                    }
                }
                else {
                    publicIP = this.cachedIP;
                }
                const heartbeatData = {
                    workerId: this.config.workerId,
                    location: this.config.location,
                    ip: publicIP,
                    timestamp: Date.now(),
                    lastSeen: Date.now(),
                    activeChecks: this.activeChecks.size,
                    uptime: Date.now() - this.registration.registeredAt,
                    region: this.config.location.region || 'unknown',
                    version: this.config.version || '6.4.4',
                    checksCompleted: 0,
                    totalPoints: 0,
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
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.channel) {
            await this.channel.publish(geographic_hierarchy_1.EXCHANGES.REGISTRATION, 'unregister', Buffer.from(JSON.stringify({ workerId: this.config.workerId })));
        }
        if (this.channel)
            await this.channel.close();
        if (this.channelWrapper)
            await this.channelWrapper.close();
        logger.info('Worker stopped');
    }
}
exports.GeographicWorker = GeographicWorker;
