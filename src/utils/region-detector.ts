export async function detectRegion(): Promise<string | null> {
  try {
    // Try to detect region from IP geolocation
    const response = await fetch('http://ip-api.com/json/', {
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json() as any;
    
    // Map country to region
    const regionMap: Record<string, string> = {
      'United States': 'us-east',
      'Canada': 'us-east',
      'United Kingdom': 'europe',
      'Germany': 'europe',
      'France': 'europe',
      'Poland': 'europe',
      'Netherlands': 'europe',
      'Singapore': 'asia',
      'Japan': 'asia',
      'Australia': 'oceania',
      'Brazil': 'south-america',
      'India': 'asia'
    };
    
    return regionMap[data.country] || null;
  } catch (error) {
    console.error('Failed to detect region:', error);
    return null;
  }
}