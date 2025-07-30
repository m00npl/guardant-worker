#!/usr/bin/env bun
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
exports.bootstrap = bootstrap;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const crypto_1 = __importDefault(require("crypto"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Bootstrap configuration
const BOOTSTRAP_CONFIG = {
    registrationUrl: process.env.REGISTRATION_URL || 'https://guardant.me/api/public/workers/register',
    registrationToken: process.env.REGISTRATION_TOKEN || '', // Optional pre-shared token
    configFile: '.env',
    keyFile: '.worker-key',
};
async function generateWorkerKey() {
    return new Promise((resolve, reject) => {
        crypto_1.default.generateKeyPair('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        }, (err, publicKey, privateKey) => {
            if (err)
                reject(err);
            else
                resolve({ publicKey, privateKey });
        });
    });
}
async function getSystemInfo() {
    const hostname = os.hostname();
    const platform = os.platform();
    // Try to get public IP
    let ip = 'unknown';
    try {
        const response = await axios_1.default.get('https://api.ipify.org?format=json', { timeout: 5000 });
        ip = response.data.ip;
    }
    catch (error) {
        console.warn('Could not get public IP:', error.message);
    }
    return { hostname, platform, ip };
}
async function getOwnerEmail() {
    const readline = await Promise.resolve().then(() => __importStar(require('readline')));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question('📧 Please enter your email address: ', (email) => {
            rl.close();
            resolve(email.trim());
        });
    });
}
async function registerWorker() {
    console.log('🚀 GuardAnt Worker Bootstrap');
    console.log('============================');
    // Check if already configured
    try {
        await fs.access(BOOTSTRAP_CONFIG.configFile);
        console.log('✅ Worker already configured. Starting...');
        return null; // Will use existing config
    }
    catch (error) {
        // Config doesn't exist, continue with registration
    }
    console.log('📝 Registering new worker...');
    // Get owner email
    let ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) {
        ownerEmail = await getOwnerEmail();
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        while (!emailRegex.test(ownerEmail)) {
            console.log('❌ Invalid email format. Please try again.');
            ownerEmail = await getOwnerEmail();
        }
    }
    console.log(`✉️  Owner email: ${ownerEmail}`);
    // Generate worker key pair
    const { publicKey, privateKey } = await generateWorkerKey();
    await fs.writeFile(BOOTSTRAP_CONFIG.keyFile, privateKey, { mode: 0o600 });
    // Get system info
    const systemInfo = await getSystemInfo();
    const workerId = `worker-${systemInfo.hostname}-${Date.now()}`;
    // Prepare registration data
    const registration = {
        workerId,
        hostname: systemInfo.hostname,
        platform: systemInfo.platform,
        ip: systemInfo.ip,
        publicKey,
        ownerEmail,
    };
    console.log(`📍 Worker ID: ${workerId}`);
    console.log(`🖥️  System: ${systemInfo.platform} @ ${systemInfo.hostname}`);
    console.log(`🌐 IP: ${systemInfo.ip}`);
    console.log(`📧 Owner: ${ownerEmail}`);
    try {
        // Send registration request
        const headers = {
            'Content-Type': 'application/json',
        };
        if (BOOTSTRAP_CONFIG.registrationToken) {
            headers['X-Registration-Token'] = BOOTSTRAP_CONFIG.registrationToken;
        }
        const response = await axios_1.default.post(BOOTSTRAP_CONFIG.registrationUrl, registration, { headers, timeout: 30000 });
        const config = response.data;
        if (!config.approved) {
            console.log('⏳ Registration submitted. Waiting for approval...');
            console.log('   Admin needs to approve this worker in GuardAnt dashboard.');
            console.log(`   Worker ID: ${workerId}`);
            console.log(`   Owner: ${ownerEmail}`);
            // Poll for approval
            return await waitForApproval(workerId);
        }
        return config;
    }
    catch (error) {
        if (error.response?.status === 401) {
            console.error('❌ Invalid registration token');
        }
        else {
            console.error('❌ Registration failed:', error.message);
        }
        throw error;
    }
}
async function waitForApproval(workerId) {
    console.log('⏳ Polling for approval...');
    const pollUrl = `${BOOTSTRAP_CONFIG.registrationUrl}/${workerId}/status`;
    let attempts = 0;
    const maxAttempts = 360; // 30 minutes with 5 second intervals
    while (attempts < maxAttempts) {
        try {
            const response = await axios_1.default.get(pollUrl, { timeout: 5000 });
            const config = response.data;
            if (config.approved) {
                console.log('✅ Worker approved!');
                return config;
            }
        }
        catch (error) {
            // Ignore errors during polling
        }
        attempts++;
        if (attempts % 12 === 0) { // Every minute
            console.log(`   Still waiting... (${attempts * 5}s elapsed)`);
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    throw new Error('Approval timeout - please check with administrator');
}
async function saveConfig(config, ownerEmail) {
    if (!config.rabbitmqUrl) {
        throw new Error('No RabbitMQ URL provided - worker not approved yet');
    }
    const envContent = `# GuardAnt Worker Configuration
# Auto-generated on ${new Date().toISOString()}

RABBITMQ_URL=${config.rabbitmqUrl}
WORKER_ID=${config.workerId}
WORKER_REGION=${config.region}
OWNER_EMAIL=${ownerEmail}
LOG_LEVEL=info
`;
    await fs.writeFile(BOOTSTRAP_CONFIG.configFile, envContent);
    console.log('💾 Configuration saved to .env');
}
async function startWorker() {
    console.log('🚀 Starting worker...');
    // Start using docker compose
    try {
        await execAsync('docker compose up -d');
        console.log('✅ Worker started successfully!');
        console.log('📊 View logs: docker compose logs -f');
    }
    catch (error) {
        console.error('❌ Failed to start worker:', error.message);
        throw error;
    }
}
// Main bootstrap flow
async function bootstrap() {
    try {
        const config = await registerWorker();
        if (config && config.approved && config.rabbitmqUrl) {
            const ownerEmail = process.env.OWNER_EMAIL || await getOwnerEmail();
            await saveConfig(config, ownerEmail);
        }
        else if (config) {
            console.log('⏳ Worker registered but not approved yet');
            console.log('   Cannot start until admin approves');
            process.exit(0);
        }
        await startWorker();
    }
    catch (error) {
        console.error('❌ Bootstrap failed:', error.message);
        process.exit(1);
    }
}
// Run if called directly
if (import.meta.main) {
    bootstrap();
}
//# sourceMappingURL=bootstrap.js.map