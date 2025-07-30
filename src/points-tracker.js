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
exports.PointsTracker = void 0;
const logger_1 = require("./shared/logger");
const fs = __importStar(require("fs/promises"));
const logger = (0, logger_1.createLogger)('points-tracker');
class PointsTracker {
    constructor(workerId) {
        this.statsFile = '/app/.worker-stats.json';
        // Points per check type
        this.POINTS = {
            http: 1, // Basic HTTP check
            ping: 1, // Basic ping check
            port: 2, // Port scan (more resource intensive)
            dns: 2, // DNS lookup
        };
        // Bonus multipliers
        this.MULTIPLIERS = {
            uptime: 1.1, // 10% bonus for high uptime
            volume: 1.2, // 20% bonus for high volume
            reliability: 1.15, // 15% bonus for reliability
        };
        this.loadStats(workerId);
        // Auto-save every minute
        this.saveInterval = setInterval(() => {
            this.saveStats();
        }, 60000);
    }
    async loadStats(workerId) {
        try {
            const data = await fs.readFile(this.statsFile, 'utf-8');
            this.stats = JSON.parse(data);
            logger.info('Loaded worker stats', {
                totalPoints: this.stats.totalPoints,
                totalChecks: this.stats.totalChecks
            });
        }
        catch (error) {
            // Initialize new stats
            this.stats = {
                workerId,
                totalPoints: 0,
                totalChecks: 0,
                checksByType: {},
                pointsByType: {},
                lastReset: Date.now(),
                currentPeriod: {
                    points: 0,
                    checks: 0,
                    startTime: Date.now(),
                },
            };
            logger.info('Initialized new worker stats');
        }
    }
    async saveStats() {
        try {
            await fs.writeFile(this.statsFile, JSON.stringify(this.stats, null, 2));
        }
        catch (error) {
            logger.error('Failed to save stats', error);
        }
    }
    recordCheck(type, success, responseTime) {
        const basePoints = this.POINTS[type] || 1;
        let points = basePoints;
        // Apply modifiers
        if (success) {
            // Bonus for successful checks
            points *= 1.0;
            // Speed bonus (faster response = more points)
            if (responseTime && responseTime < 100) {
                points *= 1.1; // 10% bonus for fast responses
            }
        }
        else {
            // Partial points for failed checks (still consumed resources)
            points *= 0.5;
        }
        // Apply global multipliers based on performance
        points = this.applyMultipliers(points);
        // Round to 2 decimal places
        points = Math.round(points * 100) / 100;
        // Update stats
        this.stats.totalPoints += points;
        this.stats.totalChecks++;
        this.stats.currentPeriod.points += points;
        this.stats.currentPeriod.checks++;
        // Track by type
        this.stats.checksByType[type] = (this.stats.checksByType[type] || 0) + 1;
        this.stats.pointsByType[type] = (this.stats.pointsByType[type] || 0) + points;
        logger.debug('Check recorded', {
            type,
            success,
            points,
            totalPoints: this.stats.totalPoints
        });
        return points;
    }
    applyMultipliers(points) {
        let multiplier = 1.0;
        // Volume multiplier (more checks = higher multiplier)
        const dailyChecks = this.stats.currentPeriod.checks;
        if (dailyChecks > 10000) {
            multiplier *= this.MULTIPLIERS.volume;
        }
        else if (dailyChecks > 5000) {
            multiplier *= 1.1;
        }
        // Uptime multiplier (based on period duration)
        const uptimeHours = (Date.now() - this.stats.currentPeriod.startTime) / (1000 * 60 * 60);
        if (uptimeHours > 24) {
            multiplier *= this.MULTIPLIERS.uptime;
        }
        return points * multiplier;
    }
    getStats() {
        return { ...this.stats };
    }
    async setWalletAddress(address) {
        this.stats.wallet = address;
        await this.saveStats();
        logger.info('Wallet address set', { address });
    }
    // Reset period (for monthly/weekly billing)
    async resetPeriod() {
        const period = { ...this.stats.currentPeriod };
        this.stats.lastReset = Date.now();
        this.stats.currentPeriod = {
            points: 0,
            checks: 0,
            startTime: Date.now(),
        };
        await this.saveStats();
        logger.info('Period reset', {
            periodPoints: period.points,
            periodChecks: period.checks
        });
        return period;
    }
    // Get earnings estimate (future implementation)
    getEarningsEstimate() {
        const pointValue = 0.00001; // $0.00001 per point (example)
        const cryptoRate = 0.000000001; // Crypto units per point (example)
        return {
            points: this.stats.currentPeriod.points,
            estimatedUSD: this.stats.currentPeriod.points * pointValue,
            estimatedCrypto: this.stats.currentPeriod.points * cryptoRate,
        };
    }
    cleanup() {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
        this.saveStats();
    }
}
exports.PointsTracker = PointsTracker;
//# sourceMappingURL=points-tracker.js.map