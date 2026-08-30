export interface PaginationQuery {
    page?: number;
    limit?: number;
}
export interface SearchQuery extends PaginationQuery {
    search?: string;
}
export interface JwtPayload {
    type: 'access';
    userId: number;
    email: string;
    role: string;
}
export interface RefreshTokenPayload {
    type: 'refresh';
    userId: number;
    tokenId: string;
}
//# sourceMappingURL=common.types.d.ts.map