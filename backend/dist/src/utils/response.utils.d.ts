import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response<ApiResponse<T>>;
export declare const sendError: (res: Response, message: string, statusCode?: number, errors?: Record<string, string[]>) => Response<ApiResponse>;
export declare const sendPaginated: <T>(res: Response, data: T[], pagination: PaginatedResponse<T>["pagination"], message?: string) => Response<PaginatedResponse<T>>;
//# sourceMappingURL=response.utils.d.ts.map