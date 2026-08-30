"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFavorite = exports.getFavoriteStatus = exports.getFavorites = void 0;
const favorite_service_1 = require("../services/favorite.service");
const response_utils_1 = require("../utils/response.utils");
const userId = (req) => req.user.id;
const destinationId = (req) => Number(req.params.destinationId);
const getFavorites = async (req, res) => {
    const result = await favorite_service_1.favoriteService.getFavorites(userId(req), req.query);
    (0, response_utils_1.sendPaginated)(res, result.data, result.pagination, 'Lấy danh sách yêu thích thành công');
};
exports.getFavorites = getFavorites;
const getFavoriteStatus = async (req, res) => {
    const status = await favorite_service_1.favoriteService.getStatus(userId(req), destinationId(req));
    (0, response_utils_1.sendSuccess)(res, status, 'Lấy trạng thái yêu thích thành công');
};
exports.getFavoriteStatus = getFavoriteStatus;
const toggleFavorite = async (req, res) => {
    const status = await favorite_service_1.favoriteService.toggle(userId(req), destinationId(req));
    (0, response_utils_1.sendSuccess)(res, status, status.isFavorite ? 'Đã lưu địa điểm yêu thích' : 'Đã bỏ lưu địa điểm yêu thích');
};
exports.toggleFavorite = toggleFavorite;
//# sourceMappingURL=favorite.controller.js.map