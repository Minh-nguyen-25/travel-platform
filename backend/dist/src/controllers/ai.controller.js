"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateItinerary = void 0;
const constants_1 = require("../constants");
const ai_service_1 = require("../services/ai.service");
const app_error_1 = require("../utils/app-error");
const response_utils_1 = require("../utils/response.utils");
const getAuthenticatedUserId = (req) => {
    if (!req.user) {
        throw new app_error_1.AppError('Bạn cần đăng nhập để tạo lịch trình bằng AI', constants_1.HTTP_STATUS.UNAUTHORIZED);
    }
    return req.user.id;
};
const generateItinerary = async (req, res) => {
    const result = await ai_service_1.aiService.generateItinerary(getAuthenticatedUserId(req), req.body);
    res.setHeader('Cache-Control', 'no-store');
    (0, response_utils_1.sendSuccess)(res, result, 'Tạo lịch trình gợi ý bằng AI thành công');
};
exports.generateItinerary = generateItinerary;
//# sourceMappingURL=ai.controller.js.map