import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../utils/app-error';
import { sendSuccess } from '../utils/response.utils';

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('Bạn chưa đăng nhập', HTTP_STATUS.UNAUTHORIZED);
  }

  sendSuccess(res, req.user, 'Lấy thông tin tài khoản thành công');
};
