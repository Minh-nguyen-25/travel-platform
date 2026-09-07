import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { aiService } from '../services/ai.service';
import { AiChatInput, GenerateItineraryInput } from '../types/ai.types';
import { AppError } from '../utils/app-error';
import { sendSuccess } from '../utils/response.utils';

const getAuthenticatedUserId = (req: Request): number => {
  if (!req.user) {
    throw new AppError(
      'Bạn cần đăng nhập để tạo lịch trình bằng AI',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  return req.user.id;
};

export const generateItinerary = async (req: Request, res: Response): Promise<void> => {
  const result = await aiService.generateItinerary(
    getAuthenticatedUserId(req),
    req.body as GenerateItineraryInput
  );

  res.setHeader('Cache-Control', 'no-store');
  sendSuccess(res, result, 'Tạo lịch trình gợi ý bằng AI thành công');
};

export const chat = async (req: Request, res: Response): Promise<void> => {
  const result = await aiService.chat(
    getAuthenticatedUserId(req),
    req.body as AiChatInput
  );

  res.setHeader('Cache-Control', 'no-store');
  sendSuccess(res, result, 'AI đã trả lời');
};
