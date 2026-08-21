import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { HTTP_STATUS } from '../constants';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Thành công',
  statusCode: number = HTTP_STATUS.OK
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: Record<string, string[]>
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  message = 'Thành công'
): Response<PaginatedResponse<T>> => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination,
  });
};
