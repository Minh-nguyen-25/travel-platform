"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const constants_1 = require("../constants");
const category_repository_1 = require("../repositories/category.repository");
const app_error_1 = require("../utils/app-error");
const CATEGORY_NOT_FOUND = 'Không tìm thấy danh mục';
const serializeCategory = (category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    destinationCount: category._count.destinations,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
});
const assertUniqueName = async (name, excludeId) => {
    const duplicate = await category_repository_1.categoryRepository.findByNameInsensitive(name, excludeId);
    if (duplicate) {
        throw new app_error_1.AppError('Tên danh mục đã tồn tại', constants_1.HTTP_STATUS.CONFLICT);
    }
};
exports.categoryService = {
    async getCategories(query) {
        const result = await category_repository_1.categoryRepository.findMany(query);
        return {
            data: result.data.map(serializeCategory),
            pagination: {
                page: query.page,
                limit: query.limit,
                total: result.total,
                totalPages: Math.ceil(result.total / query.limit),
            },
        };
    },
    async getCategory(id) {
        const category = await category_repository_1.categoryRepository.findById(id);
        if (!category) {
            throw new app_error_1.AppError(CATEGORY_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        return serializeCategory(category);
    },
    async createCategory(input) {
        await assertUniqueName(input.name);
        return serializeCategory(await category_repository_1.categoryRepository.create(input));
    },
    async updateCategory(id, input) {
        const existing = await category_repository_1.categoryRepository.findById(id);
        if (!existing) {
            throw new app_error_1.AppError(CATEGORY_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        if (input.name !== undefined)
            await assertUniqueName(input.name, id);
        return serializeCategory(await category_repository_1.categoryRepository.update(id, input));
    },
    async deleteCategory(id) {
        const existing = await category_repository_1.categoryRepository.findById(id);
        if (!existing) {
            throw new app_error_1.AppError(CATEGORY_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        await category_repository_1.categoryRepository.delete(id);
    },
};
//# sourceMappingURL=category.service.js.map