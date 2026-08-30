export interface ApiResponse<T = null> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string[]>;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
//# sourceMappingURL=api.types.d.ts.map