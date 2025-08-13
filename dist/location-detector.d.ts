import { GeographicLocation } from './geographic-hierarchy';
export declare class LocationDetector {
    private static readonly GEO_IP_SERVICES;
    private static getStableWorkerId;
    private static readonly CLOUD_METADATA_ENDPOINTS;
    /**
     * Automatycznie wykrywa lokalizację workera
     */
    static detectLocation(): Promise<GeographicLocation>;
    /**
     * Sprawdza zmienne środowiskowe
     */
    private static checkEnvironmentVariables;
    /**
     * Wykrywa cloud providera i pobiera metadane
     */
    private static detectCloudProvider;
    /**
     * Wykrywa lokalizację przez GeoIP
     */
    private static detectViaGeoIP;
    /**
     * Parsery dla różnych cloud providerów
     */
    private static parseAwsZone;
    private static parseGcpZone;
    private static parseAzureLocation;
    private static parseDigitalOceanRegion;
    private static parseHetznerRegion;
    /**
     * Pomocnicze funkcje
     */
    private static mapContinent;
    private static normalizeString;
    private static determineRegion;
    private static getFallbackLocation;
}
//# sourceMappingURL=location-detector.d.ts.map