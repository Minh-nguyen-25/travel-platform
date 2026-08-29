import { Router } from 'express';
import * as favoriteController from '../controllers/favorite.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  reviewDestinationIdParamsSchema,
  favoriteListQuerySchema,
} from '../validators/review.validator';

const favoriteRoutes = Router();
favoriteRoutes.use(authenticate);
favoriteRoutes.get(
  '/',
  validate(favoriteListQuerySchema, 'query'),
  favoriteController.getFavorites
);

export const destinationFavoriteRoutes = Router({ mergeParams: true });
destinationFavoriteRoutes.use(authenticate);
destinationFavoriteRoutes.get(
  '/',
  validate(reviewDestinationIdParamsSchema, 'params'),
  favoriteController.getFavoriteStatus
);
destinationFavoriteRoutes.post(
  '/',
  validate(reviewDestinationIdParamsSchema, 'params'),
  favoriteController.toggleFavorite
);

export default favoriteRoutes;
