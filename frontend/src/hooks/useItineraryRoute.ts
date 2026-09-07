import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '@/api/axiosClient';
import type {
  ApiEnvelope,
  GeoJsonLineString,
  MapCoordinate,
  MapRouteResult,
  RouteRequestStatus,
  RoutingProfile,
} from '@/types/map.types';

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isGeoJsonLineString = (value: unknown): value is GeoJsonLineString => {
  const geometry = asRecord(value);
  if (geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates)) return false;

  return geometry.coordinates.length >= 2 && geometry.coordinates.every(
    (coordinate) => Array.isArray(coordinate)
      && coordinate.length >= 2
      && isFiniteNumber(coordinate[0])
      && isFiniteNumber(coordinate[1]),
  );
};

const parseRoute = (value: unknown): MapRouteResult => {
  const route = asRecord(value);
  if (
    !route
    || !isFiniteNumber(route.distanceMeters)
    || !isFiniteNumber(route.distanceKm)
    || !isFiniteNumber(route.durationSeconds)
    || !isFiniteNumber(route.durationMinutes)
    || !isGeoJsonLineString(route.geometry)
    || !['driving', 'walking', 'cycling'].includes(String(route.profile))
  ) {
    throw new Error('API bản đồ trả về tuyến đường không hợp lệ.');
  }

  return {
    profile: route.profile as RoutingProfile,
    distanceMeters: route.distanceMeters,
    distanceKm: route.distanceKm,
    durationSeconds: route.durationSeconds,
    durationMinutes: route.durationMinutes,
    geometry: route.geometry,
  };
};

const getErrorMessage = (error: unknown): string => {
  const response = asRecord(asRecord(error)?.response);
  const responseData = asRecord(response?.data);
  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'Không thể tính tuyến đường. Vui lòng thử lại.';
};

interface UseItineraryRouteOptions {
  coordinates: MapCoordinate[];
  enabled?: boolean;
  profile?: RoutingProfile;
}

interface UseItineraryRouteResult {
  error: string | null;
  retry: () => void;
  route: MapRouteResult | null;
  status: RouteRequestStatus;
}

export function useItineraryRoute({
  coordinates,
  enabled = true,
  profile = 'driving',
}: UseItineraryRouteOptions): UseItineraryRouteResult {
  const coordinatesKey = useMemo(
    () => JSON.stringify(coordinates.map(({ latitude, longitude }) => ({ latitude, longitude }))),
    [coordinates],
  );
  const [route, setRoute] = useState<MapRouteResult | null>(null);
  const [status, setStatus] = useState<RouteRequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const requestCoordinates = JSON.parse(coordinatesKey) as MapCoordinate[];
    if (!enabled || requestCoordinates.length < 2) {
      setRoute(null);
      setStatus('idle');
      setError(null);
      return undefined;
    }
    if (requestCoordinates.length > 100) {
      setRoute(null);
      setStatus('error');
      setError('Tuyến đường hỗ trợ tối đa 100 điểm dừng.');
      return undefined;
    }

    const controller = new AbortController();
    setRoute(null);
    setStatus('loading');
    setError(null);

    void axiosClient.post<ApiEnvelope<unknown>>(
      '/maps/route',
      {
        coordinates: requestCoordinates,
        profile,
        alternatives: false,
        steps: false,
        overview: 'full',
        geometries: 'geojson',
      },
      { signal: controller.signal },
    ).then((response) => {
      if (controller.signal.aborted) return;
      setRoute(parseRoute(response.data.data));
      setStatus('success');
    }).catch((requestError: unknown) => {
      if (controller.signal.aborted) return;
      setRoute(null);
      setStatus('error');
      setError(getErrorMessage(requestError));
    });

    return () => controller.abort();
  }, [attempt, coordinatesKey, enabled, profile]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { error, retry, route, status };
}
