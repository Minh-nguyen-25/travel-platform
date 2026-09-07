import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';
import { HTTP_STATUS } from '../constants';
import prisma from '../config/db';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    sendError(res, 'Không có token xác thực', HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  const match = /^Bearer ([^\s]+)$/.exec(authHeader);
  if (!match) {
    sendError(res, 'Token xác thực không hợp lệ', HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  const token = match[1];

  try {
    // verifyAccessToken asserts type==='access' and algorithm===HS256 internally
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      omit: { passwordHash: true },
    });

    if (!user || !user.isActive) {
      sendError(res, 'Tài khoản không tồn tại hoặc đã bị khóa', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    req.user = user;
    next();
  } catch {
    sendError(res, 'Token không hợp lệ hoặc đã hết hạn', HTTP_STATUS.UNAUTHORIZED);
  }
};
