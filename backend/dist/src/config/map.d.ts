import { RoutingProfile } from '../types/map.types';
export interface OsrmConfig {
    baseUrl: string;
    timeoutMs: number;
    maxRetries: number;
    apiKey: string | null;
    apiKeyQueryParam: string;
    userAgent: string;
    profiles: Record<RoutingProfile, string>;
    transitProfile: RoutingProfile | null;
}
export declare const getOsrmConfig: () => OsrmConfig;
//# sourceMappingURL=map.d.ts.map