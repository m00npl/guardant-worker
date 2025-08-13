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
const dotenv_1 = require("dotenv");
const socket_io_client_1 = require("socket.io-client");
const si = __importStar(require("systeminformation"));
const p_queue_1 = __importDefault(require("p-queue"));
const pino_1 = __importDefault(require("pino"));
const crypto_1 = require("crypto");
const os_1 = require("os");
// Load environment variables
(0, dotenv_1.config)();
// Logger setup - use pino-pretty only in development
const logger = process.env.NODE_ENV === 'development'
    ? (0, pino_1.default)({
        level: process.env.LOG_LEVEL || 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'yyyy-mm-dd HH:MM:ss',
                ignore: 'pid,hostname'
            }
        }
    })
    : (0, pino_1.default)({
        level: process.env.LOG_LEVEL || 'info',
        formatters: {
            level: (label) => ({ level: label }),
            bindings: () => ({})
        },
        timestamp: () => `,"time":"${new Date().toISOString()}"`
    });
class GuardAntWorker {
    constructor() {
        this.socket = null;
        this.isRunning = false;
        this.systemInfo = {};
        this.checkCount = 0;
        this.startTime = Date.now();
        this.config = this.loadConfig();
        this.queue = new p_queue_1.default({
            concurrency: this.config.maxConcurrent,
            interval: 1000,
            intervalCap: this.config.maxConcurrent
        });
        logger.info('GuardAnt Worker initialized', {
            workerId: this.config.workerId,
            region: this.config.region,
            name: this.config.workerName
        });
    }
    loadConfig() {
        const workerId = process.env.WORKER_ID || this.generateWorkerId();
        const workerToken = process.env.WORKER_TOKEN || '';
        if (!workerToken) {
            logger.error('WORKER_TOKEN is required');
            process.exit(1);
        }
        return {
            workerId,
            workerToken,
            apiEndpoint: process.env.API_ENDPOINT || 'https://guardant.me',
            workerName: process.env.WORKER_NAME || (0, os_1.hostname)(),
            region: process.env.WORKER_REGION || 'auto',
            maxConcurrent: parseInt(process.env.MAX_CONCURRENT || '10'),
            checkInterval: parseInt(process.env.CHECK_INTERVAL || '60000'),
            reportInterval: parseInt(process.env.REPORT_INTERVAL || '300000')
        };
    }
    generateWorkerId() {
        const hash = (0, crypto_1.createHash)('sha256');
        hash.update((0, os_1.hostname)() + Date.now().toString());
        return `worker_${hash.digest('hex').substring(0, 12)}`;
    }
    async start() {
        logger.info('Starting GuardAnt Worker...');
        try {
            // Collect system information
            await this.collectSystemInfo();
            // Register with API
            await this.register();
            // Connect WebSocket
            await this.connectWebSocket();
            // Start monitoring loop
            this.isRunning = true;
            this.startMonitoringLoop();
            // Start reporting loop
            this.startReportingLoop();
            // Handle graceful shutdown
            this.setupShutdownHandlers();
            logger.info('Worker started successfully');
        }
        catch (error) {
            logger.error('Failed to start worker', error);
            process.exit(1);
        }
    }
    async collectSystemInfo() {
        try {
            const [cpu, mem, os, network] = await Promise.all([
                si.cpu(),
                si.mem(),
                si.osInfo(),
                si.networkInterfaces()
            ]);
            this.systemInfo = {
                cpu: {
                    manufacturer: cpu.manufacturer,
                    brand: cpu.brand,
                    cores: cpu.cores,
                    speed: cpu.speed
                },
                memory: {
                    total: mem.total,
                    available: mem.available
                },
                os: {
                    platform: os.platform,
                    distro: os.distro,
                    release: os.release,
                    arch: os.arch
                },
                network: network[0]?.ip4 || 'unknown'
            };
            logger.info('System information collected', this.systemInfo);
        }
        catch (error) {
            logger.error('Failed to collect system info', error);
        }
    }
    async register() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/api/worker/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.workerToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workerId: this.config.workerId,
                    name: this.config.workerName,
                    region: this.config.region,
                    systemInfo: this.systemInfo,
                    capabilities: {
                        maxConcurrent: this.config.maxConcurrent,
                        supportedCheckTypes: ['http', 'tcp', 'ping', 'dns']
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                logger.info('Worker registered successfully');
                // Update region if auto-detected
                if (this.config.region === 'auto' && data.detectedRegion) {
                    this.config.region = data.detectedRegion;
                    logger.info(`Region auto-detected: ${this.config.region}`);
                }
            }
        }
        catch (error) {
            logger.error('Failed to register worker', error);
            throw error;
        }
    }
    async connectWebSocket() {
        const wsUrl = this.config.apiEndpoint.replace('https', 'wss').replace('http', 'ws');
        this.socket = (0, socket_io_client_1.io)(wsUrl, {
            auth: {
                token: this.config.workerToken,
                workerId: this.config.workerId
            },
            reconnection: true,
            reconnectionDelay: 5000,
            reconnectionAttempts: Infinity
        });
        this.socket.on('connect', () => {
            logger.info('WebSocket connected');
        });
        this.socket.on('disconnect', (reason) => {
            logger.warn('WebSocket disconnected', { reason });
        });
        this.socket.on('check:request', (check) => {
            this.handleCheckRequest(check);
        });
        this.socket.on('config:update', (config) => {
            this.updateConfig(config);
        });
        this.socket.on('command:stop', () => {
            this.stop();
        });
    }
    async handleCheckRequest(check) {
        this.queue.add(async () => {
            const result = await this.performCheck(check);
            this.reportCheckResult(result);
        });
    }
    async performCheck(check) {
        const startTime = Date.now();
        let result = {
            serviceId: check.serviceId,
            checkId: check.id,
            status: 'down',
            responseTime: 0,
            timestamp: Date.now(),
            workerId: this.config.workerId,
            region: this.config.region
        };
        try {
            switch (check.type) {
                case 'http':
                    result = await this.performHttpCheck(check, startTime);
                    break;
                case 'tcp':
                    result = await this.performTcpCheck(check, startTime);
                    break;
                case 'ping':
                    result = await this.performPingCheck(check, startTime);
                    break;
                case 'dns':
                    result = await this.performDnsCheck(check, startTime);
                    break;
                default:
                    throw new Error(`Unsupported check type: ${check.type}`);
            }
            this.checkCount++;
        }
        catch (error) {
            result.status = 'down';
            result.error = error.message;
            result.responseTime = Date.now() - startTime;
        }
        return result;
    }
    async performHttpCheck(check, startTime) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), check.timeout);
            const response = await fetch(check.target, {
                method: check.method || 'GET',
                headers: check.headers,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            const expectedStatus = check.expectedStatus || 200;
            let status = 'up';
            if (response.status !== expectedStatus) {
                status = response.status >= 500 ? 'down' : 'degraded';
            }
            if (check.expectedContent) {
                const text = await response.text();
                if (!text.includes(check.expectedContent)) {
                    status = 'degraded';
                }
            }
            return {
                serviceId: check.serviceId,
                checkId: check.id,
                status,
                responseTime,
                statusCode: response.status,
                timestamp: Date.now(),
                workerId: this.config.workerId,
                region: this.config.region
            };
        }
        catch (error) {
            return {
                serviceId: check.serviceId,
                checkId: check.id,
                status: 'down',
                responseTime: Date.now() - startTime,
                error: error.message,
                timestamp: Date.now(),
                workerId: this.config.workerId,
                region: this.config.region
            };
        }
    }
    async performTcpCheck(check, startTime) {
        // TCP check implementation
        const net = require('net');
        const url = new URL(check.target);
        const port = parseInt(url.port || '80');
        const host = url.hostname;
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(check.timeout);
            socket.on('connect', () => {
                const responseTime = Date.now() - startTime;
                socket.destroy();
                resolve({
                    serviceId: check.serviceId,
                    checkId: check.id,
                    status: 'up',
                    responseTime,
                    timestamp: Date.now(),
                    workerId: this.config.workerId,
                    region: this.config.region
                });
            });
            socket.on('timeout', () => {
                socket.destroy();
                resolve({
                    serviceId: check.serviceId,
                    checkId: check.id,
                    status: 'down',
                    responseTime: Date.now() - startTime,
                    error: 'Connection timeout',
                    timestamp: Date.now(),
                    workerId: this.config.workerId,
                    region: this.config.region
                });
            });
            socket.on('error', (error) => {
                resolve({
                    serviceId: check.serviceId,
                    checkId: check.id,
                    status: 'down',
                    responseTime: Date.now() - startTime,
                    error: error.message,
                    timestamp: Date.now(),
                    workerId: this.config.workerId,
                    region: this.config.region
                });
            });
            socket.connect(port, host);
        });
    }
    async performPingCheck(check, startTime) {
        // Simple TCP-based ping since ICMP requires root privileges
        const net = require('net');
        const url = new URL(check.target);
        const host = url.hostname;
        const port = 80; // Default to HTTP port for ping check
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(check.timeout);
            socket.on('connect', () => {
                const responseTime = Date.now() - startTime;
                socket.destroy();
                resolve({
                    serviceId: check.serviceId,
                    checkId: check.id,
                    status: 'up',
                    responseTime,
                    timestamp: Date.now(),
                    workerId: this.config.workerId,
                    region: this.config.region
                });
            });
            socket.on('timeout', () => {
                socket.destroy();
                resolve({
                    serviceId: check.serviceId,
                    checkId: check.id,
                    status: 'down',
                    responseTime: Date.now() - startTime,
                    error: 'Ping timeout',
                    timestamp: Date.now(),
                    workerId: this.config.workerId,
                    region: this.config.region
                });
            });
            socket.on('error', () => {
                resolve({
                    serviceId: check.serviceId,
                    checkId: check.id,
                    status: 'down',
                    responseTime: Date.now() - startTime,
                    error: 'Host unreachable',
                    timestamp: Date.now(),
                    workerId: this.config.workerId,
                    region: this.config.region
                });
            });
            socket.connect(port, host);
        });
    }
    async performDnsCheck(check, startTime) {
        const dns = require('dns').promises;
        const domain = check.target.replace(/^https?:\/\//, '');
        try {
            await dns.resolve4(domain);
            return {
                serviceId: check.serviceId,
                checkId: check.id,
                status: 'up',
                responseTime: Date.now() - startTime,
                timestamp: Date.now(),
                workerId: this.config.workerId,
                region: this.config.region
            };
        }
        catch (error) {
            return {
                serviceId: check.serviceId,
                checkId: check.id,
                status: 'down',
                responseTime: Date.now() - startTime,
                error: error.message,
                timestamp: Date.now(),
                workerId: this.config.workerId,
                region: this.config.region
            };
        }
    }
    reportCheckResult(result) {
        // Report via WebSocket if connected
        if (this.socket?.connected) {
            this.socket.emit('check:result', result);
        }
        // Also report via HTTP as fallback
        fetch(`${this.config.apiEndpoint}/api/worker/report`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.workerToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ results: [result] })
        }).catch(error => {
            logger.error('Failed to report check result', error);
        });
        logger.debug('Check result reported', {
            serviceId: result.serviceId,
            status: result.status,
            responseTime: result.responseTime
        });
    }
    startMonitoringLoop() {
        setInterval(async () => {
            if (!this.isRunning)
                return;
            try {
                // Fetch checks to perform
                const params = new URLSearchParams({
                    workerId: this.config.workerId,
                    region: this.config.region
                });
                const response = await fetch(`${this.config.apiEndpoint}/api/worker/checks?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${this.config.workerToken}`
                    }
                });
                const data = await response.json();
                if (data.checks && data.checks.length > 0) {
                    logger.info(`Received ${data.checks.length} checks to perform`);
                    for (const check of data.checks) {
                        this.handleCheckRequest(check);
                    }
                }
            }
            catch (error) {
                logger.error('Failed to fetch checks', error);
            }
        }, this.config.checkInterval);
    }
    startReportingLoop() {
        setInterval(async () => {
            if (!this.isRunning)
                return;
            const uptime = Date.now() - this.startTime;
            const stats = {
                workerId: this.config.workerId,
                uptime,
                checksPerformed: this.checkCount,
                queueSize: this.queue.size,
                queuePending: this.queue.pending,
                systemInfo: await this.getCurrentSystemStats()
            };
            // Report stats via WebSocket
            if (this.socket?.connected) {
                this.socket.emit('worker:stats', stats);
            }
            // Also report via HTTP
            fetch(`${this.config.apiEndpoint}/api/worker/stats`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.workerToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stats)
            }).catch(error => {
                logger.error('Failed to report stats', error);
            });
            logger.info('Worker stats reported', {
                uptime: Math.floor(uptime / 1000) + 's',
                checks: this.checkCount,
                queue: this.queue.size
            });
        }, this.config.reportInterval);
    }
    async getCurrentSystemStats() {
        try {
            const [currentLoad, mem] = await Promise.all([
                si.currentLoad(),
                si.mem()
            ]);
            return {
                cpu: currentLoad.currentLoad,
                memory: {
                    used: mem.used,
                    available: mem.available,
                    percent: (mem.used / mem.total) * 100
                }
            };
        }
        catch (error) {
            return {};
        }
    }
    updateConfig(config) {
        logger.info('Updating worker configuration', config);
        if (config.maxConcurrent) {
            this.queue.concurrency = config.maxConcurrent;
        }
        Object.assign(this.config, config);
    }
    setupShutdownHandlers() {
        const shutdown = async () => {
            logger.info('Shutting down worker...');
            await this.stop();
            process.exit(0);
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        process.on('SIGHUP', shutdown);
    }
    async stop() {
        logger.info('Stopping worker...');
        this.isRunning = false;
        // Clear queue
        this.queue.clear();
        await this.queue.onIdle();
        // Disconnect WebSocket
        if (this.socket) {
            this.socket.disconnect();
        }
        // Notify API
        try {
            await fetch(`${this.config.apiEndpoint}/api/worker/unregister`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.workerToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ workerId: this.config.workerId })
            });
        }
        catch (error) {
            logger.error('Failed to unregister worker', error);
        }
        logger.info('Worker stopped');
    }
}
// ASCII Art Banner
function printBanner() {
    console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║         GuardAnt Worker v1.0.0            ║
║     Distributed Monitoring at Scale       ║
║                                            ║
╚════════════════════════════════════════════╝
  `);
}
// Main execution
async function main() {
    // Handle CLI arguments
    const args = process.argv.slice(2);
    if (args.includes('--version') || args.includes('-v')) {
        console.log('GuardAnt Worker v1.0.0');
        process.exit(0);
    }
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
GuardAnt Worker v1.0.0

Usage: guardant-worker [options]

Options:
  --version, -v     Show version
  --help, -h        Show help
  --config FILE     Load config from file
  --daemon          Run as daemon

Environment Variables:
  WORKER_ID         Worker identifier
  WORKER_TOKEN      Authentication token (required)
  API_ENDPOINT      API endpoint (default: https://guardant.me)
  WORKER_NAME       Worker name (default: hostname)
  WORKER_REGION     Worker region (default: auto)
  MAX_CONCURRENT    Max concurrent checks (default: 10)
  LOG_LEVEL         Log level (default: info)

Example:
  export WORKER_TOKEN=wt_abc123...
  ./guardant-worker
    `);
        process.exit(0);
    }
    printBanner();
    const worker = new GuardAntWorker();
    await worker.start();
}
// Start worker
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error.message);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map