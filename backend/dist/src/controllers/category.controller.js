"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategory = exports.getCategories = void 0;
const constants_1 = require("../constants");
const category_service_1 = require("../services/category.service");
const response_utils_1 = require("../utils/response.utils");
const getCategoryId = (req) => Number(req.params.categoryId);
const getCategories = async (req, res) => {
    const result = await category_service_1.categoryService.getCategories(req.query);
    (0, response_utils_1.sendPaginated)(res, result.data, result.pagination, 'Lấy danh sách danh mục thành công');
};
exports.getCategories = getCategories;
const getCategory = async (req, res) => {
    const category = await category_service_1.categoryService.getCategory(getCategoryId(req));
    (0, response_utils_1.sendSuccess)(res, category, 'Lấy chi tiết danh mục thành công');
};
exports.getCategory = getCategory;
const createCategory = async (req, res) => {
    const category = await category_service_1.categoryService.createCategory(req.body);
    (0, response_utils_1.sendSuccess)(res, category, 'Thêm danh mục thành công', constants_1.HTTP_STATUS.CREATED);
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    const category = await category_service_1.categoryService.updateCategory(getCategoryId(req), req.body);
    (0, response_utils_1.sendSuccess)(res, category, 'Cập nhật danh mục thành công');
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    await category_service_1.categoryService.deleteCategory(getCategoryId(req));
    (0, response_utils_1.sendSuccess)(res, null, 'Xóa danh mục thành công');
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.controller.js.map