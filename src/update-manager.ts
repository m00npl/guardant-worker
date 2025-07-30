import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createLogger } from './shared/logger';

const execAsync = promisify(exec);
const logger = createLogger('update-manager');

export class UpdateManager {
  private isUpdating = false;
  private updateTimeout: NodeJS.Timeout | null = null;
  private versionFile = '/app/.worker-version';
  private currentVersion: string | null = null;
  
  constructor() {
    this.loadCurrentVersion();
  }
  
  private async loadCurrentVersion() {
    try {
      this.currentVersion = await fs.readFile(this.versionFile, 'utf-8');
      logger.info('Current version', { version: this.currentVersion });
    } catch (error) {
      this.currentVersion = null;
      logger.info('No version file found');
    }
  }
  
  getCurrentVersion(): string | null {
    return this.currentVersion;
  }

  async handleUpdateCommand(data: any) {
    if (this.isUpdating) {
      logger.warn('Update already in progress');
      return;
    }

    const { repoUrl, branch = 'main', version, delay = 5000 } = data;
    
    // Check if this version is already installed
    if (version && this.currentVersion === version) {
      logger.info('Version already installed', { version });
      return;
    }
    
    logger.info('📦 Update command received', { repoUrl, branch, version, delay });
    
    this.isUpdating = true;
    
    // Schedule update with delay to allow acknowledgment
    this.updateTimeout = setTimeout(async () => {
      try {
        await this.performUpdate(repoUrl, branch, version);
      } catch (error) {
        logger.error('Update failed', error);
        this.isUpdating = false;
      }
    }, delay);
  }

  private async performUpdate(repoUrl: string, branch: string, version?: string) {
    logger.info('🔄 Starting update process...');
    
    try {
      // Pull latest code
      logger.info('📥 Pulling latest code...');
      await execAsync(`git remote set-url origin ${repoUrl} || git remote add origin ${repoUrl}`);
      await execAsync(`git fetch origin ${branch}`);
      await execAsync(`git reset --hard origin/${branch}`);
      
      // Install dependencies
      logger.info('📦 Installing dependencies...');
      await execAsync('bun install');
      
      // Rebuild Docker image
      logger.info('🔨 Rebuilding Docker image...');
      await execAsync('docker compose build');
      
      // Save version if provided
      if (version) {
        await fs.writeFile(this.versionFile, version);
        logger.info('📝 Saved version', { version });
      }
      
      // Restart container
      logger.info('🔄 Restarting container...');
      await execAsync('docker compose down');
      await execAsync('docker compose up -d');
      
      logger.info('✅ Update completed successfully', { version });
      
      // Exit current process to be replaced by new container
      process.exit(0);
    } catch (error) {
      logger.error('❌ Update failed', error);
      this.isUpdating = false;
      throw error;
    }
  }

  async handleRebuildCommand(data: any) {
    if (this.isUpdating) {
      logger.warn('Update already in progress');
      return;
    }

    const { delay = 5000 } = data;
    
    logger.info('🔨 Rebuild command received', { delay });
    
    this.isUpdating = true;
    
    // Schedule rebuild with delay
    this.updateTimeout = setTimeout(async () => {
      try {
        await this.performRebuild();
      } catch (error) {
        logger.error('Rebuild failed', error);
        this.isUpdating = false;
      }
    }, delay);
  }

  private async performRebuild() {
    logger.info('🔨 Starting rebuild process...');
    
    try {
      // Rebuild Docker image
      logger.info('🔨 Rebuilding Docker image...');
      await execAsync('docker compose build --no-cache');
      
      // Restart container
      logger.info('🔄 Restarting container...');
      await execAsync('docker compose down');
      await execAsync('docker compose up -d');
      
      logger.info('✅ Rebuild completed successfully');
      
      // Exit current process
      process.exit(0);
    } catch (error) {
      logger.error('❌ Rebuild failed', error);
      this.isUpdating = false;
      throw error;
    }
  }

  cancel() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
      this.isUpdating = false;
      logger.info('🛑 Update cancelled');
    }
  }
}