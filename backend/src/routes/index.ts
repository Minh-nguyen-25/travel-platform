import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import tripRoutes from './trip.routes';
import userRoutes, { adminUserRoutes } from './user.routes';
import preferenceRoutes from './preference.routes';
import analyticsRoutes from './analytics.routes';
import mapRoutes from './map.routes';
import aiRoutes from './ai.routes';
import destinationRoutes, { adminDestinationRoutes } from './destination.routes';
import categoryRoutes, { adminCategoryRoutes } from './category.routes';
import reviewRoutes, {
  adminReviewRoutes,
  destinationReviewRoutes,
} from './review.routes';
import favoriteRoutes, { destinationFavoriteRoutes } from './favorite.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Travel Platform API is running',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trips', tripRoutes);
router.use('/travel-preferences', preferenceRoutes);
router.use('/admin/analytics', analyticsRoutes);
router.use('/maps', mapRoutes);
router.use('/ai', aiRoutes);
router.use('/destinations/:destinationId/reviews', destinationReviewRoutes);
router.use('/destinations/:destinationId/favorite', destinationFavoriteRoutes);
router.use('/destinations/:destinationId/favorites', destinationFavoriteRoutes);
router.use('/destinations', destinationRoutes);
router.use('/categories', categoryRoutes);
router.use('/reviews', reviewRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/admin/destinations', adminDestinationRoutes);
router.use('/admin/categories', adminCategoryRoutes);
router.use('/admin/reviews', adminReviewRoutes);
router.use('/admin/users', adminUserRoutes);

export default router;
