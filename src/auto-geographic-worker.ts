#!/usr/bin/env node
import { GeographicWorker, WorkerConfig } from './geographic-worker';
import { LocationDetector } from './location-detector';
import { createLogger } from './logger';

const logger = createLogger('auto-worker');

async function startAutoWorker() {
  logger.info('🚀 Starting GuardAnt Worker with auto-location detection...');
  
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
    
    // Konfiguracja workera
    const config: WorkerConfig = {
      workerId: location.workerId,
      location: location,
      redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
      rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
      capabilities: (process.env.WORKER_CAPABILITIES || 'http,https,tcp,ping').split(','),
      version: process.env.WORKER_VERSION || '2.0.0-auto'
    };
    
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