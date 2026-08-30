"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePreference = exports.updatePreference = exports.createPreference = exports.getPreference = void 0;
const constants_1 = require("../constants");
const preference_service_1 = require("../services/preference.service");
const app_error_1 = require("../utils/app-error");
const response_utils_1 = require("../utils/response.utils");
const getAuthenticatedUserId = (req) => {
    if (!req.user) {
        throw new app_error_1.AppError('Bạn cần đăng nhập để thực hiện thao tác này', constants_1.HTTP_STATUS.UNAUTHORIZED);
    }
    return req.user.id;
};
const getPreference = async (req, res) => {
    const preference = await preference_service_1.preferenceService.getPreference(getAuthenticatedUserId(req));
    (0, response_utils_1.sendSuccess)(res, preference, 'Lấy sở thích du lịch thành công');
};
exports.getPreference = getPreference;
const createPreference = async (req, res) => {
    const preference = await preference_service_1.preferenceService.createPreference(getAuthenticatedUserId(req), req.body);
    (0, response_utils_1.sendSuccess)(res, preference, 'Lưu sở thích du lịch thành công', constants_1.HTTP_STATUS.CREATED);
};
exports.createPreference = createPreference;
const updatePreference = async (req, res) => {
    const preference = await preference_service_1.preferenceService.updatePreference(getAuthenticatedUserId(req), req.body);
    (0, response_utils_1.sendSuccess)(res, preference, 'Cập nhật sở thích du lịch thành công');
};
exports.updatePreference = updatePreference;
const deletePreference = async (req, res) => {
    await preference_service_1.preferenceService.deletePreference(getAuthenticatedUserId(req));
    (0, response_utils_1.sendSuccess)(res, null, 'Xóa sở thích du lịch thành công');
};
exports.deletePreference = deletePreference;
//# sourceMappingURL=preference.controller.js.map