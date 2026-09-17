import { Category } from './category.types';

export interface DestinationImage {
  id: number;
  destinationId: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface Destination {
  id: number;
  name: string;
  description?: string | null;
  address: string;
  phoneNumber?: string | null;
  latitude: number | string;
  longitude: number | string;
  ticketPrice: number | string;
  openingHoursNote?: string | null;
  visitDuration?: number | null;
  rating: number | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  categories?: {
    destinationId?: number;
    categoryId?: number;
    category: Category;
  }[];
  images?: DestinationImage[];
}

export interface DestinationFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'rating:desc' | 'rating:asc' | 'ticketPrice:asc' | 'ticketPrice:desc' | 'createdAt:desc' | 'createdAt:asc' | 'name:asc';
  includeInactive?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

