// src/shared/logger.ts
function createLogger(name) {
  const formatTime = () => new Date().toISOString();
  return {
    info: (...args) => console.log(`[${formatTime()}] [INFO] [${name}]`, ...args),
    error: (...args) => console.error(`[${formatTime()}] [ERROR] [${name}]`, ...args),
    warn: (...args) => console.warn(`[${formatTime()}] [WARN] [${name}]`, ...args),
    debug: (...args) => {
      if (process.env.DEBUG) {
        console.log(`[${formatTime()}] [DEBUG] [${name}]`, ...args);
      }
    }
  };
}
export {
  createLogger
};
