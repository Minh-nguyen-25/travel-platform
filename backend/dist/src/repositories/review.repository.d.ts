import { Prisma } from '@prisma/client';
import { AdminReviewListQuery, CreateReviewInput, ReviewListQuery, UpdateReviewInput } from '../types/review.types';
declare const reviewInclude: {
    user: {
        select: {
            id: true;
            fullName: true;
            avatarUrl: true;
        };
    };
    destination: {
        select: {
            id: true;
            name: true;
        };
    };
    images: {
        orderBy: ({
            createdAt: "asc";
            id?: undefined;
        } | {
            id: "asc";
            createdAt?: undefined;
        })[];
    };
};
export type ReviewRecord = Prisma.ReviewGetPayload<{
    include: typeof reviewInclude;
}>;
export declare const roundAverageRating: (average: number | null) => number;
export declare const reviewRepository: {
    findPublicByDestination(destinationId: number, query: ReviewListQuery): Promise<{
        data: ReviewRecord[];
        total: number;
    }>;
    findAdmin(query: AdminReviewListQuery): Promise<{
        data: ReviewRecord[];
        total: number;
    }>;
    findById(id: number): Promise<ReviewRecord | null>;
    findByUserAndDestination(userId: number, destinationId: number): Promise<ReviewRecord | null>;
    create(userId: number, destinationId: number, input: CreateReviewInput, imageUrls: string[]): Promise<ReviewRecord>;
    update(id: number, input: UpdateReviewInput, imageUrls: string[]): Promise<ReviewRecord>;
    delete(id: number): Promise<{
        review: ReviewRecord;
        imageUrls: string[];
    }>;
    setVisibility(id: number, isVisible: boolean): Promise<ReviewRecord>;
    deleteImage(reviewId: number, imageId: number): Promise<{
        review: ReviewRecord;
        imageUrl: string;
    }>;
};
export {};
//# sourceMappingURL=review.repository.d.ts.map