import { TravelMode } from '../constants';
import { OsrmConfig } from '../config/map';
import { DistanceResult, MapCoordinate, RouteMatrixRequest, RouteMatrixResult, RouteRequest, RouteResult, RoutingProfile } from '../types/map.types';
type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type ConfigFactory = () => OsrmConfig;
export declare class OsrmMapService {
    private readonly configFactory;
    private readonly fetchImpl;
    private readonly now;
    private readonly routeCache;
    private readonly pendingRoutes;
    private readonly freshMs;
    private readonly staleMs;
    private readonly maxCachedRoutes;
    constructor(configFactory?: ConfigFactory, fetchImpl?: FetchLike, now?: () => number);
    private request;
    getProfileForTravelMode(travelMode: TravelMode): {
        profile: RoutingProfile;
        isApproximation: boolean;
    };
    calculateRoute(request: RouteRequest, signal?: AbortSignal): Promise<RouteResult>;
    private fetchRoute;
    calculateDistance(origin: MapCoordinate, destination: MapCoordinate, profile?: RoutingProfile, signal?: AbortSignal): Promise<DistanceResult>;
    calculateMatrix(request: RouteMatrixRequest, signal?: AbortSignal): Promise<RouteMatrixResult>;
}
export declare const mapService: OsrmMapService;
export {};
//# sourceMappingURL=map.service.d.ts.map