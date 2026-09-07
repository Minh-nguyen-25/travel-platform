import { HTTP_STATUS } from '../constants';
import {
  CategoryRecord,
  categoryRepository,
} from '../repositories/category.repository';
import {
  CategoryListQuery,
  CategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/destination.types';
import { AppError } from '../utils/app-error';

const CATEGORY_NOT_FOUND = 'Không tìm thấy danh mục';

const serializeCategory = (category: CategoryRecord): CategoryResponse => ({
  id: category.id,
  name: category.name,
  description: category.description,
  destinationCount: category._count.destinations,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString(),
});

const assertUniqueName = async (name: string, excludeId?: number): Promise<void> => {
  const duplicate = await categoryRepository.findByNameInsensitive(name, excludeId);
  if (duplicate) {
    throw new AppError('Tên danh mục đã tồn tại', HTTP_STATUS.CONFLICT);
  }
};

export const categoryService = {
  async getCategories(query: CategoryListQuery) {
    const result = await categoryRepository.findMany(query);
    return {
      data: result.data.map(serializeCategory),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async getCategory(id: number): Promise<CategoryResponse> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new AppError(CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return serializeCategory(category);
  },

  async createCategory(input: CreateCategoryInput): Promise<CategoryResponse> {
    await assertUniqueName(input.name);
    return serializeCategory(await categoryRepository.create(input));
  },

  async updateCategory(id: number, input: UpdateCategoryInput): Promise<CategoryResponse> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new AppError(CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    if (input.name !== undefined) await assertUniqueName(input.name, id);

    return serializeCategory(await categoryRepository.update(id, input));
  },

  async deleteCategory(id: number): Promise<void> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new AppError(CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await categoryRepository.delete(id);
  },
};
