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
const amqplib_1 = __importDefault(require("amqplib"));
const logger_1 = require("./shared/logger");
const monitoring_1 = require("./services/monitoring");
const worker_ant_location_1 = require("./worker-ant-location");
const metrics_1 = require("./shared/metrics");
const update_manager_1 = require("./update-manager");
const points_tracker_1 = require("./points-tracker");
const region_detector_1 = require("./utils/region-detector");
const fs = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const worker_id_generator_1 = require("./worker-id-generator");
let config = {
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    workerId: '',
    region: process.env.WORKER_REGION || 'unknown',
};
const logger = (0, logger_1.createLogger)('worker-rabbitmq');
const metricsCollector = (0, metrics_1.getMetricsCollector)('guardant_workers');
let monitoringService;
const activeMonitoring = new Map();
let rabbitmqChannel = null;
const updateManager = new update_manager_1.UpdateManager();
let checksCompleted = 0;
let checksFailed = 0;
let responseTimeSum = 0;
let pointsTracker;
let workerKeys = null;
let workerLocation = null;
function signData(data) {
    if (!workerKeys) {
        logger.warn('Worker keys not available for signing');
        return '';
    }
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(workerKeys.privateKey, 'base64');
}
async function sendLocationData() {
    if (!rabbitmqChannel || !config.workerId)
        return;
    try {
        const ip = await getPublicIP();
        const locationData = {
            workerId: config.workerId,
            ip: ip || 'unknown',
            location: workerLocation?.city && workerLocation?.country
                ? `${workerLocation.city}, ${workerLocation.country}`
                : 'auto',
            region: config.region,
            city: workerLocation?.city,
            country: workerLocation?.country,
            timestamp: Date.now()
        };
        await rabbitmqChannel.publish('monitoring.locations', 'worker', Buffer.from(JSON.stringify(locationData)));
        logger.debug('📍 Sent location data to worker-location service', { ip });
    }
    catch (error) {
        logger.error('Failed to send location data:', error);
    }
}
async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    }
    catch (error) {
        logger.error('Failed to get public IP:', error);
        return null;
    }
}
async function sendHeartbeat() {
    if (!rabbitmqChannel)
        return;
    try {
        const stats = pointsTracker?.getStats() || {
            totalPoints: 0,
            currentPeriod: { points: 0 }
        };
        const earnings = pointsTracker?.getEarningsEstimate() || {
            points: 0,
            estimatedUSD: 0,
            estimatedCrypto: 0
        };
        const successRate = checksCompleted > 0 ?
            ((checksCompleted - checksFailed) / checksCompleted) : 0.98;
        const avgResponseTime = responseTimeSum > 0 && checksCompleted > 0 ?
            Math.round(responseTimeSum / checksCompleted) : 150;
        const heartbeat = {
            workerId: config.workerId,
            region: config.region,
            version: updateManager.getCurrentVersion() || 'unknown',
            lastSeen: Date.now(),
            checksCompleted,
            totalPoints: stats.totalPoints,
            currentPeriodPoints: stats.currentPeriod.points,
            earnings,
            location: workerLocation,
            timestamp: Date.now(),
            metrics: {
                avgResponseTime,
                avgLatency: Math.round(avgResponseTime * 0.3),
                successRate,
                errorRate: 1 - successRate,
                uptime: successRate * 100,
                checksCompleted
            },
            stats: {
                checksCompleted,
                checksFailed,
                averageResponseTime: avgResponseTime,
                uptime: successRate * 100
            },
            lastActivity: Date.now()
        };
        const heartbeatData = JSON.stringify(heartbeat);
        const signature = signData(heartbeatData);
        const signedHeartbeat = {
            ...heartbeat,
            signature
        };
        if (heartbeat.location?.country === 'PL') {
            logger.info('🏙️ Sending Polish location', {
                city: heartbeat.location.city,
                cityBytes: Buffer.from(heartbeat.location.city).toString('hex')
            });
        }
        await rabbitmqChannel.assertExchange('worker_heartbeat', 'fanout');
        await rabbitmqChannel.publish('worker_heartbeat', '', Buffer.from(JSON.stringify(signedHeartbeat), 'utf8'), {
            expiration: '60000',
            contentType: 'application/json',
            contentEncoding: 'utf8'
        });
        logger.info('💓 Heartbeat sent', {
            version: heartbeat.version,
            points: stats?.totalPoints,
            region: config.region,
            workerId: config.workerId
        });
    }
    catch (error) {
        logger.error('Failed to send heartbeat', error);
    }
}
async function getWorkerKeypair() {
    const keyDir = process.env.KEY_DIR || '.';
    const publicKeyPath = path.join(keyDir, 'worker.pub');
    const privateKeyPath = path.join(keyDir, 'worker.key');
    try {
        const publicKey = await fs.readFile(publicKeyPath, 'utf8');
        const privateKey = await fs.readFile(privateKeyPath, 'utf8');
        logger.info('🔑 Loaded existing worker keys');
        return { publicKey, privateKey };
    }
    catch (error) {
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
                    await fs.writeFile(publicKeyPath, publicKey, { mode: 0o644 });
                    await fs.writeFile(privateKeyPath, privateKey, { mode: 0o600 });
                    logger.info('✅ Worker keypair generated and saved');
                    resolve({ publicKey, privateKey });
                }
                catch (saveError) {
                    reject(saveError);
                }
            });
        });
    }
}
async function saveWorkerCredentials(rabbitmqUrl) {
    try {
        const keyDir = process.env.KEY_DIR || '/keys';
        const credentialsFile = path.join(keyDir, 'rabbitmq-credentials');
        await fs.mkdir(keyDir, { recursive: true });
        await fs.writeFile(credentialsFile, rabbitmqUrl, { mode: 0o600 });
        logger.info('💾 Saved RabbitMQ credentials for worker');
    }
    catch (error) {
        logger.error('Failed to save credentials', error);
    }
}
async function loadWorkerCredentials() {
    try {
        const keyDir = process.env.KEY_DIR || '/keys';
        const credentialsFile = path.join(keyDir, 'rabbitmq-credentials');
        const credentials = await fs.readFile(credentialsFile, 'utf-8');
        if (credentials.trim()) {
            logger.info('📂 Loaded saved RabbitMQ credentials');
            return credentials.trim();
        }
    }
    catch (error) {
    }
    return null;
}
async function checkWorkerStatus() {
    try {
        logger.info('🔍 Checking worker status...');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const response = await fetch(`https://guardant.me/api/public/workers/register/${config.workerId}/status`, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'GuardAnt-Worker/1.0'
            }
        });
        clearTimeout(timeout);
        if (!response.ok) {
            logger.warn('Status check failed', { status: response.status });
            return false;
        }
        const result = await response.json();
        logger.info('📋 Status check result:', {
            approved: result.approved,
            hasRabbitMQ: !!result.rabbitmqUrl,
            rabbitmqUrl: result.rabbitmqUrl ? result.rabbitmqUrl.replace(/:[^:@]+@/, ':****@') : 'none'
        });
        if (result.approved && result.rabbitmqUrl) {
            process.env.RABBITMQ_URL = result.rabbitmqUrl;
            config.rabbitmqUrl = result.rabbitmqUrl;
            logger.info('✅ Worker approved! Got RabbitMQ credentials', {
                newUrl: result.rabbitmqUrl.replace(/:[^:@]+@/, ':****@')
            });
            await saveWorkerCredentials(result.rabbitmqUrl);
            return true;
        }
        return false;
    }
    catch (error) {
        logger.error('Failed to check worker status', {
            message: error.message,
            code: error.code,
            cause: error.cause,
            stack: error.stack
        });
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
        if (await checkWorkerStatus()) {
            return true;
        }
        logger.info('📝 Registering worker...', { workerId: config.workerId, ownerEmail });
        workerKeys = await getWorkerKeypair();
        const { publicKey } = workerKeys;
        const registrationData = {
            workerId: config.workerId,
            hostname: os.hostname(),
            platform: os.platform(),
            ip: 'auto',
            publicKey: publicKey,
            ownerEmail: ownerEmail
        };
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const response = await fetch('https://guardant.me/api/public/workers/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'GuardAnt-Worker/1.0'
            },
            body: JSON.stringify(registrationData),
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (!response.ok) {
            const error = await response.text();
            logger.error('Registration failed', { status: response.status, error });
            return false;
        }
        const result = await response.json();
        logger.info('✅ Worker registered successfully', { approved: result.approved });
        if (result.approved && result.rabbitmqUrl) {
            process.env.RABBITMQ_URL = result.rabbitmqUrl;
            config.rabbitmqUrl = result.rabbitmqUrl;
            logger.info('📡 Got RabbitMQ credentials from registration');
            await saveWorkerCredentials(result.rabbitmqUrl);
        }
        return true;
    }
    catch (error) {
        logger.error('Failed to register worker', {
            message: error.message,
            code: error.code,
            cause: error.cause,
            stack: error.stack
        });
        return false;
    }
}
async function startWorker() {
    try {
        config.workerId = await (0, worker_id_generator_1.generateUniqueWorkerId)();
        logger.info('🚀 RabbitMQ Worker starting...', { workerId: config.workerId });
        try {
            workerKeys = await getWorkerKeypair();
        }
        catch (error) {
            logger.error('Failed to load worker keys', error);
        }
        const savedCredentials = await loadWorkerCredentials();
        if (savedCredentials) {
            config.rabbitmqUrl = savedCredentials;
            process.env.RABBITMQ_URL = savedCredentials;
            logger.info('📂 Using saved RabbitMQ credentials');
        }
        const registered = await registerWorker();
        if (!config.rabbitmqUrl || config.rabbitmqUrl === 'amqp://localhost:5672') {
            logger.info('⏳ Worker registered but waiting for approval...');
            logger.info('📋 Please approve the worker in the admin panel');
            while (true) {
                await new Promise(resolve => setTimeout(resolve, 30000));
                if (await checkWorkerStatus()) {
                    logger.info('🎉 Worker approved! Starting...');
                    break;
                }
                logger.info('⏳ Still waiting for approval...');
            }
        }
        pointsTracker = new points_tracker_1.PointsTracker(config.workerId);
        const location = await worker_ant_location_1.locationDetector.detectLocation();
        let region = location.region || config.region;
        if (region === 'unknown' || region === 'auto') {
            const detectedRegion = await (0, region_detector_1.detectRegion)();
            if (detectedRegion !== 'auto') {
                region = detectedRegion;
                logger.info('🌍 Region detected via IP geolocation', { region });
            }
        }
        config.region = region;
        workerLocation = location;
        logger.info('📍 Worker location detected', { region, city: location.city });
        monitoringService = new monitoring_1.MonitoringService(region);
        logger.info('🔌 Connecting to RabbitMQ with URL:', {
            url: config.rabbitmqUrl.replace(/:[^:@]+@/, ':****@')
        });
        const connection = await amqplib_1.default.connect(config.rabbitmqUrl);
        const channel = await connection.createChannel();
        rabbitmqChannel = channel;
        await channel.assertExchange('worker_commands', 'direct');
        await channel.assertExchange('monitoring.locations', 'topic', { durable: true });
        const queueName = 'monitoring_workers';
        const q = await channel.assertQueue(queueName, {
            durable: true,
            exclusive: false
        });
        await channel.prefetch(1);
        await channel.bindQueue(q.queue, 'worker_commands', 'monitor_service');
        await channel.bindQueue(q.queue, 'worker_commands', 'stop_monitoring');
        await channel.bindQueue(q.queue, 'worker_commands', 'check_service_once');
        await channel.bindQueue(q.queue, 'worker_commands', 'update_worker');
        await channel.bindQueue(q.queue, 'worker_commands', 'rebuild_worker');
        const workerQueue = `worker.${config.workerId}`;
        const wq = await channel.assertQueue(workerQueue, { durable: true });
        await channel.consume(wq.queue, async (msg) => {
            if (!msg)
                return;
            try {
                const command = JSON.parse(msg.content.toString());
                logger.info('📨 Received targeted command', {
                    command: command.command,
                    timestamp: command.timestamp
                });
                switch (command.command) {
                    case 'update_worker':
                        await updateManager.handleUpdateCommand(command.data);
                        break;
                    case 'rebuild_worker':
                        await updateManager.handleRebuildCommand(command.data);
                        break;
                    case 'update_points_config':
                        logger.info('📊 Received points configuration update');
                        if (pointsTracker && command.data) {
                            await pointsTracker.updateConfig(command.data);
                            logger.info('✅ Points configuration updated');
                        }
                        break;
                    case 'suspend':
                        logger.info('Worker suspended by admin');
                        process.exit(0);
                        break;
                    case 'resume':
                        logger.info('Worker resumed by admin');
                        break;
                    default:
                        logger.warn('Unknown targeted command', { command: command.command });
                }
                channel.ack(msg);
            }
            catch (error) {
                logger.error('Failed to process targeted command', error);
                channel.nack(msg, false, false);
            }
        });
        logger.info('✅ Connected to RabbitMQ and ready to receive commands');
        sendHeartbeat();
        setInterval(sendHeartbeat, 30000);
        sendLocationData();
        setInterval(sendLocationData, 5 * 60 * 1000);
        await channel.consume(q.queue, async (msg) => {
            if (!msg)
                return;
            try {
                const command = JSON.parse(msg.content.toString());
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
                    case 'update_points_config':
                        logger.info('📊 Received points configuration update');
                        if (pointsTracker && command.data) {
                            await pointsTracker.updateConfig(command.data);
                            logger.info('✅ Points configuration updated');
                        }
                        break;
                    default:
                        logger.warn('Unknown command', { command: command.command });
                }
                channel.ack(msg);
            }
            catch (error) {
                logger.error('Failed to process command', error);
                channel.nack(msg, false, false);
            }
        });
        logger.info('🌍 Worker region', { region, queue: queueName });
        connection.on('error', (error) => {
            logger.error('RabbitMQ connection error', error);
        });
        connection.on('close', () => {
            logger.warn('RabbitMQ connection closed, exiting...');
            updateManager.cancel();
            pointsTracker?.cleanup();
            process.exit(1);
        });
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
    }
    catch (error) {
        logger.error('Failed to start worker', error);
        process.exit(1);
    }
}
async function handleMonitorService(data) {
    const { serviceId, nestId, type, target, config, regions, interval } = data;
    logger.info('🔍 Starting monitoring for service', {
        serviceId,
        type,
        target,
        interval
    });
    const service = {
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
    const existingInterval = activeMonitoring.get(serviceId);
    if (existingInterval) {
        clearInterval(existingInterval);
    }
    const checkService = async () => {
        try {
            const result = await monitoringService.checkService(service.target);
            logger.info('✅ Check completed', {
                serviceId,
                status: result.status
            });
            checksCompleted++;
            if (result.status !== 'up') {
                checksFailed++;
            }
            if (result.responseTime) {
                responseTimeSum += result.responseTime;
            }
            metricsCollector.recordMonitoringCheck(serviceId, result.success, result.responseTime || 0, config.region || 'unknown', config.workerId);
        }
        catch (error) {
            logger.error('Check failed', error, { serviceId });
        }
    };
    await checkService();
    const intervalId = setInterval(checkService, interval * 1000);
    activeMonitoring.set(serviceId, intervalId);
}
async function handleStopMonitoring(data) {
    const { serviceId } = data;
    logger.info('🛑 Stopping monitoring for service', { serviceId });
    const interval = activeMonitoring.get(serviceId);
    if (interval) {
        clearInterval(interval);
        activeMonitoring.delete(serviceId);
        logger.info('✅ Monitoring stopped', { serviceId });
    }
    else {
        logger.warn('No active monitoring found', { serviceId });
    }
}
async function handleSingleCheck(data) {
    const { serviceId, nestId, type, target, config, regions, cacheKey } = data;
    if (regions && regions.length > 0 && workerLocation) {
        const workerCityId = workerLocation.city.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (!regions.includes(workerCityId)) {
            logger.info('⏭️ Skipping check - not in requested regions', {
                serviceId,
                workerCity: workerLocation.city,
                workerCityId,
                requestedRegions: regions
            });
            return;
        }
    }
    logger.info('🔍 Performing single check', { serviceId, type, target, workerCity: workerLocation?.city });
    const service = {
        id: serviceId,
        nestId,
        name: target,
        type,
        target,
        interval: 0,
        config: config || {},
        monitoring: {
            regions: regions || [],
        },
    };
    try {
        const result = await monitoringService.checkService(service.target);
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
                cacheKey,
            });
            await rabbitmqChannel.publish('monitoring_results', 'check_completed', Buffer.from(resultMessage), { persistent: true });
        }
        logger.info('✅ Single check completed', {
            serviceId,
            status: result.status,
            responseTime: result.responseTime
        });
        checksCompleted++;
        if (result.status !== 'up') {
            checksFailed++;
        }
        if (result.responseTime) {
            responseTimeSum += result.responseTime;
        }
        const points = pointsTracker.recordCheck(result.success, result.responseTime || 0, type);
        logger.debug('💰 Points earned', { points, type });
        metricsCollector.recordMonitoringCheck(serviceId, result.success, result.responseTime || 0, config.region || 'unknown', config.workerId);
    }
    catch (error) {
        logger.error('Single check failed', error, { serviceId });
        if (rabbitmqChannel) {
            const failureMessage = JSON.stringify({
                serviceId,
                nestId,
                status: 'error',
                error: error.message,
                timestamp: Date.now(),
                workerId: config.workerId,
            });
            await rabbitmqChannel.publish('monitoring_results', 'check_completed', Buffer.from(failureMessage), { persistent: true });
        }
    }
}
startWorker().catch((error) => {
    logger.error('Worker startup failed', error);
    process.exit(1);
});
