"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOsrmConfig = void 0;
const readInteger = (name, fallback, minimum, maximum) => {
    const rawValue = process.env[name]?.trim();
    if (!rawValue)
        return fallback;
    const value = Number(rawValue);
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
    }
    return value;
};
const readProfile = (name, fallback) => {
    const profile = process.env[name]?.trim() || fallback;
    if (!/^[a-zA-Z0-9_-]+$/.test(profile)) {
        throw new Error(`${name} contains unsupported characters`);
    }
    return profile;
};
const readTransitProfile = () => {
    const profile = process.env.OSRM_TRANSIT_FALLBACK_PROFILE?.trim().toLowerCase();
    if (!profile)
        return null;
    if (profile !== 'driving' && profile !== 'walking' && profile !== 'cycling') {
        throw new Error('OSRM_TRANSIT_FALLBACK_PROFILE must be driving, walking, cycling, or empty');
    }
    return profile;
};
const getOsrmConfig = () => {
    const rawBaseUrl = (process.env.OSRM_BASE_URL ?? 'https://router.project-osrm.org').trim();
    let parsedUrl;
    try {
        parsedUrl = new URL(rawBaseUrl);
    }
    catch {
        throw new Error('OSRM_BASE_URL must be a valid absolute URL');
    }
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        throw new Error('OSRM_BASE_URL must use http or https');
    }
    const apiKeyQueryParam = process.env.OSRM_API_KEY_QUERY_PARAM?.trim() || 'api_key';
    if (!/^[a-zA-Z0-9_.-]+$/.test(apiKeyQueryParam)) {
        throw new Error('OSRM_API_KEY_QUERY_PARAM contains unsupported characters');
    }
    return {
        baseUrl: rawBaseUrl.replace(/\/+$/, ''),
        timeoutMs: readInteger('OSRM_REQUEST_TIMEOUT_MS', 10_000, 500, 120_000),
        maxRetries: readInteger('OSRM_MAX_RETRIES', 1, 0, 3),
        apiKey: process.env.OSRM_API_KEY?.trim() || null,
        apiKeyQueryParam,
        userAgent: process.env.OSRM_USER_AGENT?.trim() || 'travel-platform-backend/1.0',
        profiles: {
            driving: readProfile('OSRM_DRIVING_PROFILE', 'driving'),
            walking: readProfile('OSRM_WALKING_PROFILE', 'walking'),
            cycling: readProfile('OSRM_CYCLING_PROFILE', 'cycling'),
        },
        transitProfile: readTransitProfile(),
    };
};
exports.getOsrmConfig = getOsrmConfig;
//# sourceMappingURL=map.js.map