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
exports.UpdateManager = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs/promises"));
const logger_1 = require("./shared/logger");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const logger = (0, logger_1.createLogger)('update-manager');
class UpdateManager {
    constructor() {
        this.isUpdating = false;
        this.updateTimeout = null;
        this.versionFile = '/app/.worker-version';
        this.currentVersion = null;
        this.loadCurrentVersion();
    }
    async loadCurrentVersion() {
        try {
            this.currentVersion = await fs.readFile(this.versionFile, 'utf-8');
            logger.info('Current version', { version: this.currentVersion });
        }
        catch (error) {
            this.currentVersion = null;
            logger.info('No version file found');
        }
    }
    getCurrentVersion() {
        return this.currentVersion;
    }
    async handleUpdateCommand(data) {
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
            }
            catch (error) {
                logger.error('Update failed', error);
                this.isUpdating = false;
            }
        }, delay);
    }
    async performUpdate(repoUrl, branch, version) {
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
        }
        catch (error) {
            logger.error('❌ Update failed', error);
            this.isUpdating = false;
            throw error;
        }
    }
    async handleRebuildCommand(data) {
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
            }
            catch (error) {
                logger.error('Rebuild failed', error);
                this.isUpdating = false;
            }
        }, delay);
    }
    async performRebuild() {
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
        }
        catch (error) {
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
exports.UpdateManager = UpdateManager;
//# sourceMappingURL=update-manager.js.map