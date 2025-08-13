export function getMetricsCollector(prefix: string) {
  return {
    recordMonitoringCheck(serviceName: string, success: boolean, responseTime: number, region: string, workerId: string) {
      // Metrics collection would go here if needed
      // For now, just log in debug mode
      if (process.env.DEBUG) {
        console.log(`[METRICS] ${prefix} - ${serviceName}: success=${success}, responseTime=${responseTime}ms, region=${region}, worker=${workerId}`);
      }
    }
  };
}