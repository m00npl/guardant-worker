import { createLogger } from '../shared/logger';
import axios from 'axios';

const logger = createLogger('region-detector');

// Map IP geolocation to AWS-style regions
const COUNTRY_TO_REGION: Record<string, string> = {
  // Europe
  'DE': 'eu-west-1',      // Germany -> Frankfurt
  'FR': 'eu-west-1',      // France -> Frankfurt
  'GB': 'eu-west-1',      // UK -> Frankfurt
  'NL': 'eu-west-1',      // Netherlands -> Frankfurt
  'BE': 'eu-west-1',      // Belgium -> Frankfurt
  'PL': 'eu-central-1',   // Poland -> Warsaw
  'CZ': 'eu-central-1',   // Czech Republic -> Warsaw
  'SK': 'eu-central-1',   // Slovakia -> Warsaw
  
  // Americas
  'US': 'us-east-1',      // USA (default to east)
  'CA': 'us-east-1',      // Canada -> US East
  'MX': 'us-east-1',      // Mexico -> US East
  'BR': 'sa-east-1',      // Brazil -> São Paulo
  
  // Asia Pacific
  'SG': 'ap-southeast-1', // Singapore
  'MY': 'ap-southeast-1', // Malaysia -> Singapore
  'TH': 'ap-southeast-1', // Thailand -> Singapore
  'JP': 'ap-northeast-1', // Japan -> Tokyo
  'KR': 'ap-northeast-2', // South Korea -> Seoul
  'IN': 'ap-south-1',     // India -> Mumbai
  'AU': 'ap-southeast-2', // Australia -> Sydney
  'NZ': 'ap-southeast-2', // New Zealand -> Sydney
  
  // Middle East & Africa
  'AE': 'me-south-1',     // UAE -> Bahrain
  'SA': 'me-south-1',     // Saudi Arabia -> Bahrain
  'ZA': 'af-south-1',     // South Africa -> Cape Town
};

// Map US states to specific regions
const US_STATE_TO_REGION: Record<string, string> = {
  'CA': 'us-west-1',      // California
  'OR': 'us-west-2',      // Oregon
  'WA': 'us-west-2',      // Washington
  'NV': 'us-west-1',      // Nevada
  'AZ': 'us-west-1',      // Arizona
  // All others default to us-east-1
};

export async function detectRegion(): Promise<string> {
  try {
    // Try multiple IP geolocation services for reliability
    const geoData = await tryGeoServices();
    
    if (!geoData) {
      logger.warn('Could not detect region via IP geolocation');
      return 'auto';
    }
    
    logger.info('Detected location', geoData);
    
    // Map country to region
    let region = COUNTRY_TO_REGION[geoData.country] || 'auto';
    
    // For US, try to get more specific based on state
    if (geoData.country === 'US' && geoData.state) {
      region = US_STATE_TO_REGION[geoData.state] || 'us-east-1';
    }
    
    logger.info(`Mapped location to region: ${region}`, {
      country: geoData.country,
      state: geoData.state,
      city: geoData.city,
      region
    });
    
    return region;
  } catch (error) {
    logger.error('Failed to detect region', error);
    return 'auto';
  }
}

interface GeoData {
  country: string;
  state?: string;
  city?: string;
  ip?: string;
}

async function tryGeoServices(): Promise<GeoData | null> {
  // Try multiple services in order
  const services = [
    tryIpApi,
    tryIpInfo,
    tryCloudflare,
  ];
  
  for (const service of services) {
    try {
      const result = await service();
      if (result) return result;
    } catch (error) {
      logger.debug(`Geo service failed: ${service.name}`, error);
    }
  }
  
  return null;
}

async function tryIpApi(): Promise<GeoData | null> {
  const response = await axios.get('http://ip-api.com/json/', {
    timeout: 5000,
  });
  
  if (response.data.status === 'success') {
    return {
      country: response.data.countryCode,
      state: response.data.region,
      city: response.data.city,
      ip: response.data.query,
    };
  }
  
  return null;
}

async function tryIpInfo(): Promise<GeoData | null> {
  const response = await axios.get('https://ipinfo.io/json', {
    timeout: 5000,
  });
  
  if (response.data.country) {
    return {
      country: response.data.country,
      state: response.data.region,
      city: response.data.city,
      ip: response.data.ip,
    };
  }
  
  return null;
}

async function tryCloudflare(): Promise<GeoData | null> {
  const response = await axios.get('https://1.1.1.1/cdn-cgi/trace', {
    timeout: 5000,
  });
  
  const lines = response.data.split('\n');
  const data: Record<string, string> = {};
  
  for (const line of lines) {
    const [key, value] = line.split('=');
    if (key && value) {
      data[key] = value;
    }
  }
  
  if (data.loc) {
    return {
      country: data.loc,
      ip: data.ip,
    };
  }
  
  return null;
}