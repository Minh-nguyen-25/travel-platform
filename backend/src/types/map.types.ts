export type RoutingProfile = 'driving' | 'walking' | 'cycling';

export type RouteOverview = false | 'simplified' | 'full';

export type RouteGeometryFormat = 'polyline' | 'polyline6' | 'geojson';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface GeoJsonLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface RouteStep {
  distanceMeters: number;
  durationSeconds: number;
  name: string;
  mode: string;
  maneuver: {
    type: string;
    modifier: string | null;
    location: MapCoordinate;
    instruction: string | null;
  };
}

export interface RouteLeg {
  distanceMeters: number;
  durationSeconds: number;
  summary: string;
  steps: RouteStep[];
}

export interface SnappedWaypoint {
  name: string;
  distanceMeters: number;
  location: MapCoordinate;
}

export interface RouteAlternative {
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  geometry: string | GeoJsonLineString | null;
  legs: RouteLeg[];
}

export interface RouteRequest {
  coordinates: MapCoordinate[];
  profile?: RoutingProfile;
  alternatives?: boolean | number;
  steps?: boolean;
  overview?: RouteOverview;
  geometries?: RouteGeometryFormat;
}

export interface RouteResult extends RouteAlternative {
  profile: RoutingProfile;
  waypoints: SnappedWaypoint[];
  alternatives: RouteAlternative[];
}

export interface DistanceResult {
  profile: RoutingProfile;
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  origin: SnappedWaypoint | null;
  destination: SnappedWaypoint | null;
}

export interface RouteMatrixRequest {
  coordinates: MapCoordinate[];
  profile?: RoutingProfile;
  sources?: number[];
  destinations?: number[];
}

export interface RouteMatrixResult {
  profile: RoutingProfile;
  durationsSeconds: Array<Array<number | null>>;
  distancesMeters: Array<Array<number | null>>;
  sources: SnappedWaypoint[];
  destinations: SnappedWaypoint[];
}
