import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { authService } from '../services/auth.service';
import { sendError, sendSuccess } from '../utils/response.utils';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login(email, password);
  sendSuccess(res, result, 'Đăng nhập thành công');
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  sendSuccess(res, null, 'Đăng xuất thành công');
};

export const refresh = async (_req: Request, res: Response): Promise<void> => {
  sendError(
    res,
    'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
    HTTP_STATUS.UNAUTHORIZED
  );
};
