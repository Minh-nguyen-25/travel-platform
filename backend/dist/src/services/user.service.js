"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const constants_1 = require("../constants");
const user_repository_1 = require("../repositories/user.repository");
const auth_service_1 = require("./auth.service");
const app_error_1 = require("../utils/app-error");
const user_utils_1 = require("../utils/user.utils");
const upload_service_1 = require("./upload.service");
const USER_NOT_FOUND = 'Không tìm thấy người dùng';
const BCRYPT_ROUNDS = Math.min(14, Math.max(10, Number(process.env.BCRYPT_ROUNDS) || 12));
const serializeAdminUser = (user) => ({
    ...(0, user_utils_1.serializeUser)(user),
    counts: {
        reviews: user._count.reviews,
        favorites: user._count.favorites,
        trips: user._count.trips,
    },
});
const cleanupOldAvatar = async (avatarUrl) => {
    if (!avatarUrl)
        return;
    try {
        await (0, upload_service_1.deleteCloudinaryImageByUrl)(avatarUrl);
    }
    catch (error) {
        console.warn('[Cloudinary] Avatar đã cập nhật nhưng không thể xóa ảnh cũ:', error);
    }
};
exports.userService = {
    async getProfile(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user)
            throw new app_error_1.AppError(USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        return (0, user_utils_1.serializeUser)(user);
    },
    async updateProfile(userId, fullName) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user)
            throw new app_error_1.AppError(USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        return (0, user_utils_1.serializeUser)(await user_repository_1.userRepository.updateProfile(userId, fullName.trim()));
    },
    async changePassword(userId, input) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user)
            throw new app_error_1.AppError(USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        if (!user.passwordHash) {
            throw new app_error_1.AppError('Tài khoản Google chưa thiết lập mật khẩu đăng nhập', constants_1.HTTP_STATUS.BAD_REQUEST);
        }
        if (!(await bcryptjs_1.default.compare(input.currentPassword, user.passwordHash))) {
            throw new app_error_1.AppError('Mật khẩu hiện tại không chính xác', constants_1.HTTP_STATUS.UNAUTHORIZED);
        }
        if (await bcryptjs_1.default.compare(input.newPassword, user.passwordHash)) {
            throw new app_error_1.AppError('Mật khẩu mới phải khác mật khẩu hiện tại', constants_1.HTTP_STATUS.UNPROCESSABLE);
        }
        const updated = await user_repository_1.userRepository.updatePassword(userId, await bcryptjs_1.default.hash(input.newPassword, BCRYPT_ROUNDS));
        return auth_service_1.authService.replaceAllSessionsForUser(updated);
    },
    async uploadAvatar(userId, file) {
        if (!file)
            throw new app_error_1.AppError('Cần chọn một ảnh đại diện', constants_1.HTTP_STATUS.BAD_REQUEST);
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user)
            throw new app_error_1.AppError(USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        let uploaded;
        try {
            [uploaded] = await (0, upload_service_1.uploadImagesToCloudinary)([file], 'avatars');
        }
        catch (error) {
            console.error('[Cloudinary] Upload avatar failed:', error);
            if (error instanceof app_error_1.AppError)
                throw error;
            throw new app_error_1.AppError('Không thể upload avatar lên Cloudinary', constants_1.HTTP_STATUS.BAD_GATEWAY);
        }
        try {
            const updated = await user_repository_1.userRepository.updateAvatar(userId, uploaded.imageUrl);
            await cleanupOldAvatar(user.avatarUrl);
            return (0, user_utils_1.serializeUser)(updated);
        }
        catch (error) {
            await (0, upload_service_1.deleteUploadedImages)([uploaded]);
            throw error;
        }
    },
    async deleteAvatar(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user)
            throw new app_error_1.AppError(USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        if (!user.avatarUrl)
            return (0, user_utils_1.serializeUser)(user);
        const updated = await user_repository_1.userRepository.updateAvatar(userId, null);
        await cleanupOldAvatar(user.avatarUrl);
        return (0, user_utils_1.serializeUser)(updated);
    },
    async getAdminUsers(query) {
        const result = await user_repository_1.userRepository.findManyAdmin(query);
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
    async getAdminUser(userId) {
        const user = await user_repository_1.userRepository.findAdminById(userId);
        if (!user)
            throw new app_error_1.AppError(USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        return serializeAdminUser(user);
    },
    async setUserStatus(actorId, userId, isActive) {
        if (actorId === userId && !isActive) {
            throw new app_error_1.AppError('Bạn không thể tự khóa tài khoản của mình', constants_1.HTTP_STATUS.CONFLICT);
        }
        const user = await user_repository_1.userRepository.findAdminById(userId);
        if (!user)
            throw new app_error_1.AppError(USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        if (user.isActive === isActive)
            return serializeAdminUser(user);
        return serializeAdminUser(await user_repository_1.userRepository.setStatus(userId, isActive));
    },
    async setUserRole(actorId, userId, role) {
        if (actorId === userId && role !== 'ADMIN') {
            throw new app_error_1.AppError('Bạn không thể tự hạ quyền tài khoản của mình', constants_1.HTTP_STATUS.CONFLICT);
        }
        const user = await user_repository_1.userRepository.findAdminById(userId);
        if (!user)
            throw new app_error_1.AppError(USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        if (user.role === role)
            return serializeAdminUser(user);
        try {
            return serializeAdminUser(await user_repository_1.userRepository.setRole(userId, role));
        }
        catch (error) {
            if (error instanceof Error && error.message === 'LAST_ACTIVE_ADMIN') {
                throw new app_error_1.AppError('Hệ thống phải còn ít nhất một quản trị viên đang hoạt động', constants_1.HTTP_STATUS.CONFLICT);
            }
            throw error;
        }
    },
};
//# sourceMappingURL=user.service.js.map