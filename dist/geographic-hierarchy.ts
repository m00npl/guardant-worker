// Geographic hierarchy for worker routing
export interface GeographicLocation {
  continent: string;
  region: string;
  country: string;
  city: string;
  workerId: string;
}

export interface WorkerRegistration {
  workerId: string;
  location: GeographicLocation;
  capabilities: string[];
  version: string;
  registeredAt: number;
  lastHeartbeat: number;
}

export interface CheckTask {
  id: string;
  serviceId: string;
  nestId: string;
  type: string;
  target: string;
  config: any;
  routingLevel: 'continent' | 'region' | 'country' | 'city' | 'worker';
  routingTarget: string; // e.g., "europe.north.poland.warsaw.worker-001"
  createdAt: number;
  claimedBy?: string;
  claimedAt?: number;
}

// Routing key builder
export class RoutingKeyBuilder {
  static buildKey(location: Partial<GeographicLocation>, level?: string): string {
    const parts = [];
    
    if (location.continent) parts.push(location.continent);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    if (location.city) parts.push(location.city);
    if (location.workerId) parts.push(location.workerId);
    
    // Add wildcard for partial matching
    if (level && parts.length < 5) {
      parts.push('*');
    }
    
    return parts.join('.');
  }
  
  static parseKey(routingKey: string): Partial<GeographicLocation> {
    const parts = routingKey.split('.');
    const location: Partial<GeographicLocation> = {};
    
    if (parts[0] && parts[0] !== '*') location.continent = parts[0];
    if (parts[1] && parts[1] !== '*') location.region = parts[1];
    if (parts[2] && parts[2] !== '*') location.country = parts[2];
    if (parts[3] && parts[3] !== '*') location.city = parts[3];
    if (parts[4] && parts[4] !== '*') location.workerId = parts[4];
    
    return location;
  }
  
  // Generate all routing keys a worker should listen to
  static getWorkerBindings(location: GeographicLocation): string[] {
    return [
      // Specific worker
      `check.${location.continent}.${location.region}.${location.country}.${location.city}.${location.workerId}`,
      // City level
      `check.${location.continent}.${location.region}.${location.country}.${location.city}.*`,
      // Country level
      `check.${location.continent}.${location.region}.${location.country}.*.*`,
      // Region level
      `check.${location.continent}.${location.region}.*.*.*`,
      // Continent level
      `check.${location.continent}.*.*.*.*`,
      // Global level
      `check.*.*.*.*.*`
    ];
  }
}

// Exchange and queue configuration
export const EXCHANGES = {
  CHECKS: 'monitoring.checks',
  CLAIMS: 'monitoring.claims',
  HEARTBEATS: 'monitoring.heartbeats',
  REGISTRATION: 'monitoring.registration',
  RESULTS: 'monitoring.results'
} as const;

export const QUEUE_PREFIXES = {
  WORKER_CHECKS: 'worker.checks.',
  WORKER_CLAIMS: 'worker.claims.',
  SCHEDULER_HEARTBEATS: 'scheduler.heartbeats',
  SCHEDULER_REGISTRATION: 'scheduler.registration',
  SCHEDULER_RESULTS: 'scheduler.results'
} as const;

// Claim protocol
export interface ClaimRequest {
  taskId: string;
  workerId: string;
  timestamp: number;
}

export interface ClaimResponse {
  taskId: string;
  approved: boolean;
  workerId: string;
  reason?: string;
}

// Geographic regions mapping
export const GEOGRAPHIC_HIERARCHY = {
  'europe': {
    name: 'Europe',
    regions: {
      'north': {
        name: 'Northern Europe',
        countries: {
          'poland': {
            name: 'Poland',
            cities: ['warsaw', 'krakow', 'gdansk', 'poznan']
          },
          'germany': {
            name: 'Germany',
            cities: ['berlin', 'munich', 'frankfurt', 'hamburg']
          },
          'uk': {
            name: 'United Kingdom',
            cities: ['london', 'manchester', 'birmingham', 'glasgow']
          }
        }
      },
      'west': {
        name: 'Western Europe',
        countries: {
          'france': {
            name: 'France',
            cities: ['paris', 'lyon', 'marseille', 'toulouse']
          },
          'netherlands': {
            name: 'Netherlands',
            cities: ['amsterdam', 'rotterdam', 'hague', 'utrecht']
          }
        }
      },
      'south': {
        name: 'Southern Europe',
        countries: {
          'spain': {
            name: 'Spain',
            cities: ['madrid', 'barcelona', 'valencia', 'seville']
          },
          'italy': {
            name: 'Italy',
            cities: ['rome', 'milan', 'naples', 'turin']
          }
        }
      }
    }
  },
  'northamerica': {
    name: 'North America',
    regions: {
      'east': {
        name: 'US East',
        countries: {
          'usa': {
            name: 'United States',
            cities: ['newyork', 'washington', 'boston', 'atlanta']
          }
        }
      },
      'west': {
        name: 'US West',
        countries: {
          'usa': {
            name: 'United States',
            cities: ['sanfrancisco', 'losangeles', 'seattle', 'portland']
          }
        }
      },
      'central': {
        name: 'US Central',
        countries: {
          'usa': {
            name: 'United States',
            cities: ['chicago', 'dallas', 'houston', 'denver']
          }
        }
      }
    }
  },
  'asia': {
    name: 'Asia',
    regions: {
      'east': {
        name: 'East Asia',
        countries: {
          'japan': {
            name: 'Japan',
            cities: ['tokyo', 'osaka', 'kyoto', 'yokohama']
          },
          'korea': {
            name: 'South Korea',
            cities: ['seoul', 'busan', 'incheon', 'daegu']
          }
        }
      },
      'southeast': {
        name: 'Southeast Asia',
        countries: {
          'singapore': {
            name: 'Singapore',
            cities: ['singapore']
          },
          'thailand': {
            name: 'Thailand',
            cities: ['bangkok', 'chiangmai', 'phuket']
          }
        }
      },
      'south': {
        name: 'South Asia',
        countries: {
          'india': {
            name: 'India',
            cities: ['mumbai', 'delhi', 'bangalore', 'chennai']
          }
        }
      }
    }
  },
  'oceania': {
    name: 'Oceania',
    regions: {
      'australia': {
        name: 'Australia',
        countries: {
          'australia': {
            name: 'Australia',
            cities: ['sydney', 'melbourne', 'brisbane', 'perth']
          }
        }
      },
      'newzealand': {
        name: 'New Zealand',
        countries: {
          'newzealand': {
            name: 'New Zealand',
            cities: ['auckland', 'wellington', 'christchurch']
          }
        }
      }
    }
  }
};