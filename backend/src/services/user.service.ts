import bcrypt from 'bcryptjs';
import { HTTP_STATUS } from '../constants';
import {
  AdminUserRecord,
  userRepository,
} from '../repositories/user.repository';
import { authService } from './auth.service';
import {
  AdminUserListQuery,
  AdminUserResponse,
  ChangePasswordInput,
  UserResponse,
} from '../types/user.types';
import { AppError } from '../utils/app-error';
import { serializeUser } from '../utils/user.utils';
import {
  deleteCloudinaryImageByUrl,
  deleteUploadedImages,
  uploadImagesToCloudinary,
} from './upload.service';

const USER_NOT_FOUND = 'Không tìm thấy người dùng';
const BCRYPT_ROUNDS = Math.min(14, Math.max(10, Number(process.env.BCRYPT_ROUNDS) || 12));

const serializeAdminUser = (user: AdminUserRecord): AdminUserResponse => ({
  ...serializeUser(user),
  counts: {
    reviews: user._count.reviews,
    favorites: user._count.favorites,
    trips: user._count.trips,
  },
});

const cleanupOldAvatar = async (avatarUrl: string | null): Promise<void> => {
  if (!avatarUrl) return;
  try {
    await deleteCloudinaryImageByUrl(avatarUrl);
  } catch (error) {
    console.warn('[Cloudinary] Avatar đã cập nhật nhưng không thể xóa ảnh cũ:', error);
  }
};

export const userService = {
  async getProfile(userId: number): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return serializeUser(user);
  },

  async updateProfile(userId: number, fullName: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return serializeUser(await userRepository.updateProfile(userId, fullName.trim()));
  },

  async changePassword(userId: number, input: ChangePasswordInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (!user.passwordHash) {
      throw new AppError(
        'Tài khoản Google chưa thiết lập mật khẩu đăng nhập',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      throw new AppError('Mật khẩu hiện tại không chính xác', HTTP_STATUS.UNAUTHORIZED);
    }
    if (await bcrypt.compare(input.newPassword, user.passwordHash)) {
      throw new AppError('Mật khẩu mới phải khác mật khẩu hiện tại', HTTP_STATUS.UNPROCESSABLE);
    }

    const updated = await userRepository.updatePassword(
      userId,
      await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS)
    );
    return authService.replaceAllSessionsForUser(updated);
  },

  async uploadAvatar(userId: number, file?: Express.Multer.File): Promise<UserResponse> {
    if (!file) throw new AppError('Cần chọn một ảnh đại diện', HTTP_STATUS.BAD_REQUEST);
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    let uploaded;
    try {
      [uploaded] = await uploadImagesToCloudinary([file], 'avatars');
    } catch (error) {
      console.error('[Cloudinary] Upload avatar failed:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Không thể upload avatar lên Cloudinary', HTTP_STATUS.BAD_GATEWAY);
    }

    try {
      const updated = await userRepository.updateAvatar(userId, uploaded.imageUrl);
      await cleanupOldAvatar(user.avatarUrl);
      return serializeUser(updated);
    } catch (error) {
      await deleteUploadedImages([uploaded]);
      throw error;
    }
  },

  async deleteAvatar(userId: number): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (!user.avatarUrl) return serializeUser(user);

    const updated = await userRepository.updateAvatar(userId, null);
    await cleanupOldAvatar(user.avatarUrl);
    return serializeUser(updated);
  },

  async getAdminUsers(query: AdminUserListQuery) {
    const result = await userRepository.findManyAdmin(query);
    return {
      data: result.data.map(serializeAdminUser),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async getAdminUser(userId: number): Promise<AdminUserResponse> {
    const user = await userRepository.findAdminById(userId);
    if (!user) throw new AppError(USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return serializeAdminUser(user);
  },

  async setUserStatus(
    actorId: number,
    userId: number,
    isActive: boolean
  ): Promise<AdminUserResponse> {
    if (actorId === userId && !isActive) {
      throw new AppError('Bạn không thể tự khóa tài khoản của mình', HTTP_STATUS.CONFLICT);
    }
    const user = await userRepository.findAdminById(userId);
    if (!user) throw new AppError(USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (user.isActive === isActive) return serializeAdminUser(user);
    return serializeAdminUser(await userRepository.setStatus(userId, isActive));
  },

  async setUserRole(
    actorId: number,
    userId: number,
    role: 'ADMIN' | 'USER'
  ): Promise<AdminUserResponse> {
    if (actorId === userId && role !== 'ADMIN') {
      throw new AppError('Bạn không thể tự hạ quyền tài khoản của mình', HTTP_STATUS.CONFLICT);
    }
    const user = await userRepository.findAdminById(userId);
    if (!user) throw new AppError(USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (user.role === role) return serializeAdminUser(user);

    try {
      return serializeAdminUser(await userRepository.setRole(userId, role));
    } catch (error) {
      if (error instanceof Error && error.message === 'LAST_ACTIVE_ADMIN') {
        throw new AppError(
          'Hệ thống phải còn ít nhất một quản trị viên đang hoạt động',
          HTTP_STATUS.CONFLICT
        );
      }
      throw error;
    }
  },
};
