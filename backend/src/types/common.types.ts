// Query params dùng chung cho phân trang
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// Query có kèm tìm kiếm
export interface SearchQuery extends PaginationQuery {
  search?: string;
}

// JWT Payload
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}
