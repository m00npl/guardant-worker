export function createLogger(name: string) {
  const formatTime = () => new Date().toISOString();
  
  return {
    info: (...args: any[]) => console.log(`[${formatTime()}] [INFO] [${name}]`, ...args),
    error: (...args: any[]) => console.error(`[${formatTime()}] [ERROR] [${name}]`, ...args),
    warn: (...args: any[]) => console.warn(`[${formatTime()}] [WARN] [${name}]`, ...args),
    debug: (...args: any[]) => {
      if (process.env.DEBUG) {
        console.log(`[${formatTime()}] [DEBUG] [${name}]`, ...args);
      }
    }
  };
}