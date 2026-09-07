import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { preferenceService } from '../services/preference.service';
import {
  CreatePreferenceInput,
  UpdatePreferenceInput,
} from '../types/preference.types';
import { AppError } from '../utils/app-error';
import { sendSuccess } from '../utils/response.utils';

const getAuthenticatedUserId = (req: Request): number => {
  if (!req.user) {
    throw new AppError(
      'Bạn cần đăng nhập để thực hiện thao tác này',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  return req.user.id;
};

export const getPreference = async (req: Request, res: Response): Promise<void> => {
  const preference = await preferenceService.getPreference(getAuthenticatedUserId(req));
  sendSuccess(res, preference, 'Lấy sở thích du lịch thành công');
};

export const createPreference = async (req: Request, res: Response): Promise<void> => {
  const preference = await preferenceService.createPreference(
    getAuthenticatedUserId(req),
    req.body as CreatePreferenceInput
  );

  sendSuccess(res, preference, 'Lưu sở thích du lịch thành công', HTTP_STATUS.CREATED);
};

export const updatePreference = async (req: Request, res: Response): Promise<void> => {
  const preference = await preferenceService.updatePreference(
    getAuthenticatedUserId(req),
    req.body as UpdatePreferenceInput
  );

  sendSuccess(res, preference, 'Cập nhật sở thích du lịch thành công');
};

export const deletePreference = async (req: Request, res: Response): Promise<void> => {
  await preferenceService.deletePreference(getAuthenticatedUserId(req));
  sendSuccess(res, null, 'Xóa sở thích du lịch thành công');
};
