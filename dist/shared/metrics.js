// src/shared/metrics.ts
function getMetricsCollector(prefix) {
  return {
    recordMonitoringCheck(serviceName, success, responseTime, region, workerId) {
      if (process.env.DEBUG) {
        console.log(`[METRICS] ${prefix} - ${serviceName}: success=${success}, responseTime=${responseTime}ms, region=${region}, worker=${workerId}`);
      }
    }
  };
}
export {
  getMetricsCollector
};
