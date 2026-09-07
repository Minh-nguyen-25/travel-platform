import { Router } from 'express';
import { ROLE } from '../constants';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';
import { userRateLimit } from '../middlewares/rateLimit.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  adminUserListQuerySchema,
  changePasswordSchema,
  updateProfileSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userIdParamsSchema,
} from '../validators/user.validator';

const userRoutes = Router();
userRoutes.use(authenticate);
userRoutes.get('/me', userController.getMe);
userRoutes.patch('/me', validate(updateProfileSchema), userController.updateMe);
userRoutes.patch(
  '/me/password',
  userRateLimit({
    namespace: 'change-password',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Bạn đã thử đổi mật khẩu quá nhiều lần, vui lòng thử lại sau 15 phút',
  }),
  validate(changePasswordSchema),
  userController.changePassword
);
userRoutes.post('/me/avatar', uploadSingle, userController.uploadAvatar);
userRoutes.delete('/me/avatar', userController.deleteAvatar);

export const adminUserRoutes = Router();
adminUserRoutes.use(authenticate, requireRole(ROLE.ADMIN));
adminUserRoutes.get(
  '/',
  validate(adminUserListQuerySchema, 'query'),
  userController.getAdminUsers
);
adminUserRoutes.get(
  '/:userId',
  validate(userIdParamsSchema, 'params'),
  userController.getAdminUser
);
adminUserRoutes.patch(
  '/:userId/status',
  validate(userIdParamsSchema, 'params'),
  validate(updateUserStatusSchema),
  userController.setUserStatus
);
adminUserRoutes.patch(
  '/:userId/role',
  validate(userIdParamsSchema, 'params'),
  validate(updateUserRoleSchema),
  userController.setUserRole
);

export default userRoutes;
