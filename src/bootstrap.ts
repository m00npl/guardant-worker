#!/usr/bin/env bun

import axios from 'axios';
import * as fs from 'fs/promises';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);

// Check if command exists
async function commandExists(cmd: string): Promise<boolean> {
  try {
    await execAsync(`which ${cmd}`);
    return true;
  } catch {
    return false;
  }
}

// Check system requirements
async function checkRequirements(): Promise<boolean> {
  console.log('🔍 Checking system requirements...');
  
  const requirements = {
    docker: { 
      name: 'Docker', 
      check: async () => await commandExists('docker'),
      install: 'curl -fsSL https://get.docker.com | sh'
    },
    git: { 
      name: 'Git', 
      check: async () => await commandExists('git'),
      install: 'apt-get update && apt-get install -y git'
    },
    curl: { 
      name: 'curl', 
      check: async () => await commandExists('curl'),
      install: 'apt-get update && apt-get install -y curl'
    }
  };

  let allPresent = true;
  const missing: string[] = [];

  for (const [cmd, info] of Object.entries(requirements)) {
    const exists = await info.check();
    if (exists) {
      console.log(`✅ ${info.name} is installed`);
    } else {
      console.log(`❌ ${info.name} is NOT installed`);
      missing.push(cmd);
      allPresent = false;
    }
  }

  if (!allPresent) {
    console.log('\n❌ Missing required dependencies!');
    console.log('\nTo install missing dependencies, run:\n');
    
    for (const cmd of missing) {
      const info = requirements[cmd];
      console.log(`# Install ${info.name}:`);
      console.log(`sudo ${info.install}`);
      console.log('');
    }
    
    // Check if we have sudo access
    try {
      await execAsync('sudo -n true');
      console.log('🔑 Sudo access available. Would you like to install missing dependencies automatically? (y/N)');
      // Note: In bun context, we can't easily read stdin, so we'll exit here
      console.log('\nPlease install the missing dependencies and run this script again.');
      return false;
    } catch {
      console.log('\nPlease install the missing dependencies with sudo and run this script again.');
      return false;
    }
  }

  // Check Docker Compose
  let dockerComposeCmd = '';
  try {
    await execAsync('docker compose version');
    dockerComposeCmd = 'docker compose';
    console.log('✅ Docker Compose (v2) is installed');
  } catch {
    try {
      await execAsync('docker-compose --version');
      dockerComposeCmd = 'docker-compose';
      console.log('✅ Docker Compose (v1) is installed');
    } catch {
      console.log('❌ Docker Compose is NOT installed');
      console.log('\nDocker Compose should come with Docker. Please ensure Docker is properly installed.');
      return false;
    }
  }

  console.log('\n✅ All requirements satisfied!\n');
  return true;
}

interface WorkerRegistration {
  workerId: string;
  hostname: string;
  platform: string;
  ip: string;
  publicKey: string;
  ownerEmail: string;
}

interface WorkerConfig {
  workerId: string;
  rabbitmqUrl?: string; // Only provided after approval
  region: string;
  approved: boolean;
}

// Bootstrap configuration
const BOOTSTRAP_CONFIG = {
  registrationUrl: process.env.REGISTRATION_URL || 'https://guardant.me/api/public/workers/register',
  registrationToken: process.env.REGISTRATION_TOKEN || '', // Optional pre-shared token
  configFile: '.env',
  keyFile: '.worker-key',
};

async function generateWorkerKey(): Promise<{ publicKey: string; privateKey: string }> {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair('rsa', {
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
      if (err) reject(err);
      else resolve({ publicKey, privateKey });
    });
  });
}

async function getSystemInfo() {
  const hostname = os.hostname();
  const platform = os.platform();
  
  // Try to get public IP
  let ip = 'unknown';
  try {
    const response = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
    ip = response.data.ip;
  } catch (error) {
    console.warn('Could not get public IP:', error.message);
  }
  
  return { hostname, platform, ip };
}

async function getOwnerEmail(): Promise<string> {
  const readline = await import('readline');
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

async function registerWorker(): Promise<WorkerConfig> {
  console.log('🚀 GuardAnt Worker Bootstrap');
  console.log('============================');
  
  // Check if already configured
  try {
    await fs.access(BOOTSTRAP_CONFIG.configFile);
    console.log('✅ Worker already configured. Starting...');
    return null; // Will use existing config
  } catch (error) {
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
  const registration: WorkerRegistration = {
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
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (BOOTSTRAP_CONFIG.registrationToken) {
      headers['X-Registration-Token'] = BOOTSTRAP_CONFIG.registrationToken;
    }
    
    const response = await axios.post(
      BOOTSTRAP_CONFIG.registrationUrl,
      registration,
      { headers, timeout: 30000 }
    );
    
    const config: WorkerConfig = response.data;
    
    if (!config.approved) {
      console.log('⏳ Registration submitted. Waiting for approval...');
      console.log('   Admin needs to approve this worker in GuardAnt dashboard.');
      console.log(`   Worker ID: ${workerId}`);
      console.log(`   Owner: ${ownerEmail}`);
      
      // Poll for approval
      return await waitForApproval(workerId);
    }
    
    return config;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('❌ Invalid registration token');
    } else {
      console.error('❌ Registration failed:', error.message);
    }
    throw error;
  }
}

async function waitForApproval(workerId: string): Promise<WorkerConfig> {
  console.log('⏳ Polling for approval...');
  
  const pollUrl = `${BOOTSTRAP_CONFIG.registrationUrl}/${workerId}/status`;
  let attempts = 0;
  const maxAttempts = 360; // 30 minutes with 5 second intervals
  
  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(pollUrl, { timeout: 5000 });
      const config: WorkerConfig = response.data;
      
      if (config.approved) {
        console.log('✅ Worker approved!');
        return config;
      }
    } catch (error) {
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

async function saveConfig(config: WorkerConfig, ownerEmail: string) {
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
  
  // Determine which docker compose command to use
  let dockerComposeCmd = 'docker compose';
  try {
    await execAsync('docker compose version');
  } catch {
    try {
      await execAsync('docker-compose --version');
      dockerComposeCmd = 'docker-compose';
    } catch {
      console.error('❌ Docker Compose not found!');
      throw new Error('Docker Compose is required but not installed');
    }
  }
  
  // Start using the appropriate command
  try {
    await execAsync(`${dockerComposeCmd} up -d`);
    console.log('✅ Worker started successfully!');
    console.log(`📊 View logs: ${dockerComposeCmd} logs -f`);
  } catch (error) {
    console.error('❌ Failed to start worker:', error.message);
    throw error;
  }
}

// Main bootstrap flow
async function bootstrap() {
  console.log('🚀 GuardAnt Worker Bootstrap');
  console.log('============================\n');
  
  try {
    // Skip system requirements check if running inside Docker
    // (requirements should be checked by install.sh before running bootstrap)
    const isDocker = await fs.access('/.dockerenv').then(() => true).catch(() => false);
    
    if (!isDocker) {
      // Only check requirements if NOT running in Docker
      const requirementsMet = await checkRequirements();
      if (!requirementsMet) {
        console.error('\n❌ System requirements not met. Please install missing dependencies.');
        process.exit(1);
      }
    }
    
    const config = await registerWorker();
    
    if (config && config.approved && config.rabbitmqUrl) {
      const ownerEmail = process.env.OWNER_EMAIL || await getOwnerEmail();
      await saveConfig(config, ownerEmail);
    } else if (config) {
      console.log('⏳ Worker registered but not approved yet');
      console.log('   Cannot start until admin approves');
      process.exit(0);
    }
    
    await startWorker();
  } catch (error) {
    console.error('❌ Bootstrap failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  bootstrap();
}

export { bootstrap };