export interface CreateReviewInput {
    rating: number;
    comment?: string | null;
}
export interface UpdateReviewInput {
    rating?: number;
    comment?: string | null;
}
export interface ReviewListQuery {
    page: number;
    limit: number;
    sortBy: 'createdAt' | 'rating';
    sortOrder: 'asc' | 'desc';
}
export interface AdminReviewListQuery extends ReviewListQuery {
    search?: string;
    destinationId?: number;
    userId?: number;
    rating?: number;
    isVisible?: boolean;
}
export interface ReviewImageResponse {
    id: number;
    imageUrl: string;
    createdAt: string;
}
export interface ReviewResponse {
    id: number;
    userId: number;
    destinationId: number;
    rating: number;
    comment: string | null;
    isVisible: boolean;
    user: {
        id: number;
        fullName: string;
        avatarUrl: string | null;
    };
    destination: {
        id: number;
        name: string;
    };
    images: ReviewImageResponse[];
    createdAt: string;
    updatedAt: string;
}
export interface ReviewVisibilityInput {
    isVisible: boolean;
}
//# sourceMappingURL=review.types.d.ts.map