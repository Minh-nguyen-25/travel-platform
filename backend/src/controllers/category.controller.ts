import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { categoryService } from '../services/category.service';
import {
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/destination.types';
import { sendPaginated, sendSuccess } from '../utils/response.utils';

const getCategoryId = (req: Request): number => Number(req.params.categoryId);

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const result = await categoryService.getCategories(
    req.query as unknown as CategoryListQuery
  );
  sendPaginated(res, result.data, result.pagination, 'Lấy danh sách danh mục thành công');
};

export const getCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await categoryService.getCategory(getCategoryId(req));
  sendSuccess(res, category, 'Lấy chi tiết danh mục thành công');
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await categoryService.createCategory(req.body as CreateCategoryInput);
  sendSuccess(res, category, 'Thêm danh mục thành công', HTTP_STATUS.CREATED);
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await categoryService.updateCategory(
    getCategoryId(req),
    req.body as UpdateCategoryInput
  );
  sendSuccess(res, category, 'Cập nhật danh mục thành công');
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  await categoryService.deleteCategory(getCategoryId(req));
  sendSuccess(res, null, 'Xóa danh mục thành công');
};
