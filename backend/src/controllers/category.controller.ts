import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { categorySchema, categoryUpdateSchema } from '../validators/category.validator';
import { sendSuccess } from '../utils/response.utils';
import { HTTP_STATUS } from '../constants';

export class CategoryController {
  /**
   * Lấy danh sách tất cả danh mục
   */
  static async getAll(_req: Request, res: Response): Promise<void> {
    const categories = await CategoryService.getAllCategories();
    sendSuccess(res, categories, 'Lấy danh mục thành công');
  }

  /**
   * Lấy chi tiết 1 danh mục theo ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const category = await CategoryService.getCategoryById(id);
    sendSuccess(res, category, 'Lấy thông tin danh mục thành công');
  }

  /**
   * Tạo mới danh mục
   */
  static async create(req: Request, res: Response): Promise<void> {
    const validatedData = categorySchema.parse(req.body);
    const category = await CategoryService.createCategory(validatedData);
    sendSuccess(res, category, 'Tạo danh mục thành công', HTTP_STATUS.CREATED);
  }

  /**
   * Cập nhật thông tin danh mục
   */
  static async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const validatedData = categoryUpdateSchema.parse(req.body);
    const category = await CategoryService.updateCategory(id, validatedData);
    sendSuccess(res, category, 'Cập nhật danh mục thành công');
  }

  /**
   * Xóa danh mục
   */
  static async delete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    await CategoryService.deleteCategory(id);
    sendSuccess(res, null, 'Xóa danh mục thành công');
  }
}