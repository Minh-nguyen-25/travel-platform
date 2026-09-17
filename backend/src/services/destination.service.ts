import prisma from '../config/db';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../constants';
import type {
  DestinationDto,
  DestinationUpdateDto,
  DestinationFilterQuery,
} from '../validators/destination.validator';

export class DestinationService {
  /**
   * 1. Lấy danh sách địa điểm với bộ lọc đa tiêu chí và phân trang
   */
  static async getDestinations(filter: DestinationFilterQuery) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'createdAt:desc',
      includeInactive = false,
    } = filter;

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện lọc linh hoạt
    const where: Prisma.DestinationWhereInput = {};

    // Mặc định khách vãng lai chỉ xem địa điểm đang hoạt động
    if (!includeInactive) {
      where.isActive = true;
    }

    // Tìm kiếm theo từ khóa (tên hoặc địa chỉ)
    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { address: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Lọc theo danh mục
    if (categoryId) {
      where.categories = {
        some: { categoryId: Number(categoryId) },
      };
    }

    // Lọc theo khoảng giá
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.ticketPrice = {};
      if (minPrice !== undefined) where.ticketPrice.gte = minPrice;
      if (maxPrice !== undefined) where.ticketPrice.lte = maxPrice;
    }

    // Lọc theo rating tối thiểu
    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Xác định thứ tự sắp xếp
    let orderBy: Prisma.DestinationOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy) {
      const [field, direction] = sortBy.split(':') as [string, 'asc' | 'desc'];
      if (['rating', 'ticketPrice', 'createdAt', 'name'].includes(field) && ['asc', 'desc'].includes(direction)) {
        orderBy = { [field]: direction };
      }
    }

    const [total, destinations] = await Promise.all([
      prisma.destination.count({ where }),
      prisma.destination.findMany({
        where,
        skip,
        take: limit,
        include: {
          categories: {
            include: { category: true },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy,
      }),
    ]);

    return {
      total,
      destinations,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 2. Lấy top địa điểm đánh giá cao nhất (cho Trang chủ)
   */
  static async getTopRatedDestinations(limit = 6) {
    return prisma.destination.findMany({
      where: { isActive: true },
      take: limit,
      include: {
        categories: {
          include: { category: true },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * 3. Lấy chi tiết 1 địa điểm theo ID
   */
  static async getDestinationById(id: number) {
    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        categories: {
          include: { category: true },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!destination) {
      throw new AppError('Không tìm thấy địa điểm du lịch', HTTP_STATUS.NOT_FOUND);
    }

    return destination;
  }

  /**
   * 4. Thêm mới địa điểm (kèm danh mục và upload nhiều ảnh)
   */
  static async createDestination(data: DestinationDto, imageUrls: string[] = [], primaryIndex: number = 0) {
    const { categoryIds, ...destData } = data;

    const safePrimaryIndex = primaryIndex >= 0 && primaryIndex < imageUrls.length ? primaryIndex : 0;

    return prisma.destination.create({
      data: {
        ...destData,
        categories: {
          create: categoryIds.map((catId: number) => ({ categoryId: catId })),
        },
        images: {
          create: imageUrls.map((url, index) => ({
            imageUrl: url,
            isPrimary: index === safePrimaryIndex,
            displayOrder: index,
          })),
        },
      },
      include: {
        categories: {
          include: { category: true },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * 5. Cập nhật địa điểm
   */
  static async updateDestination(
    id: number,
    data: DestinationUpdateDto,
    newImageUrls: string[] = [],
    deletedImageIds: number[] = [],
    primaryImageId?: number
  ) {
    // Kiểm tra địa điểm tồn tại
    await this.getDestinationById(id);

    const { categoryIds, ...destData } = data;

    return prisma.$transaction(async (tx) => {
      // Cập nhật thông tin cơ bản
      if (Object.keys(destData).length > 0) {
        await tx.destination.update({
          where: { id },
          data: destData,
        });
      }

      // Nếu có cập nhật danh mục
      if (categoryIds && Array.isArray(categoryIds)) {
        await tx.destinationCategory.deleteMany({ where: { destinationId: id } });
        await tx.destinationCategory.createMany({
          data: categoryIds.map((catId: number) => ({
            destinationId: id,
            categoryId: catId,
          })),
        });
      }

      // 1. Xóa ảnh theo danh sách yêu cầu
      if (deletedImageIds.length > 0) {
        await tx.destinationImage.deleteMany({
          where: {
            id: { in: deletedImageIds },
            destinationId: id,
          },
        });
      }

      // 2. Nếu có upload thêm ảnh mới -> nối tiếp vào displayOrder
      if (newImageUrls.length > 0) {
        const lastImage = await tx.destinationImage.findFirst({
          where: { destinationId: id },
          orderBy: { displayOrder: 'desc' },
        });

        let nextOrder = lastImage ? lastImage.displayOrder + 1 : 0;

        await tx.destinationImage.createMany({
          data: newImageUrls.map((url) => ({
            destinationId: id,
            imageUrl: url,
            isPrimary: false,
            displayOrder: nextOrder++,
          })),
        });
      }

      // 3. Nếu có chỉ định ảnh chính
      if (primaryImageId) {
        await tx.destinationImage.updateMany({
          where: { destinationId: id },
          data: { isPrimary: false },
        });
        await tx.destinationImage.updateMany({
          where: { destinationId: id, id: primaryImageId },
          data: { isPrimary: true },
        });
      }

      // 4. Đảm bảo luôn có ít nhất 1 ảnh làm isPrimary nếu địa điểm có ảnh
      const allCurrentImages = await tx.destinationImage.findMany({
        where: { destinationId: id },
        orderBy: { displayOrder: 'asc' },
      });

      if (allCurrentImages.length > 0 && !allCurrentImages.some((img) => img.isPrimary)) {
        await tx.destinationImage.update({
          where: { id: allCurrentImages[0].id },
          data: { isPrimary: true },
        });
      }

      return tx.destination.findUnique({
        where: { id },
        include: {
          categories: { include: { category: true } },
          images: { orderBy: { displayOrder: 'asc' } },
        },
      });
    });
  }

  /**
   * Xóa 1 ảnh cụ thể của địa điểm
   */
  static async deleteImage(destinationId: number, imageId: number) {
    const image = await prisma.destinationImage.findFirst({
      where: { id: imageId, destinationId },
    });

    if (!image) {
      throw new AppError('Không tìm thấy hình ảnh này', HTTP_STATUS.NOT_FOUND);
    }

    await prisma.destinationImage.delete({ where: { id: imageId } });

    // Nếu ảnh vừa xóa là ảnh chính, chọn ảnh đầu tiên còn lại làm ảnh chính
    if (image.isPrimary) {
      const remainingImage = await prisma.destinationImage.findFirst({
        where: { destinationId },
        orderBy: { displayOrder: 'asc' },
      });
      if (remainingImage) {
        await prisma.destinationImage.update({
          where: { id: remainingImage.id },
          data: { isPrimary: true },
        });
      }
    }

    return { message: 'Đã xóa ảnh thành công' };
  }

  /**
   * Đặt 1 ảnh làm ảnh chính (Primary)
   */
  static async setPrimaryImage(destinationId: number, imageId: number) {
    const image = await prisma.destinationImage.findFirst({
      where: { id: imageId, destinationId },
    });

    if (!image) {
      throw new AppError('Không tìm thấy hình ảnh này', HTTP_STATUS.NOT_FOUND);
    }

    await prisma.$transaction([
      prisma.destinationImage.updateMany({
        where: { destinationId },
        data: { isPrimary: false },
      }),
      prisma.destinationImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    return { message: 'Đã đặt làm ảnh chính thành công' };
  }

  /**
   * 6. Chuyển đổi trạng thái Ẩn/Hiện địa điểm
   */
  static async toggleActiveStatus(id: number, isActive: boolean) {
    await this.getDestinationById(id);

    return prisma.destination.update({
      where: { id },
      data: { isActive },
      include: {
        categories: { include: { category: true } },
        images: true,
      },
    });
  }

  /**
   * 7. Xóa mềm địa điểm (isActive = false)
   */
  static async softDeleteDestination(id: number) {
    return this.toggleActiveStatus(id, false);
  }
}