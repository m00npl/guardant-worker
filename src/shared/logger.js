"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = createLogger;
const winston_1 = __importDefault(require("winston"));
const format = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const log = {
        timestamp,
        level: level.toUpperCase(),
        message,
        context: {
            service: context || 'worker',
            ...meta
        }
    };
    return JSON.stringify(log);
}));
function createLogger(service) {
    return winston_1.default.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format,
        defaultMeta: { service },
        transports: [
            new winston_1.default.transports.Console()
        ]
    });
}
//# sourceMappingURL=logger.js.map