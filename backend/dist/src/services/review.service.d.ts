import { ReviewRecord } from '../repositories/review.repository';
import { AdminReviewListQuery, CreateReviewInput, ReviewListQuery, ReviewResponse, UpdateReviewInput } from '../types/review.types';
export declare const serializeReview: (review: ReviewRecord) => ReviewResponse;
export declare const reviewService: {
    getDestinationReviews(destinationId: number, query: ReviewListQuery): Promise<{
        data: ReviewResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPublicReview(destinationId: number, reviewId: number): Promise<ReviewResponse>;
    getMyReview(userId: number, destinationId: number): Promise<ReviewResponse>;
    createReview(userId: number, destinationId: number, input: CreateReviewInput, files?: Express.Multer.File[]): Promise<ReviewResponse>;
    updateReview(userId: number, reviewId: number, input: UpdateReviewInput, files?: Express.Multer.File[]): Promise<ReviewResponse>;
    deleteReview(userId: number, reviewId: number): Promise<ReviewResponse>;
    deleteReviewImage(userId: number, reviewId: number, imageId: number): Promise<ReviewResponse>;
    getAdminReviews(query: AdminReviewListQuery): Promise<{
        data: ReviewResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    setReviewVisibility(reviewId: number, isVisible: boolean): Promise<ReviewResponse>;
    deleteReviewAsAdmin(reviewId: number): Promise<ReviewResponse>;
};
//# sourceMappingURL=review.service.d.ts.map