import { DestinationResponse } from './destination.types';

export interface FavoriteListQuery {
  page: number;
  limit: number;
}

export interface FavoriteStatusResponse {
  destinationId: number;
  isFavorite: boolean;
}

export interface FavoriteResponse {
  createdAt: string;
  destination: DestinationResponse;
}

