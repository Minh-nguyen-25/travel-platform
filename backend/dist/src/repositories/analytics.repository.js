"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRepository = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db"));
const popularDestinationSelect = {
    id: true,
    name: true,
    address: true,
    rating: true,
    isActive: true,
    categories: {
        select: {
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
};
const toSafeCount = (value) => {
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new RangeError('Analytics count exceeds JavaScript safe integer range');
    }
    return Number(value);
};
const createdDuring = (start, end) => ({
    gte: start,
    lt: end,
});
exports.analyticsRepository = {
    async getOverview(window) {
        const currentPeriod = createdDuring(window.currentStart, window.currentEnd);
        const previousPeriod = createdDuring(window.previousStart, window.currentStart);
        return db_1.default.$transaction(async (tx) => {
            const [users, destinations, trips, reviews] = await Promise.all([
                Promise.all([
                    tx.user.count(),
                    tx.user.count({ where: { isActive: true } }),
                    tx.user.count({ where: { createdAt: currentPeriod } }),
                    tx.user.count({ where: { createdAt: previousPeriod } }),
                ]),
                Promise.all([
                    tx.destination.count(),
                    tx.destination.count({ where: { isActive: true } }),
                    tx.destination.count({ where: { createdAt: currentPeriod } }),
                    tx.destination.count({ where: { createdAt: previousPeriod } }),
                ]),
                Promise.all([
                    tx.trip.count(),
                    tx.trip.count({ where: { isAiGenerated: true } }),
                    tx.trip.count({ where: { isPublic: true } }),
                    tx.trip.count({ where: { createdAt: currentPeriod } }),
                    tx.trip.count({ where: { createdAt: previousPeriod } }),
                ]),
                Promise.all([
                    tx.review.count(),
                    tx.review.count({ where: { isVisible: true } }),
                    tx.review.count({ where: { createdAt: currentPeriod } }),
                    tx.review.count({ where: { createdAt: previousPeriod } }),
                    tx.review.aggregate({
                        where: { isVisible: true },
                        _avg: { rating: true },
                    }),
                ]),
            ]);
            const [totalUsers, activeUsers, currentUsers, previousUsers] = users;
            const [totalDestinations, activeDestinations, currentDestinations, previousDestinations,] = destinations;
            const [totalTrips, aiGeneratedTrips, publicTrips, currentTrips, previousTrips] = trips;
            const [totalReviews, visibleReviews, currentReviews, previousReviews, reviewRating,] = reviews;
            return {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    currentPeriod: currentUsers,
                    previousPeriod: previousUsers,
                },
                destinations: {
                    total: totalDestinations,
                    active: activeDestinations,
                    currentPeriod: currentDestinations,
                    previousPeriod: previousDestinations,
                },
                trips: {
                    total: totalTrips,
                    aiGenerated: aiGeneratedTrips,
                    public: publicTrips,
                    currentPeriod: currentTrips,
                    previousPeriod: previousTrips,
                },
                reviews: {
                    total: totalReviews,
                    visible: visibleReviews,
                    currentPeriod: currentReviews,
                    previousPeriod: previousReviews,
                    averageRating: reviewRating._avg.rating,
                },
            };
        }, {
            isolationLevel: client_1.Prisma.TransactionIsolationLevel.RepeatableRead,
            maxWait: 5_000,
            timeout: 20_000,
        });
    },
    async getPopularDestinations(limit) {
        return db_1.default.$transaction(async (tx) => {
            const ranking = await tx.$queryRaw(client_1.Prisma.sql `
          WITH itinerary_counts AS (
            SELECT "destination_id" AS id, COUNT(*)::bigint AS count
            FROM "itineraries"
            GROUP BY "destination_id"
          ),
          favorite_counts AS (
            SELECT "destination_id" AS id, COUNT(*)::bigint AS count
            FROM "favorites"
            GROUP BY "destination_id"
          ),
          review_counts AS (
            SELECT
              "destination_id" AS id,
              COUNT(*)::bigint AS count,
              AVG("rating")::double precision AS average
            FROM "reviews"
            WHERE "is_visible" = true
            GROUP BY "destination_id"
          )
          SELECT
            destinations."id" AS id,
            COALESCE(itineraries.count, 0)::bigint AS "itineraryCount",
            COALESCE(favorites.count, 0)::bigint AS "favoriteCount",
            COALESCE(reviews.count, 0)::bigint AS "reviewCount",
            reviews.average AS "averageReviewRating"
          FROM "destinations" AS destinations
          LEFT JOIN itinerary_counts AS itineraries ON itineraries.id = destinations."id"
          LEFT JOIN favorite_counts AS favorites ON favorites.id = destinations."id"
          LEFT JOIN review_counts AS reviews ON reviews.id = destinations."id"
          ORDER BY
            COALESCE(itineraries.count, 0) +
              COALESCE(favorites.count, 0) +
              COALESCE(reviews.count, 0) DESC,
            destinations."rating" DESC,
            destinations."id" ASC
          LIMIT ${limit}
        `);
            if (ranking.length === 0)
                return [];
            const destinations = await tx.destination.findMany({
                where: { id: { in: ranking.map(({ id }) => id) } },
                select: popularDestinationSelect,
            });
            const destinationsById = new Map(destinations.map((destination) => [destination.id, destination]));
            return ranking.flatMap((ranked) => {
                const destination = destinationsById.get(ranked.id);
                if (!destination)
                    return [];
                return {
                    id: destination.id,
                    name: destination.name,
                    address: destination.address,
                    rating: destination.rating,
                    isActive: destination.isActive,
                    categories: destination.categories,
                    itineraryCount: toSafeCount(ranked.itineraryCount),
                    favoriteCount: toSafeCount(ranked.favoriteCount),
                    reviewCount: toSafeCount(ranked.reviewCount),
                    averageReviewRating: ranked.averageReviewRating,
                };
            });
        }, {
            isolationLevel: client_1.Prisma.TransactionIsolationLevel.RepeatableRead,
            maxWait: 5_000,
            timeout: 20_000,
        });
    },
    async getTopTripCities(limit) {
        const rows = await db_1.default.trip.groupBy({
            by: ['destinationCity'],
            _count: { _all: true },
            orderBy: [
                { _count: { destinationCity: 'desc' } },
                { destinationCity: 'asc' },
            ],
            take: limit,
        });
        return rows.map((row) => ({
            destinationCity: row.destinationCity,
            tripCount: row._count._all,
        }));
    },
    async getDailyActivity(window) {
        const start = window.currentStart.toISOString();
        const end = window.currentEnd.toISOString();
        const rows = await db_1.default.$queryRaw(client_1.Prisma.sql `
      WITH day_buckets AS (
        SELECT generate_series(
          ${start}::timestamp,
          ${end}::timestamp - INTERVAL '1 day',
          INTERVAL '1 day'
        ) AS bucket
      ),
      user_counts AS (
        SELECT date_trunc('day', "created_at") AS bucket, COUNT(*) AS count
        FROM "users"
        WHERE "created_at" >= ${start}::timestamp
          AND "created_at" < ${end}::timestamp
        GROUP BY 1
      ),
      trip_counts AS (
        SELECT date_trunc('day', "created_at") AS bucket, COUNT(*) AS count
        FROM "trips"
        WHERE "created_at" >= ${start}::timestamp
          AND "created_at" < ${end}::timestamp
        GROUP BY 1
      ),
      review_counts AS (
        SELECT date_trunc('day', "created_at") AS bucket, COUNT(*) AS count
        FROM "reviews"
        WHERE "created_at" >= ${start}::timestamp
          AND "created_at" < ${end}::timestamp
        GROUP BY 1
      )
      SELECT
        to_char(days.bucket, 'YYYY-MM-DD') AS date,
        COALESCE(users.count, 0)::bigint AS "newUsers",
        COALESCE(trips.count, 0)::bigint AS "createdTrips",
        COALESCE(reviews.count, 0)::bigint AS "newReviews"
      FROM day_buckets AS days
      LEFT JOIN user_counts AS users ON users.bucket = days.bucket
      LEFT JOIN trip_counts AS trips ON trips.bucket = days.bucket
      LEFT JOIN review_counts AS reviews ON reviews.bucket = days.bucket
      ORDER BY days.bucket ASC
    `);
        return rows.map((row) => ({
            date: row.date,
            newUsers: toSafeCount(row.newUsers),
            createdTrips: toSafeCount(row.createdTrips),
            newReviews: toSafeCount(row.newReviews),
        }));
    },
};
//# sourceMappingURL=analytics.repository.js.map