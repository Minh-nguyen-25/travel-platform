import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axiosClient from '@/api/axiosClient';
import { loadMapRoute } from '@/utils/map-route-cache';
import type {
  ApiEnvelope,
  MapCoordinate,
  MapRouteResult,
  RouteRequestStatus,
  RoutingProfile,
} from '@/types/map.types';

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;

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
  cacheNotice: string | null;
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
  const [cacheNotice, setCacheNotice] = useState<string | null>(null);
  const requestKey = JSON.stringify([axiosClient.defaults.baseURL, profile, coordinatesKey]);
  const retryTarget = useRef<string | null>(null);

  useEffect(() => {
    const requestCoordinates = JSON.parse(coordinatesKey) as MapCoordinate[];
    setCacheNotice(null);
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

    let storage: Storage | undefined;
    try { storage = window.sessionStorage; } catch { /* Browser storage can be disabled. */ }
    const force = retryTarget.current === requestKey;
    retryTarget.current = null;
    void loadMapRoute({
      key: requestKey,
      storage,
      signal: controller.signal,
      force,
      fetchRoute: async () => {
        const response = await axiosClient.post<ApiEnvelope<unknown>>(
          '/maps/route',
          {
            coordinates: requestCoordinates,
            profile,
            alternatives: false,
            steps: false,
            overview: 'full',
            geometries: 'geojson',
          },
          { signal: controller.signal, timeout: 30_000 },
        );
        return response.data.data;
      },
    }).then((result) => {
      if (controller.signal.aborted) return;
      setRoute(result.route);
      setCacheNotice(result.warning);
      setStatus('success');
    }).catch((requestError: unknown) => {
      if (controller.signal.aborted) return;
      setRoute(null);
      setStatus('error');
      setError(getErrorMessage(requestError));
    });

    return () => controller.abort();
  }, [attempt, coordinatesKey, enabled, profile, requestKey]);

  const retry = useCallback(() => {
    retryTarget.current = requestKey;
    setAttempt((value) => value + 1);
  }, [requestKey]);

  return { cacheNotice, error, retry, route, status };
}
