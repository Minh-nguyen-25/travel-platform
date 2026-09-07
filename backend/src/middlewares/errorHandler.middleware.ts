import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../utils/app-error';

// Đặt cuối cùng trong app.ts — bắt tất cả lỗi chưa được xử lý
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  // Lỗi AppError — business logic có thể dự đoán được (ưu tiên kiểm tra trước)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Lỗi Zod (validation)
  if (err instanceof ZodError) {
    res.status(HTTP_STATUS.UNPROCESSABLE).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // Lỗi Multer (upload)
  if (err.name === 'MulterError') {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Lỗi Prisma (unique constraint, record not found, v.v.)
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as Error & { code?: string };
    if (prismaError.code === 'P2002') {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Dữ liệu đã tồn tại',
      });
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Không tìm thấy dữ liệu',
      });
      return;
    }
    if (prismaError.code === 'P2003') {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Dữ liệu liên quan không tồn tại hoặc vừa bị thay đổi',
      });
      return;
    }
    if (prismaError.code === 'P2034' || prismaError.code === 'P2028') {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Dữ liệu vừa được thay đổi đồng thời, vui lòng thử lại',
      });
      return;
    }
  }

  // Lỗi không xác định
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Lỗi hệ thống' : err.message,
  });
};
