#!/usr/bin/env node
import { GeographicWorker, WorkerConfig } from './geographic-worker';
import { LocationDetector } from './location-detector';
import { createLogger } from './logger';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const logger = createLogger('auto-worker');

const API_ENDPOINT = process.env.API_ENDPOINT || 'https://guardant.me';
const CREDENTIALS_FILE = path.join(os.homedir(), '.guardant-worker-creds.json');

async function loadCredentials(): Promise<{ workerId: string; rabbitmqUrl: string; redisUrl?: string } | null> {
  try {
    const data = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function startAutoWorker() {
  logger.info('🚀 Starting GuardAnt Geographic Worker (Compatible Mode)...');
  
  try {
    // Check if we have WORKER_TOKEN from Worker Ant Program
    const workerToken = process.env.WORKER_TOKEN;
    const workerId = process.env.WORKER_ID;
    
    if (!workerToken || !workerId) {
      logger.error('❌ WORKER_TOKEN and WORKER_ID are required!');
      logger.error('This worker needs to be deployed through Worker Ant Program.');
      logger.error('Please apply at: https://guardant.me/admin/worker-program');
      process.exit(1);
    }
    
    // Automatycznie wykryj lokalizację
    const location = await LocationDetector.detectLocation();
    
    // Use provided workerId instead of generated one
    location.workerId = workerId;
    
    logger.info('📍 Detected location:', {
      continent: location.continent,
      region: location.region,
      country: location.country,
      city: location.city,
      workerId: location.workerId
    });
    
    // Pokaż ładnie sformatowaną lokalizację
    const locationString = `${location.continent}.${location.region}.${location.country}.${location.city}`;
    console.log(`\n╔═══════════════════════════════════════════════════════╗`);
    console.log(`║ 🌍 Worker Location: ${locationString.padEnd(33)} ║`);
    console.log(`║ 🆔 Worker ID: ${workerId.padEnd(39)} ║`);
    console.log(`╚═══════════════════════════════════════════════════════╝\n`);
    
    // Use provided RABBITMQ_URL and REDIS_URL from Worker Ant Program
    const rabbitmqUrl = process.env.RABBITMQ_URL;
    const redisUrl = process.env.REDIS_URL || 'redis://db.guardant.me:16379';
    
    if (!rabbitmqUrl) {
      logger.error('❌ RABBITMQ_URL not provided!');
      logger.error('Worker needs RabbitMQ credentials from Worker Ant Program.');
      process.exit(1);
    }
    
    // Konfiguracja workera
    const config: WorkerConfig = {
      workerId: workerId,
      location: location,
      redisUrl: redisUrl,
      rabbitmqUrl: rabbitmqUrl,
      capabilities: (process.env.WORKER_CAPABILITIES || 'http,https,tcp,ping').split(','),
      version: process.env.WORKER_VERSION || '6.0.8'
    };
    
    logger.info('🔧 Worker configuration:', {
      workerId: config.workerId,
      location: `${location.continent}.${location.region}.${location.country}.${location.city}`,
      redisUrl: config.redisUrl.replace(/:[^:@]+@/, ':****@'),
      rabbitmqUrl: config.rabbitmqUrl.replace(/:[^:@]+@/, ':****@'),
      capabilities: config.capabilities,
      version: config.version
    });
    
    // Register with API to report location
    try {
      const response = await fetch(`${API_ENDPOINT}/api/worker/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${workerToken}`
        },
        body: JSON.stringify({
          workerId,
          name: `Geographic Worker ${location.city}`,
          region: location.region,
          capabilities: config.capabilities,
          version: config.version,
          location: {
            continent: location.continent,
            region: location.region,
            country: location.country,
            city: location.city
          }
        })
      });
      
      if (response.ok) {
        logger.info('✅ Worker registered with geographic location');
      } else {
        logger.warn('⚠️ Could not register location with API:', response.statusText);
      }
    } catch (error) {
      logger.warn('⚠️ Could not connect to API to register location:', error);
    }
    
    // Uruchom workera
    const worker = new GeographicWorker(config);
    await worker.start();
    
    logger.info('✅ Worker started successfully');
    
    // Obsługa zamknięcia
    process.on('SIGINT', async () => {
      logger.info('🛑 Shutting down gracefully...');
      await worker.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('🛑 Shutting down gracefully...');
      await worker.stop();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
}

// Start worker
startAutoWorker().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});