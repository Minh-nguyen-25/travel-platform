export type RoutingProfile = 'driving' | 'walking' | 'cycling';

export type ItineraryTravelMode = 'WALKING' | 'DRIVING' | 'TRANSIT' | 'CYCLING';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

interface ItineraryMapStopLocation {
  address?: string | null;
  latitude: number | string;
  longitude: number | string;
}

type ItineraryMapStopIdentifier =
  | { id: string | number; destinationId?: string | number }
  | { id?: string | number; destinationId: string | number };

type ItineraryMapStopName =
  | { name: string; destinationName?: string }
  | { name?: string; destinationName: string };

/** Accepts both a generic map stop and a GeneratedItineraryActivity without reshaping it. */
export type ItineraryMapStop = ItineraryMapStopLocation
  & ItineraryMapStopIdentifier
  & ItineraryMapStopName;

export interface GeoJsonLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface MapRouteResult {
  profile: RoutingProfile;
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  geometry: GeoJsonLineString;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type RouteRequestStatus = 'idle' | 'loading' | 'success' | 'error';
