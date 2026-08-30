"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const constants_1 = require("../constants");
/**
 * Lỗi có thể dự đoán được trong business logic.
 * Throw trong Service → errorHandler tự bắt và trả response đúng format.
 *
 * Ví dụ:
 *   throw new AppError('Không tìm thấy địa điểm', HTTP_STATUS.NOT_FOUND);
 *   throw new AppError('Bạn đã đánh giá rồi', HTTP_STATUS.CONFLICT);
 *   throw new AppError('Email đã tồn tại', HTTP_STATUS.CONFLICT);
 */
class AppError extends Error {
    statusCode;
    constructor(message, statusCode = constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        // Fix prototype chain cho TypeScript kế thừa từ Error
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=app-error.js.map