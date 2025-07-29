import winston from 'winston';

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
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
  })
);

export function createLogger(service: string) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format,
    defaultMeta: { service },
    transports: [
      new winston.transports.Console()
    ]
  });
}