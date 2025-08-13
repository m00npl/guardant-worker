// Simple logger without external dependencies
export interface Logger {
  debug: (msg: string, data?: any) => void;
  info: (msg: string, data?: any) => void;
  warn: (msg: string, data?: any) => void;
  error: (msg: string, data?: any) => void;
}

export function createLogger(name: string): Logger {
  const prefix = `[${name}]`;
  
  return {
    debug: (msg: string, data?: any) => {
      if (process.env.LOG_LEVEL === 'debug') {
        console.log(`${new Date().toISOString()} DEBUG ${prefix} ${msg}`, data || '');
      }
    },
    info: (msg: string, data?: any) => {
      console.log(`${new Date().toISOString()} INFO ${prefix} ${msg}`, data || '');
    },
    warn: (msg: string, data?: any) => {
      console.warn(`${new Date().toISOString()} WARN ${prefix} ${msg}`, data || '');
    },
    error: (msg: string, data?: any) => {
      console.error(`${new Date().toISOString()} ERROR ${prefix} ${msg}`, data || '');
    }
  };
}

export default createLogger;