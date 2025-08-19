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
exports.generateUniqueWorkerId = generateUniqueWorkerId;
exports.clearWorkerId = clearWorkerId;
exports.generateUniqueWorkerIdSync = generateUniqueWorkerIdSync;
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const WORKER_ID_FILE = path.join(os.homedir(), '.guardant-worker-id');
async function generateUniqueWorkerId() {
    if (process.env.WORKER_ID) {
        console.log(`Using worker ID from environment: ${process.env.WORKER_ID}`);
        return process.env.WORKER_ID;
    }
    try {
        const savedId = await fs.readFile(WORKER_ID_FILE, 'utf-8');
        if (savedId && savedId.trim()) {
            console.log(`Using saved worker ID: ${savedId.trim()}`);
            return savedId.trim();
        }
    }
    catch (error) {
    }
    const timestamp = Date.now();
    const hostname = os.hostname();
    const randomBytes = crypto.randomBytes(6).toString('hex');
    const workerId = `wkr_${timestamp}_${randomBytes}`;
    try {
        await fs.writeFile(WORKER_ID_FILE, workerId, 'utf-8');
        console.log(`Generated and saved new worker ID: ${workerId}`);
    }
    catch (error) {
        console.error('Failed to save worker ID to file:', error);
    }
    return workerId;
}
async function clearWorkerId() {
    try {
        await fs.unlink(WORKER_ID_FILE);
        console.log('Worker ID cleared');
    }
    catch (error) {
    }
}
function generateUniqueWorkerIdSync() {
    if (process.env.WORKER_ID) {
        console.log(`Using worker ID from environment: ${process.env.WORKER_ID}`);
        return process.env.WORKER_ID;
    }
    try {
        const savedId = fsSync.readFileSync(WORKER_ID_FILE, 'utf-8');
        if (savedId && savedId.trim()) {
            console.log(`Using saved worker ID: ${savedId.trim()}`);
            return savedId.trim();
        }
    }
    catch (error) {
    }
    const timestamp = Date.now();
    const hostname = os.hostname();
    const randomBytes = crypto.randomBytes(6).toString('hex');
    const workerId = `wkr_${timestamp}_${randomBytes}`;
    try {
        fsSync.writeFileSync(WORKER_ID_FILE, workerId, 'utf-8');
        console.log(`Generated and saved new worker ID: ${workerId}`);
    }
    catch (error) {
        console.error('Failed to save worker ID to file:', error);
    }
    return workerId;
}
