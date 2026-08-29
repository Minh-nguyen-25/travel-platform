import { HTTP_STATUS } from '../constants';
import { destinationRepository } from '../repositories/destination.repository';
import { favoriteRepository } from '../repositories/favorite.repository';
import {
  FavoriteListQuery,
  FavoriteResponse,
  FavoriteStatusResponse,
} from '../types/favorite.types';
import { AppError } from '../utils/app-error';
import { serializeDestination } from './destination.service';

const assertActiveDestination = async (destinationId: number): Promise<void> => {
  const destination = await destinationRepository.findById(destinationId, true);
  if (!destination) {
    throw new AppError('Không tìm thấy địa điểm', HTTP_STATUS.NOT_FOUND);
  }
};

export const favoriteService = {
  async getFavorites(userId: number, query: FavoriteListQuery) {
    const result = await favoriteRepository.findMany(userId, query);
    const data: FavoriteResponse[] = result.data.map((favorite) => ({
      createdAt: favorite.createdAt.toISOString(),
      destination: serializeDestination(favorite.destination),
    }));

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async getStatus(userId: number, destinationId: number): Promise<FavoriteStatusResponse> {
    await assertActiveDestination(destinationId);
    return {
      destinationId,
      isFavorite: await favoriteRepository.exists(userId, destinationId),
    };
  },

  async toggle(userId: number, destinationId: number): Promise<FavoriteStatusResponse> {
    await assertActiveDestination(destinationId);
    return {
      destinationId,
      isFavorite: await favoriteRepository.toggle(userId, destinationId),
    };
  },
};

