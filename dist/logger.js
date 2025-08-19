"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = createLogger;
function createLogger(name) {
    const prefix = `[${name}]`;
    return {
        debug: (msg, data) => {
            if (process.env.LOG_LEVEL === 'debug') {
                console.log(`${new Date().toISOString()} DEBUG ${prefix} ${msg}`, data || '');
            }
        },
        info: (msg, data) => {
            console.log(`${new Date().toISOString()} INFO ${prefix} ${msg}`, data || '');
        },
        warn: (msg, data) => {
            console.warn(`${new Date().toISOString()} WARN ${prefix} ${msg}`, data || '');
        },
        error: (msg, data) => {
            console.error(`${new Date().toISOString()} ERROR ${prefix} ${msg}`, data || '');
        }
    };
}
exports.default = createLogger;
