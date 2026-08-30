export declare const DEFAULT_ANALYTICS_PERIOD_DAYS = 30;
export declare const MAX_ANALYTICS_PERIOD_DAYS = 90;
export declare const DEFAULT_POPULAR_DESTINATION_LIMIT = 5;
export declare const DEFAULT_TOP_CITY_LIMIT = 5;
export declare const MAX_ANALYTICS_RANKING_LIMIT = 20;
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
export declare const analyticsService: {
    getOverview(options?: AnalyticsOverviewOptions): Promise<{
        generatedAt: string;
        period: {
            days: number;
            current: {
                from: string;
                to: string;
            };
            previous: {
                from: string;
                to: string;
            };
        };
        summary: {
            users: {
                active: number;
                inactive: number;
                total: number;
                currentPeriod: number;
                previousPeriod: number;
                growthPercentage: number | null;
            };
            destinations: {
                active: number;
                inactive: number;
                total: number;
                currentPeriod: number;
                previousPeriod: number;
                growthPercentage: number | null;
            };
            trips: {
                aiGenerated: number;
                public: number;
                total: number;
                currentPeriod: number;
                previousPeriod: number;
                growthPercentage: number | null;
            };
            reviews: {
                visible: number;
                hidden: number;
                averageRating: number | null;
                total: number;
                currentPeriod: number;
                previousPeriod: number;
                growthPercentage: number | null;
            };
        };
        aiUsage: {
            generatedTrips: number;
            totalTrips: number;
            adoptionPercentage: number;
        };
        dailyActivity: import("../repositories/analytics.repository").DailyActivityRecord[];
        popularDestinations: {
            id: number;
            name: string;
            address: string;
            rating: number;
            isActive: boolean;
            categories: {
                id: number;
                name: string;
            }[];
            itineraryCount: number;
            favoriteCount: number;
            reviewCount: number;
            averageReviewRating: number | null;
            engagementCount: number;
        }[];
        topTripCities: {
            sharePercentage: number;
            destinationCity: string;
            tripCount: number;
        }[];
    }>;
};
export type AnalyticsOverview = Awaited<ReturnType<typeof analyticsService.getOverview>>;
//# sourceMappingURL=analytics.service.d.ts.map