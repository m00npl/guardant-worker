import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import * as path from 'path';

const WORKER_ID_FILE = path.join(os.homedir(), '.guardant-worker-id');

/**
 * Generate a unique worker ID that persists across restarts
 * Priority:
 * 1. Environment variable WORKER_ID
 * 2. Saved ID from file
 * 3. Generate new ID and save it
 */
export async function generateUniqueWorkerId(): Promise<string> {
  // 1. Check environment variable
  if (process.env.WORKER_ID) {
    console.log(`Using worker ID from environment: ${process.env.WORKER_ID}`);
    return process.env.WORKER_ID;
  }

  // 2. Try to load saved ID
  try {
    const savedId = await fs.readFile(WORKER_ID_FILE, 'utf-8');
    if (savedId && savedId.trim()) {
      console.log(`Using saved worker ID: ${savedId.trim()}`);
      return savedId.trim();
    }
  } catch (error) {
    // File doesn't exist, will generate new ID
  }

  // 3. Generate new persistent ID
  const timestamp = Date.now();
  const hostname = os.hostname();
  const randomBytes = crypto.randomBytes(6).toString('hex');
  
  // Format: wkr_timestamp_randomhex
  const workerId = `wkr_${timestamp}_${randomBytes}`;
  
  // Save to file for persistence
  try {
    await fs.writeFile(WORKER_ID_FILE, workerId, 'utf-8');
    console.log(`Generated and saved new worker ID: ${workerId}`);
  } catch (error) {
    console.error('Failed to save worker ID to file:', error);
  }

  return workerId;
}

/**
 * Clear the saved worker ID (useful for testing or reset)
 */
export async function clearWorkerId(): Promise<void> {
  try {
    await fs.unlink(WORKER_ID_FILE);
    console.log('Worker ID cleared');
  } catch (error) {
    // File might not exist
  }
}

/**
 * Synchronous version for use in constructors
 */
export function generateUniqueWorkerIdSync(): string {
  // 1. Check environment variable
  if (process.env.WORKER_ID) {
    console.log(`Using worker ID from environment: ${process.env.WORKER_ID}`);
    return process.env.WORKER_ID;
  }

  // 2. Try to load saved ID
  try {
    const savedId = fsSync.readFileSync(WORKER_ID_FILE, 'utf-8');
    if (savedId && savedId.trim()) {
      console.log(`Using saved worker ID: ${savedId.trim()}`);
      return savedId.trim();
    }
  } catch (error) {
    // File doesn't exist, will generate new ID
  }

  // 3. Generate new persistent ID
  const timestamp = Date.now();
  const hostname = os.hostname();
  const randomBytes = crypto.randomBytes(6).toString('hex');
  
  // Format: wkr_timestamp_randomhex
  const workerId = `wkr_${timestamp}_${randomBytes}`;
  
  // Save to file for persistence
  try {
    fsSync.writeFileSync(WORKER_ID_FILE, workerId, 'utf-8');
    console.log(`Generated and saved new worker ID: ${workerId}`);
  } catch (error) {
    console.error('Failed to save worker ID to file:', error);
  }

  return workerId;
}