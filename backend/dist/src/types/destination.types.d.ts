export type SortOrder = 'asc' | 'desc';
export type DestinationSortBy = 'createdAt' | 'name' | 'rating' | 'ticketPrice';
export type CategoryMatch = 'any' | 'all';
export interface DestinationListQuery {
    page: number;
    limit: number;
    search?: string;
    categoryIds?: number[];
    categoryMatch: CategoryMatch;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    maxRating?: number;
    sortBy: DestinationSortBy;
    sortOrder: SortOrder;
    isActive?: boolean;
}
export interface DestinationWriteInput {
    name: string;
    description?: string | null;
    address: string;
    phoneNumber?: string | null;
    latitude: number;
    longitude: number;
    ticketPrice?: number;
    openingHoursNote?: string | null;
    visitDuration?: number | null;
    isActive?: boolean;
    categoryIds: number[];
}
export type CreateDestinationInput = DestinationWriteInput;
export type UpdateDestinationInput = Partial<DestinationWriteInput>;
export interface UploadedDestinationImage {
    imageUrl: string;
    publicId: string;
}
export interface DestinationCategoryResponse {
    id: number;
    name: string;
    description: string | null;
}
export interface DestinationImageResponse {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
    displayOrder: number;
    createdAt: string;
}
export interface DestinationResponse {
    id: number;
    name: string;
    description: string | null;
    address: string;
    phoneNumber: string | null;
    latitude: string;
    longitude: string;
    ticketPrice: string;
    openingHoursNote: string | null;
    visitDuration: number | null;
    rating: string;
    isActive: boolean;
    categories: DestinationCategoryResponse[];
    images: DestinationImageResponse[];
    createdAt: string;
    updatedAt: string;
}
export interface CategoryListQuery {
    page: number;
    limit: number;
    search?: string;
    sortBy: 'createdAt' | 'name';
    sortOrder: SortOrder;
}
export interface CreateCategoryInput {
    name: string;
    description?: string | null;
}
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
export interface CategoryResponse {
    id: number;
    name: string;
    description: string | null;
    destinationCount: number;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=destination.types.d.ts.map