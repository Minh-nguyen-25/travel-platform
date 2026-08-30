"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserRole = exports.setUserStatus = exports.getAdminUser = exports.getAdminUsers = exports.deleteAvatar = exports.uploadAvatar = exports.changePassword = exports.updateMe = exports.getMe = void 0;
const user_service_1 = require("../services/user.service");
const auth_cookie_utils_1 = require("../utils/auth-cookie.utils");
const response_utils_1 = require("../utils/response.utils");
const currentUserId = (req) => req.user.id;
const targetUserId = (req) => Number(req.params.userId);
const getMe = async (req, res) => {
    (0, response_utils_1.sendSuccess)(res, await user_service_1.userService.getProfile(currentUserId(req)), 'Lấy thông tin tài khoản thành công');
};
exports.getMe = getMe;
const updateMe = async (req, res) => {
    const { fullName } = req.body;
    (0, response_utils_1.sendSuccess)(res, await user_service_1.userService.updateProfile(currentUserId(req), fullName), 'Cập nhật hồ sơ thành công');
};
exports.updateMe = updateMe;
const changePassword = async (req, res) => {
    const session = await user_service_1.userService.changePassword(currentUserId(req), req.body);
    (0, auth_cookie_utils_1.setRefreshTokenCookie)(res, session.refreshToken, session.refreshTokenExpiresAt);
    (0, response_utils_1.sendSuccess)(res, { accessToken: session.accessToken, user: session.user }, 'Đổi mật khẩu thành công');
};
exports.changePassword = changePassword;
const uploadAvatar = async (req, res) => {
    (0, response_utils_1.sendSuccess)(res, await user_service_1.userService.uploadAvatar(currentUserId(req), req.file), 'Cập nhật avatar thành công');
};
exports.uploadAvatar = uploadAvatar;
const deleteAvatar = async (req, res) => {
    (0, response_utils_1.sendSuccess)(res, await user_service_1.userService.deleteAvatar(currentUserId(req)), 'Xóa avatar thành công');
};
exports.deleteAvatar = deleteAvatar;
const getAdminUsers = async (req, res) => {
    const result = await user_service_1.userService.getAdminUsers(req.query);
    (0, response_utils_1.sendPaginated)(res, result.data, result.pagination, 'Lấy danh sách người dùng thành công');
};
exports.getAdminUsers = getAdminUsers;
const getAdminUser = async (req, res) => {
    (0, response_utils_1.sendSuccess)(res, await user_service_1.userService.getAdminUser(targetUserId(req)), 'Lấy chi tiết người dùng thành công');
};
exports.getAdminUser = getAdminUser;
const setUserStatus = async (req, res) => {
    const user = await user_service_1.userService.setUserStatus(currentUserId(req), targetUserId(req), req.body.isActive);
    (0, response_utils_1.sendSuccess)(res, user, user.isActive ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công');
};
exports.setUserStatus = setUserStatus;
const setUserRole = async (req, res) => {
    const user = await user_service_1.userService.setUserRole(currentUserId(req), targetUserId(req), req.body.role);
    (0, response_utils_1.sendSuccess)(res, user, 'Cập nhật quyền người dùng thành công');
};
exports.setUserRole = setUserRole;
//# sourceMappingURL=user.controller.js.map