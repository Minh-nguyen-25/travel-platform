import type { MapRouteResult } from '../types/map.types';

type CacheStorage = Pick<Storage, 'getItem' | 'setItem'>;
const CACHE_KEY = 'travel-platform:map-routes:v1';
const FRESH_MS = 15 * 60_000;
const STALE_MS = 24 * 60 * 60_000;
const MAX_ROUTES = 24;
const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;

export function parseMapRoute(value: unknown): MapRouteResult {
  const route = asRecord(value);
  const geometry = asRecord(route?.geometry);
  if (!route || !['driving', 'walking', 'cycling'].includes(String(route.profile))
    || !['distanceMeters', 'distanceKm', 'durationSeconds', 'durationMinutes'].every(
      field => typeof route[field] === 'number' && Number.isFinite(route[field]) && route[field] >= 0,
    ) || geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates)
    || geometry.coordinates.length < 2 || !geometry.coordinates.every(point =>
      Array.isArray(point) && point.length >= 2
      && typeof point[0] === 'number' && Number.isFinite(point[0]) && Math.abs(point[0]) <= 180
      && typeof point[1] === 'number' && Number.isFinite(point[1]) && Math.abs(point[1]) <= 90)) {
    throw new Error('API bản đồ trả về tuyến đường không hợp lệ.');
  }
  const cache = asRecord(route.cache);
  return {
    profile: route.profile as MapRouteResult['profile'],
    distanceMeters: route.distanceMeters as number,
    distanceKm: route.distanceKm as number,
    durationSeconds: route.durationSeconds as number,
    durationMinutes: route.durationMinutes as number,
    geometry: { type: 'LineString', coordinates: geometry.coordinates.map(point => [point[0], point[1]]) },
    ...(cache && ['fresh', 'hit', 'stale'].includes(String(cache.status))
      && typeof cache.fetchedAt === 'string' && Number.isFinite(Date.parse(cache.fetchedAt))
      ? { cache: { status: cache.status as 'fresh' | 'hit' | 'stale', fetchedAt: cache.fetchedAt } } : {}),
  };
}

interface SavedRoute { key: string; fetchedAt: number; route: MapRouteResult }
const readRoutes = (storage: CacheStorage | undefined, now: number): SavedRoute[] => {
  try {
    const items: unknown = JSON.parse(storage?.getItem(CACHE_KEY) || '[]');
    if (!Array.isArray(items)) return [];
    return items.slice(-MAX_ROUTES).flatMap(item => {
      try {
        const saved = asRecord(item);
        if (!saved || typeof saved.key !== 'string' || typeof saved.fetchedAt !== 'number'
          || saved.fetchedAt > now || now - saved.fetchedAt > STALE_MS) return [];
        return [{ key: saved.key, fetchedAt: saved.fetchedAt, route: parseMapRoute(saved.route) }];
      } catch { return []; }
    });
  } catch { return []; }
};

const savedResult = (saved: SavedRoute, stale: boolean) => ({
  route: { ...saved.route, cache: { status: stale ? 'stale' as const : 'hit' as const, fetchedAt: new Date(saved.fetchedAt).toISOString() } },
  warning: stale ? `Đang dùng tuyến đường đã lưu lúc ${new Date(saved.fetchedAt).toLocaleString('vi-VN')}. Kết quả có thể đã thay đổi.` : null,
});

export async function loadMapRoute({ key, storage, fetchRoute, signal, force = false, now = Date.now }: {
  key: string;
  storage?: CacheStorage;
  fetchRoute: () => Promise<unknown>;
  signal?: AbortSignal;
  force?: boolean;
  now?: () => number;
}): Promise<{ route: MapRouteResult; warning: string | null }> {
  const abort = () => { if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError'); };
  abort();
  const saved = readRoutes(storage, now()).find(item => item.key === key);
  if (!force && saved && now() - saved.fetchedAt < FRESH_MS) return savedResult(saved, false);
  try {
    const route = parseMapRoute(await fetchRoute());
    abort();
    const fetchedAt = route.cache ? Date.parse(route.cache.fetchedAt) : now();
    if (fetchedAt > now() || now() - fetchedAt > STALE_MS) throw new Error('Tuyến đường đã quá hạn sử dụng.');
    const entry = { key, route, fetchedAt };
    try {
      // Re-read after awaiting the API to preserve other routes saved concurrently.
      const items = readRoutes(storage, now()).filter(item => item.key !== key);
      storage?.setItem(CACHE_KEY, JSON.stringify([...items, entry].slice(-MAX_ROUTES)));
    } catch { /* Storage may be unavailable or full; the real API result remains usable. */ }
    return route.cache?.status === 'stale' ? savedResult(entry, true) : { route, warning: null };
  } catch (error) {
    abort();
    const response = asRecord(asRecord(error)?.response);
    const status = response?.status;
    if (typeof status === 'number' && status >= 400 && status < 500 && status !== 429) {
      try {
        storage?.setItem(CACHE_KEY, JSON.stringify(readRoutes(storage, now()).filter(item => item.key !== key)));
      } catch { /* The authoritative API error still reaches the caller. */ }
    }
    // Authentication, validation and missing-route errors must remain visible.
    if (saved && readRoutes(storage, now()).some(item => item.key === key && item.fetchedAt === saved.fetchedAt)
      && now() - saved.fetchedAt <= STALE_MS
      && (!response || status === 429 || typeof status === 'number' && status >= 500)) {
      return savedResult(saved, true);
    }
    throw error;
  }
}
