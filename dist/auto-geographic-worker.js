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
const simple_logger_1 = require("./simple-logger");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const logger = (0, simple_logger_1.createLogger)('auto-worker');
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://guardant.me';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'admin@guardant.me';
const CREDENTIALS_FILE = path.join(os.homedir(), '.guardant-worker-creds.json');
async function registerWorker(workerId, location) {
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
                version: process.env.WORKER_VERSION || '6.4.5'
            })
        });
        if (!response.ok) {
            logger.error(`Registration failed: ${response.status} ${response.statusText}`);
            return false;
        }
        const result = await response.json();
        logger.info('✅ Worker registered successfully', { workerId: result.workerId });
        return true;
    }
    catch (error) {
        logger.error('Failed to register worker:', error);
        return false;
    }
}
async function checkWorkerStatus(workerId) {
    try {
        const response = await fetch(`${API_ENDPOINT}/api/worker/status/${workerId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            return null;
        }
        const status = await response.json();
        return status;
    }
    catch (error) {
        logger.error('Failed to check worker status:', error);
        return null;
    }
}
async function saveCredentials(workerId, rabbitmqUrl) {
    try {
        await fs.writeFile(CREDENTIALS_FILE, JSON.stringify({ workerId, rabbitmqUrl }, null, 2));
        logger.info('💾 Credentials saved locally');
    }
    catch (error) {
        logger.warn('Could not save credentials locally:', error);
    }
}
async function loadCredentials() {
    try {
        const data = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch {
        return null;
    }
}
async function waitForApproval(workerId) {
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
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
}
async function startAutoWorker() {
    logger.info('🚀 Starting GuardAnt Geographic Worker with auto-location detection...');
    try {
        const location = await location_detector_1.LocationDetector.detectLocation();
        logger.info('📍 Detected location:', {
            continent: location.continent,
            region: location.region,
            country: location.country,
            city: location.city,
            workerId: location.workerId
        });
        const locationString = `${location.continent}.${location.region}.${location.country}.${location.city}`;
        console.log(`\n╔═══════════════════════════════════════════════════════╗`);
        console.log(`║ 🌍 Worker Location: ${locationString.padEnd(33)} ║`);
        console.log(`║ 🆔 Worker ID: ${location.workerId.padEnd(39)} ║`);
        console.log(`╚═══════════════════════════════════════════════════════╝\n`);
        let rabbitmqUrl = process.env.RABBITMQ_URL;
        const savedCreds = await loadCredentials();
        if (savedCreds && savedCreds.workerId === location.workerId) {
            logger.info('📂 Found saved credentials, checking if still valid...');
            const status = await checkWorkerStatus(location.workerId);
            if (status && status.approved) {
                logger.info('✅ Using existing approved credentials');
                rabbitmqUrl = savedCreds.rabbitmqUrl;
            }
        }
        if (!rabbitmqUrl || rabbitmqUrl === 'amqp://rabbitmq:5672') {
            logger.info('📝 Registering worker...');
            const registered = await registerWorker(location.workerId, location);
            if (!registered) {
                throw new Error('Failed to register worker');
            }
            const approval = await waitForApproval(location.workerId);
            rabbitmqUrl = approval.rabbitmqUrl;
            await saveCredentials(location.workerId, rabbitmqUrl);
            if (approval.geographic) {
                if (approval.geographic.continent)
                    location.continent = approval.geographic.continent;
                if (approval.geographic.region)
                    location.region = approval.geographic.region;
                if (approval.geographic.country)
                    location.country = approval.geographic.country;
                if (approval.geographic.city)
                    location.city = approval.geographic.city;
                logger.info('📍 Location updated by admin:', location);
            }
        }
        const config = {
            workerId: location.workerId,
            location: location,
            rabbitmqUrl: rabbitmqUrl,
            capabilities: (process.env.WORKER_CAPABILITIES || 'http,https,tcp,ping').split(','),
            version: process.env.WORKER_VERSION || '6.4.5'
        };
        logger.info('🔧 Worker configuration:', {
            workerId: config.workerId,
            location: `${location.continent}.${location.region}.${location.country}.${location.city}`,
            rabbitmqUrl: config.rabbitmqUrl.replace(/:[^:@]+@/, ':****@'),
            capabilities: config.capabilities,
            version: config.version
        });
        const worker = new geographic_worker_1.GeographicWorker(config);
        await worker.start();
        logger.info('✅ Worker started successfully');
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
startAutoWorker().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
