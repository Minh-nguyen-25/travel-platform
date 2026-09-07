import { HTTP_STATUS } from '../constants';
import {
  DestinationRecord,
  destinationRepository,
} from '../repositories/destination.repository';
import {
  CreateDestinationInput,
  DestinationListQuery,
  DestinationResponse,
  UpdateDestinationInput,
  UploadedDestinationImage,
} from '../types/destination.types';
import { AppError } from '../utils/app-error';
import { toSlug } from '../utils/slug.utils';
import {
  deleteCloudinaryImageByUrl,
  deleteUploadedImages,
  uploadImagesToCloudinary,
} from './upload.service';


const DESTINATION_NOT_FOUND = 'Không tìm thấy địa điểm';

export const serializeDestination = (
  destination: DestinationRecord
): DestinationResponse => ({
  id: destination.id,
  name: destination.name,
  description: destination.description,
  address: destination.address,
  phoneNumber: destination.phoneNumber,
  latitude: destination.latitude.toFixed(7),
  longitude: destination.longitude.toFixed(7),
  ticketPrice: destination.ticketPrice.toFixed(2),
  openingHoursNote: destination.openingHoursNote,
  visitDuration: destination.visitDuration,
  rating: destination.rating.toFixed(1),
  isActive: destination.isActive,
  categories: destination.categories.map(({ category }) => ({
    id: category.id,
    name: category.name,
    description: category.description,
  })),
  images: destination.images.map((image) => ({
    id: image.id,
    imageUrl: image.imageUrl,
    isPrimary: image.isPrimary,
    displayOrder: image.displayOrder,
    createdAt: image.createdAt.toISOString(),
  })),
  createdAt: destination.createdAt.toISOString(),
  updatedAt: destination.updatedAt.toISOString(),
});

const assertCategoryIdsExist = async (categoryIds: number[]): Promise<void> => {
  const existingIds = await destinationRepository.findExistingCategoryIds(categoryIds);
  const existingIdSet = new Set(existingIds);
  const missingIds = categoryIds.filter((id) => !existingIdSet.has(id));

  if (missingIds.length > 0) {
    throw new AppError(
      `Không tìm thấy danh mục có ID: ${missingIds.join(', ')}`,
      HTTP_STATUS.UNPROCESSABLE
    );
  }
};

const assertPrimaryImageIndex = (
  files: Express.Multer.File[],
  primaryImageIndex?: number
): void => {
  if (primaryImageIndex === undefined) return;
  if (files.length === 0 || primaryImageIndex >= files.length) {
    throw new AppError(
      'primaryImageIndex phải trỏ tới một ảnh trong danh sách upload',
      HTTP_STATUS.UNPROCESSABLE
    );
  }
};

const uploadImages = async (
  files: Express.Multer.File[],
  destinationName?: string
): Promise<UploadedDestinationImage[]> => {
  if (files.length === 0) return [];

  const folder = destinationName
    ? `destinations/${toSlug(destinationName)}`
    : 'destinations';

  try {
    return await uploadImagesToCloudinary(files, folder);
  } catch (error) {
    console.error('[Cloudinary] Upload destination images failed:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Không thể upload ảnh lên Cloudinary', HTTP_STATUS.BAD_GATEWAY);
  }
};

const persistWithUploadRollback = async <T>(
  uploadedImages: UploadedDestinationImage[],
  action: () => Promise<T>
): Promise<T> => {
  try {
    return await action();
  } catch (error) {
    await deleteUploadedImages(uploadedImages);
    throw error;
  }
};

export const destinationService = {
  async getDestinations(query: DestinationListQuery, publicOnly = true) {
    const result = await destinationRepository.findMany(query, publicOnly);
    return {
      data: result.data.map(serializeDestination),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async getDestination(id: number, publicOnly = true): Promise<DestinationResponse> {
    const destination = await destinationRepository.findById(id, publicOnly);
    if (!destination) {
      throw new AppError(DESTINATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return serializeDestination(destination);
  },

  async createDestination(
    input: CreateDestinationInput,
    files: Express.Multer.File[] = [],
    primaryImageIndex?: number
  ): Promise<DestinationResponse> {
    assertPrimaryImageIndex(files, primaryImageIndex);
    await assertCategoryIdsExist(input.categoryIds);
    const uploadedImages = await uploadImages(files, input.name);
    const destination = await persistWithUploadRollback(uploadedImages, () =>
      destinationRepository.create(input, uploadedImages, primaryImageIndex)
    );

    return serializeDestination(destination);
  },

  async updateDestination(
    id: number,
    input: UpdateDestinationInput,
    files: Express.Multer.File[] = [],
    primaryImageIndex?: number
  ): Promise<DestinationResponse> {
    const existing = await destinationRepository.findById(id);
    if (!existing) {
      throw new AppError(DESTINATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    if (Object.keys(input).length === 0 && files.length === 0) {
      throw new AppError(
        'Cần cung cấp ít nhất một trường hoặc một ảnh để cập nhật',
        HTTP_STATUS.UNPROCESSABLE
      );
    }

    assertPrimaryImageIndex(files, primaryImageIndex);
    if (input.categoryIds) await assertCategoryIdsExist(input.categoryIds);

    const uploadedImages = await uploadImages(files, input.name ?? existing.name);
    const destination = await persistWithUploadRollback(uploadedImages, () =>
      destinationRepository.update(id, input, uploadedImages, primaryImageIndex)
    );

    return serializeDestination(destination);
  },

  async softDeleteDestination(id: number): Promise<DestinationResponse> {
    const existing = await destinationRepository.findById(id);
    if (!existing) {
      throw new AppError(DESTINATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    if (!existing.isActive) return serializeDestination(existing);

    return serializeDestination(await destinationRepository.softDelete(id));
  },

  async uploadDestinationImages(
    id: number,
    files: Express.Multer.File[],
    primaryImageIndex?: number
  ): Promise<DestinationResponse> {
    const existing = await destinationRepository.findById(id);
    if (!existing) {
      throw new AppError(DESTINATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    if (files.length === 0) {
      throw new AppError('Cần chọn ít nhất một ảnh để upload', HTTP_STATUS.BAD_REQUEST);
    }

    assertPrimaryImageIndex(files, primaryImageIndex);
    const uploadedImages = await uploadImages(files, existing.name);
    const destination = await persistWithUploadRollback(uploadedImages, () =>
      destinationRepository.update(id, {}, uploadedImages, primaryImageIndex)
    );

    return serializeDestination(destination);
  },


  async deleteDestinationImage(
    destinationId: number,
    imageId: number
  ): Promise<DestinationResponse> {
    const existing = await destinationRepository.findById(destinationId);
    if (!existing) {
      throw new AppError(DESTINATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    try {
      const result = await destinationRepository.deleteImage(destinationId, imageId);
      try {
        await deleteCloudinaryImageByUrl(result.imageUrl);
      } catch (error) {
        console.warn('[Cloudinary] Database image was deleted but remote cleanup failed:', error);
      }
      return serializeDestination(result.destination);
    } catch (error) {
      if (error instanceof Error && error.message === 'DESTINATION_IMAGE_NOT_FOUND') {
        throw new AppError('Không tìm thấy ảnh của địa điểm', HTTP_STATUS.NOT_FOUND);
      }
      throw error;
    }
  },

  async setPrimaryImage(destinationId: number, imageId: number): Promise<DestinationResponse> {
    const existing = await destinationRepository.findById(destinationId);
    if (!existing) {
      throw new AppError(DESTINATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    try {
      return serializeDestination(
        await destinationRepository.setPrimaryImage(destinationId, imageId)
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'DESTINATION_IMAGE_NOT_FOUND') {
        throw new AppError('Không tìm thấy ảnh của địa điểm', HTTP_STATUS.NOT_FOUND);
      }
      throw error;
    }
  },
};
