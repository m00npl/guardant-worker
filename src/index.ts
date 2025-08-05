import { config } from 'dotenv';
import { io, Socket } from 'socket.io-client';
import * as si from 'systeminformation';
import PQueue from 'p-queue';
import pino from 'pino';
import { createHash } from 'crypto';
import { hostname } from 'os';

// Load environment variables
config();

// Logger setup - use pino-pretty only in development
const logger = process.env.NODE_ENV === 'development' 
  ? pino({
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
  : pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label }),
        bindings: () => ({})
      },
      timestamp: () => `,"time":"${new Date().toISOString()}"`
    });

// Configuration
interface WorkerConfig {
  workerId: string;
  workerToken: string;
  apiEndpoint: string;
  workerName: string;
  region: string;
  maxConcurrent: number;
  checkInterval: number;
  reportInterval: number;
}

// Service check interface
interface ServiceCheck {
  id: string;
  serviceId: string;
  type: 'http' | 'tcp' | 'ping' | 'dns';
  target: string;
  method?: string;
  headers?: Record<string, string>;
  timeout: number;
  expectedStatus?: number;
  expectedContent?: string;
}

// Check result interface
interface CheckResult {
  serviceId: string;
  checkId: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: number;
  workerId: string;
  region: string;
}

class GuardAntWorker {
  private config: WorkerConfig;
  private socket: Socket | null = null;
  private queue: PQueue;
  private isRunning: boolean = false;
  private systemInfo: any = {};
  private checkCount: number = 0;
  private startTime: number = Date.now();

  constructor() {
    this.config = this.loadConfig();
    this.queue = new PQueue({ 
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

  private loadConfig(): WorkerConfig {
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
      workerName: process.env.WORKER_NAME || hostname(),
      region: process.env.WORKER_REGION || 'auto',
      maxConcurrent: parseInt(process.env.MAX_CONCURRENT || '10'),
      checkInterval: parseInt(process.env.CHECK_INTERVAL || '60000'),
      reportInterval: parseInt(process.env.REPORT_INTERVAL || '300000')
    };
  }

  private generateWorkerId(): string {
    const hash = createHash('sha256');
    hash.update(hostname() + Date.now().toString());
    return `worker_${hash.digest('hex').substring(0, 12)}`;
  }

  async start(): Promise<void> {
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
    } catch (error) {
      logger.error('Failed to start worker', error);
      process.exit(1);
    }
  }

  private async collectSystemInfo(): Promise<void> {
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
    } catch (error) {
      logger.error('Failed to collect system info', error);
    }
  }

  private async register(): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.apiEndpoint}/api/worker/register`,
        {
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
        }
      );

      const data = await response.json() as any;
      
      if (data.success) {
        logger.info('Worker registered successfully');
        
        // Update region if auto-detected
        if (this.config.region === 'auto' && data.detectedRegion) {
          this.config.region = data.detectedRegion;
          logger.info(`Region auto-detected: ${this.config.region}`);
        }
      }
    } catch (error) {
      logger.error('Failed to register worker', error);
      throw error;
    }
  }

  private async connectWebSocket(): Promise<void> {
    const wsUrl = this.config.apiEndpoint.replace('https', 'wss').replace('http', 'ws');
    
    this.socket = io(wsUrl, {
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

    this.socket.on('check:request', (check: ServiceCheck) => {
      this.handleCheckRequest(check);
    });

    this.socket.on('config:update', (config: Partial<WorkerConfig>) => {
      this.updateConfig(config);
    });

    this.socket.on('command:stop', () => {
      this.stop();
    });
  }

  private async handleCheckRequest(check: ServiceCheck): Promise<void> {
    this.queue.add(async () => {
      const result = await this.performCheck(check);
      this.reportCheckResult(result);
    });
  }

  private async performCheck(check: ServiceCheck): Promise<CheckResult> {
    const startTime = Date.now();
    let result: CheckResult = {
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
    } catch (error: any) {
      result.status = 'down';
      result.error = error.message;
      result.responseTime = Date.now() - startTime;
    }

    return result;
  }

  private async performHttpCheck(check: ServiceCheck, startTime: number): Promise<CheckResult> {
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
      
      let status: 'up' | 'down' | 'degraded' = 'up';
      
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
    } catch (error: any) {
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

  private async performTcpCheck(check: ServiceCheck, startTime: number): Promise<CheckResult> {
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

      socket.on('error', (error: any) => {
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

  private async performPingCheck(check: ServiceCheck, startTime: number): Promise<CheckResult> {
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

  private async performDnsCheck(check: ServiceCheck, startTime: number): Promise<CheckResult> {
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
    } catch (error: any) {
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

  private reportCheckResult(result: CheckResult): void {
    // Report via WebSocket if connected
    if (this.socket?.connected) {
      this.socket.emit('check:result', result);
    }
    
    // Also report via HTTP as fallback
    fetch(
      `${this.config.apiEndpoint}/api/worker/report`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.workerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ results: [result] })
      }
    ).catch(error => {
      logger.error('Failed to report check result', error);
    });

    logger.debug('Check result reported', {
      serviceId: result.serviceId,
      status: result.status,
      responseTime: result.responseTime
    });
  }

  private startMonitoringLoop(): void {
    setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        // Fetch checks to perform
        const params = new URLSearchParams({
          workerId: this.config.workerId,
          region: this.config.region
        });
        
        const response = await fetch(
          `${this.config.apiEndpoint}/api/worker/checks?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${this.config.workerToken}`
            }
          }
        );
        
        const data = await response.json() as any;

        if (data.checks && data.checks.length > 0) {
          logger.info(`Received ${data.checks.length} checks to perform`);
          
          for (const check of data.checks) {
            this.handleCheckRequest(check);
          }
        }
      } catch (error) {
        logger.error('Failed to fetch checks', error);
      }
    }, this.config.checkInterval);
  }

  private startReportingLoop(): void {
    setInterval(async () => {
      if (!this.isRunning) return;
      
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
      fetch(
        `${this.config.apiEndpoint}/api/worker/stats`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.workerToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(stats)
        }
      ).catch(error => {
        logger.error('Failed to report stats', error);
      });

      logger.info('Worker stats reported', {
        uptime: Math.floor(uptime / 1000) + 's',
        checks: this.checkCount,
        queue: this.queue.size
      });
    }, this.config.reportInterval);
  }

  private async getCurrentSystemStats(): Promise<any> {
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
    } catch (error) {
      return {};
    }
  }

  private updateConfig(config: Partial<WorkerConfig>): void {
    logger.info('Updating worker configuration', config);
    
    if (config.maxConcurrent) {
      this.queue.concurrency = config.maxConcurrent;
    }
    
    Object.assign(this.config, config);
  }

  private setupShutdownHandlers(): void {
    const shutdown = async () => {
      logger.info('Shutting down worker...');
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGHUP', shutdown);
  }

  async stop(): Promise<void> {
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
      await fetch(
        `${this.config.apiEndpoint}/api/worker/unregister`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.workerToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ workerId: this.config.workerId })
        }
      );
    } catch (error) {
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