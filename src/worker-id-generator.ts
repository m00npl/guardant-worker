import * as os from 'os';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getWorkerInstance } from './worker-instance-tracker';

/**
 * Generates a unique worker ID for scaled docker-compose instances
 */
export async function generateUniqueWorkerId(): Promise<string> {
  const hostname = os.hostname();
  const baseId = process.env.WORKER_ID;
  
  console.log('🔍 Worker ID generation debug:', {
    hostname,
    baseId,
    HOSTNAME_env: process.env.HOSTNAME,
    containerName: process.env.CONTAINER_NAME
  });
  
  // First, try to detect container instance number from hostname
  const containerMatch = hostname.match(/[-_](\d+)$/);
  const instanceNum = containerMatch ? containerMatch[1] : null;
  
  // If WORKER_ID is set and contains a pattern like {n}, replace it with instance number
  if (baseId && baseId.includes('{n}')) {
    // Get a unique instance number using our tracker
    const trackedInstance = await getWorkerInstance(baseId);
    console.log(`📋 Using pattern ${baseId} with tracked instance ${trackedInstance}`);
    return baseId.replace('{n}', trackedInstance.toString());
  }
  
  // If we have an instance number from container, append it
  if (instanceNum) {
    const base = baseId || `${process.env.HOSTNAME || hostname}-worker`;
    console.log(`📋 Using base ${base} with instance ${instanceNum}`);
    return `${base}-${instanceNum}`;
  }
  
  // Check if we have a stored ID in the keys directory
  const keyDir = process.env.KEY_DIR || '/keys';
  const idFile = path.join(keyDir, 'worker-id');
  
  try {
    const storedId = await fs.readFile(idFile, 'utf-8');
    if (storedId.trim()) {
      return storedId.trim();
    }
  } catch (error) {
    // File doesn't exist, will generate new ID
  }
  
  // Generate new unique ID
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const newId = baseId || `${hostname}-worker-${timestamp}-${random}`;
  
  // Try to save it for persistence
  try {
    await fs.mkdir(keyDir, { recursive: true });
    await fs.writeFile(idFile, newId, 'utf-8');
  } catch (error) {
    // Ignore save errors, ID is still valid
  }
  
  return newId;
}