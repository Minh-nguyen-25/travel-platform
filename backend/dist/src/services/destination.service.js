"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destinationService = exports.serializeDestination = void 0;
const constants_1 = require("../constants");
const destination_repository_1 = require("../repositories/destination.repository");
const app_error_1 = require("../utils/app-error");
const upload_service_1 = require("./upload.service");
const DESTINATION_NOT_FOUND = 'Không tìm thấy địa điểm';
const serializeDestination = (destination) => ({
    id: destination.id,
    name: destination.name,
    description: destination.description,
    address: destination.address,
    phoneNumber: destination.phoneNumber,
    latitude: destination.latitude.toFixed(7),
    longitude: destination.longitude.toFixed(7),
    ticketPrice: destination.ticketPrice.toFixed(2),
    openingHoursNote: destination.openingHoursNote,
    visitDuration: destination.visitDuration,
    rating: destination.rating.toFixed(1),
    isActive: destination.isActive,
    categories: destination.categories.map(({ category }) => ({
        id: category.id,
        name: category.name,
        description: category.description,
    })),
    images: destination.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        isPrimary: image.isPrimary,
        displayOrder: image.displayOrder,
        createdAt: image.createdAt.toISOString(),
    })),
    createdAt: destination.createdAt.toISOString(),
    updatedAt: destination.updatedAt.toISOString(),
});
exports.serializeDestination = serializeDestination;
const assertCategoryIdsExist = async (categoryIds) => {
    const existingIds = await destination_repository_1.destinationRepository.findExistingCategoryIds(categoryIds);
    const existingIdSet = new Set(existingIds);
    const missingIds = categoryIds.filter((id) => !existingIdSet.has(id));
    if (missingIds.length > 0) {
        throw new app_error_1.AppError(`Không tìm thấy danh mục có ID: ${missingIds.join(', ')}`, constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
};
const assertPrimaryImageIndex = (files, primaryImageIndex) => {
    if (primaryImageIndex === undefined)
        return;
    if (files.length === 0 || primaryImageIndex >= files.length) {
        throw new app_error_1.AppError('primaryImageIndex phải trỏ tới một ảnh trong danh sách upload', constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
};
const uploadImages = async (files) => {
    if (files.length === 0)
        return [];
    try {
        return await (0, upload_service_1.uploadImagesToCloudinary)(files, 'destinations');
    }
    catch (error) {
        console.error('[Cloudinary] Upload destination images failed:', error);
        if (error instanceof app_error_1.AppError)
            throw error;
        throw new app_error_1.AppError('Không thể upload ảnh lên Cloudinary', constants_1.HTTP_STATUS.BAD_GATEWAY);
    }
};
const persistWithUploadRollback = async (uploadedImages, action) => {
    try {
        return await action();
    }
    catch (error) {
        await (0, upload_service_1.deleteUploadedImages)(uploadedImages);
        throw error;
    }
};
exports.destinationService = {
    async getDestinations(query, publicOnly = true) {
        const result = await destination_repository_1.destinationRepository.findMany(query, publicOnly);
        return {
            data: result.data.map(exports.serializeDestination),
            pagination: {
                page: query.page,
                limit: query.limit,
                total: result.total,
                totalPages: Math.ceil(result.total / query.limit),
            },
        };
    },
    async getDestination(id, publicOnly = true) {
        const destination = await destination_repository_1.destinationRepository.findById(id, publicOnly);
        if (!destination) {
            throw new app_error_1.AppError(DESTINATION_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        return (0, exports.serializeDestination)(destination);
    },
    async createDestination(input, files = [], primaryImageIndex) {
        assertPrimaryImageIndex(files, primaryImageIndex);
        await assertCategoryIdsExist(input.categoryIds);
        const uploadedImages = await uploadImages(files);
        const destination = await persistWithUploadRollback(uploadedImages, () => destination_repository_1.destinationRepository.create(input, uploadedImages, primaryImageIndex));
        return (0, exports.serializeDestination)(destination);
    },
    async updateDestination(id, input, files = [], primaryImageIndex) {
        const existing = await destination_repository_1.destinationRepository.findById(id);
        if (!existing) {
            throw new app_error_1.AppError(DESTINATION_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        if (Object.keys(input).length === 0 && files.length === 0) {
            throw new app_error_1.AppError('Cần cung cấp ít nhất một trường hoặc một ảnh để cập nhật', constants_1.HTTP_STATUS.UNPROCESSABLE);
        }
        assertPrimaryImageIndex(files, primaryImageIndex);
        if (input.categoryIds)
            await assertCategoryIdsExist(input.categoryIds);
        const uploadedImages = await uploadImages(files);
        const destination = await persistWithUploadRollback(uploadedImages, () => destination_repository_1.destinationRepository.update(id, input, uploadedImages, primaryImageIndex));
        return (0, exports.serializeDestination)(destination);
    },
    async softDeleteDestination(id) {
        const existing = await destination_repository_1.destinationRepository.findById(id);
        if (!existing) {
            throw new app_error_1.AppError(DESTINATION_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        if (!existing.isActive)
            return (0, exports.serializeDestination)(existing);
        return (0, exports.serializeDestination)(await destination_repository_1.destinationRepository.softDelete(id));
    },
    async uploadDestinationImages(id, files, primaryImageIndex) {
        const existing = await destination_repository_1.destinationRepository.findById(id);
        if (!existing) {
            throw new app_error_1.AppError(DESTINATION_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        if (files.length === 0) {
            throw new app_error_1.AppError('Cần chọn ít nhất một ảnh để upload', constants_1.HTTP_STATUS.BAD_REQUEST);
        }
        assertPrimaryImageIndex(files, primaryImageIndex);
        const uploadedImages = await uploadImages(files);
        const destination = await persistWithUploadRollback(uploadedImages, () => destination_repository_1.destinationRepository.update(id, {}, uploadedImages, primaryImageIndex));
        return (0, exports.serializeDestination)(destination);
    },
    async deleteDestinationImage(destinationId, imageId) {
        const existing = await destination_repository_1.destinationRepository.findById(destinationId);
        if (!existing) {
            throw new app_error_1.AppError(DESTINATION_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        try {
            const result = await destination_repository_1.destinationRepository.deleteImage(destinationId, imageId);
            try {
                await (0, upload_service_1.deleteCloudinaryImageByUrl)(result.imageUrl);
            }
            catch (error) {
                console.warn('[Cloudinary] Database image was deleted but remote cleanup failed:', error);
            }
            return (0, exports.serializeDestination)(result.destination);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'DESTINATION_IMAGE_NOT_FOUND') {
                throw new app_error_1.AppError('Không tìm thấy ảnh của địa điểm', constants_1.HTTP_STATUS.NOT_FOUND);
            }
            throw error;
        }
    },
    async setPrimaryImage(destinationId, imageId) {
        const existing = await destination_repository_1.destinationRepository.findById(destinationId);
        if (!existing) {
            throw new app_error_1.AppError(DESTINATION_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        try {
            return (0, exports.serializeDestination)(await destination_repository_1.destinationRepository.setPrimaryImage(destinationId, imageId));
        }
        catch (error) {
            if (error instanceof Error && error.message === 'DESTINATION_IMAGE_NOT_FOUND') {
                throw new app_error_1.AppError('Không tìm thấy ảnh của địa điểm', constants_1.HTTP_STATUS.NOT_FOUND);
            }
            throw error;
        }
    },
};
//# sourceMappingURL=destination.service.js.map