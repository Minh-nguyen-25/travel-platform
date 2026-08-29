import { Prisma } from '@prisma/client';
import { HTTP_STATUS } from '../constants';
import { destinationRepository } from '../repositories/destination.repository';
import { ReviewRecord, reviewRepository } from '../repositories/review.repository';
import {
  AdminReviewListQuery,
  CreateReviewInput,
  ReviewListQuery,
  ReviewResponse,
  UpdateReviewInput,
} from '../types/review.types';
import { AppError } from '../utils/app-error';
import {
  deleteCloudinaryImageByUrl,
  deleteUploadedImages,
  uploadImagesToCloudinary,
} from './upload.service';

const REVIEW_NOT_FOUND = 'Không tìm thấy đánh giá';
const DESTINATION_NOT_FOUND = 'Không tìm thấy địa điểm';
const MAX_REVIEW_IMAGES = 5;

const isPrismaError = (error: unknown, code: string): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;

export const serializeReview = (review: ReviewRecord): ReviewResponse => ({
  id: review.id,
  userId: review.userId,
  destinationId: review.destinationId,
  rating: review.rating,
  comment: review.comment,
  isVisible: review.isVisible,
  user: review.user,
  destination: review.destination,
  images: review.images.map((image) => ({
    id: image.id,
    imageUrl: image.imageUrl,
    createdAt: image.createdAt.toISOString(),
  })),
  createdAt: review.createdAt.toISOString(),
  updatedAt: review.updatedAt.toISOString(),
});

const assertActiveDestination = async (destinationId: number): Promise<void> => {
  const destination = await destinationRepository.findById(destinationId, true);
  if (!destination) {
    throw new AppError(DESTINATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
};

const assertOwner = (review: ReviewRecord, userId: number): void => {
  if (review.userId !== userId) {
    throw new AppError('Bạn không có quyền chỉnh sửa đánh giá này', HTTP_STATUS.FORBIDDEN);
  }
};

const uploadReviewImages = async (files: Express.Multer.File[]) => {
  if (files.length === 0) return [];

  try {
    return await uploadImagesToCloudinary(files, 'reviews');
  } catch (error) {
    console.error('[Cloudinary] Upload review images failed:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Không thể upload ảnh đánh giá lên Cloudinary', HTTP_STATUS.BAD_GATEWAY);
  }
};

const cleanupRemoteImages = async (imageUrls: string[]): Promise<void> => {
  const results = await Promise.allSettled(imageUrls.map(deleteCloudinaryImageByUrl));
  if (results.some(({ status }) => status === 'rejected')) {
    console.warn('[Cloudinary] Review was changed but some remote images could not be deleted');
  }
};

const pagination = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export const reviewService = {
  async getDestinationReviews(destinationId: number, query: ReviewListQuery) {
    await assertActiveDestination(destinationId);
    const result = await reviewRepository.findPublicByDestination(destinationId, query);

    return {
      data: result.data.map(serializeReview),
      pagination: pagination(query.page, query.limit, result.total),
    };
  },

  async getPublicReview(destinationId: number, reviewId: number): Promise<ReviewResponse> {
    await assertActiveDestination(destinationId);
    const review = await reviewRepository.findById(reviewId);
    if (!review || review.destinationId !== destinationId || !review.isVisible) {
      throw new AppError(REVIEW_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return serializeReview(review);
  },

  async getMyReview(userId: number, destinationId: number): Promise<ReviewResponse> {
    await assertActiveDestination(destinationId);
    const review = await reviewRepository.findByUserAndDestination(userId, destinationId);
    if (!review) throw new AppError(REVIEW_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    return serializeReview(review);
  },

  async createReview(
    userId: number,
    destinationId: number,
    input: CreateReviewInput,
    files: Express.Multer.File[] = []
  ): Promise<ReviewResponse> {
    await assertActiveDestination(destinationId);
    const existing = await reviewRepository.findByUserAndDestination(userId, destinationId);
    if (existing) {
      throw new AppError(
        'Mỗi người dùng chỉ được đánh giá một lần cho mỗi địa điểm',
        HTTP_STATUS.CONFLICT
      );
    }

    const uploadedImages = await uploadReviewImages(files);
    try {
      const review = await reviewRepository.create(
        userId,
        destinationId,
        input,
        uploadedImages.map(({ imageUrl }) => imageUrl)
      );
      return serializeReview(review);
    } catch (error) {
      await deleteUploadedImages(uploadedImages);
      if (isPrismaError(error, 'P2002')) {
        throw new AppError(
          'Mỗi người dùng chỉ được đánh giá một lần cho mỗi địa điểm',
          HTTP_STATUS.CONFLICT
        );
      }
      throw error;
    }
  },

  async updateReview(
    userId: number,
    reviewId: number,
    input: UpdateReviewInput,
    files: Express.Multer.File[] = []
  ): Promise<ReviewResponse> {
    const existing = await reviewRepository.findById(reviewId);
    if (!existing) throw new AppError(REVIEW_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    assertOwner(existing, userId);

    if (Object.keys(input).length === 0 && files.length === 0) {
      throw new AppError(
        'Cần cung cấp điểm, nội dung hoặc ảnh để cập nhật đánh giá',
        HTTP_STATUS.UNPROCESSABLE
      );
    }
    if (existing.images.length + files.length > MAX_REVIEW_IMAGES) {
      throw new AppError(
        `Mỗi đánh giá chỉ được có tối đa ${MAX_REVIEW_IMAGES} ảnh`,
        HTTP_STATUS.UNPROCESSABLE
      );
    }

    const uploadedImages = await uploadReviewImages(files);
    try {
      return serializeReview(
        await reviewRepository.update(
          reviewId,
          input,
          uploadedImages.map(({ imageUrl }) => imageUrl)
        )
      );
    } catch (error) {
      await deleteUploadedImages(uploadedImages);
      throw error;
    }
  },

  async deleteReview(userId: number, reviewId: number): Promise<ReviewResponse> {
    const existing = await reviewRepository.findById(reviewId);
    if (!existing) throw new AppError(REVIEW_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    assertOwner(existing, userId);

    const result = await reviewRepository.delete(reviewId);
    await cleanupRemoteImages(result.imageUrls);
    return serializeReview(result.review);
  },

  async deleteReviewImage(
    userId: number,
    reviewId: number,
    imageId: number
  ): Promise<ReviewResponse> {
    const existing = await reviewRepository.findById(reviewId);
    if (!existing) throw new AppError(REVIEW_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    assertOwner(existing, userId);

    try {
      const result = await reviewRepository.deleteImage(reviewId, imageId);
      await cleanupRemoteImages([result.imageUrl]);
      return serializeReview(result.review);
    } catch (error) {
      if (error instanceof Error && error.message === 'REVIEW_IMAGE_NOT_FOUND') {
        throw new AppError('Không tìm thấy ảnh của đánh giá', HTTP_STATUS.NOT_FOUND);
      }
      throw error;
    }
  },

  async getAdminReviews(query: AdminReviewListQuery) {
    const result = await reviewRepository.findAdmin(query);
    return {
      data: result.data.map(serializeReview),
      pagination: pagination(query.page, query.limit, result.total),
    };
  },

  async setReviewVisibility(reviewId: number, isVisible: boolean): Promise<ReviewResponse> {
    const existing = await reviewRepository.findById(reviewId);
    if (!existing) throw new AppError(REVIEW_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (existing.isVisible === isVisible) return serializeReview(existing);

    return serializeReview(await reviewRepository.setVisibility(reviewId, isVisible));
  },

  async deleteReviewAsAdmin(reviewId: number): Promise<ReviewResponse> {
    const existing = await reviewRepository.findById(reviewId);
    if (!existing) throw new AppError(REVIEW_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const result = await reviewRepository.delete(reviewId);
    await cleanupRemoteImages(result.imageUrls);
    return serializeReview(result.review);
  },
};
