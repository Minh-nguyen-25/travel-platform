"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const response_utils_1 = require("../utils/response.utils");
const constants_1 = require("../constants");
const db_1 = __importDefault(require("../config/db"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        (0, response_utils_1.sendError)(res, 'Không có token xác thực', constants_1.HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    const match = /^Bearer ([^\s]+)$/.exec(authHeader);
    if (!match) {
        (0, response_utils_1.sendError)(res, 'Token xác thực không hợp lệ', constants_1.HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    const token = match[1];
    try {
        const payload = (0, jwt_utils_1.verifyAccessToken)(token);
        const user = await db_1.default.user.findUnique({
            where: { id: payload.userId },
            omit: { passwordHash: true },
        });
        if (!user || !user.isActive) {
            (0, response_utils_1.sendError)(res, 'Tài khoản không tồn tại hoặc đã bị khóa', constants_1.HTTP_STATUS.UNAUTHORIZED);
            return;
        }
        req.user = user;
        next();
    }
    catch {
        (0, response_utils_1.sendError)(res, 'Token không hợp lệ hoặc đã hết hạn', constants_1.HTTP_STATUS.UNAUTHORIZED);
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map