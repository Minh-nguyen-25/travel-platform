/**
 * Lỗi có thể dự đoán được trong business logic.
 * Throw trong Service → errorHandler tự bắt và trả response đúng format.
 *
 * Ví dụ:
 *   throw new AppError('Không tìm thấy địa điểm', HTTP_STATUS.NOT_FOUND);
 *   throw new AppError('Bạn đã đánh giá rồi', HTTP_STATUS.CONFLICT);
 *   throw new AppError('Email đã tồn tại', HTTP_STATUS.CONFLICT);
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode?: number);
}
//# sourceMappingURL=app-error.d.ts.map