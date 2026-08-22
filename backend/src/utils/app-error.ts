import { HTTP_STATUS } from '../constants';

/**
 * Lỗi có thể dự đoán được trong business logic.
 * Throw trong Service → errorHandler tự bắt và trả response đúng format.
 *
 * Ví dụ:
 *   throw new AppError('Không tìm thấy địa điểm', HTTP_STATUS.NOT_FOUND);
 *   throw new AppError('Bạn đã đánh giá rồi', HTTP_STATUS.CONFLICT);
 *   throw new AppError('Email đã tồn tại', HTTP_STATUS.CONFLICT);
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;

    // Fix prototype chain cho TypeScript kế thừa từ Error
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
