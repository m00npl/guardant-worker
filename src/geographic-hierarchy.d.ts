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
    routingTarget: string;
    createdAt: number;
    claimedBy?: string;
    claimedAt?: number;
}
export declare class RoutingKeyBuilder {
    static buildKey(location: Partial<GeographicLocation>, level?: string): string;
    static parseKey(routingKey: string): Partial<GeographicLocation>;
    static getWorkerBindings(location: GeographicLocation): string[];
}
export declare const EXCHANGES: {
    readonly CHECKS: "monitoring.checks";
    readonly CLAIMS: "monitoring.claims";
    readonly HEARTBEATS: "monitoring.heartbeats";
    readonly REGISTRATION: "monitoring.registration";
    readonly RESULTS: "monitoring.results";
};
export declare const QUEUE_PREFIXES: {
    readonly WORKER_CHECKS: "worker.checks.";
    readonly WORKER_CLAIMS: "worker.claims.";
    readonly SCHEDULER_HEARTBEATS: "scheduler.heartbeats";
    readonly SCHEDULER_REGISTRATION: "scheduler.registration";
    readonly SCHEDULER_RESULTS: "scheduler.results";
};
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
export declare const GEOGRAPHIC_HIERARCHY: {
    europe: {
        name: string;
        regions: {
            north: {
                name: string;
                countries: {
                    poland: {
                        name: string;
                        cities: string[];
                    };
                    germany: {
                        name: string;
                        cities: string[];
                    };
                    uk: {
                        name: string;
                        cities: string[];
                    };
                };
            };
            west: {
                name: string;
                countries: {
                    france: {
                        name: string;
                        cities: string[];
                    };
                    netherlands: {
                        name: string;
                        cities: string[];
                    };
                };
            };
            south: {
                name: string;
                countries: {
                    spain: {
                        name: string;
                        cities: string[];
                    };
                    italy: {
                        name: string;
                        cities: string[];
                    };
                };
            };
        };
    };
    northamerica: {
        name: string;
        regions: {
            east: {
                name: string;
                countries: {
                    usa: {
                        name: string;
                        cities: string[];
                    };
                };
            };
            west: {
                name: string;
                countries: {
                    usa: {
                        name: string;
                        cities: string[];
                    };
                };
            };
            central: {
                name: string;
                countries: {
                    usa: {
                        name: string;
                        cities: string[];
                    };
                };
            };
        };
    };
    asia: {
        name: string;
        regions: {
            east: {
                name: string;
                countries: {
                    japan: {
                        name: string;
                        cities: string[];
                    };
                    korea: {
                        name: string;
                        cities: string[];
                    };
                };
            };
            southeast: {
                name: string;
                countries: {
                    singapore: {
                        name: string;
                        cities: string[];
                    };
                    thailand: {
                        name: string;
                        cities: string[];
                    };
                };
            };
            south: {
                name: string;
                countries: {
                    india: {
                        name: string;
                        cities: string[];
                    };
                };
            };
        };
    };
    oceania: {
        name: string;
        regions: {
            australia: {
                name: string;
                countries: {
                    australia: {
                        name: string;
                        cities: string[];
                    };
                };
            };
            newzealand: {
                name: string;
                countries: {
                    newzealand: {
                        name: string;
                        cities: string[];
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=geographic-hierarchy.d.ts.map