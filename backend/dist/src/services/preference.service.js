"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferenceService = void 0;
const client_1 = require("@prisma/client");
const constants_1 = require("../constants");
const preference_repository_1 = require("../repositories/preference.repository");
const app_error_1 = require("../utils/app-error");
const NOT_FOUND_MESSAGE = 'Không tìm thấy sở thích du lịch của bạn';
const isPrismaError = (error, code) => error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === code;
const serializeStringList = (value) => {
    if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
        return null;
    }
    return value;
};
const serializeBudgetLevel = (value) => value === constants_1.BUDGET_LEVEL.LOW ||
    value === constants_1.BUDGET_LEVEL.MEDIUM ||
    value === constants_1.BUDGET_LEVEL.HIGH
    ? value
    : null;
const serializePreference = (preference) => ({
    id: preference.id,
    userId: preference.userId,
    budgetLevel: serializeBudgetLevel(preference.budgetLevel),
    travelStyle: preference.travelStyle,
    preferredActivities: serializeStringList(preference.preferredActivities),
    preferredCategories: serializeStringList(preference.preferredCategories),
    updatedAt: preference.updatedAt.toISOString(),
});
exports.preferenceService = {
    async getPreference(userId) {
        const preference = await preference_repository_1.preferenceRepository.findByUserId(userId);
        if (!preference) {
            throw new app_error_1.AppError(NOT_FOUND_MESSAGE, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        return serializePreference(preference);
    },
    async createPreference(userId, input) {
        try {
            const preference = await preference_repository_1.preferenceRepository.createForUser(userId, input);
            return serializePreference(preference);
        }
        catch (error) {
            if (isPrismaError(error, 'P2002')) {
                throw new app_error_1.AppError('Sở thích du lịch của bạn đã tồn tại', constants_1.HTTP_STATUS.CONFLICT);
            }
            throw error;
        }
    },
    async updatePreference(userId, input) {
        try {
            const preference = await preference_repository_1.preferenceRepository.updateForUser(userId, input);
            return serializePreference(preference);
        }
        catch (error) {
            if (isPrismaError(error, 'P2025')) {
                throw new app_error_1.AppError(NOT_FOUND_MESSAGE, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            throw error;
        }
    },
    async deletePreference(userId) {
        try {
            await preference_repository_1.preferenceRepository.deleteForUser(userId);
        }
        catch (error) {
            if (isPrismaError(error, 'P2025')) {
                throw new app_error_1.AppError(NOT_FOUND_MESSAGE, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            throw error;
        }
    },
};
//# sourceMappingURL=preference.service.js.map