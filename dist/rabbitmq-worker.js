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
// Local cache not needed for standalone workers - results sent directly via RabbitMQ
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
// Configuration - will be initialized in startWorker
let config = {
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    workerId: '', // Will be set during initialization
    region: process.env.WORKER_REGION || 'unknown',
};
// Services
const logger = (0, logger_1.createLogger)('worker-rabbitmq');
const metricsCollector = (0, metrics_1.getMetricsCollector)('guardant_workers');
// Redis not needed - results sent via RabbitMQ
// Initialize monitoring service
let monitoringService;
// Active monitoring intervals
const activeMonitoring = new Map();
// RabbitMQ channel reference
let rabbitmqChannel = null;
// Update manager
const updateManager = new update_manager_1.UpdateManager();
// Worker stats
let checksCompleted = 0;
let checksFailed = 0;
let responseTimeSum = 0;
// Points tracker
let pointsTracker;
// Worker keys
let workerKeys = null;
// Worker location
let workerLocation = null;
// Standalone workers don't restore state - they receive tasks from scheduler
// Sign data with worker's private key
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
// Send heartbeat to main server
async function sendHeartbeat() {
    if (!rabbitmqChannel)
        return;
    try {
        // If pointsTracker is not initialized yet (during registration), use default values
        const stats = pointsTracker?.getStats() || {
            totalPoints: 0,
            currentPeriod: { points: 0 }
        };
        const earnings = pointsTracker?.getEarningsEstimate() || {
            points: 0,
            estimatedUSD: 0,
            estimatedCrypto: 0
        };
        // Calculate metrics
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
            // Add metrics data
            metrics: {
                avgResponseTime,
                avgLatency: Math.round(avgResponseTime * 0.3), // Estimate latency as 30% of response time
                successRate,
                errorRate: 1 - successRate,
                uptime: successRate * 100, // Use success rate as proxy for uptime
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
        // Sign the heartbeat
        const heartbeatData = JSON.stringify(heartbeat);
        const signature = signData(heartbeatData);
        const signedHeartbeat = {
            ...heartbeat,
            signature
        };
        // Debug log for Polish locations
        if (heartbeat.location?.country === 'PL') {
            logger.info('🏙️ Sending Polish location', {
                city: heartbeat.location.city,
                cityBytes: Buffer.from(heartbeat.location.city).toString('hex')
            });
        }
        await rabbitmqChannel.assertExchange('worker_heartbeat', 'fanout');
        await rabbitmqChannel.publish('worker_heartbeat', '', Buffer.from(JSON.stringify(signedHeartbeat), 'utf8'), {
            expiration: '60000', // Message expires in 1 minute
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
// Generate or load worker keypair
async function getWorkerKeypair() {
    const keyDir = process.env.KEY_DIR || '.';
    const publicKeyPath = path.join(keyDir, 'worker.pub');
    const privateKeyPath = path.join(keyDir, 'worker.key');
    try {
        // Try to load existing keys
        const publicKey = await fs.readFile(publicKeyPath, 'utf8');
        const privateKey = await fs.readFile(privateKeyPath, 'utf8');
        logger.info('🔑 Loaded existing worker keys');
        return { publicKey, privateKey };
    }
    catch (error) {
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
        // Save credentials securely
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
        // File doesn't exist or can't be read - normal for new workers
    }
    return null;
}
async function checkWorkerStatus() {
    try {
        logger.info('🔍 Checking worker status...');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
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
            // Save RabbitMQ URL for this worker
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
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
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
        // If already approved, update RabbitMQ URL
        if (result.approved && result.rabbitmqUrl) {
            process.env.RABBITMQ_URL = result.rabbitmqUrl;
            config.rabbitmqUrl = result.rabbitmqUrl;
            logger.info('📡 Got RabbitMQ credentials from registration');
            // Save RabbitMQ URL for this worker
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
        // Generate unique worker ID
        config.workerId = await (0, worker_id_generator_1.generateUniqueWorkerId)();
        logger.info('🚀 RabbitMQ Worker starting...', { workerId: config.workerId });
        // Load or generate worker keys (needed for signing)
        try {
            workerKeys = await getWorkerKeypair();
        }
        catch (error) {
            logger.error('Failed to load worker keys', error);
        }
        // Try to load saved credentials first
        const savedCredentials = await loadWorkerCredentials();
        if (savedCredentials) {
            config.rabbitmqUrl = savedCredentials;
            process.env.RABBITMQ_URL = savedCredentials;
            logger.info('📂 Using saved RabbitMQ credentials');
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
        pointsTracker = new points_tracker_1.PointsTracker(config.workerId);
        // Detect location
        const location = await worker_ant_location_1.locationDetector.detectLocation();
        let region = location.region || config.region;
        // If still 'unknown' or 'auto', try IP-based detection
        if (region === 'unknown' || region === 'auto') {
            const detectedRegion = await (0, region_detector_1.detectRegion)();
            if (detectedRegion !== 'auto') {
                region = detectedRegion;
                logger.info('🌍 Region detected via IP geolocation', { region });
            }
        }
        // Update config with detected region
        config.region = region;
        // Store location for heartbeats
        workerLocation = location;
        logger.info('📍 Worker location detected', { region, city: location.city });
        // Initialize monitoring service
        monitoringService = new monitoring_1.MonitoringService(region);
        // Standalone workers receive all tasks from scheduler via RabbitMQ
        // Connect to RabbitMQ
        logger.info('🔌 Connecting to RabbitMQ with URL:', {
            url: config.rabbitmqUrl.replace(/:[^:@]+@/, ':****@') // Hide password in logs
        });
        const connection = await amqplib_1.default.connect(config.rabbitmqUrl);
        const channel = await connection.createChannel();
        rabbitmqChannel = channel; // Set global reference
        // Declare exchange and shared queue
        await channel.assertExchange('worker_commands', 'direct');
        // Use a shared queue for all workers (not exclusive)
        const queueName = 'monitoring_workers';
        const q = await channel.assertQueue(queueName, {
            durable: true,
            exclusive: false // Shared between workers
        });
        // Set prefetch to 1 to ensure fair distribution
        await channel.prefetch(1);
        // Bind queue to commands
        await channel.bindQueue(q.queue, 'worker_commands', 'monitor_service');
        await channel.bindQueue(q.queue, 'worker_commands', 'stop_monitoring');
        await channel.bindQueue(q.queue, 'worker_commands', 'check_service_once');
        await channel.bindQueue(q.queue, 'worker_commands', 'update_worker');
        await channel.bindQueue(q.queue, 'worker_commands', 'rebuild_worker');
        // Also create and bind worker-specific queue for targeted commands
        const workerQueue = `worker.${config.workerId}`;
        const wq = await channel.assertQueue(workerQueue, { durable: true });
        // Listen on worker-specific queue
        await channel.consume(wq.queue, async (msg) => {
            if (!msg)
                return;
            try {
                const command = JSON.parse(msg.content.toString());
                logger.info('📨 Received targeted command', {
                    command: command.command,
                    timestamp: command.timestamp
                });
                // Process same commands as general queue
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
        // Start heartbeat
        sendHeartbeat();
        setInterval(sendHeartbeat, 30000); // Send heartbeat every 30 seconds
        // Consume messages
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
    // Create service object
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
    // Stop existing monitoring if any
    const existingInterval = activeMonitoring.get(serviceId);
    if (existingInterval) {
        clearInterval(existingInterval);
    }
    // Start monitoring
    const checkService = async () => {
        try {
            const result = await monitoringService.checkService(service);
            // For standalone workers, results are sent via scheduler, not stored locally
            logger.info('✅ Check completed', {
                serviceId,
                status: result.status
            });
            // Update worker stats
            checksCompleted++;
            if (result.status !== 'up') {
                checksFailed++;
            }
            if (result.responseTime) {
                responseTimeSum += result.responseTime;
            }
            // Record metrics
            metricsCollector.recordMonitoringCheck(nestId, serviceId, result.status, config.region || 'unknown', result.responseTime || 0, type);
        }
        catch (error) {
            logger.error('Check failed', error, { serviceId });
        }
    };
    // Run first check immediately
    await checkService();
    // Schedule periodic checks
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
// Handle single check (from scheduler)
async function handleSingleCheck(data) {
    const { serviceId, nestId, type, target, config, regions, cacheKey } = data;
    // Check if this worker should handle this request based on regions
    if (regions && regions.length > 0 && workerLocation) {
        // Get worker's city ID (same format as used in regions API)
        const workerCityId = workerLocation.city.toLowerCase().replace(/[^a-z0-9]/g, '-');
        // Check if worker's city is in the requested regions
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
            await rabbitmqChannel.publish('monitoring_results', 'check_completed', Buffer.from(resultMessage), { persistent: true });
        }
        logger.info('✅ Single check completed', {
            serviceId,
            status: result.status,
            responseTime: result.responseTime
        });
        // Update worker stats
        checksCompleted++;
        if (result.status !== 'up') {
            checksFailed++;
        }
        if (result.responseTime) {
            responseTimeSum += result.responseTime;
        }
        // Record points
        const points = pointsTracker.recordCheck(type, result.status === 'up', result.responseTime);
        logger.debug('💰 Points earned', { points, type });
        // Record metrics
        metricsCollector.recordMonitoringCheck(nestId, serviceId, result.status, config.region || 'unknown', result.responseTime || 0, type);
    }
    catch (error) {
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
            await rabbitmqChannel.publish('monitoring_results', 'check_completed', Buffer.from(failureMessage), { persistent: true });
        }
    }
}
// Start the worker
startWorker().catch((error) => {
    logger.error('Worker startup failed', error);
    process.exit(1);
});
//# sourceMappingURL=rabbitmq-worker.js.map