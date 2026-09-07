import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import {
  AdminUserListQuery,
  ChangePasswordInput,
  UpdateProfileInput,
  UserRoleInput,
  UserStatusInput,
} from '../types/user.types';
import { setRefreshTokenCookie } from '../utils/auth-cookie.utils';
import { sendPaginated, sendSuccess } from '../utils/response.utils';

const currentUserId = (req: Request): number => req.user!.id;
const targetUserId = (req: Request): number => Number(req.params.userId);

export const getMe = async (req: Request, res: Response): Promise<void> => {
  sendSuccess(
    res,
    await userService.getProfile(currentUserId(req)),
    'Lấy thông tin tài khoản thành công'
  );
};
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  const { fullName } = req.body as UpdateProfileInput;
  sendSuccess(
    res,
    await userService.updateProfile(currentUserId(req), fullName),
    'Cập nhật hồ sơ thành công'
  );
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const session = await userService.changePassword(
    currentUserId(req),
    req.body as ChangePasswordInput
  );
  setRefreshTokenCookie(res, session.refreshToken);
  sendSuccess(
    res,
    { accessToken: session.accessToken, user: session.user },
    'Đổi mật khẩu thành công'
  );
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  sendSuccess(
    res,
    await userService.uploadAvatar(currentUserId(req), req.file),
    'Cập nhật avatar thành công'
  );
};

export const deleteAvatar = async (req: Request, res: Response): Promise<void> => {
  sendSuccess(
    res,
    await userService.deleteAvatar(currentUserId(req)),
    'Xóa avatar thành công'
  );
};

export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
  const result = await userService.getAdminUsers(
    req.query as unknown as AdminUserListQuery
  );
  sendPaginated(res, result.data, result.pagination, 'Lấy danh sách người dùng thành công');
};

export const getAdminUser = async (req: Request, res: Response): Promise<void> => {
  sendSuccess(
    res,
    await userService.getAdminUser(targetUserId(req)),
    'Lấy chi tiết người dùng thành công'
  );
};

export const setUserStatus = async (req: Request, res: Response): Promise<void> => {
  const user = await userService.setUserStatus(
    currentUserId(req),
    targetUserId(req),
    (req.body as UserStatusInput).isActive
  );
  sendSuccess(
    res,
    user,
    user.isActive ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công'
  );
};

export const setUserRole = async (req: Request, res: Response): Promise<void> => {
  const user = await userService.setUserRole(
    currentUserId(req),
    targetUserId(req),
    (req.body as UserRoleInput).role
  );
  sendSuccess(res, user, 'Cập nhật quyền người dùng thành công');
};
