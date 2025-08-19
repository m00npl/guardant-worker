"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationDetector = void 0;
const axios_1 = __importDefault(require("axios"));
const os_1 = __importDefault(require("os"));
const logger_1 = require("./logger");
const country_mappings_1 = require("./country-mappings");
const logger = (0, logger_1.createLogger)('location-detector');
class LocationDetector {
    static GEO_IP_SERVICES = [
        'http://ip-api.com/json/',
        'https://ipapi.co/json/',
        'https://geolocation-db.com/json/'
    ];
    static getStableWorkerId() {
        if (process.env.WORKER_ID) {
            return process.env.WORKER_ID;
        }
        const hostname = os_1.default.hostname();
        const hash = hostname.split('').reduce((acc, char) => {
            return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);
        return `worker-${hostname}-${Math.abs(hash).toString(36)}`;
    }
    static CLOUD_METADATA_ENDPOINTS = {
        aws: {
            url: 'http://169.254.169.254/latest/meta-data/placement/availability-zone',
            timeout: 500,
            parser: (data) => LocationDetector.parseAwsZone(data)
        },
        gcp: {
            url: 'http://metadata.google.internal/computeMetadata/v1/instance/zone',
            headers: { 'Metadata-Flavor': 'Google' },
            timeout: 500,
            parser: (data) => LocationDetector.parseGcpZone(data)
        },
        azure: {
            url: 'http://169.254.169.254/metadata/instance/compute/location?api-version=2021-02-01',
            headers: { 'Metadata': 'true' },
            timeout: 500,
            parser: (data) => LocationDetector.parseAzureLocation(data)
        },
        digitalocean: {
            url: 'http://169.254.169.254/metadata/v1/region',
            timeout: 500,
            parser: (data) => LocationDetector.parseDigitalOceanRegion(data)
        },
        hetzner: {
            url: 'http://169.254.169.254/hetzner/v1/metadata/region',
            timeout: 500,
            parser: (data) => LocationDetector.parseHetznerRegion(data)
        }
    };
    static async detectLocation() {
        logger.info('🔍 Starting automatic location detection...');
        const envLocation = LocationDetector.checkEnvironmentVariables();
        if (envLocation) {
            logger.info('✅ Location from environment variables', envLocation);
            return envLocation;
        }
        const cloudLocation = await LocationDetector.detectCloudProvider();
        if (cloudLocation) {
            logger.info('✅ Location from cloud provider metadata', cloudLocation);
            return cloudLocation;
        }
        const geoIpLocation = await LocationDetector.detectViaGeoIP();
        if (geoIpLocation) {
            logger.info('✅ Location from GeoIP', geoIpLocation);
            return geoIpLocation;
        }
        const fallbackLocation = LocationDetector.getFallbackLocation();
        logger.warn('⚠️ Using fallback location', fallbackLocation);
        return fallbackLocation;
    }
    static checkEnvironmentVariables() {
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
                workerId: LocationDetector.getStableWorkerId()
            };
        }
        return null;
    }
    static async detectCloudProvider() {
        for (const [provider, config] of Object.entries(LocationDetector.CLOUD_METADATA_ENDPOINTS)) {
            try {
                const response = await axios_1.default.get(config.url, {
                    timeout: config.timeout,
                    headers: config.headers || {},
                    validateStatus: () => true
                });
                if (response.status === 200 && response.data) {
                    const location = config.parser(response.data);
                    if (location) {
                        logger.info(`Detected ${provider} environment`);
                        return {
                            continent: location.continent || 'unknown',
                            region: location.region || 'unknown',
                            country: location.country || 'unknown',
                            city: location.city || 'unknown',
                            workerId: LocationDetector.getStableWorkerId()
                        };
                    }
                }
            }
            catch (error) {
            }
        }
        return null;
    }
    static async detectViaGeoIP() {
        let publicIp;
        try {
            const ipResponse = await axios_1.default.get('https://api.ipify.org?format=text', { timeout: 2000 });
            publicIp = ipResponse.data.trim();
            logger.info(`Public IP: ${publicIp}`);
        }
        catch (error) {
            logger.error('Failed to get public IP', error);
            return null;
        }
        for (const serviceUrl of LocationDetector.GEO_IP_SERVICES) {
            try {
                const response = await axios_1.default.get(serviceUrl + publicIp, { timeout: 3000 });
                const data = response.data;
                logger.debug('GeoIP response:', data);
                let countryData = data.country || data.country_name || data.countryCode || 'unknown';
                const normalizedCountry = LocationDetector.normalizeString(countryData);
                let continent = country_mappings_1.COUNTRY_TO_CONTINENT[normalizedCountry] ||
                    country_mappings_1.COUNTRY_TO_CONTINENT[countryData.toLowerCase()];
                if (!continent) {
                    const continentData = data.continent || data.continent_name || data.continentCode;
                    continent = LocationDetector.mapContinent(continentData);
                }
                if (continent === 'unknown' && normalizedCountry !== 'unknown') {
                    continent = country_mappings_1.COUNTRY_TO_CONTINENT[normalizedCountry] || 'unknown';
                }
                const country = normalizedCountry;
                const city = LocationDetector.normalizeString(data.city || data.city_name || data.regionName || 'unknown');
                const region = LocationDetector.determineRegion(continent, country);
                return {
                    continent,
                    region,
                    country,
                    city,
                    workerId: LocationDetector.getStableWorkerId()
                };
            }
            catch (error) {
                logger.debug(`GeoIP service ${serviceUrl} failed`, error);
            }
        }
        return null;
    }
    static parseAwsZone(zone) {
        const regionMap = {
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
    static parseGcpZone(zone) {
        const parts = zone.split('/');
        const zoneName = parts[parts.length - 1];
        const region = zoneName.substring(0, zoneName.lastIndexOf('-'));
        const regionMap = {
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
    static parseAzureLocation(location) {
        const locationMap = {
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
    static parseDigitalOceanRegion(region) {
        const regionMap = {
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
    static parseHetznerRegion(region) {
        const regionMap = {
            'fsn1': { continent: 'europe', region: 'central', country: 'germany', city: 'falkenstein' },
            'nbg1': { continent: 'europe', region: 'central', country: 'germany', city: 'nuremberg' },
            'hel1': { continent: 'europe', region: 'north', country: 'finland', city: 'helsinki' },
            'ash': { continent: 'northamerica', region: 'east', country: 'usa', city: 'ashburn' }
        };
        return regionMap[region] || {};
    }
    static mapContinent(input) {
        if (!input)
            return 'unknown';
        const normalized = input.toUpperCase();
        return country_mappings_1.CONTINENT_CODES[normalized] || 'unknown';
    }
    static normalizeString(input) {
        return input
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20);
    }
    static determineRegion(continent, country) {
        return country_mappings_1.CONTINENT_REGIONS[continent]?.[country] || 'general';
    }
    static getFallbackLocation() {
        return {
            continent: 'europe',
            region: 'unknown',
            country: 'unknown',
            city: 'unknown',
            workerId: LocationDetector.getStableWorkerId()
        };
    }
}
exports.LocationDetector = LocationDetector;
