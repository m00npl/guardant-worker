"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetricsCollector = getMetricsCollector;
// Simplified metrics collector for standalone worker
function getMetricsCollector(prefix) {
    return {
        recordMonitoringCheck: (nestId, serviceId, status, region, responseTime, type) => {
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
//# sourceMappingURL=metrics.js.map