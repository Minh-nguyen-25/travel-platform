"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagination = void 0;
const calculatePagination = (query, total) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    return { page, limit, skip, total, totalPages };
};
exports.calculatePagination = calculatePagination;
//# sourceMappingURL=pagination.utils.js.map