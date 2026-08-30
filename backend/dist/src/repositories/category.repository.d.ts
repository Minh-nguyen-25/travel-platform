import { Prisma } from '@prisma/client';
import { CategoryListQuery, CreateCategoryInput, UpdateCategoryInput } from '../types/destination.types';
declare const categoryInclude: {
    _count: {
        select: {
            destinations: true;
        };
    };
};
export type CategoryRecord = Prisma.CategoryGetPayload<{
    include: typeof categoryInclude;
}>;
export declare const categoryRepository: {
    findMany(query: CategoryListQuery): Promise<{
        data: CategoryRecord[];
        total: number;
    }>;
    findById(id: number): Promise<CategoryRecord | null>;
    findByNameInsensitive(name: string, excludeId?: number): Prisma.Prisma__CategoryClient<{
        id: number;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, {
        log: ("query" | "warn" | "error")[];
    }>;
    create(input: CreateCategoryInput): Promise<CategoryRecord>;
    update(id: number, input: UpdateCategoryInput): Promise<CategoryRecord>;
    delete(id: number): Promise<CategoryRecord>;
};
export {};
//# sourceMappingURL=category.repository.d.ts.map