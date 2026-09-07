export interface DestinationImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface DestinationCategory {
  id: number;
  name: string;
  description: string | null;
}

export interface Destination {
  id: number;
  name: string;
  description: string | null;
  address: string;
  phoneNumber: string | null;
  latitude: string;
  longitude: string;
  ticketPrice: string;
  openingHoursNote: string | null;
  visitDuration: number | null;
  rating: string;
  isActive: boolean;
  images: DestinationImage[];
  categories: DestinationCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  destinationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type DestinationSortBy = 'createdAt' | 'name' | 'rating' | 'ticketPrice';
export type SortOrder = 'asc' | 'desc';

export interface DestinationListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryIds?: number[];
  categoryMatch?: 'any' | 'all';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  sortBy?: DestinationSortBy;
  sortOrder?: SortOrder;
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: SortOrder;
}

export interface DestinationListResult {
  data: Destination[];
  pagination: Pagination;
}

export interface CategoryListResult {
  data: Category[];
  pagination: Pagination;
}
