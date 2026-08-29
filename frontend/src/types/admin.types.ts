import type { AuthProvider, User, UserRole } from '@/types/auth.types';

export interface AdminUser extends User {
  counts: {
    reviews: number;
    favorites: number;
    trips: number;
  };
}

export interface AdminUserQuery {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  authProvider?: AuthProvider;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'fullName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  pagination: PaginationMeta;
}

export interface AnalyticsMetric {
  total: number;
  currentPeriod: number;
  previousPeriod: number;
  growthPercentage: number | null;
}

export interface AnalyticsSummary {
  users: AnalyticsMetric & { active: number; inactive: number };
  destinations: AnalyticsMetric & { active: number; inactive: number };
  trips: AnalyticsMetric & { aiGenerated: number; public: number };
  reviews: AnalyticsMetric & { visible: number; hidden: number; averageRating: number | null };
}

export interface DailyActivity {
  date: string;
  newUsers: number;
  createdTrips: number;
  newReviews: number;
}

export interface PopularDestination {
  id: number;
  name: string;
  address: string;
  rating: number;
  isActive: boolean;
  categories: Array<{ id: number; name: string }>;
  itineraryCount: number;
  favoriteCount: number;
  reviewCount: number;
  averageReviewRating: number | null;
  engagementCount: number;
}

export interface AnalyticsOverview {
  generatedAt: string;
  period: {
    days: number;
    current: { from: string; to: string };
    previous: { from: string; to: string };
  };
  summary: AnalyticsSummary;
  aiUsage: {
    generatedTrips: number;
    totalTrips: number;
    adoptionPercentage: number;
  };
  dailyActivity: DailyActivity[];
  popularDestinations: PopularDestination[];
  topTripCities: Array<{
    destinationCity: string;
    tripCount: number;
    sharePercentage: number;
  }>;
}
