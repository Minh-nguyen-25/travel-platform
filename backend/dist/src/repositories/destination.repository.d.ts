import { Prisma } from '@prisma/client';
import { CreateDestinationInput, DestinationListQuery, UpdateDestinationInput, UploadedDestinationImage } from '../types/destination.types';
declare const destinationInclude: {
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
export type DestinationRecord = Prisma.DestinationGetPayload<{
    include: typeof destinationInclude;
}>;
export declare const destinationRepository: {
    findMany(query: DestinationListQuery, publicOnly: boolean): Promise<{
        data: DestinationRecord[];
        total: number;
    }>;
    findById(id: number, publicOnly?: boolean): Promise<DestinationRecord | null>;
    findExistingCategoryIds(categoryIds: number[]): Promise<number[]>;
    create(input: CreateDestinationInput, images?: UploadedDestinationImage[], primaryImageIndex?: number): Promise<DestinationRecord>;
    update(id: number, input: UpdateDestinationInput, images?: UploadedDestinationImage[], primaryImageIndex?: number): Promise<DestinationRecord>;
    softDelete(id: number): Promise<DestinationRecord>;
    deleteImage(destinationId: number, imageId: number): Promise<{
        destination: DestinationRecord;
        imageUrl: string;
    }>;
    setPrimaryImage(destinationId: number, imageId: number): Promise<DestinationRecord>;
};
export {};
//# sourceMappingURL=destination.repository.d.ts.map