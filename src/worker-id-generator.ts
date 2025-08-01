import * as os from 'os';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Generates a unique worker ID for scaled docker-compose instances
 */
export async function generateUniqueWorkerId(): Promise<string> {
  const hostname = os.hostname();
  const baseId = process.env.WORKER_ID;
  
  // If WORKER_ID is set and contains a pattern like {n}, replace it with instance number
  if (baseId && baseId.includes('{n}')) {
    // Try to detect instance number from container hostname
    const match = hostname.match(/[-_](\d+)$/);
    const instanceNum = match ? match[1] : '1';
    return baseId.replace('{n}', instanceNum);
  }
  
  // If running in Docker, try to get container ID or instance number
  if (process.env.HOSTNAME && process.env.HOSTNAME !== hostname) {
    // In docker-compose scaled services, hostname includes instance number
    const dockerHostname = process.env.HOSTNAME;
    const match = dockerHostname.match(/[-_](\d+)$/);
    if (match) {
      const instanceNum = match[1];
      const base = baseId || `${os.hostname()}-worker`;
      return `${base}-${instanceNum}`;
    }
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