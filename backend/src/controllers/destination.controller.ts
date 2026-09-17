import { Request, Response } from 'express';
import { DestinationService } from '../services/destination.service';
import {
  destinationSchema,
  destinationUpdateSchema,
  destinationFilterQuerySchema,
  destinationStatusSchema,
} from '../validators/destination.validator';
import { uploadToCloudinary } from '../config/cloudinary';
import { sendSuccess, sendPaginated } from '../utils/response.utils';
import { HTTP_STATUS } from '../constants';

export class DestinationController {
  /**
   * 1. Lấy danh sách địa điểm (kèm lọc đa tiêu chí và phân trang)
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    const validatedQuery = destinationFilterQuerySchema.parse(req.query);
    const result = await DestinationService.getDestinations(validatedQuery);

    sendPaginated(
      res,
      result.destinations,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      'Lấy danh sách địa điểm thành công'
    );
  }

  /**
   * 2. Lấy top địa điểm đánh giá cao nhất (cho trang chủ)
   */
  static async getTopRated(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 6;
    const destinations = await DestinationService.getTopRatedDestinations(limit);

    sendSuccess(res, destinations, 'Lấy danh sách top địa điểm đánh giá cao thành công');
  }

  /**
   * 3. Lấy chi tiết 1 địa điểm
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const destination = await DestinationService.getDestinationById(id);

    sendSuccess(res, destination, 'Lấy thông tin địa điểm thành công');
  }

  /**
   * 4. Tạo mới địa điểm (kèm upload nhiều ảnh)
   */
  static async create(req: Request, res: Response): Promise<void> {
    const validatedData = destinationSchema.parse(req.body);

    const files = req.files as Express.Multer.File[] | undefined;
    const imageUrls: string[] = [];

    // Nếu người dùng có gửi ảnh dạng URL trực tiếp
    if (req.body.imageUrls) {
      if (Array.isArray(req.body.imageUrls)) {
        imageUrls.push(...req.body.imageUrls);
      } else if (typeof req.body.imageUrls === 'string') {
        try {
          const parsed = JSON.parse(req.body.imageUrls);
          if (Array.isArray(parsed)) imageUrls.push(...parsed);
          else imageUrls.push(req.body.imageUrls);
        } catch {
          imageUrls.push(req.body.imageUrls);
        }
      }
    }

    // Upload các file từ Multer (lên Cloudinary hoặc Local Storage nếu chưa có key)
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer, 'destinations', file.originalname);
        return result.secure_url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      imageUrls.push(...uploadedUrls);
    }

    const primaryIndex = req.body.primaryIndex !== undefined ? Number(req.body.primaryIndex) : 0;
    const destination = await DestinationService.createDestination(validatedData, imageUrls, primaryIndex);
    sendSuccess(res, destination, 'Tạo địa điểm thành công', HTTP_STATUS.CREATED);
  }

  /**
   * 5. Cập nhật thông tin địa điểm
   */
  static async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const validatedData = destinationUpdateSchema.parse(req.body);

    const files = req.files as Express.Multer.File[] | undefined;
    const newImageUrls: string[] = [];

    // Hỗ trợ thêm ảnh dạng URL
    if (req.body.imageUrls) {
      if (Array.isArray(req.body.imageUrls)) {
        newImageUrls.push(...req.body.imageUrls);
      } else if (typeof req.body.imageUrls === 'string') {
        try {
          const parsed = JSON.parse(req.body.imageUrls);
          if (Array.isArray(parsed)) newImageUrls.push(...parsed);
          else if (parsed) newImageUrls.push(String(parsed));
        } catch {
          newImageUrls.push(req.body.imageUrls);
        }
      }
    }

    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer, 'destinations', file.originalname);
        return result.secure_url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      newImageUrls.push(...uploadedUrls);
    }

    // Danh sách id ảnh cần xóa
    let deletedImageIds: number[] = [];
    if (req.body.deletedImageIds) {
      if (Array.isArray(req.body.deletedImageIds)) {
        deletedImageIds = req.body.deletedImageIds.map(Number).filter((n: number) => !isNaN(n));
      } else if (typeof req.body.deletedImageIds === 'string') {
        try {
          const parsed = JSON.parse(req.body.deletedImageIds);
          if (Array.isArray(parsed)) deletedImageIds = parsed.map(Number).filter((n: number) => !isNaN(n));
          else deletedImageIds = req.body.deletedImageIds.split(',').map(Number).filter((n: number) => !isNaN(n));
        } catch {
          deletedImageIds = req.body.deletedImageIds.split(',').map(Number).filter((n: number) => !isNaN(n));
        }
      }
    }

    const primaryImageId = req.body.primaryImageId ? Number(req.body.primaryImageId) : undefined;

    const destination = await DestinationService.updateDestination(
      id,
      validatedData,
      newImageUrls,
      deletedImageIds,
      primaryImageId
    );
    sendSuccess(res, destination, 'Cập nhật địa điểm thành công');
  }

  /**
   * Xóa 1 ảnh của địa điểm
   */
  static async deleteImage(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const imageId = Number(req.params.imageId);
    const result = await DestinationService.deleteImage(id, imageId);
    sendSuccess(res, result, 'Đã xóa ảnh thành công');
  }

  /**
   * Đặt 1 ảnh làm ảnh chính
   */
  static async setPrimaryImage(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const imageId = Number(req.params.imageId);
    const result = await DestinationService.setPrimaryImage(id, imageId);
    sendSuccess(res, result, 'Đã đặt làm ảnh chính thành công');
  }

  /**
   * 6. Chuyển đổi trạng thái Ẩn/Hiện địa điểm
   */
  static async toggleStatus(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const { isActive } = destinationStatusSchema.parse(req.body);

    const destination = await DestinationService.toggleActiveStatus(id, isActive);
    sendSuccess(res, destination, isActive ? 'Đã hiển thị địa điểm thành công' : 'Đã ẩn địa điểm thành công');
  }

  /**
   * 7. Xóa mềm (Ẩn địa điểm)
   */
  static async softDelete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    await DestinationService.softDeleteDestination(id);

    sendSuccess(res, null, 'Đã ẩn địa điểm thành công');
  }
}