"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrimaryImage = exports.deleteDestinationImage = exports.uploadDestinationImages = exports.deleteDestination = exports.updateDestination = exports.createDestination = exports.getAdminDestination = exports.getAdminDestinations = exports.getDestination = exports.getDestinations = void 0;
const constants_1 = require("../constants");
const destination_service_1 = require("../services/destination.service");
const response_utils_1 = require("../utils/response.utils");
const getDestinationId = (req) => Number(req.params.destinationId);
const getImageId = (req) => Number(req.params.imageId);
const getFiles = (req) => Array.isArray(req.files) ? req.files : [];
const getDestinations = async (req, res) => {
    const result = await destination_service_1.destinationService.getDestinations(req.query, true);
    (0, response_utils_1.sendPaginated)(res, result.data, result.pagination, 'Lấy danh sách địa điểm thành công');
};
exports.getDestinations = getDestinations;
const getDestination = async (req, res) => {
    const destination = await destination_service_1.destinationService.getDestination(getDestinationId(req), true);
    (0, response_utils_1.sendSuccess)(res, destination, 'Lấy chi tiết địa điểm thành công');
};
exports.getDestination = getDestination;
const getAdminDestinations = async (req, res) => {
    const result = await destination_service_1.destinationService.getDestinations(req.query, false);
    (0, response_utils_1.sendPaginated)(res, result.data, result.pagination, 'Lấy danh sách địa điểm quản trị thành công');
};
exports.getAdminDestinations = getAdminDestinations;
const getAdminDestination = async (req, res) => {
    const destination = await destination_service_1.destinationService.getDestination(getDestinationId(req), false);
    (0, response_utils_1.sendSuccess)(res, destination, 'Lấy chi tiết địa điểm quản trị thành công');
};
exports.getAdminDestination = getAdminDestination;
const createDestination = async (req, res) => {
    const { primaryImageIndex, ...input } = req.body;
    const destination = await destination_service_1.destinationService.createDestination(input, getFiles(req), primaryImageIndex);
    (0, response_utils_1.sendSuccess)(res, destination, 'Thêm địa điểm thành công', constants_1.HTTP_STATUS.CREATED);
};
exports.createDestination = createDestination;
const updateDestination = async (req, res) => {
    const { primaryImageIndex, ...input } = req.body;
    const destination = await destination_service_1.destinationService.updateDestination(getDestinationId(req), input, getFiles(req), primaryImageIndex);
    (0, response_utils_1.sendSuccess)(res, destination, 'Cập nhật địa điểm thành công');
};
exports.updateDestination = updateDestination;
const deleteDestination = async (req, res) => {
    const destination = await destination_service_1.destinationService.softDeleteDestination(getDestinationId(req));
    (0, response_utils_1.sendSuccess)(res, destination, 'Xóa mềm địa điểm thành công');
};
exports.deleteDestination = deleteDestination;
const uploadDestinationImages = async (req, res) => {
    const destination = await destination_service_1.destinationService.uploadDestinationImages(getDestinationId(req), getFiles(req), req.body.primaryImageIndex);
    (0, response_utils_1.sendSuccess)(res, destination, 'Upload ảnh địa điểm thành công', constants_1.HTTP_STATUS.CREATED);
};
exports.uploadDestinationImages = uploadDestinationImages;
const deleteDestinationImage = async (req, res) => {
    const destination = await destination_service_1.destinationService.deleteDestinationImage(getDestinationId(req), getImageId(req));
    (0, response_utils_1.sendSuccess)(res, destination, 'Xóa ảnh địa điểm thành công');
};
exports.deleteDestinationImage = deleteDestinationImage;
const setPrimaryImage = async (req, res) => {
    const destination = await destination_service_1.destinationService.setPrimaryImage(getDestinationId(req), getImageId(req));
    (0, response_utils_1.sendSuccess)(res, destination, 'Đặt ảnh đại diện thành công');
};
exports.setPrimaryImage = setPrimaryImage;
//# sourceMappingURL=destination.controller.js.map