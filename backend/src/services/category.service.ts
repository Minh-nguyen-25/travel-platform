import prisma from '../config/db';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../constants';
import type { CategoryDto, CategoryUpdateDto } from '../validators/category.validator';

export class CategoryService {
  /**
   * Lấy danh sách tất cả danh mục (kèm số lượng địa điểm liên kết)
   */
  static async getAllCategories() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { destinations: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Lấy chi tiết 1 danh mục theo ID
   */
  static async getCategoryById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { destinations: true },
        },
      },
    });

    if (!category) {
      throw new AppError('Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
    }

    return category;
  }

  /**
   * Tạo danh mục mới
   */
  static async createCategory(data: CategoryDto) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new AppError('Tên danh mục đã tồn tại', HTTP_STATUS.CONFLICT);
    }

    return prisma.category.create({
      data,
    });
  }

  /**
   * Cập nhật danh mục
   */
  static async updateCategory(id: number, data: CategoryUpdateDto) {
    await this.getCategoryById(id);

    if (data.name) {
      const duplicate = await prisma.category.findFirst({
        where: {
          name: data.name,
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new AppError('Tên danh mục đã tồn tại', HTTP_STATUS.CONFLICT);
      }
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Xóa danh mục (kiểm tra an toàn nếu có địa điểm liên kết)
   */
  static async deleteCategory(id: number) {
    await this.getCategoryById(id);

    const linkedCount = await prisma.destinationCategory.count({
      where: { categoryId: id },
    });

    if (linkedCount > 0) {
      throw new AppError(
        `Không thể xóa danh mục đang có ${linkedCount} địa điểm du lịch sử dụng`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return prisma.category.delete({
      where: { id },
    });
  }
}