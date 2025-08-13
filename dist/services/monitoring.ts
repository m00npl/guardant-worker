export class MonitoringService {
  constructor(private region: string) {}
  
  async checkService(url: string): Promise<any> {
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(30000)
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: response.ok,
        statusCode: response.status,
        responseTime,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }
}