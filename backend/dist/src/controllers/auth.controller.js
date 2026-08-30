"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const constants_1 = require("../constants");
const auth_service_1 = require("../services/auth.service");
const app_error_1 = require("../utils/app-error");
const auth_cookie_utils_1 = require("../utils/auth-cookie.utils");
const response_utils_1 = require("../utils/response.utils");
const sendAuthSession = (res, session, message, statusCode = constants_1.HTTP_STATUS.OK) => {
    (0, auth_cookie_utils_1.setRefreshTokenCookie)(res, session.refreshToken, session.refreshTokenExpiresAt);
    (0, response_utils_1.sendSuccess)(res, { accessToken: session.accessToken, user: session.user }, message, statusCode);
};
const register = async (req, res) => {
    sendAuthSession(res, await auth_service_1.authService.register(req.body), 'Đăng ký tài khoản thành công', constants_1.HTTP_STATUS.CREATED);
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    sendAuthSession(res, await auth_service_1.authService.login(email, password), 'Đăng nhập thành công');
};
exports.login = login;
const logout = async (req, res) => {
    await auth_service_1.authService.logout((0, auth_cookie_utils_1.getRefreshTokenFromRequest)(req));
    (0, auth_cookie_utils_1.clearRefreshTokenCookie)(res);
    (0, response_utils_1.sendSuccess)(res, null, 'Đăng xuất thành công');
};
exports.logout = logout;
const refresh = async (req, res) => {
    try {
        sendAuthSession(res, await auth_service_1.authService.refresh((0, auth_cookie_utils_1.getRefreshTokenFromRequest)(req)), 'Làm mới phiên đăng nhập thành công');
    }
    catch (error) {
        (0, auth_cookie_utils_1.clearRefreshTokenCookie)(res);
        throw error;
    }
};
exports.refresh = refresh;
const googleCallback = async (req, res) => {
    if (!req.user) {
        throw new app_error_1.AppError('Google không trả về thông tin tài khoản', constants_1.HTTP_STATUS.UNAUTHORIZED);
    }
    const session = await auth_service_1.authService.loginWithUserId(req.user.id);
    (0, auth_cookie_utils_1.setRefreshTokenCookie)(res, session.refreshToken, session.refreshTokenExpiresAt);
    const redirectUrl = process.env.GOOGLE_OAUTH_SUCCESS_REDIRECT?.trim() ||
        `${process.env.FRONTEND_URL?.trim() || 'http://localhost:5173'}/login`;
    res.redirect(`${redirectUrl}#accessToken=${encodeURIComponent(session.accessToken)}`);
};
exports.googleCallback = googleCallback;
//# sourceMappingURL=auth.controller.js.map