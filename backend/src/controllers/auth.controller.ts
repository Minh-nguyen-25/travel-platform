import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { authService } from '../services/auth.service';
import { LoginInput, RegisterInput } from '../types/auth.types';
import { AppError } from '../utils/app-error';
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  setRefreshTokenCookie,
} from '../utils/auth-cookie.utils';
import { sendSuccess } from '../utils/response.utils';

const sendAuthSession = (
  res: Response,
  session: Awaited<ReturnType<typeof authService.login>>,
  message: string,
  statusCode: number = HTTP_STATUS.OK
): void => {
  setRefreshTokenCookie(res, session.refreshToken, session.refreshTokenExpiresAt);
  sendSuccess(
    res,
    { accessToken: session.accessToken, user: session.user },
    message,
    statusCode
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  sendAuthSession(
    res,
    await authService.register(req.body as RegisterInput),
    'Đăng ký tài khoản thành công',
    HTTP_STATUS.CREATED
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;
  sendAuthSession(res, await authService.login(email, password), 'Đăng nhập thành công');
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  await authService.logout(getRefreshTokenFromRequest(req));
  clearRefreshTokenCookie(res);
  sendSuccess(res, null, 'Đăng xuất thành công');
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    sendAuthSession(
      res,
      await authService.refresh(getRefreshTokenFromRequest(req)),
      'Làm mới phiên đăng nhập thành công'
    );
  } catch (error) {
    clearRefreshTokenCookie(res);
    throw error;
  }
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('Google không trả về thông tin tài khoản', HTTP_STATUS.UNAUTHORIZED);
  }

  const session = await authService.loginWithUserId(req.user.id);
  setRefreshTokenCookie(res, session.refreshToken, session.refreshTokenExpiresAt);

  const redirectUrl =
    process.env.GOOGLE_OAUTH_SUCCESS_REDIRECT?.trim() ||
    `${process.env.FRONTEND_URL?.trim() || 'http://localhost:5173'}/login`;
  res.redirect(`${redirectUrl}#accessToken=${encodeURIComponent(session.accessToken)}`);
};
