import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { ROLE } from '../constants';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { uploadMultiple } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  adminReviewListQuerySchema,
  createReviewSchema,
  reviewDestinationIdParamsSchema,
  reviewIdParamsSchema,
  reviewImageParamsSchema,
  reviewListQuerySchema,
  reviewVisibilitySchema,
  updateReviewSchema,
} from '../validators/review.validator';

export const destinationReviewRoutes = Router({ mergeParams: true });

destinationReviewRoutes.get(
  '/',
  validate(reviewDestinationIdParamsSchema, 'params'),
  validate(reviewListQuerySchema, 'query'),
  reviewController.getDestinationReviews
);
destinationReviewRoutes.get(
  '/me',
  authenticate,
  validate(reviewDestinationIdParamsSchema, 'params'),
  reviewController.getMyReview
);
destinationReviewRoutes.post(
  '/',
  authenticate,
  validate(reviewDestinationIdParamsSchema, 'params'),
  uploadMultiple,
  validate(createReviewSchema),
  reviewController.createReview
);
destinationReviewRoutes.get(
  '/:reviewId',
  validate(
    reviewDestinationIdParamsSchema.extend(reviewIdParamsSchema.shape),
    'params'
  ),
  reviewController.getPublicReview
);

const reviewRoutes = Router();
reviewRoutes.use(authenticate);
reviewRoutes.patch(
  '/:reviewId',
  validate(reviewIdParamsSchema, 'params'),
  uploadMultiple,
  validate(updateReviewSchema),
  reviewController.updateReview
);
reviewRoutes.delete(
  '/:reviewId/images/:imageId',
  validate(reviewImageParamsSchema, 'params'),
  reviewController.deleteReviewImage
);
reviewRoutes.delete(
  '/:reviewId',
  validate(reviewIdParamsSchema, 'params'),
  reviewController.deleteReview
);

export const adminReviewRoutes = Router();
adminReviewRoutes.use(authenticate, requireRole(ROLE.ADMIN));
adminReviewRoutes.get(
  '/',
  validate(adminReviewListQuerySchema, 'query'),
  reviewController.getAdminReviews
);
adminReviewRoutes.patch(
  '/:reviewId/visibility',
  validate(reviewIdParamsSchema, 'params'),
  validate(reviewVisibilitySchema),
  reviewController.setReviewVisibility
);
adminReviewRoutes.delete(
  '/:reviewId',
  validate(reviewIdParamsSchema, 'params'),
  reviewController.deleteReviewAsAdmin
);

export default reviewRoutes;
