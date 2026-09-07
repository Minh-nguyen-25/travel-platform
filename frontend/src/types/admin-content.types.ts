import type {
  Category,
  Destination,
  DestinationSortBy,
  SortOrder,
} from '@/types/destination.types';
import type { Review } from '@/types/review.types';
import type { PaginationMeta } from '@/types/admin.types';

export interface AdminDestinationQuery {
  page: number;
  limit: number;
  search?: string;
  categoryIds?: number[];
  isActive?: boolean;
  sortBy?: DestinationSortBy;
  sortOrder?: SortOrder;
}

export interface DestinationUpsertPayload {
  name: string;
  description?: string;
  address: string;
  phoneNumber?: string;
  latitude: number;
  longitude: number;
  ticketPrice: number;
  openingHoursNote?: string;
  visitDuration?: number;
  isActive: boolean;
  categoryIds: number[];
  images?: File[];
  primaryImageIndex?: number;
}

export interface CategoryUpsertPayload {
  name: string;
  description?: string;
}

export interface AdminCategoryQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: SortOrder;
}

export interface AdminReviewQuery {
  page: number;
  limit: number;
  search?: string;
  destinationId?: number;
  rating?: number;
  isVisible?: boolean;
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: SortOrder;
}

export interface AdminDestinationListResponse {
  data: Destination[];
  pagination: PaginationMeta;
}

export interface AdminCategoryListResponse {
  data: Category[];
  pagination: PaginationMeta;
}

export interface AdminReviewListResponse {
  data: Review[];
  pagination: PaginationMeta;
}
