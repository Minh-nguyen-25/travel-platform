import { Request, Response } from 'express';
import { favoriteService } from '../services/favorite.service';
import { FavoriteListQuery } from '../types/favorite.types';
import { sendPaginated, sendSuccess } from '../utils/response.utils';

const userId = (req: Request): number => req.user!.id;
const destinationId = (req: Request): number => Number(req.params.destinationId);

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  const result = await favoriteService.getFavorites(
    userId(req),
    req.query as unknown as FavoriteListQuery
  );
  sendPaginated(res, result.data, result.pagination, 'Lấy danh sách yêu thích thành công');
};

export const getFavoriteStatus = async (req: Request, res: Response): Promise<void> => {
  const status = await favoriteService.getStatus(userId(req), destinationId(req));
  sendSuccess(res, status, 'Lấy trạng thái yêu thích thành công');
};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  const status = await favoriteService.toggle(userId(req), destinationId(req));
  sendSuccess(
    res,
    status,
    status.isFavorite ? 'Đã lưu địa điểm yêu thích' : 'Đã bỏ lưu địa điểm yêu thích'
  );
};

