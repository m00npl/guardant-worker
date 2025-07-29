import { createLogger } from './shared/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

const logger = createLogger('points-tracker');

interface CheckPoints {
  http: number;
  ping: number;
  port: number;
  dns: number;
}

interface WorkerStats {
  workerId: string;
  totalPoints: number;
  totalChecks: number;
  checksByType: Record<string, number>;
  pointsByType: Record<string, number>;
  lastReset: number;
  currentPeriod: {
    points: number;
    checks: number;
    startTime: number;
  };
  wallet?: string; // Future: crypto wallet address
}

export class PointsTracker {
  private stats: WorkerStats;
  private statsFile = '/app/.worker-stats.json';
  private saveInterval: NodeJS.Timeout;
  
  // Points per check type
  private readonly POINTS: CheckPoints = {
    http: 1,    // Basic HTTP check
    ping: 1,    // Basic ping check
    port: 2,    // Port scan (more resource intensive)
    dns: 2,     // DNS lookup
  };
  
  // Bonus multipliers
  private readonly MULTIPLIERS = {
    uptime: 1.1,      // 10% bonus for high uptime
    volume: 1.2,      // 20% bonus for high volume
    reliability: 1.15, // 15% bonus for reliability
  };

  constructor(workerId: string) {
    this.loadStats(workerId);
    
    // Auto-save every minute
    this.saveInterval = setInterval(() => {
      this.saveStats();
    }, 60000);
  }

  private async loadStats(workerId: string) {
    try {
      const data = await fs.readFile(this.statsFile, 'utf-8');
      this.stats = JSON.parse(data);
      logger.info('Loaded worker stats', { 
        totalPoints: this.stats.totalPoints,
        totalChecks: this.stats.totalChecks 
      });
    } catch (error) {
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

  private async saveStats() {
    try {
      await fs.writeFile(this.statsFile, JSON.stringify(this.stats, null, 2));
    } catch (error) {
      logger.error('Failed to save stats', error);
    }
  }

  recordCheck(type: string, success: boolean, responseTime?: number) {
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
    } else {
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

  private applyMultipliers(points: number): number {
    let multiplier = 1.0;
    
    // Volume multiplier (more checks = higher multiplier)
    const dailyChecks = this.stats.currentPeriod.checks;
    if (dailyChecks > 10000) {
      multiplier *= this.MULTIPLIERS.volume;
    } else if (dailyChecks > 5000) {
      multiplier *= 1.1;
    }
    
    // Uptime multiplier (based on period duration)
    const uptimeHours = (Date.now() - this.stats.currentPeriod.startTime) / (1000 * 60 * 60);
    if (uptimeHours > 24) {
      multiplier *= this.MULTIPLIERS.uptime;
    }
    
    return points * multiplier;
  }

  getStats(): WorkerStats {
    return { ...this.stats };
  }

  async setWalletAddress(address: string) {
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
  getEarningsEstimate(): {
    points: number;
    estimatedUSD: number;
    estimatedCrypto: number;
  } {
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