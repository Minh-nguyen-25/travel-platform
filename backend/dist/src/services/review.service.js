"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = exports.serializeReview = void 0;
const client_1 = require("@prisma/client");
const constants_1 = require("../constants");
const destination_repository_1 = require("../repositories/destination.repository");
const review_repository_1 = require("../repositories/review.repository");
const app_error_1 = require("../utils/app-error");
const upload_service_1 = require("./upload.service");
const REVIEW_NOT_FOUND = 'Không tìm thấy đánh giá';
const DESTINATION_NOT_FOUND = 'Không tìm thấy địa điểm';
const MAX_REVIEW_IMAGES = 5;
const isPrismaError = (error, code) => error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === code;
const serializeReview = (review) => ({
    id: review.id,
    userId: review.userId,
    destinationId: review.destinationId,
    rating: review.rating,
    comment: review.comment,
    isVisible: review.isVisible,
    user: review.user,
    destination: review.destination,
    images: review.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        createdAt: image.createdAt.toISOString(),
    })),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
});
exports.serializeReview = serializeReview;
const assertActiveDestination = async (destinationId) => {
    const destination = await destination_repository_1.destinationRepository.findById(destinationId, true);
    if (!destination) {
        throw new app_error_1.AppError(DESTINATION_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
    }
};
const assertOwner = (review, userId) => {
    if (review.userId !== userId) {
        throw new app_error_1.AppError('Bạn không có quyền chỉnh sửa đánh giá này', constants_1.HTTP_STATUS.FORBIDDEN);
    }
};
const uploadReviewImages = async (files) => {
    if (files.length === 0)
        return [];
    try {
        return await (0, upload_service_1.uploadImagesToCloudinary)(files, 'reviews');
    }
    catch (error) {
        console.error('[Cloudinary] Upload review images failed:', error);
        if (error instanceof app_error_1.AppError)
            throw error;
        throw new app_error_1.AppError('Không thể upload ảnh đánh giá lên Cloudinary', constants_1.HTTP_STATUS.BAD_GATEWAY);
    }
};
const cleanupRemoteImages = async (imageUrls) => {
    const results = await Promise.allSettled(imageUrls.map(upload_service_1.deleteCloudinaryImageByUrl));
    if (results.some(({ status }) => status === 'rejected')) {
        console.warn('[Cloudinary] Review was changed but some remote images could not be deleted');
    }
};
const pagination = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
});
exports.reviewService = {
    async getDestinationReviews(destinationId, query) {
        await assertActiveDestination(destinationId);
        const result = await review_repository_1.reviewRepository.findPublicByDestination(destinationId, query);
        return {
            data: result.data.map(exports.serializeReview),
            pagination: pagination(query.page, query.limit, result.total),
        };
    },
    async getPublicReview(destinationId, reviewId) {
        await assertActiveDestination(destinationId);
        const review = await review_repository_1.reviewRepository.findById(reviewId);
        if (!review || review.destinationId !== destinationId || !review.isVisible) {
            throw new app_error_1.AppError(REVIEW_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        return (0, exports.serializeReview)(review);
    },
    async getMyReview(userId, destinationId) {
        await assertActiveDestination(destinationId);
        const review = await review_repository_1.reviewRepository.findByUserAndDestination(userId, destinationId);
        if (!review)
            throw new app_error_1.AppError(REVIEW_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        return (0, exports.serializeReview)(review);
    },
    async createReview(userId, destinationId, input, files = []) {
        await assertActiveDestination(destinationId);
        const existing = await review_repository_1.reviewRepository.findByUserAndDestination(userId, destinationId);
        if (existing) {
            throw new app_error_1.AppError('Mỗi người dùng chỉ được đánh giá một lần cho mỗi địa điểm', constants_1.HTTP_STATUS.CONFLICT);
        }
        const uploadedImages = await uploadReviewImages(files);
        try {
            const review = await review_repository_1.reviewRepository.create(userId, destinationId, input, uploadedImages.map(({ imageUrl }) => imageUrl));
            return (0, exports.serializeReview)(review);
        }
        catch (error) {
            await (0, upload_service_1.deleteUploadedImages)(uploadedImages);
            if (isPrismaError(error, 'P2002')) {
                throw new app_error_1.AppError('Mỗi người dùng chỉ được đánh giá một lần cho mỗi địa điểm', constants_1.HTTP_STATUS.CONFLICT);
            }
            throw error;
        }
    },
    async updateReview(userId, reviewId, input, files = []) {
        const existing = await review_repository_1.reviewRepository.findById(reviewId);
        if (!existing)
            throw new app_error_1.AppError(REVIEW_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        assertOwner(existing, userId);
        if (Object.keys(input).length === 0 && files.length === 0) {
            throw new app_error_1.AppError('Cần cung cấp điểm, nội dung hoặc ảnh để cập nhật đánh giá', constants_1.HTTP_STATUS.UNPROCESSABLE);
        }
        if (existing.images.length + files.length > MAX_REVIEW_IMAGES) {
            throw new app_error_1.AppError(`Mỗi đánh giá chỉ được có tối đa ${MAX_REVIEW_IMAGES} ảnh`, constants_1.HTTP_STATUS.UNPROCESSABLE);
        }
        const uploadedImages = await uploadReviewImages(files);
        try {
            return (0, exports.serializeReview)(await review_repository_1.reviewRepository.update(reviewId, input, uploadedImages.map(({ imageUrl }) => imageUrl)));
        }
        catch (error) {
            await (0, upload_service_1.deleteUploadedImages)(uploadedImages);
            throw error;
        }
    },
    async deleteReview(userId, reviewId) {
        const existing = await review_repository_1.reviewRepository.findById(reviewId);
        if (!existing)
            throw new app_error_1.AppError(REVIEW_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        assertOwner(existing, userId);
        const result = await review_repository_1.reviewRepository.delete(reviewId);
        await cleanupRemoteImages(result.imageUrls);
        return (0, exports.serializeReview)(result.review);
    },
    async deleteReviewImage(userId, reviewId, imageId) {
        const existing = await review_repository_1.reviewRepository.findById(reviewId);
        if (!existing)
            throw new app_error_1.AppError(REVIEW_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        assertOwner(existing, userId);
        try {
            const result = await review_repository_1.reviewRepository.deleteImage(reviewId, imageId);
            await cleanupRemoteImages([result.imageUrl]);
            return (0, exports.serializeReview)(result.review);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'REVIEW_IMAGE_NOT_FOUND') {
                throw new app_error_1.AppError('Không tìm thấy ảnh của đánh giá', constants_1.HTTP_STATUS.NOT_FOUND);
            }
            throw error;
        }
    },
    async getAdminReviews(query) {
        const result = await review_repository_1.reviewRepository.findAdmin(query);
        return {
            data: result.data.map(exports.serializeReview),
            pagination: pagination(query.page, query.limit, result.total),
        };
    },
    async setReviewVisibility(reviewId, isVisible) {
        const existing = await review_repository_1.reviewRepository.findById(reviewId);
        if (!existing)
            throw new app_error_1.AppError(REVIEW_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        if (existing.isVisible === isVisible)
            return (0, exports.serializeReview)(existing);
        return (0, exports.serializeReview)(await review_repository_1.reviewRepository.setVisibility(reviewId, isVisible));
    },
    async deleteReviewAsAdmin(reviewId) {
        const existing = await review_repository_1.reviewRepository.findById(reviewId);
        if (!existing)
            throw new app_error_1.AppError(REVIEW_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        const result = await review_repository_1.reviewRepository.delete(reviewId);
        await cleanupRemoteImages(result.imageUrls);
        return (0, exports.serializeReview)(result.review);
    },
};
//# sourceMappingURL=review.service.js.map