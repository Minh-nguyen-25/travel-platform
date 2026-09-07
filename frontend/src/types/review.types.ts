import type { Destination, Pagination, SortOrder } from './destination.types';

export interface ReviewImage {
  id: number;
  imageUrl: string;
  createdAt: string;
}

export interface ReviewUser {
  id: number;
  fullName: string;
  avatarUrl: string | null;
}

export interface Review {
  id: number;
  userId: number;
  destinationId: number;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  user: ReviewUser;
  destination: {
    id: number;
    name: string;
  };
  images: ReviewImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: SortOrder;
}

export interface ReviewListResult {
  data: Review[];
  pagination: Pagination;
}

export interface ReviewPayload {
  rating: number;
  comment: string;
  images?: File[];
}

export interface FavoriteStatus {
  destinationId: number;
  isFavorite: boolean;
}

export interface SavedDestination {
  createdAt: string;
  destination: Destination;
}

export interface FavoriteListResult {
  data: SavedDestination[];
  pagination: Pagination;
}

