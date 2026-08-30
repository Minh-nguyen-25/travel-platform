"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReviewAsAdmin = exports.setReviewVisibility = exports.getAdminReviews = exports.deleteReviewImage = exports.deleteReview = exports.updateReview = exports.createReview = exports.getMyReview = exports.getPublicReview = exports.getDestinationReviews = void 0;
const constants_1 = require("../constants");
const review_service_1 = require("../services/review.service");
const response_utils_1 = require("../utils/response.utils");
const destinationId = (req) => Number(req.params.destinationId);
const reviewId = (req) => Number(req.params.reviewId);
const imageId = (req) => Number(req.params.imageId);
const userId = (req) => req.user.id;
const files = (req) => Array.isArray(req.files) ? req.files : [];
const getDestinationReviews = async (req, res) => {
    const result = await review_service_1.reviewService.getDestinationReviews(destinationId(req), req.query);
    (0, response_utils_1.sendPaginated)(res, result.data, result.pagination, 'Lấy danh sách đánh giá thành công');
};
exports.getDestinationReviews = getDestinationReviews;
const getPublicReview = async (req, res) => {
    const review = await review_service_1.reviewService.getPublicReview(destinationId(req), reviewId(req));
    (0, response_utils_1.sendSuccess)(res, review, 'Lấy chi tiết đánh giá thành công');
};
exports.getPublicReview = getPublicReview;
const getMyReview = async (req, res) => {
    const review = await review_service_1.reviewService.getMyReview(userId(req), destinationId(req));
    (0, response_utils_1.sendSuccess)(res, review, 'Lấy đánh giá của bạn thành công');
};
exports.getMyReview = getMyReview;
const createReview = async (req, res) => {
    const review = await review_service_1.reviewService.createReview(userId(req), destinationId(req), req.body, files(req));
    (0, response_utils_1.sendSuccess)(res, review, 'Tạo đánh giá thành công', constants_1.HTTP_STATUS.CREATED);
};
exports.createReview = createReview;
const updateReview = async (req, res) => {
    const review = await review_service_1.reviewService.updateReview(userId(req), reviewId(req), req.body, files(req));
    (0, response_utils_1.sendSuccess)(res, review, 'Cập nhật đánh giá thành công');
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    const review = await review_service_1.reviewService.deleteReview(userId(req), reviewId(req));
    (0, response_utils_1.sendSuccess)(res, review, 'Xóa đánh giá thành công');
};
exports.deleteReview = deleteReview;
const deleteReviewImage = async (req, res) => {
    const review = await review_service_1.reviewService.deleteReviewImage(userId(req), reviewId(req), imageId(req));
    (0, response_utils_1.sendSuccess)(res, review, 'Xóa ảnh đánh giá thành công');
};
exports.deleteReviewImage = deleteReviewImage;
const getAdminReviews = async (req, res) => {
    const result = await review_service_1.reviewService.getAdminReviews(req.query);
    (0, response_utils_1.sendPaginated)(res, result.data, result.pagination, 'Lấy danh sách đánh giá quản trị thành công');
};
exports.getAdminReviews = getAdminReviews;
const setReviewVisibility = async (req, res) => {
    const review = await review_service_1.reviewService.setReviewVisibility(reviewId(req), req.body.isVisible);
    (0, response_utils_1.sendSuccess)(res, review, review.isVisible ? 'Hiện đánh giá thành công' : 'Ẩn đánh giá thành công');
};
exports.setReviewVisibility = setReviewVisibility;
const deleteReviewAsAdmin = async (req, res) => {
    const review = await review_service_1.reviewService.deleteReviewAsAdmin(reviewId(req));
    (0, response_utils_1.sendSuccess)(res, review, 'Xóa đánh giá vi phạm thành công');
};
exports.deleteReviewAsAdmin = deleteReviewAsAdmin;
//# sourceMappingURL=review.controller.js.map