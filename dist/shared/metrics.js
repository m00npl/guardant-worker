"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetricsCollector = getMetricsCollector;
function getMetricsCollector(prefix) {
    return {
        recordMonitoringCheck(serviceName, success, responseTime, region, workerId) {
            if (process.env.DEBUG) {
                console.log(`[METRICS] ${prefix} - ${serviceName}: success=${success}, responseTime=${responseTime}ms, region=${region}, worker=${workerId}`);
            }
        }
    };
}
