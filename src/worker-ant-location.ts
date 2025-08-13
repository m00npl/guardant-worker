export const locationDetector = {
  async detectLocation() {
    try {
      // Try to get location from IP
      const response = await fetch('http://ip-api.com/json/', { 
        signal: AbortSignal.timeout(5000) 
      });
      const data = await response.json() as any;
      
      return {
        city: data.city || 'Unknown',
        country: data.country || 'Unknown',
        region: data.regionName || 'Unknown',
        lat: data.lat,
        lon: data.lon,
        ip: data.query
      };
    } catch (error) {
      return {
        city: 'Unknown',
        country: 'Unknown',
        region: 'Unknown'
      };
    }
  }
};