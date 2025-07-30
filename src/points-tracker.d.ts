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
    wallet?: string;
}
export declare class PointsTracker {
    private stats;
    private statsFile;
    private saveInterval;
    private readonly POINTS;
    private readonly MULTIPLIERS;
    constructor(workerId: string);
    private loadStats;
    private saveStats;
    recordCheck(type: string, success: boolean, responseTime?: number): any;
    private applyMultipliers;
    getStats(): WorkerStats;
    setWalletAddress(address: string): Promise<void>;
    resetPeriod(): Promise<{
        points: number;
        checks: number;
        startTime: number;
    }>;
    getEarningsEstimate(): {
        points: number;
        estimatedUSD: number;
        estimatedCrypto: number;
    };
    cleanup(): void;
}
export {};
//# sourceMappingURL=points-tracker.d.ts.map