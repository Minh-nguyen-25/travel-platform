"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMatrix = exports.calculateRoute = exports.calculateDistance = void 0;
const map_service_1 = require("../services/map.service");
const response_utils_1 = require("../utils/response.utils");
const calculateDistance = async (req, res) => {
    const { origin, destination, profile } = req.body;
    const result = await map_service_1.mapService.calculateDistance(origin, destination, profile);
    (0, response_utils_1.sendSuccess)(res, result, 'Tính khoảng cách và thời gian di chuyển thành công');
};
exports.calculateDistance = calculateDistance;
const calculateRoute = async (req, res) => {
    const result = await map_service_1.mapService.calculateRoute(req.body);
    (0, response_utils_1.sendSuccess)(res, result, 'Tính tuyến đường thành công');
};
exports.calculateRoute = calculateRoute;
const calculateMatrix = async (req, res) => {
    const result = await map_service_1.mapService.calculateMatrix(req.body);
    (0, response_utils_1.sendSuccess)(res, result, 'Tính ma trận khoảng cách và thời gian thành công');
};
exports.calculateMatrix = calculateMatrix;
//# sourceMappingURL=map.controller.js.map