import { FavoriteListQuery, FavoriteResponse, FavoriteStatusResponse } from '../types/favorite.types';
export declare const favoriteService: {
    getFavorites(userId: number, query: FavoriteListQuery): Promise<{
        data: FavoriteResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStatus(userId: number, destinationId: number): Promise<FavoriteStatusResponse>;
    toggle(userId: number, destinationId: number): Promise<FavoriteStatusResponse>;
};
//# sourceMappingURL=favorite.service.d.ts.map