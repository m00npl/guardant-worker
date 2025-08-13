// src/points-tracker.ts
class PointsTracker {
  totalPoints = 0;
  currentPeriodPoints = 0;
  workerId;
  constructor(workerId) {
    this.workerId = workerId;
  }
  getStats() {
    return {
      totalPoints: this.totalPoints,
      currentPeriod: {
        points: this.currentPeriodPoints
      }
    };
  }
  getEarningsEstimate() {
    return {
      points: this.totalPoints,
      estimatedUSD: this.totalPoints * 0.001,
      estimatedCrypto: this.totalPoints * 0.00001
    };
  }
  recordCheck(success, responseTime, serviceType) {
    let points = 0;
    if (success) {
      points = 1;
      if (responseTime < 500)
        points += 0.5;
      if (responseTime < 200)
        points += 0.5;
      if (serviceType === "critical")
        points += 1;
    }
    this.totalPoints += points;
    this.currentPeriodPoints += points;
    return points;
  }
  async updateConfig(config) {}
  cleanup() {}
}
export {
  PointsTracker
};
