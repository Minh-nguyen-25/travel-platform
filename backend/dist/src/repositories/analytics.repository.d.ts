import { Prisma } from '@prisma/client';
export interface AnalyticsDateWindow {
    currentStart: Date;
    currentEnd: Date;
    previousStart: Date;
}
export interface AnalyticsCountRecord {
    total: number;
    currentPeriod: number;
    previousPeriod: number;
}
export interface AnalyticsOverviewRecord {
    users: AnalyticsCountRecord & {
        active: number;
    };
    destinations: AnalyticsCountRecord & {
        active: number;
    };
    trips: AnalyticsCountRecord & {
        aiGenerated: number;
        public: number;
    };
    reviews: AnalyticsCountRecord & {
        visible: number;
        averageRating: number | null;
    };
}
export interface PopularDestinationRecord {
    id: number;
    name: string;
    address: string;
    rating: Prisma.Decimal;
    isActive: boolean;
    categories: Array<{
        category: {
            id: number;
            name: string;
        };
    }>;
    itineraryCount: number;
    favoriteCount: number;
    reviewCount: number;
    averageReviewRating: number | null;
}
export interface TopTripCityRecord {
    destinationCity: string;
    tripCount: number;
}
export interface DailyActivityRecord {
    date: string;
    newUsers: number;
    createdTrips: number;
    newReviews: number;
}
export declare const analyticsRepository: {
    getOverview(window: AnalyticsDateWindow): Promise<AnalyticsOverviewRecord>;
    getPopularDestinations(limit: number): Promise<PopularDestinationRecord[]>;
    getTopTripCities(limit: number): Promise<TopTripCityRecord[]>;
    getDailyActivity(window: AnalyticsDateWindow): Promise<DailyActivityRecord[]>;
};
//# sourceMappingURL=analytics.repository.d.ts.map