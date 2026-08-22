// Chuẩn response trả về cho mọi API
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Response có phân trang
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
