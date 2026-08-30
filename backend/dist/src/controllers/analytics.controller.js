"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverview = void 0;
const analytics_service_1 = require("../services/analytics.service");
const response_utils_1 = require("../utils/response.utils");
const getOverview = async (req, res) => {
    const query = req.query;
    const overview = await analytics_service_1.analyticsService.getOverview(query);
    (0, response_utils_1.sendSuccess)(res, overview, 'Lấy dữ liệu tổng quan quản trị thành công');
};
exports.getOverview = getOverview;
//# sourceMappingURL=analytics.controller.js.map