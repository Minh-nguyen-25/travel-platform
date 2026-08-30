"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
const app_error_1 = require("../utils/app-error");
// Đặt cuối cùng trong app.ts — bắt tất cả lỗi chưa được xử lý
const errorHandler = (err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    // Lỗi AppError — business logic có thể dự đoán được (ưu tiên kiểm tra trước)
    if (err instanceof app_error_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    // Lỗi Zod (validation)
    if (err instanceof zod_1.ZodError) {
        res.status(constants_1.HTTP_STATUS.UNPROCESSABLE).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: err.flatten().fieldErrors,
        });
        return;
    }
    // Lỗi Multer (upload)
    if (err.name === 'MulterError') {
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: err.message,
        });
        return;
    }
    // Lỗi Prisma (unique constraint, record not found, v.v.)
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
        if (prismaError.code === 'P2002') {
            res.status(constants_1.HTTP_STATUS.CONFLICT).json({
                success: false,
                message: 'Dữ liệu đã tồn tại',
            });
            return;
        }
        if (prismaError.code === 'P2025') {
            res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Không tìm thấy dữ liệu',
            });
            return;
        }
        if (prismaError.code === 'P2003') {
            res.status(constants_1.HTTP_STATUS.CONFLICT).json({
                success: false,
                message: 'Dữ liệu liên quan không tồn tại hoặc vừa bị thay đổi',
            });
            return;
        }
        if (prismaError.code === 'P2034' || prismaError.code === 'P2028') {
            res.status(constants_1.HTTP_STATUS.CONFLICT).json({
                success: false,
                message: 'Dữ liệu vừa được thay đổi đồng thời, vui lòng thử lại',
            });
            return;
        }
    }
    // Lỗi không xác định
    res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Lỗi hệ thống' : err.message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.middleware.js.map