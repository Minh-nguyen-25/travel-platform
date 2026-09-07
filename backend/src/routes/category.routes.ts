import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { ROLE } from '../constants';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  categoryIdParamsSchema,
  categoryListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validators/destination.validator';

const categoryRoutes = Router();

categoryRoutes.get(
  '/',
  validate(categoryListQuerySchema, 'query'),
  categoryController.getCategories
);
categoryRoutes.get(
  '/:categoryId',
  validate(categoryIdParamsSchema, 'params'),
  categoryController.getCategory
);

export const adminCategoryRoutes = Router();

adminCategoryRoutes.use(authenticate, requireRole(ROLE.ADMIN));
adminCategoryRoutes.get(
  '/',
  validate(categoryListQuerySchema, 'query'),
  categoryController.getCategories
);
adminCategoryRoutes.post(
  '/',
  validate(createCategorySchema),
  categoryController.createCategory
);
adminCategoryRoutes.get(
  '/:categoryId',
  validate(categoryIdParamsSchema, 'params'),
  categoryController.getCategory
);
adminCategoryRoutes.patch(
  '/:categoryId',
  validate(categoryIdParamsSchema, 'params'),
  validate(updateCategorySchema),
  categoryController.updateCategory
);
adminCategoryRoutes.delete(
  '/:categoryId',
  validate(categoryIdParamsSchema, 'params'),
  categoryController.deleteCategory
);

export default categoryRoutes;
