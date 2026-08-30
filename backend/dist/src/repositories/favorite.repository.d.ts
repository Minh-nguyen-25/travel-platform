import { Prisma } from '@prisma/client';
import { FavoriteListQuery } from '../types/favorite.types';
declare const favoriteInclude: {
    destination: {
        include: {
            categories: {
                include: {
                    category: true;
                };
                orderBy: {
                    categoryId: "asc";
                };
            };
            images: {
                orderBy: ({
                    isPrimary: "desc";
                    displayOrder?: undefined;
                    id?: undefined;
                } | {
                    displayOrder: "asc";
                    isPrimary?: undefined;
                    id?: undefined;
                } | {
                    id: "asc";
                    isPrimary?: undefined;
                    displayOrder?: undefined;
                })[];
            };
        };
    };
};
export type FavoriteRecord = Prisma.FavoriteGetPayload<{
    include: typeof favoriteInclude;
}>;
export declare const favoriteRepository: {
    findMany(userId: number, query: FavoriteListQuery): Promise<{
        data: FavoriteRecord[];
        total: number;
    }>;
    exists(userId: number, destinationId: number): Promise<boolean>;
    toggle(userId: number, destinationId: number): Promise<boolean>;
};
export {};
//# sourceMappingURL=favorite.repository.d.ts.map