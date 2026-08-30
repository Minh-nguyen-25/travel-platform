"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.MAX_ANALYTICS_RANKING_LIMIT = exports.DEFAULT_TOP_CITY_LIMIT = exports.DEFAULT_POPULAR_DESTINATION_LIMIT = exports.MAX_ANALYTICS_PERIOD_DAYS = exports.DEFAULT_ANALYTICS_PERIOD_DAYS = void 0;
const constants_1 = require("../constants");
const analytics_repository_1 = require("../repositories/analytics.repository");
const app_error_1 = require("../utils/app-error");
exports.DEFAULT_ANALYTICS_PERIOD_DAYS = 30;
exports.MAX_ANALYTICS_PERIOD_DAYS = 90;
exports.DEFAULT_POPULAR_DESTINATION_LIMIT = 5;
exports.DEFAULT_TOP_CITY_LIMIT = 5;
exports.MAX_ANALYTICS_RANKING_LIMIT = 20;
const normalizeInteger = (value, fallback, minimum, maximum, label) => {
    if (value === undefined) {
        return fallback;
    }
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new app_error_1.AppError(`${label} phải là số nguyên từ ${minimum} đến ${maximum}`, constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
    return value;
};
const addUtcDays = (date, days) => {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
};
const startOfUtcDay = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const toDateOnly = (date) => date.toISOString().slice(0, 10);
const percentage = (part, total) => total === 0 ? 0 : Number(((part / total) * 100).toFixed(2));
const growthPercentage = (current, previous) => {
    if (previous === 0) {
        return current === 0 ? 0 : null;
    }
    return Number((((current - previous) / previous) * 100).toFixed(2));
};
const serializeMetric = (record) => ({
    total: record.total,
    currentPeriod: record.currentPeriod,
    previousPeriod: record.previousPeriod,
    growthPercentage: growthPercentage(record.currentPeriod, record.previousPeriod),
});
const buildWindow = (now, periodDays) => {
    const currentEnd = addUtcDays(startOfUtcDay(now), 1);
    const currentStart = addUtcDays(currentEnd, -periodDays);
    return {
        currentStart,
        currentEnd,
        previousStart: addUtcDays(currentStart, -periodDays),
    };
};
exports.analyticsService = {
    async getOverview(options = {}) {
        const periodDays = normalizeInteger(options.periodDays, exports.DEFAULT_ANALYTICS_PERIOD_DAYS, 1, exports.MAX_ANALYTICS_PERIOD_DAYS, 'periodDays');
        const popularDestinationLimit = normalizeInteger(options.popularDestinationLimit, exports.DEFAULT_POPULAR_DESTINATION_LIMIT, 1, exports.MAX_ANALYTICS_RANKING_LIMIT, 'popularDestinationLimit');
        const topCityLimit = normalizeInteger(options.topCityLimit, exports.DEFAULT_TOP_CITY_LIMIT, 1, exports.MAX_ANALYTICS_RANKING_LIMIT, 'topCityLimit');
        const now = options.now ? new Date(options.now.getTime()) : new Date();
        if (Number.isNaN(now.getTime())) {
            throw new app_error_1.AppError('Thời điểm tạo analytics không hợp lệ', constants_1.HTTP_STATUS.UNPROCESSABLE);
        }
        const window = buildWindow(now, periodDays);
        const [overview, popularDestinations, topTripCities, dailyActivity] = await Promise.all([
            analytics_repository_1.analyticsRepository.getOverview(window),
            analytics_repository_1.analyticsRepository.getPopularDestinations(popularDestinationLimit),
            analytics_repository_1.analyticsRepository.getTopTripCities(topCityLimit),
            analytics_repository_1.analyticsRepository.getDailyActivity(window),
        ]);
        return {
            generatedAt: now.toISOString(),
            period: {
                days: periodDays,
                current: {
                    from: toDateOnly(window.currentStart),
                    to: toDateOnly(addUtcDays(window.currentEnd, -1)),
                },
                previous: {
                    from: toDateOnly(window.previousStart),
                    to: toDateOnly(addUtcDays(window.currentStart, -1)),
                },
            },
            summary: {
                users: {
                    ...serializeMetric(overview.users),
                    active: overview.users.active,
                    inactive: overview.users.total - overview.users.active,
                },
                destinations: {
                    ...serializeMetric(overview.destinations),
                    active: overview.destinations.active,
                    inactive: overview.destinations.total - overview.destinations.active,
                },
                trips: {
                    ...serializeMetric(overview.trips),
                    aiGenerated: overview.trips.aiGenerated,
                    public: overview.trips.public,
                },
                reviews: {
                    ...serializeMetric(overview.reviews),
                    visible: overview.reviews.visible,
                    hidden: overview.reviews.total - overview.reviews.visible,
                    averageRating: overview.reviews.averageRating,
                },
            },
            aiUsage: {
                generatedTrips: overview.trips.aiGenerated,
                totalTrips: overview.trips.total,
                adoptionPercentage: percentage(overview.trips.aiGenerated, overview.trips.total),
            },
            dailyActivity,
            popularDestinations: popularDestinations.map((destination) => ({
                id: destination.id,
                name: destination.name,
                address: destination.address,
                rating: Number(destination.rating.toString()),
                isActive: destination.isActive,
                categories: destination.categories
                    .map(({ category }) => category)
                    .sort((left, right) => left.name.localeCompare(right.name)),
                itineraryCount: destination.itineraryCount,
                favoriteCount: destination.favoriteCount,
                reviewCount: destination.reviewCount,
                averageReviewRating: destination.averageReviewRating,
                engagementCount: destination.itineraryCount +
                    destination.favoriteCount +
                    destination.reviewCount,
            })),
            topTripCities: topTripCities.map((city) => ({
                ...city,
                sharePercentage: percentage(city.tripCount, overview.trips.total),
            })),
        };
    },
};
//# sourceMappingURL=analytics.service.js.map