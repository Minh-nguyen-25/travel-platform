import { PaginationQuery } from '../types/common.types';

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  total: number;
  totalPages: number;
}

export const calculatePagination = (
  query: PaginationQuery,
  total: number
): PaginationResult => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  return { page, limit, skip, total, totalPages };
};
