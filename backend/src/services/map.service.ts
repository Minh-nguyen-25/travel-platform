import { TravelMode, TRAVEL_MODE, HTTP_STATUS } from '../constants';
import { getOsrmConfig, OsrmConfig } from '../config/map';
import {
  DistanceResult,
  GeoJsonLineString,
  MapCoordinate,
  RouteAlternative,
  RouteGeometryFormat,
  RouteLeg,
  RouteMatrixRequest,
  RouteMatrixResult,
  RouteOverview,
  RouteRequest,
  RouteResult,
  RoutingProfile,
  RouteStep,
  SnappedWaypoint,
} from '../types/map.types';
import { AppError } from '../utils/app-error';

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type ConfigFactory = () => OsrmConfig;
type JsonRecord = Record<string, unknown>;

const MAX_COORDINATES = 100;
const UPSTREAM_ERROR_STATUS = 502;
const UPSTREAM_UNAVAILABLE_STATUS = 503;
const UPSTREAM_TIMEOUT_STATUS = 504;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const round = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const assertCoordinate = (coordinate: MapCoordinate, index: number): void => {
  if (
    !coordinate ||
    !Number.isFinite(coordinate.latitude) ||
    coordinate.latitude < -90 ||
    coordinate.latitude > 90 ||
    !Number.isFinite(coordinate.longitude) ||
    coordinate.longitude < -180 ||
    coordinate.longitude > 180
  ) {
    throw new AppError(
      `Tọa độ tại vị trí ${index} không hợp lệ`,
      HTTP_STATUS.UNPROCESSABLE
    );
  }
};

const assertCoordinates = (coordinates: MapCoordinate[], minimum: number): void => {
  if (!Array.isArray(coordinates) || coordinates.length < minimum) {
    throw new AppError(
      `Cần cung cấp ít nhất ${minimum} tọa độ`,
      HTTP_STATUS.UNPROCESSABLE
    );
  }
  if (coordinates.length > MAX_COORDINATES) {
    throw new AppError(
      `Mỗi yêu cầu chỉ hỗ trợ tối đa ${MAX_COORDINATES} tọa độ`,
      HTTP_STATUS.UNPROCESSABLE
    );
  }
  coordinates.forEach(assertCoordinate);
};

const coordinatePath = (coordinates: MapCoordinate[]): string =>
  coordinates
    .map(({ longitude, latitude }) => `${longitude.toFixed(7)},${latitude.toFixed(7)}`)
    .join(';');

const parseLocation = (value: unknown): MapCoordinate | null => {
  if (
    !Array.isArray(value) ||
    value.length < 2 ||
    !isFiniteNumber(value[0]) ||
    !isFiniteNumber(value[1])
  ) {
    return null;
  }
  return { longitude: value[0], latitude: value[1] };
};

const parseWaypoint = (value: unknown): SnappedWaypoint | null => {
  if (!isRecord(value)) return null;
  const location = parseLocation(value.location);
  if (!location) return null;
  return {
    name: typeof value.name === 'string' ? value.name : '',
    distanceMeters: isFiniteNumber(value.distance) ? value.distance : 0,
    location,
  };
};

const parseStep = (value: unknown): RouteStep | null => {
  if (!isRecord(value) || !isFiniteNumber(value.distance) || !isFiniteNumber(value.duration)) {
    return null;
  }
  const maneuver = isRecord(value.maneuver) ? value.maneuver : {};
  const location = parseLocation(maneuver.location);
  if (!location) return null;

  return {
    distanceMeters: value.distance,
    durationSeconds: value.duration,
    name: typeof value.name === 'string' ? value.name : '',
    mode: typeof value.mode === 'string' ? value.mode : '',
    maneuver: {
      type: typeof maneuver.type === 'string' ? maneuver.type : '',
      modifier: typeof maneuver.modifier === 'string' ? maneuver.modifier : null,
      location,
      instruction: typeof maneuver.instruction === 'string' ? maneuver.instruction : null,
    },
  };
};

const parseLeg = (value: unknown): RouteLeg | null => {
  if (!isRecord(value) || !isFiniteNumber(value.distance) || !isFiniteNumber(value.duration)) {
    return null;
  }
  const steps = Array.isArray(value.steps)
    ? value.steps.map(parseStep).filter((step): step is RouteStep => step !== null)
    : [];
  return {
    distanceMeters: value.distance,
    durationSeconds: value.duration,
    summary: typeof value.summary === 'string' ? value.summary : '',
    steps,
  };
};

const parseGeometry = (
  value: unknown,
  format: RouteGeometryFormat
): string | GeoJsonLineString | null => {
  if ((format === 'polyline' || format === 'polyline6') && typeof value === 'string') {
    return value;
  }
  if (format === 'geojson' && isRecord(value) && value.type === 'LineString') {
    if (
      Array.isArray(value.coordinates) &&
      value.coordinates.every(
        (item) =>
          Array.isArray(item) &&
          item.length >= 2 &&
          isFiniteNumber(item[0]) &&
          isFiniteNumber(item[1])
      )
    ) {
      return {
        type: 'LineString',
        coordinates: value.coordinates.map((item) => [item[0], item[1]] as [number, number]),
      };
    }
  }
  return null;
};

const parseRoute = (value: unknown, geometryFormat: RouteGeometryFormat): RouteAlternative | null => {
  if (!isRecord(value) || !isFiniteNumber(value.distance) || !isFiniteNumber(value.duration)) {
    return null;
  }
  const legs = Array.isArray(value.legs)
    ? value.legs.map(parseLeg).filter((leg): leg is RouteLeg => leg !== null)
    : [];

  return {
    distanceMeters: value.distance,
    distanceKm: round(value.distance / 1_000, 2),
    durationSeconds: value.duration,
    durationMinutes: Math.ceil(value.duration / 60),
    geometry: parseGeometry(value.geometry, geometryFormat),
    legs,
  };
};

const validateProfile = (profile: RoutingProfile): void => {
  if (profile !== 'driving' && profile !== 'walking' && profile !== 'cycling') {
    throw new AppError('Loại phương tiện routing không hợp lệ', HTTP_STATUS.UNPROCESSABLE);
  }
};

const retryableStatus = (status: number): boolean =>
  status === 408 || status === 425 || status === 429 || status >= 500;

const delay = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const getErrorCode = (payload: unknown): string | null =>
  isRecord(payload) && typeof payload.code === 'string' ? payload.code : null;

const getErrorMessage = (payload: unknown): string | null =>
  isRecord(payload) && typeof payload.message === 'string' ? payload.message : null;

const isOsrmClientError = (code: string | null): boolean =>
  code === 'InvalidQuery' ||
  code === 'InvalidValue' ||
  code === 'NoSegment' ||
  code === 'NoRoute' ||
  code === 'NoTable' ||
  code === 'TooBig';

const assertMatrixIndexes = (
  indexes: number[] | undefined,
  coordinateCount: number,
  field: 'sources' | 'destinations'
): void => {
  if (indexes === undefined) return;
  if (
    indexes.length === 0 ||
    new Set(indexes).size !== indexes.length ||
    indexes.some((index) => !Number.isInteger(index) || index < 0 || index >= coordinateCount)
  ) {
    throw new AppError(`${field} chứa chỉ số tọa độ không hợp lệ`, HTTP_STATUS.UNPROCESSABLE);
  }
};

const parseMatrix = (value: unknown, label: string): Array<Array<number | null>> => {
  if (!Array.isArray(value)) {
    throw new AppError(`OSRM không trả về ma trận ${label} hợp lệ`, UPSTREAM_ERROR_STATUS);
  }
  return value.map((row) => {
    if (!Array.isArray(row) || row.some((cell) => cell !== null && !isFiniteNumber(cell))) {
      throw new AppError(`OSRM không trả về ma trận ${label} hợp lệ`, UPSTREAM_ERROR_STATUS);
    }
    return row as Array<number | null>;
  });
};

export class OsrmMapService {
  constructor(
    private readonly configFactory: ConfigFactory = getOsrmConfig,
    private readonly fetchImpl: FetchLike = globalThis.fetch.bind(globalThis)
  ) {}

  private async request(
    path: string,
    params: URLSearchParams,
    externalSignal?: AbortSignal
  ): Promise<unknown> {
    const config = this.configFactory();
    const url = new URL(`${config.baseUrl}${path}`);
    params.forEach((value, key) => url.searchParams.set(key, value));
    if (config.apiKey) {
      url.searchParams.set(config.apiKeyQueryParam, config.apiKey);
    }

    let lastError: unknown;
    for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
      const abortFromExternal = (): void => controller.abort();
      if (externalSignal?.aborted) controller.abort();
      else externalSignal?.addEventListener('abort', abortFromExternal, { once: true });
      try {
        const response = await this.fetchImpl(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': config.userAgent,
          },
          signal: controller.signal,
        });
        const rawText = await response.text();

        if (!response.ok && retryableStatus(response.status) && attempt < config.maxRetries) {
          await delay(250 * 2 ** attempt);
          continue;
        }

        let payload: unknown = null;
        if (rawText) {
          try {
            payload = JSON.parse(rawText) as unknown;
          } catch {
            if (!response.ok) {
              throw new AppError(
                `Không thể tính tuyến đường qua OSRM (${response.status})`,
                response.status === 429 ? UPSTREAM_UNAVAILABLE_STATUS : UPSTREAM_ERROR_STATUS
              );
            }
            throw new AppError('OSRM trả về dữ liệu không hợp lệ', UPSTREAM_ERROR_STATUS);
          }
        }

        if (!response.ok) {
          const code = getErrorCode(payload);
          if (code === 'NoRoute' || code === 'NoSegment') {
            throw new AppError(
              'Không tìm thấy tuyến đường phù hợp giữa các tọa độ',
              HTTP_STATUS.UNPROCESSABLE
            );
          }
          if (code === 'NoTable') {
            throw new AppError(
              'Không thể tính ma trận tuyến đường cho các tọa độ đã chọn',
              HTTP_STATUS.UNPROCESSABLE
            );
          }
          if (
            code === 'InvalidQuery' ||
            code === 'InvalidValue' ||
            code === 'TooBig'
          ) {
            throw new AppError(
              code === 'TooBig'
                ? 'Yêu cầu định tuyến vượt quá giới hạn của OSRM'
                : 'Yêu cầu định tuyến không hợp lệ',
              HTTP_STATUS.UNPROCESSABLE
            );
          }
          const status = response.status === 429 ? UPSTREAM_UNAVAILABLE_STATUS : UPSTREAM_ERROR_STATUS;
          throw new AppError(
            `Không thể tính tuyến đường qua OSRM (${response.status})`,
            status
          );
        }
        return payload;
      } catch (error) {
        lastError = error;
        if (error instanceof AppError) throw error;
        if (externalSignal?.aborted) {
          throw new AppError('Yêu cầu OSRM đã vượt quá thời hạn tổng thể', UPSTREAM_TIMEOUT_STATUS);
        }
        if (attempt < config.maxRetries) {
          await delay(250 * 2 ** attempt);
          continue;
        }
        if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
          throw new AppError('OSRM phản hồi quá thời gian cho phép', UPSTREAM_TIMEOUT_STATUS);
        }
      } finally {
        clearTimeout(timeout);
        externalSignal?.removeEventListener('abort', abortFromExternal);
      }
    }

    throw new AppError(
      lastError instanceof Error
        ? `Không thể kết nối dịch vụ OSRM: ${lastError.message}`
        : 'Không thể kết nối dịch vụ OSRM',
      UPSTREAM_UNAVAILABLE_STATUS
    );
  }

  getProfileForTravelMode(
    travelMode: TravelMode
  ): { profile: RoutingProfile; isApproximation: boolean } {
    if (travelMode === TRAVEL_MODE.DRIVING) return { profile: 'driving', isApproximation: false };
    if (travelMode === TRAVEL_MODE.WALKING) return { profile: 'walking', isApproximation: false };
    if (travelMode === TRAVEL_MODE.CYCLING) return { profile: 'cycling', isApproximation: false };

    const transitProfile = this.configFactory().transitProfile;
    if (!transitProfile) {
      throw new AppError(
        'OSRM không hỗ trợ phương tiện công cộng; hãy cấu hình OSRM_TRANSIT_FALLBACK_PROFILE nếu chấp nhận số liệu xấp xỉ',
        HTTP_STATUS.UNPROCESSABLE
      );
    }
    return { profile: transitProfile, isApproximation: true };
  }

  async calculateRoute(request: RouteRequest, signal?: AbortSignal): Promise<RouteResult> {
    assertCoordinates(request.coordinates, 2);
    const profile = request.profile ?? 'driving';
    validateProfile(profile);
    const geometryFormat = request.geometries ?? 'polyline';
    const overview: RouteOverview = request.overview ?? false;
    const alternatives = request.alternatives ?? false;

    if (
      typeof alternatives === 'number' &&
      (!Number.isInteger(alternatives) || alternatives < 1 || alternatives > 3)
    ) {
      throw new AppError('alternatives phải nằm trong khoảng 1 đến 3', HTTP_STATUS.UNPROCESSABLE);
    }

    const config = this.configFactory();
    const serverProfile = config.profiles[profile];
    const params = new URLSearchParams({
      alternatives: String(alternatives),
      steps: String(request.steps ?? false),
      overview: String(overview),
      geometries: geometryFormat,
    });
    const payload = await this.request(
      `/route/v1/${encodeURIComponent(serverProfile)}/${coordinatePath(request.coordinates)}`,
      params,
      signal
    );
    const code = getErrorCode(payload);
    if (code !== 'Ok') {
      const message = getErrorMessage(payload);
      const status = isOsrmClientError(code)
        ? HTTP_STATUS.UNPROCESSABLE
        : UPSTREAM_ERROR_STATUS;
      throw new AppError(
        code === 'NoRoute'
          ? 'Không tìm thấy tuyến đường phù hợp giữa các tọa độ'
          : `OSRM không thể tính tuyến đường${message ? `: ${message}` : ''}`,
        status
      );
    }
    if (!isRecord(payload) || !Array.isArray(payload.routes)) {
      throw new AppError('OSRM không trả về tuyến đường hợp lệ', UPSTREAM_ERROR_STATUS);
    }
    const routes = payload.routes
      .map((route) => parseRoute(route, geometryFormat))
      .filter((route): route is RouteAlternative => route !== null);
    if (routes.length === 0) {
      throw new AppError('OSRM không trả về tuyến đường hợp lệ', UPSTREAM_ERROR_STATUS);
    }
    const waypoints = Array.isArray(payload.waypoints)
      ? payload.waypoints
          .map(parseWaypoint)
          .filter((waypoint): waypoint is SnappedWaypoint => waypoint !== null)
      : [];
    const [primary, ...alternativeRoutes] = routes;
    return {
      profile,
      ...primary,
      waypoints,
      alternatives: alternativeRoutes,
    };
  }

  async calculateDistance(
    origin: MapCoordinate,
    destination: MapCoordinate,
    profile: RoutingProfile = 'driving',
    signal?: AbortSignal
  ): Promise<DistanceResult> {
    const route = await this.calculateRoute({
      coordinates: [origin, destination],
      profile,
      overview: false,
      steps: false,
    }, signal);
    return {
      profile,
      distanceMeters: route.distanceMeters,
      distanceKm: route.distanceKm,
      durationSeconds: route.durationSeconds,
      durationMinutes: route.durationMinutes,
      origin: route.waypoints[0] ?? null,
      destination: route.waypoints[route.waypoints.length - 1] ?? null,
    };
  }

  async calculateMatrix(request: RouteMatrixRequest, signal?: AbortSignal): Promise<RouteMatrixResult> {
    assertCoordinates(request.coordinates, 2);
    const profile = request.profile ?? 'driving';
    validateProfile(profile);
    assertMatrixIndexes(request.sources, request.coordinates.length, 'sources');
    assertMatrixIndexes(request.destinations, request.coordinates.length, 'destinations');

    const config = this.configFactory();
    const serverProfile = config.profiles[profile];
    const params = new URLSearchParams({ annotations: 'duration,distance' });
    if (request.sources) params.set('sources', request.sources.join(';'));
    if (request.destinations) params.set('destinations', request.destinations.join(';'));
    const payload = await this.request(
      `/table/v1/${encodeURIComponent(serverProfile)}/${coordinatePath(request.coordinates)}`,
      params,
      signal
    );
    const code = getErrorCode(payload);
    if (code !== 'Ok') {
      const message = getErrorMessage(payload);
      throw new AppError(
        code === 'NoTable'
          ? 'Không thể tính ma trận tuyến đường cho các tọa độ đã chọn'
          : `OSRM không thể tính ma trận tuyến đường${message ? `: ${message}` : ''}`,
        isOsrmClientError(code)
          ? HTTP_STATUS.UNPROCESSABLE
          : UPSTREAM_ERROR_STATUS
      );
    }
    if (!isRecord(payload)) {
      throw new AppError('OSRM không trả về ma trận hợp lệ', UPSTREAM_ERROR_STATUS);
    }
    const parseWaypoints = (value: unknown): SnappedWaypoint[] =>
      Array.isArray(value)
        ? value.map(parseWaypoint).filter((item): item is SnappedWaypoint => item !== null)
        : [];
    const durationsSeconds = parseMatrix(payload.durations, 'thời gian');
    const distancesMeters = parseMatrix(payload.distances, 'khoảng cách');
    const expectedRows = request.sources?.length ?? request.coordinates.length;
    const expectedColumns = request.destinations?.length ?? request.coordinates.length;
    const hasExpectedDimensions = (matrix: Array<Array<number | null>>): boolean =>
      matrix.length === expectedRows &&
      matrix.every((row) => row.length === expectedColumns);
    if (!hasExpectedDimensions(durationsSeconds) || !hasExpectedDimensions(distancesMeters)) {
      throw new AppError('OSRM trả về ma trận sai kích thước', UPSTREAM_ERROR_STATUS);
    }

    return {
      profile,
      durationsSeconds,
      distancesMeters,
      sources: parseWaypoints(payload.sources),
      destinations: parseWaypoints(payload.destinations),
    };
  }
}

export const mapService = new OsrmMapService();
