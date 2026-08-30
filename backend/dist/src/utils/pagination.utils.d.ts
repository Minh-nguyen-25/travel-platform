import { PaginationQuery } from '../types/common.types';
export interface PaginationResult {
    page: number;
    limit: number;
    skip: number;
    total: number;
    totalPages: number;
}
export declare const calculatePagination: (query: PaginationQuery, total: number) => PaginationResult;
//# sourceMappingURL=pagination.utils.d.ts.map