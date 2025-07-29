// Simplified metrics collector for standalone worker
export function getMetricsCollector(prefix: string) {
  return {
    recordMonitoringCheck: (
      nestId: string,
      serviceId: string,
      status: string,
      region: string,
      responseTime: number,
      type: string
    ) => {
      // In standalone mode, we just log metrics
      console.log(JSON.stringify({
        metric: 'monitoring_check',
        nestId,
        serviceId,
        status,
        region,
        responseTime,
        type,
        timestamp: Date.now()
      }));
    }
  };
}