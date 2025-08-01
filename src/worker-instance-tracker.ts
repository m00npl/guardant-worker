import * as fs from 'fs/promises';
import * as path from 'path';

const INSTANCE_FILE = '/tmp/guardant-worker-instances.json';
const LOCK_FILE = '/tmp/guardant-worker-instances.lock';
const MAX_WAIT = 5000; // 5 seconds max wait for lock

interface InstanceData {
  instances: { [workerId: string]: number };
  lastCleanup: number;
}

async function waitForLock(): Promise<void> {
  const startTime = Date.now();
  while (true) {
    try {
      // Try to create lock file exclusively
      await fs.writeFile(LOCK_FILE, process.pid.toString(), { flag: 'wx' });
      return;
    } catch (error) {
      // Lock exists, wait a bit
      if (Date.now() - startTime > MAX_WAIT) {
        // Force unlock if waited too long
        await fs.unlink(LOCK_FILE).catch(() => {});
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

async function releaseLock(): Promise<void> {
  await fs.unlink(LOCK_FILE).catch(() => {});
}

async function cleanupOldInstances(data: InstanceData): Promise<void> {
  // Clean up entries older than 5 minutes
  const now = Date.now();
  if (now - data.lastCleanup > 300000) { // 5 minutes
    // For now, just reset if too old
    data.instances = {};
    data.lastCleanup = now;
  }
}

export async function getWorkerInstance(baseWorkerId: string): Promise<number> {
  await waitForLock();
  
  try {
    let data: InstanceData;
    
    try {
      const content = await fs.readFile(INSTANCE_FILE, 'utf-8');
      data = JSON.parse(content);
    } catch (error) {
      // File doesn't exist or is invalid
      data = { instances: {}, lastCleanup: Date.now() };
    }
    
    await cleanupOldInstances(data);
    
    // Find the lowest available instance number
    const usedNumbers = new Set(Object.values(data.instances));
    let instanceNum = 1;
    while (usedNumbers.has(instanceNum)) {
      instanceNum++;
    }
    
    // Reserve this instance number
    const instanceId = `${process.pid}-${Date.now()}`;
    data.instances[instanceId] = instanceNum;
    
    // Save updated data
    await fs.writeFile(INSTANCE_FILE, JSON.stringify(data, null, 2));
    
    return instanceNum;
  } finally {
    await releaseLock();
  }
}