import { HTTP_STATUS } from '../constants';
import {
  AnalyticsCountRecord,
  AnalyticsDateWindow,
  analyticsRepository,
} from '../repositories/analytics.repository';
import { AppError } from '../utils/app-error';

export const DEFAULT_ANALYTICS_PERIOD_DAYS = 30;
export const MAX_ANALYTICS_PERIOD_DAYS = 90;
export const DEFAULT_POPULAR_DESTINATION_LIMIT = 5;
export const DEFAULT_TOP_CITY_LIMIT = 5;
export const MAX_ANALYTICS_RANKING_LIMIT = 20;

export interface AnalyticsOverviewOptions {
  periodDays?: number;
  popularDestinationLimit?: number;
  topCityLimit?: number;
  /** Primarily useful for deterministic tests. Defaults to the current time. */
  now?: Date;
}

export interface AnalyticsMetric {
  total: number;
  currentPeriod: number;
  previousPeriod: number;
  growthPercentage: number | null;
}

const normalizeInteger = (
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
  label: string
): number => {
  if (value === undefined) {
    return fallback;
  }

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new AppError(
      `${label} phải là số nguyên từ ${minimum} đến ${maximum}`,
      HTTP_STATUS.UNPROCESSABLE
    );
  }

  return value;
};

const addUtcDays = (date: Date, days: number): Date => {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const startOfUtcDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const percentage = (part: number, total: number): number =>
  total === 0 ? 0 : Number(((part / total) * 100).toFixed(2));

const growthPercentage = (current: number, previous: number): number | null => {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return Number((((current - previous) / previous) * 100).toFixed(2));
};

const serializeMetric = (record: AnalyticsCountRecord): AnalyticsMetric => ({
  total: record.total,
  currentPeriod: record.currentPeriod,
  previousPeriod: record.previousPeriod,
  growthPercentage: growthPercentage(record.currentPeriod, record.previousPeriod),
});

const buildWindow = (now: Date, periodDays: number): AnalyticsDateWindow => {
  const currentEnd = addUtcDays(startOfUtcDay(now), 1);
  const currentStart = addUtcDays(currentEnd, -periodDays);

  return {
    currentStart,
    currentEnd,
    previousStart: addUtcDays(currentStart, -periodDays),
  };
};

export const analyticsService = {
  async getOverview(options: AnalyticsOverviewOptions = {}) {
    const periodDays = normalizeInteger(
      options.periodDays,
      DEFAULT_ANALYTICS_PERIOD_DAYS,
      1,
      MAX_ANALYTICS_PERIOD_DAYS,
      'periodDays'
    );
    const popularDestinationLimit = normalizeInteger(
      options.popularDestinationLimit,
      DEFAULT_POPULAR_DESTINATION_LIMIT,
      1,
      MAX_ANALYTICS_RANKING_LIMIT,
      'popularDestinationLimit'
    );
    const topCityLimit = normalizeInteger(
      options.topCityLimit,
      DEFAULT_TOP_CITY_LIMIT,
      1,
      MAX_ANALYTICS_RANKING_LIMIT,
      'topCityLimit'
    );
    const now = options.now ? new Date(options.now.getTime()) : new Date();

    if (Number.isNaN(now.getTime())) {
      throw new AppError('Thời điểm tạo analytics không hợp lệ', HTTP_STATUS.UNPROCESSABLE);
    }

    const window = buildWindow(now, periodDays);
    const [overview, popularDestinations, topTripCities, dailyActivity] =
      await Promise.all([
        analyticsRepository.getOverview(window),
        analyticsRepository.getPopularDestinations(popularDestinationLimit),
        analyticsRepository.getTopTripCities(topCityLimit),
        analyticsRepository.getDailyActivity(window),
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
        adoptionPercentage: percentage(
          overview.trips.aiGenerated,
          overview.trips.total
        ),
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
        engagementCount:
          destination.itineraryCount +
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

export type AnalyticsOverview = Awaited<ReturnType<typeof analyticsService.getOverview>>;
