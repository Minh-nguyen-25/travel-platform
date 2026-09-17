import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { ROLE } from '../constants';

const router = Router();

// ─── Public Routes ─────────────────────────────────────────────────────────
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// ─── Admin Routes ──────────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  requireRole(ROLE.ADMIN),
  CategoryController.create
);

router.put(
  '/:id',
  authenticate,
  requireRole(ROLE.ADMIN),
  CategoryController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRole(ROLE.ADMIN),
  CategoryController.delete
);

export default router;