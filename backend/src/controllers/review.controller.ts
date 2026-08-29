import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { reviewService } from '../services/review.service';
import {
  AdminReviewListQuery,
  CreateReviewInput,
  ReviewListQuery,
  ReviewVisibilityInput,
  UpdateReviewInput,
} from '../types/review.types';
import { sendPaginated, sendSuccess } from '../utils/response.utils';

const destinationId = (req: Request): number => Number(req.params.destinationId);
const reviewId = (req: Request): number => Number(req.params.reviewId);
const imageId = (req: Request): number => Number(req.params.imageId);
const userId = (req: Request): number => req.user!.id;
const files = (req: Request): Express.Multer.File[] =>
  Array.isArray(req.files) ? req.files : [];

export const getDestinationReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await reviewService.getDestinationReviews(
    destinationId(req),
    req.query as unknown as ReviewListQuery
  );
  sendPaginated(res, result.data, result.pagination, 'Lấy danh sách đánh giá thành công');
};

export const getPublicReview = async (req: Request, res: Response): Promise<void> => {
  const review = await reviewService.getPublicReview(destinationId(req), reviewId(req));
  sendSuccess(res, review, 'Lấy chi tiết đánh giá thành công');
};

export const getMyReview = async (req: Request, res: Response): Promise<void> => {
  const review = await reviewService.getMyReview(userId(req), destinationId(req));
  sendSuccess(res, review, 'Lấy đánh giá của bạn thành công');
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  const review = await reviewService.createReview(
    userId(req),
    destinationId(req),
    req.body as CreateReviewInput,
    files(req)
  );
  sendSuccess(res, review, 'Tạo đánh giá thành công', HTTP_STATUS.CREATED);
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  const review = await reviewService.updateReview(
    userId(req),
    reviewId(req),
    req.body as UpdateReviewInput,
    files(req)
  );
  sendSuccess(res, review, 'Cập nhật đánh giá thành công');
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  const review = await reviewService.deleteReview(userId(req), reviewId(req));
  sendSuccess(res, review, 'Xóa đánh giá thành công');
};

export const deleteReviewImage = async (req: Request, res: Response): Promise<void> => {
  const review = await reviewService.deleteReviewImage(
    userId(req),
    reviewId(req),
    imageId(req)
  );
  sendSuccess(res, review, 'Xóa ảnh đánh giá thành công');
};

export const getAdminReviews = async (req: Request, res: Response): Promise<void> => {
  const result = await reviewService.getAdminReviews(
    req.query as unknown as AdminReviewListQuery
  );
  sendPaginated(
    res,
    result.data,
    result.pagination,
    'Lấy danh sách đánh giá quản trị thành công'
  );
};

export const setReviewVisibility = async (
  req: Request,
  res: Response
): Promise<void> => {
  const review = await reviewService.setReviewVisibility(
    reviewId(req),
    (req.body as ReviewVisibilityInput).isVisible
  );
  sendSuccess(
    res,
    review,
    review.isVisible ? 'Hiện đánh giá thành công' : 'Ẩn đánh giá thành công'
  );
};

export const deleteReviewAsAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const review = await reviewService.deleteReviewAsAdmin(reviewId(req));
  sendSuccess(res, review, 'Xóa đánh giá vi phạm thành công');
};
