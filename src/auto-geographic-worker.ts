#!/usr/bin/env node
import { GeographicWorker, WorkerConfig } from './geographic-worker';
import { LocationDetector } from './location-detector';
import { createLogger } from './logger';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const logger = createLogger('auto-worker');

const API_ENDPOINT = process.env.API_ENDPOINT || 'https://guardant.me';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'admin@guardant.me';
const CREDENTIALS_FILE = path.join(os.homedir(), '.guardant-worker-creds.json');

interface RegistrationResponse {
  success: boolean;
  workerId: string;
  message?: string;
}

interface StatusResponse {
  approved: boolean;
  rabbitmqUrl?: string;
  redisUrl?: string;
  geographic?: {
    continent?: string;
    region?: string;
    country?: string;
    city?: string;
  };
  capabilities?: string[];
}

async function registerWorker(workerId: string, location: any): Promise<boolean> {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/worker/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId,
        ownerEmail: OWNER_EMAIL,
        name: `Geographic Worker ${location.city}`,
        region: `${location.continent}.${location.region}`,
        location: location,
        capabilities: (process.env.WORKER_CAPABILITIES || 'http,https,tcp,ping').split(','),
        version: process.env.WORKER_VERSION || '6.0.7'
      })
    });

    if (!response.ok) {
      logger.error(`Registration failed: ${response.status} ${response.statusText}`);
      return false;
    }

    const result: RegistrationResponse = await response.json();
    logger.info('✅ Worker registered successfully', { workerId: result.workerId });
    return true;
  } catch (error) {
    logger.error('Failed to register worker:', error);
    return false;
  }
}

async function checkWorkerStatus(workerId: string): Promise<StatusResponse | null> {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/worker/status/${workerId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      return null;
    }

    const status: StatusResponse = await response.json();
    return status;
  } catch (error) {
    logger.error('Failed to check worker status:', error);
    return null;
  }
}

async function saveCredentials(workerId: string, rabbitmqUrl: string, redisUrl?: string) {
  try {
    await fs.writeFile(
      CREDENTIALS_FILE,
      JSON.stringify({ workerId, rabbitmqUrl, redisUrl }, null, 2)
    );
    logger.info('💾 Credentials saved locally');
  } catch (error) {
    logger.warn('Could not save credentials locally:', error);
  }
}

async function loadCredentials(): Promise<{ workerId: string; rabbitmqUrl: string; redisUrl?: string } | null> {
  try {
    const data = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function waitForApproval(workerId: string): Promise<StatusResponse> {
  logger.info('⏳ Waiting for admin approval...');
  logger.info('📋 Please approve this worker in the admin panel at:');
  logger.info(`   ${API_ENDPOINT}/admin/workers`);
  
  while (true) {
    const status = await checkWorkerStatus(workerId);
    
    if (status && status.approved && status.rabbitmqUrl) {
      logger.info('✅ Worker approved by admin!');
      return status;
    }
    
    logger.debug('Still waiting for approval...');
    await new Promise(resolve => setTimeout(resolve, 30000)); // Check every 30 seconds
  }
}

async function startAutoWorker() {
  logger.info('🚀 Starting GuardAnt Geographic Worker with auto-location detection...');
  
  try {
    // Automatycznie wykryj lokalizację
    const location = await LocationDetector.detectLocation();
    
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
    console.log(`║ 🆔 Worker ID: ${location.workerId.padEnd(39)} ║`);
    console.log(`╚═══════════════════════════════════════════════════════╝\n`);
    
    let rabbitmqUrl = process.env.RABBITMQ_URL;
    let redisUrl = process.env.REDIS_URL;
    
    // Check if we have saved credentials
    const savedCreds = await loadCredentials();
    if (savedCreds && savedCreds.workerId === location.workerId) {
      logger.info('📂 Found saved credentials, checking if still valid...');
      const status = await checkWorkerStatus(location.workerId);
      
      if (status && status.approved) {
        logger.info('✅ Using existing approved credentials');
        rabbitmqUrl = savedCreds.rabbitmqUrl;
        redisUrl = savedCreds.redisUrl || redisUrl;
      }
    }
    
    // If no valid credentials, register and wait for approval
    if (!rabbitmqUrl || rabbitmqUrl === 'amqp://rabbitmq:5672') {
      logger.info('📝 Registering worker...');
      
      // Register the worker
      const registered = await registerWorker(location.workerId, location);
      if (!registered) {
        throw new Error('Failed to register worker');
      }
      
      // Wait for approval
      const approval = await waitForApproval(location.workerId);
      
      // Save credentials
      rabbitmqUrl = approval.rabbitmqUrl!;
      redisUrl = approval.redisUrl || redisUrl || 'redis://db.guardant.me:16379';
      await saveCredentials(location.workerId, rabbitmqUrl, redisUrl);
      
      // Update location if provided by admin
      if (approval.geographic) {
        if (approval.geographic.continent) location.continent = approval.geographic.continent;
        if (approval.geographic.region) location.region = approval.geographic.region;
        if (approval.geographic.country) location.country = approval.geographic.country;
        if (approval.geographic.city) location.city = approval.geographic.city;
        
        logger.info('📍 Location updated by admin:', location);
      }
    }
    
    // Konfiguracja workera
    const config: WorkerConfig = {
      workerId: location.workerId,
      location: location,
      redisUrl: redisUrl || 'redis://db.guardant.me:16379',
      rabbitmqUrl: rabbitmqUrl!,
      capabilities: (process.env.WORKER_CAPABILITIES || 'http,https,tcp,ping').split(','),
      version: process.env.WORKER_VERSION || '6.0.7'
    };
    
    logger.info('🔧 Worker configuration:', {
      workerId: config.workerId,
      location: `${location.continent}.${location.region}.${location.country}.${location.city}`,
      redisUrl: config.redisUrl.replace(/:[^:@]+@/, ':****@'),
      rabbitmqUrl: config.rabbitmqUrl.replace(/:[^:@]+@/, ':****@'),
      capabilities: config.capabilities,
      version: config.version
    });
    
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