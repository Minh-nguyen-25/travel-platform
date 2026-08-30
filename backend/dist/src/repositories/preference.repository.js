"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferenceRepository = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db"));
const preferenceSelect = {
    id: true,
    userId: true,
    budgetLevel: true,
    travelStyle: true,
    preferredActivities: true,
    preferredCategories: true,
    updatedAt: true,
};
const toNullableJson = (value) => {
    if (value === undefined) {
        return undefined;
    }
    return value === null ? client_1.Prisma.DbNull : value;
};
const toWriteData = (input) => ({
    budgetLevel: input.budgetLevel,
    travelStyle: input.travelStyle,
    preferredActivities: toNullableJson(input.preferredActivities),
    preferredCategories: toNullableJson(input.preferredCategories),
});
exports.preferenceRepository = {
    findByUserId(userId) {
        return db_1.default.travelPreference.findUnique({
            where: { userId },
            select: preferenceSelect,
        });
    },
    createForUser(userId, input) {
        return db_1.default.travelPreference.create({
            data: {
                userId,
                ...toWriteData(input),
            },
            select: preferenceSelect,
        });
    },
    updateForUser(userId, input) {
        return db_1.default.travelPreference.update({
            where: { userId },
            data: toWriteData(input),
            select: preferenceSelect,
        });
    },
    deleteForUser(userId) {
        return db_1.default.travelPreference.delete({
            where: { userId },
            select: preferenceSelect,
        });
    },
};
//# sourceMappingURL=preference.repository.js.map