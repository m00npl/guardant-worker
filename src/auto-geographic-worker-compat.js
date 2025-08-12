#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const geographic_worker_1 = require("./geographic-worker");
const location_detector_1 = require("./location-detector");
const logger_1 = require("./logger");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const logger = (0, logger_1.createLogger)('auto-worker');
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://guardant.me';
const CREDENTIALS_FILE = path.join(os.homedir(), '.guardant-worker-creds.json');
async function loadCredentials() {
    try {
        const data = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch {
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
        const location = await location_detector_1.LocationDetector.detectLocation();
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
        const config = {
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
            }
            else {
                logger.warn('⚠️ Could not register location with API:', response.statusText);
            }
        }
        catch (error) {
            logger.warn('⚠️ Could not connect to API to register location:', error);
        }
        // Uruchom workera
        const worker = new geographic_worker_1.GeographicWorker(config);
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
    }
    catch (error) {
        logger.error('❌ Failed to start worker:', error);
        process.exit(1);
    }
}
// Start worker
startAutoWorker().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=auto-geographic-worker-compat.js.map