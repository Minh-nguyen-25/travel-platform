"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteService = void 0;
const constants_1 = require("../constants");
const destination_repository_1 = require("../repositories/destination.repository");
const favorite_repository_1 = require("../repositories/favorite.repository");
const app_error_1 = require("../utils/app-error");
const destination_service_1 = require("./destination.service");
const assertActiveDestination = async (destinationId) => {
    const destination = await destination_repository_1.destinationRepository.findById(destinationId, true);
    if (!destination) {
        throw new app_error_1.AppError('Không tìm thấy địa điểm', constants_1.HTTP_STATUS.NOT_FOUND);
    }
};
exports.favoriteService = {
    async getFavorites(userId, query) {
        const result = await favorite_repository_1.favoriteRepository.findMany(userId, query);
        const data = result.data.map((favorite) => ({
            createdAt: favorite.createdAt.toISOString(),
            destination: (0, destination_service_1.serializeDestination)(favorite.destination),
        }));
        return {
            data,
            pagination: {
                page: query.page,
                limit: query.limit,
                total: result.total,
                totalPages: Math.ceil(result.total / query.limit),
            },
        };
    },
    async getStatus(userId, destinationId) {
        await assertActiveDestination(destinationId);
        return {
            destinationId,
            isFavorite: await favorite_repository_1.favoriteRepository.exists(userId, destinationId),
        };
    },
    async toggle(userId, destinationId) {
        await assertActiveDestination(destinationId);
        return {
            destinationId,
            isFavorite: await favorite_repository_1.favoriteRepository.toggle(userId, destinationId),
        };
    },
};
//# sourceMappingURL=favorite.service.js.map