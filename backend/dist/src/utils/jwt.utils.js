"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.generateRefreshToken = exports.verifyAccessToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accessSecret = () => {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret)
        throw new Error('JWT_SECRET chưa được cấu hình');
    return secret;
};
const refreshSecret = () => {
    const secret = process.env.JWT_REFRESH_SECRET?.trim() || process.env.JWT_SECRET?.trim();
    if (!secret)
        throw new Error('JWT_REFRESH_SECRET chưa được cấu hình');
    return secret;
};
const accessExpiresIn = () => (process.env.JWT_EXPIRES_IN?.trim() || '15m');
const refreshExpiresIn = () => (process.env.JWT_REFRESH_EXPIRES_IN?.trim() || '30d');
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign({ ...payload, type: 'access' }, accessSecret(), {
        expiresIn: accessExpiresIn(),
    });
};
exports.generateAccessToken = generateAccessToken;
const verifyAccessToken = (token) => {
    const payload = jsonwebtoken_1.default.verify(token, accessSecret());
    if (payload.type !== 'access')
        throw new Error('Sai loại access token');
    return payload;
};
exports.verifyAccessToken = verifyAccessToken;
const generateRefreshToken = (payload) => {
    const token = jsonwebtoken_1.default.sign({ ...payload, type: 'refresh' }, refreshSecret(), {
        expiresIn: refreshExpiresIn(),
    });
    const decoded = jsonwebtoken_1.default.decode(token);
    if (!decoded || typeof decoded === 'string' || typeof decoded.exp !== 'number') {
        throw new Error('Không thể xác định hạn refresh token');
    }
    return { token, expiresAt: new Date(decoded.exp * 1000) };
};
exports.generateRefreshToken = generateRefreshToken;
const verifyRefreshToken = (token) => {
    const payload = jsonwebtoken_1.default.verify(token, refreshSecret());
    if (payload.type !== 'refresh' || !payload.tokenId) {
        throw new Error('Sai loại refresh token');
    }
    return payload;
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.utils.js.map