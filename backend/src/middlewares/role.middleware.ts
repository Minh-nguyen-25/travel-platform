import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';
import { HTTP_STATUS, Role } from '../constants';

// Dùng sau authenticate middleware
// Ví dụ: router.delete('/users/:id', authenticate, requireRole('ADMIN'), controller)
export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Chưa xác thực', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (!roles.includes(req.user.role as Role)) {
      sendError(res, 'Bạn không có quyền thực hiện hành động này', HTTP_STATUS.FORBIDDEN);
      return;
    }

    next();
  };
};
