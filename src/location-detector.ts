import axios from 'axios';
import os from 'os';
import { GeographicLocation } from '../../shared/geographic-hierarchy';
import { createLogger } from './logger';

const logger = createLogger('location-detector');

export class LocationDetector {
  private static readonly GEO_IP_SERVICES = [
    'http://ip-api.com/json/',
    'https://ipapi.co/json/',
    'https://geolocation-db.com/json/'
  ];
  
  private static readonly CLOUD_METADATA_ENDPOINTS = {
    // AWS EC2
    aws: {
      url: 'http://169.254.169.254/latest/meta-data/placement/availability-zone',
      timeout: 500,
      parser: (data: string) => LocationDetector.parseAwsZone(data)
    },
    // Google Cloud
    gcp: {
      url: 'http://metadata.google.internal/computeMetadata/v1/instance/zone',
      headers: { 'Metadata-Flavor': 'Google' },
      timeout: 500,
      parser: (data: string) => LocationDetector.parseGcpZone(data)
    },
    // Azure
    azure: {
      url: 'http://169.254.169.254/metadata/instance/compute/location?api-version=2021-02-01',
      headers: { 'Metadata': 'true' },
      timeout: 500,
      parser: (data: string) => LocationDetector.parseAzureLocation(data)
    },
    // DigitalOcean
    digitalocean: {
      url: 'http://169.254.169.254/metadata/v1/region',
      timeout: 500,
      parser: (data: string) => LocationDetector.parseDigitalOceanRegion(data)
    },
    // Hetzner
    hetzner: {
      url: 'http://169.254.169.254/hetzner/v1/metadata/region',
      timeout: 500,
      parser: (data: string) => LocationDetector.parseHetznerRegion(data)
    }
  };
  
  /**
   * Automatycznie wykrywa lokalizację workera
   */
  static async detectLocation(): Promise<GeographicLocation> {
    logger.info('🔍 Starting automatic location detection...');
    
    // 1. Sprawdź zmienne środowiskowe (override)
    const envLocation = LocationDetector.checkEnvironmentVariables();
    if (envLocation) {
      logger.info('✅ Location from environment variables', envLocation);
      return envLocation;
    }
    
    // 2. Sprawdź metadane cloud providera
    const cloudLocation = await LocationDetector.detectCloudProvider();
    if (cloudLocation) {
      logger.info('✅ Location from cloud provider metadata', cloudLocation);
      return cloudLocation;
    }
    
    // 3. Użyj GeoIP jako fallback
    const geoIpLocation = await LocationDetector.detectViaGeoIP();
    if (geoIpLocation) {
      logger.info('✅ Location from GeoIP', geoIpLocation);
      return geoIpLocation;
    }
    
    // 4. Ostateczny fallback
    const fallbackLocation = LocationDetector.getFallbackLocation();
    logger.warn('⚠️ Using fallback location', fallbackLocation);
    return fallbackLocation;
  }
  
  /**
   * Sprawdza zmienne środowiskowe
   */
  private static checkEnvironmentVariables(): GeographicLocation | null {
    if (process.env.WORKER_LOCATION) {
      const parts = process.env.WORKER_LOCATION.split('.');
      if (parts.length >= 5) {
        return {
          continent: parts[0],
          region: parts[1],
          country: parts[2],
          city: parts[3],
          workerId: parts[4]
        };
      }
    }
    
    if (process.env.WORKER_CONTINENT && process.env.WORKER_COUNTRY) {
      return {
        continent: process.env.WORKER_CONTINENT,
        region: process.env.WORKER_REGION || 'unknown',
        country: process.env.WORKER_COUNTRY,
        city: process.env.WORKER_CITY || 'unknown',
        workerId: process.env.WORKER_ID || `worker-${os.hostname()}-${Date.now()}`
      };
    }
    
    return null;
  }
  
  /**
   * Wykrywa cloud providera i pobiera metadane
   */
  private static async detectCloudProvider(): Promise<GeographicLocation | null> {
    for (const [provider, config] of Object.entries(LocationDetector.CLOUD_METADATA_ENDPOINTS)) {
      try {
        const response = await axios.get(config.url, {
          timeout: config.timeout,
          headers: config.headers || {},
          validateStatus: () => true
        });
        
        if (response.status === 200 && response.data) {
          const location = config.parser(response.data);
          if (location) {
            logger.info(`Detected ${provider} environment`);
            return {
              ...location,
              workerId: `worker-${provider}-${os.hostname()}-${Date.now()}`
            };
          }
        }
      } catch (error) {
        // Ignore - not this provider
      }
    }
    
    return null;
  }
  
  /**
   * Wykrywa lokalizację przez GeoIP
   */
  private static async detectViaGeoIP(): Promise<GeographicLocation | null> {
    // Najpierw pobierz publiczne IP
    let publicIp: string;
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=text', { timeout: 2000 });
      publicIp = ipResponse.data.trim();
      logger.info(`Public IP: ${publicIp}`);
    } catch (error) {
      logger.error('Failed to get public IP', error);
      return null;
    }
    
    // Spróbuj różnych serwisów GeoIP
    for (const serviceUrl of LocationDetector.GEO_IP_SERVICES) {
      try {
        const response = await axios.get(serviceUrl + publicIp, { timeout: 3000 });
        const data = response.data;
        
        // Mapuj dane z różnych API
        const continent = LocationDetector.mapContinent(
          data.continent || data.continent_name || data.continentCode || 'EU'
        );
        const country = LocationDetector.normalizeString(
          data.country || data.country_name || data.countryCode || 'unknown'
        );
        const city = LocationDetector.normalizeString(
          data.city || data.city_name || data.regionName || 'unknown'
        );
        const region = LocationDetector.determineRegion(continent, country);
        
        return {
          continent,
          region,
          country,
          city,
          workerId: `worker-${city}-${os.hostname()}-${Date.now()}`
        };
      } catch (error) {
        logger.debug(`GeoIP service ${serviceUrl} failed`, error);
      }
    }
    
    return null;
  }
  
  /**
   * Parsery dla różnych cloud providerów
   */
  private static parseAwsZone(zone: string): Partial<GeographicLocation> {
    // np. "us-east-1a" -> { continent: 'northamerica', region: 'east', country: 'usa', city: 'virginia' }
    const regionMap: Record<string, Partial<GeographicLocation>> = {
      'us-east-1': { continent: 'northamerica', region: 'east', country: 'usa', city: 'virginia' },
      'us-east-2': { continent: 'northamerica', region: 'east', country: 'usa', city: 'ohio' },
      'us-west-1': { continent: 'northamerica', region: 'west', country: 'usa', city: 'california' },
      'us-west-2': { continent: 'northamerica', region: 'west', country: 'usa', city: 'oregon' },
      'eu-west-1': { continent: 'europe', region: 'west', country: 'ireland', city: 'dublin' },
      'eu-west-2': { continent: 'europe', region: 'west', country: 'uk', city: 'london' },
      'eu-west-3': { continent: 'europe', region: 'west', country: 'france', city: 'paris' },
      'eu-central-1': { continent: 'europe', region: 'central', country: 'germany', city: 'frankfurt' },
      'eu-north-1': { continent: 'europe', region: 'north', country: 'sweden', city: 'stockholm' },
      'ap-southeast-1': { continent: 'asia', region: 'southeast', country: 'singapore', city: 'singapore' },
      'ap-southeast-2': { continent: 'oceania', region: 'australia', country: 'australia', city: 'sydney' },
      'ap-northeast-1': { continent: 'asia', region: 'east', country: 'japan', city: 'tokyo' },
      'ap-south-1': { continent: 'asia', region: 'south', country: 'india', city: 'mumbai' }
    };
    
    const region = zone.substring(0, zone.lastIndexOf('-'));
    return regionMap[region] || {};
  }
  
  private static parseGcpZone(zone: string): Partial<GeographicLocation> {
    // np. "projects/123456/zones/us-central1-a"
    const parts = zone.split('/');
    const zoneName = parts[parts.length - 1];
    const region = zoneName.substring(0, zoneName.lastIndexOf('-'));
    
    const regionMap: Record<string, Partial<GeographicLocation>> = {
      'us-central1': { continent: 'northamerica', region: 'central', country: 'usa', city: 'iowa' },
      'us-east1': { continent: 'northamerica', region: 'east', country: 'usa', city: 'southcarolina' },
      'us-east4': { continent: 'northamerica', region: 'east', country: 'usa', city: 'virginia' },
      'us-west1': { continent: 'northamerica', region: 'west', country: 'usa', city: 'oregon' },
      'europe-west1': { continent: 'europe', region: 'west', country: 'belgium', city: 'brussels' },
      'europe-west2': { continent: 'europe', region: 'west', country: 'uk', city: 'london' },
      'europe-west3': { continent: 'europe', region: 'west', country: 'germany', city: 'frankfurt' },
      'europe-west4': { continent: 'europe', region: 'west', country: 'netherlands', city: 'amsterdam' },
      'asia-east1': { continent: 'asia', region: 'east', country: 'taiwan', city: 'taipei' },
      'asia-northeast1': { continent: 'asia', region: 'east', country: 'japan', city: 'tokyo' },
      'asia-southeast1': { continent: 'asia', region: 'southeast', country: 'singapore', city: 'singapore' }
    };
    
    return regionMap[region] || {};
  }
  
  private static parseAzureLocation(location: string): Partial<GeographicLocation> {
    const locationMap: Record<string, Partial<GeographicLocation>> = {
      'eastus': { continent: 'northamerica', region: 'east', country: 'usa', city: 'virginia' },
      'eastus2': { continent: 'northamerica', region: 'east', country: 'usa', city: 'virginia' },
      'westus': { continent: 'northamerica', region: 'west', country: 'usa', city: 'california' },
      'westus2': { continent: 'northamerica', region: 'west', country: 'usa', city: 'washington' },
      'northeurope': { continent: 'europe', region: 'north', country: 'ireland', city: 'dublin' },
      'westeurope': { continent: 'europe', region: 'west', country: 'netherlands', city: 'amsterdam' },
      'uksouth': { continent: 'europe', region: 'west', country: 'uk', city: 'london' },
      'francecentral': { continent: 'europe', region: 'west', country: 'france', city: 'paris' },
      'germanywestcentral': { continent: 'europe', region: 'central', country: 'germany', city: 'frankfurt' },
      'japaneast': { continent: 'asia', region: 'east', country: 'japan', city: 'tokyo' },
      'southeastasia': { continent: 'asia', region: 'southeast', country: 'singapore', city: 'singapore' },
      'australiaeast': { continent: 'oceania', region: 'australia', country: 'australia', city: 'sydney' }
    };
    
    return locationMap[location.toLowerCase()] || {};
  }
  
  private static parseDigitalOceanRegion(region: string): Partial<GeographicLocation> {
    const regionMap: Record<string, Partial<GeographicLocation>> = {
      'nyc1': { continent: 'northamerica', region: 'east', country: 'usa', city: 'newyork' },
      'nyc3': { continent: 'northamerica', region: 'east', country: 'usa', city: 'newyork' },
      'sfo1': { continent: 'northamerica', region: 'west', country: 'usa', city: 'sanfrancisco' },
      'sfo2': { continent: 'northamerica', region: 'west', country: 'usa', city: 'sanfrancisco' },
      'sfo3': { continent: 'northamerica', region: 'west', country: 'usa', city: 'sanfrancisco' },
      'tor1': { continent: 'northamerica', region: 'east', country: 'canada', city: 'toronto' },
      'lon1': { continent: 'europe', region: 'west', country: 'uk', city: 'london' },
      'fra1': { continent: 'europe', region: 'central', country: 'germany', city: 'frankfurt' },
      'ams3': { continent: 'europe', region: 'west', country: 'netherlands', city: 'amsterdam' },
      'sgp1': { continent: 'asia', region: 'southeast', country: 'singapore', city: 'singapore' },
      'blr1': { continent: 'asia', region: 'south', country: 'india', city: 'bangalore' },
      'syd1': { continent: 'oceania', region: 'australia', country: 'australia', city: 'sydney' }
    };
    
    return regionMap[region] || {};
  }
  
  private static parseHetznerRegion(region: string): Partial<GeographicLocation> {
    const regionMap: Record<string, Partial<GeographicLocation>> = {
      'fsn1': { continent: 'europe', region: 'central', country: 'germany', city: 'falkenstein' },
      'nbg1': { continent: 'europe', region: 'central', country: 'germany', city: 'nuremberg' },
      'hel1': { continent: 'europe', region: 'north', country: 'finland', city: 'helsinki' },
      'ash': { continent: 'northamerica', region: 'east', country: 'usa', city: 'ashburn' }
    };
    
    return regionMap[region] || {};
  }
  
  /**
   * Pomocnicze funkcje
   */
  private static mapContinent(input: string): string {
    const normalized = input.toUpperCase();
    const mapping: Record<string, string> = {
      'EU': 'europe',
      'EUR': 'europe',
      'EUROPE': 'europe',
      'NA': 'northamerica',
      'NORTH AMERICA': 'northamerica',
      'NORTHAMERICA': 'northamerica',
      'AS': 'asia',
      'ASIA': 'asia',
      'OC': 'oceania',
      'OCEANIA': 'oceania',
      'AU': 'oceania',
      'AUSTRALIA': 'oceania',
      'SA': 'southamerica',
      'SOUTH AMERICA': 'southamerica',
      'SOUTHAMERICA': 'southamerica',
      'AF': 'africa',
      'AFRICA': 'africa'
    };
    
    return mapping[normalized] || 'europe';
  }
  
  private static normalizeString(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
  }
  
  private static determineRegion(continent: string, country: string): string {
    // Uproszczona logika określania regionu
    const regionMap: Record<string, Record<string, string>> = {
      'europe': {
        'poland': 'north',
        'germany': 'central',
        'france': 'west',
        'spain': 'south',
        'sweden': 'north',
        'finland': 'north',
        'uk': 'west',
        'ireland': 'west',
        'italy': 'south',
        'greece': 'south'
      },
      'northamerica': {
        'usa': 'central',
        'canada': 'north',
        'mexico': 'south'
      },
      'asia': {
        'japan': 'east',
        'china': 'east',
        'korea': 'east',
        'india': 'south',
        'singapore': 'southeast',
        'thailand': 'southeast'
      }
    };
    
    return regionMap[continent]?.[country] || 'unknown';
  }
  
  private static getFallbackLocation(): GeographicLocation {
    return {
      continent: 'europe',
      region: 'unknown',
      country: 'unknown',
      city: 'unknown',
      workerId: `worker-${os.hostname()}-${Date.now()}`
    };
  }
}