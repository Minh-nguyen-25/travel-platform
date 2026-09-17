import { Router } from 'express';
import { DestinationController } from '../controllers/destination.controller';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { ROLE } from '../constants';

const router = Router();

// ─── Public Routes (Ai cũng có thể truy cập) ───────────────────────────────
router.get('/', DestinationController.getAll);
router.get('/top-rated', DestinationController.getTopRated);
router.get('/:id', DestinationController.getById);

// ─── Admin Routes (Yêu cầu đăng nhập và có role ADMIN) ──────────────────────
router.post(
  '/',
  authenticate,
  requireRole(ROLE.ADMIN),
  uploadMiddleware.array('images', 20),
  DestinationController.create
);

router.put(
  '/:id',
  authenticate,
  requireRole(ROLE.ADMIN),
  uploadMiddleware.array('images', 20),
  DestinationController.update
);

// Quản lý ảnh riêng lẻ cho Địa điểm
router.delete(
  '/:id/images/:imageId',
  authenticate,
  requireRole(ROLE.ADMIN),
  DestinationController.deleteImage
);

router.patch(
  '/:id/images/:imageId/primary',
  authenticate,
  requireRole(ROLE.ADMIN),
  DestinationController.setPrimaryImage
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole(ROLE.ADMIN),
  DestinationController.toggleStatus
);

router.delete(
  '/:id',
  authenticate,
  requireRole(ROLE.ADMIN),
  DestinationController.softDelete
);

export default router;