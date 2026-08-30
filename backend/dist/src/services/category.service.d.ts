import { CategoryListQuery, CategoryResponse, CreateCategoryInput, UpdateCategoryInput } from '../types/destination.types';
export declare const categoryService: {
    getCategories(query: CategoryListQuery): Promise<{
        data: CategoryResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCategory(id: number): Promise<CategoryResponse>;
    createCategory(input: CreateCategoryInput): Promise<CategoryResponse>;
    updateCategory(id: number, input: UpdateCategoryInput): Promise<CategoryResponse>;
    deleteCategory(id: number): Promise<void>;
};
//# sourceMappingURL=category.service.d.ts.map