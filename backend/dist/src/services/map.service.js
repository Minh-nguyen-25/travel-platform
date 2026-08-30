"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapService = exports.OsrmMapService = void 0;
const constants_1 = require("../constants");
const map_1 = require("../config/map");
const app_error_1 = require("../utils/app-error");
const MAX_COORDINATES = 100;
const UPSTREAM_ERROR_STATUS = 502;
const UPSTREAM_UNAVAILABLE_STATUS = 503;
const UPSTREAM_TIMEOUT_STATUS = 504;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const round = (value, digits) => {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
};
const assertCoordinate = (coordinate, index) => {
    if (!coordinate ||
        !Number.isFinite(coordinate.latitude) ||
        coordinate.latitude < -90 ||
        coordinate.latitude > 90 ||
        !Number.isFinite(coordinate.longitude) ||
        coordinate.longitude < -180 ||
        coordinate.longitude > 180) {
        throw new app_error_1.AppError(`Tọa độ tại vị trí ${index} không hợp lệ`, constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
};
const assertCoordinates = (coordinates, minimum) => {
    if (!Array.isArray(coordinates) || coordinates.length < minimum) {
        throw new app_error_1.AppError(`Cần cung cấp ít nhất ${minimum} tọa độ`, constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
    if (coordinates.length > MAX_COORDINATES) {
        throw new app_error_1.AppError(`Mỗi yêu cầu chỉ hỗ trợ tối đa ${MAX_COORDINATES} tọa độ`, constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
    coordinates.forEach(assertCoordinate);
};
const coordinatePath = (coordinates) => coordinates
    .map(({ longitude, latitude }) => `${longitude.toFixed(7)},${latitude.toFixed(7)}`)
    .join(';');
const parseLocation = (value) => {
    if (!Array.isArray(value) ||
        value.length < 2 ||
        !isFiniteNumber(value[0]) ||
        !isFiniteNumber(value[1])) {
        return null;
    }
    return { longitude: value[0], latitude: value[1] };
};
const parseWaypoint = (value) => {
    if (!isRecord(value))
        return null;
    const location = parseLocation(value.location);
    if (!location)
        return null;
    return {
        name: typeof value.name === 'string' ? value.name : '',
        distanceMeters: isFiniteNumber(value.distance) ? value.distance : 0,
        location,
    };
};
const parseStep = (value) => {
    if (!isRecord(value) || !isFiniteNumber(value.distance) || !isFiniteNumber(value.duration)) {
        return null;
    }
    const maneuver = isRecord(value.maneuver) ? value.maneuver : {};
    const location = parseLocation(maneuver.location);
    if (!location)
        return null;
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
const parseLeg = (value) => {
    if (!isRecord(value) || !isFiniteNumber(value.distance) || !isFiniteNumber(value.duration)) {
        return null;
    }
    const steps = Array.isArray(value.steps)
        ? value.steps.map(parseStep).filter((step) => step !== null)
        : [];
    return {
        distanceMeters: value.distance,
        durationSeconds: value.duration,
        summary: typeof value.summary === 'string' ? value.summary : '',
        steps,
    };
};
const parseGeometry = (value, format) => {
    if ((format === 'polyline' || format === 'polyline6') && typeof value === 'string') {
        return value;
    }
    if (format === 'geojson' && isRecord(value) && value.type === 'LineString') {
        if (Array.isArray(value.coordinates) &&
            value.coordinates.every((item) => Array.isArray(item) &&
                item.length >= 2 &&
                isFiniteNumber(item[0]) &&
                isFiniteNumber(item[1]))) {
            return {
                type: 'LineString',
                coordinates: value.coordinates.map((item) => [item[0], item[1]]),
            };
        }
    }
    return null;
};
const parseRoute = (value, geometryFormat) => {
    if (!isRecord(value) || !isFiniteNumber(value.distance) || !isFiniteNumber(value.duration)) {
        return null;
    }
    const legs = Array.isArray(value.legs)
        ? value.legs.map(parseLeg).filter((leg) => leg !== null)
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
const validateProfile = (profile) => {
    if (profile !== 'driving' && profile !== 'walking' && profile !== 'cycling') {
        throw new app_error_1.AppError('Loại phương tiện routing không hợp lệ', constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
};
const retryableStatus = (status) => status === 408 || status === 425 || status === 429 || status >= 500;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const getErrorCode = (payload) => isRecord(payload) && typeof payload.code === 'string' ? payload.code : null;
const getErrorMessage = (payload) => isRecord(payload) && typeof payload.message === 'string' ? payload.message : null;
const isOsrmClientError = (code) => code === 'InvalidQuery' ||
    code === 'InvalidValue' ||
    code === 'NoSegment' ||
    code === 'NoRoute' ||
    code === 'NoTable' ||
    code === 'TooBig';
const assertMatrixIndexes = (indexes, coordinateCount, field) => {
    if (indexes === undefined)
        return;
    if (indexes.length === 0 ||
        new Set(indexes).size !== indexes.length ||
        indexes.some((index) => !Number.isInteger(index) || index < 0 || index >= coordinateCount)) {
        throw new app_error_1.AppError(`${field} chứa chỉ số tọa độ không hợp lệ`, constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
};
const parseMatrix = (value, label) => {
    if (!Array.isArray(value)) {
        throw new app_error_1.AppError(`OSRM không trả về ma trận ${label} hợp lệ`, UPSTREAM_ERROR_STATUS);
    }
    return value.map((row) => {
        if (!Array.isArray(row) || row.some((cell) => cell !== null && !isFiniteNumber(cell))) {
            throw new app_error_1.AppError(`OSRM không trả về ma trận ${label} hợp lệ`, UPSTREAM_ERROR_STATUS);
        }
        return row;
    });
};
class OsrmMapService {
    configFactory;
    fetchImpl;
    constructor(configFactory = map_1.getOsrmConfig, fetchImpl = globalThis.fetch.bind(globalThis)) {
        this.configFactory = configFactory;
        this.fetchImpl = fetchImpl;
    }
    async request(path, params, externalSignal) {
        const config = this.configFactory();
        const url = new URL(`${config.baseUrl}${path}`);
        params.forEach((value, key) => url.searchParams.set(key, value));
        if (config.apiKey) {
            url.searchParams.set(config.apiKeyQueryParam, config.apiKey);
        }
        let lastError;
        for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
            const abortFromExternal = () => controller.abort();
            if (externalSignal?.aborted)
                controller.abort();
            else
                externalSignal?.addEventListener('abort', abortFromExternal, { once: true });
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
                let payload = null;
                if (rawText) {
                    try {
                        payload = JSON.parse(rawText);
                    }
                    catch {
                        if (!response.ok) {
                            throw new app_error_1.AppError(`Không thể tính tuyến đường qua OSRM (${response.status})`, response.status === 429 ? UPSTREAM_UNAVAILABLE_STATUS : UPSTREAM_ERROR_STATUS);
                        }
                        throw new app_error_1.AppError('OSRM trả về dữ liệu không hợp lệ', UPSTREAM_ERROR_STATUS);
                    }
                }
                if (!response.ok) {
                    const code = getErrorCode(payload);
                    if (code === 'NoRoute' || code === 'NoSegment') {
                        throw new app_error_1.AppError('Không tìm thấy tuyến đường phù hợp giữa các tọa độ', constants_1.HTTP_STATUS.UNPROCESSABLE);
                    }
                    if (code === 'NoTable') {
                        throw new app_error_1.AppError('Không thể tính ma trận tuyến đường cho các tọa độ đã chọn', constants_1.HTTP_STATUS.UNPROCESSABLE);
                    }
                    if (code === 'InvalidQuery' ||
                        code === 'InvalidValue' ||
                        code === 'TooBig') {
                        throw new app_error_1.AppError(code === 'TooBig'
                            ? 'Yêu cầu định tuyến vượt quá giới hạn của OSRM'
                            : 'Yêu cầu định tuyến không hợp lệ', constants_1.HTTP_STATUS.UNPROCESSABLE);
                    }
                    const status = response.status === 429 ? UPSTREAM_UNAVAILABLE_STATUS : UPSTREAM_ERROR_STATUS;
                    throw new app_error_1.AppError(`Không thể tính tuyến đường qua OSRM (${response.status})`, status);
                }
                return payload;
            }
            catch (error) {
                lastError = error;
                if (error instanceof app_error_1.AppError)
                    throw error;
                if (externalSignal?.aborted) {
                    throw new app_error_1.AppError('Yêu cầu OSRM đã vượt quá thời hạn tổng thể', UPSTREAM_TIMEOUT_STATUS);
                }
                if (attempt < config.maxRetries) {
                    await delay(250 * 2 ** attempt);
                    continue;
                }
                if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
                    throw new app_error_1.AppError('OSRM phản hồi quá thời gian cho phép', UPSTREAM_TIMEOUT_STATUS);
                }
            }
            finally {
                clearTimeout(timeout);
                externalSignal?.removeEventListener('abort', abortFromExternal);
            }
        }
        throw new app_error_1.AppError(lastError instanceof Error
            ? `Không thể kết nối dịch vụ OSRM: ${lastError.message}`
            : 'Không thể kết nối dịch vụ OSRM', UPSTREAM_UNAVAILABLE_STATUS);
    }
    getProfileForTravelMode(travelMode) {
        if (travelMode === constants_1.TRAVEL_MODE.DRIVING)
            return { profile: 'driving', isApproximation: false };
        if (travelMode === constants_1.TRAVEL_MODE.WALKING)
            return { profile: 'walking', isApproximation: false };
        if (travelMode === constants_1.TRAVEL_MODE.CYCLING)
            return { profile: 'cycling', isApproximation: false };
        const transitProfile = this.configFactory().transitProfile;
        if (!transitProfile) {
            throw new app_error_1.AppError('OSRM không hỗ trợ phương tiện công cộng; hãy cấu hình OSRM_TRANSIT_FALLBACK_PROFILE nếu chấp nhận số liệu xấp xỉ', constants_1.HTTP_STATUS.UNPROCESSABLE);
        }
        return { profile: transitProfile, isApproximation: true };
    }
    async calculateRoute(request, signal) {
        assertCoordinates(request.coordinates, 2);
        const profile = request.profile ?? 'driving';
        validateProfile(profile);
        const geometryFormat = request.geometries ?? 'polyline';
        const overview = request.overview ?? false;
        const alternatives = request.alternatives ?? false;
        if (typeof alternatives === 'number' &&
            (!Number.isInteger(alternatives) || alternatives < 1 || alternatives > 3)) {
            throw new app_error_1.AppError('alternatives phải nằm trong khoảng 1 đến 3', constants_1.HTTP_STATUS.UNPROCESSABLE);
        }
        const config = this.configFactory();
        const serverProfile = config.profiles[profile];
        const params = new URLSearchParams({
            alternatives: String(alternatives),
            steps: String(request.steps ?? false),
            overview: String(overview),
            geometries: geometryFormat,
        });
        const payload = await this.request(`/route/v1/${encodeURIComponent(serverProfile)}/${coordinatePath(request.coordinates)}`, params, signal);
        const code = getErrorCode(payload);
        if (code !== 'Ok') {
            const message = getErrorMessage(payload);
            const status = isOsrmClientError(code)
                ? constants_1.HTTP_STATUS.UNPROCESSABLE
                : UPSTREAM_ERROR_STATUS;
            throw new app_error_1.AppError(code === 'NoRoute'
                ? 'Không tìm thấy tuyến đường phù hợp giữa các tọa độ'
                : `OSRM không thể tính tuyến đường${message ? `: ${message}` : ''}`, status);
        }
        if (!isRecord(payload) || !Array.isArray(payload.routes)) {
            throw new app_error_1.AppError('OSRM không trả về tuyến đường hợp lệ', UPSTREAM_ERROR_STATUS);
        }
        const routes = payload.routes
            .map((route) => parseRoute(route, geometryFormat))
            .filter((route) => route !== null);
        if (routes.length === 0) {
            throw new app_error_1.AppError('OSRM không trả về tuyến đường hợp lệ', UPSTREAM_ERROR_STATUS);
        }
        const waypoints = Array.isArray(payload.waypoints)
            ? payload.waypoints
                .map(parseWaypoint)
                .filter((waypoint) => waypoint !== null)
            : [];
        const [primary, ...alternativeRoutes] = routes;
        return {
            profile,
            ...primary,
            waypoints,
            alternatives: alternativeRoutes,
        };
    }
    async calculateDistance(origin, destination, profile = 'driving', signal) {
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
    async calculateMatrix(request, signal) {
        assertCoordinates(request.coordinates, 2);
        const profile = request.profile ?? 'driving';
        validateProfile(profile);
        assertMatrixIndexes(request.sources, request.coordinates.length, 'sources');
        assertMatrixIndexes(request.destinations, request.coordinates.length, 'destinations');
        const config = this.configFactory();
        const serverProfile = config.profiles[profile];
        const params = new URLSearchParams({ annotations: 'duration,distance' });
        if (request.sources)
            params.set('sources', request.sources.join(';'));
        if (request.destinations)
            params.set('destinations', request.destinations.join(';'));
        const payload = await this.request(`/table/v1/${encodeURIComponent(serverProfile)}/${coordinatePath(request.coordinates)}`, params, signal);
        const code = getErrorCode(payload);
        if (code !== 'Ok') {
            const message = getErrorMessage(payload);
            throw new app_error_1.AppError(code === 'NoTable'
                ? 'Không thể tính ma trận tuyến đường cho các tọa độ đã chọn'
                : `OSRM không thể tính ma trận tuyến đường${message ? `: ${message}` : ''}`, isOsrmClientError(code)
                ? constants_1.HTTP_STATUS.UNPROCESSABLE
                : UPSTREAM_ERROR_STATUS);
        }
        if (!isRecord(payload)) {
            throw new app_error_1.AppError('OSRM không trả về ma trận hợp lệ', UPSTREAM_ERROR_STATUS);
        }
        const parseWaypoints = (value) => Array.isArray(value)
            ? value.map(parseWaypoint).filter((item) => item !== null)
            : [];
        const durationsSeconds = parseMatrix(payload.durations, 'thời gian');
        const distancesMeters = parseMatrix(payload.distances, 'khoảng cách');
        const expectedRows = request.sources?.length ?? request.coordinates.length;
        const expectedColumns = request.destinations?.length ?? request.coordinates.length;
        const hasExpectedDimensions = (matrix) => matrix.length === expectedRows &&
            matrix.every((row) => row.length === expectedColumns);
        if (!hasExpectedDimensions(durationsSeconds) || !hasExpectedDimensions(distancesMeters)) {
            throw new app_error_1.AppError('OSRM trả về ma trận sai kích thước', UPSTREAM_ERROR_STATUS);
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
exports.OsrmMapService = OsrmMapService;
exports.mapService = new OsrmMapService();
//# sourceMappingURL=map.service.js.map