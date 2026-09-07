import { Router } from 'express';
import * as destinationController from '../controllers/destination.controller';
import { ROLE } from '../constants';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { uploadMultiple } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  adminDestinationListQuerySchema,
  createDestinationSchema,
  destinationIdParamsSchema,
  destinationImageParamsSchema,
  destinationListQuerySchema,
  updateDestinationSchema,
  uploadDestinationImagesSchema,
} from '../validators/destination.validator';

const destinationRoutes = Router();

destinationRoutes.get(
  '/',
  validate(destinationListQuerySchema, 'query'),
  destinationController.getDestinations
);
destinationRoutes.get(
  '/:destinationId',
  validate(destinationIdParamsSchema, 'params'),
  destinationController.getDestination
);

export const adminDestinationRoutes = Router();

adminDestinationRoutes.use(authenticate, requireRole(ROLE.ADMIN));
adminDestinationRoutes.get(
  '/',
  validate(adminDestinationListQuerySchema, 'query'),
  destinationController.getAdminDestinations
);
adminDestinationRoutes.post(
  '/',
  uploadMultiple,
  validate(createDestinationSchema),
  destinationController.createDestination
);
adminDestinationRoutes.get(
  '/:destinationId',
  validate(destinationIdParamsSchema, 'params'),
  destinationController.getAdminDestination
);
adminDestinationRoutes.patch(
  '/:destinationId',
  validate(destinationIdParamsSchema, 'params'),
  uploadMultiple,
  validate(updateDestinationSchema),
  destinationController.updateDestination
);
adminDestinationRoutes.delete(
  '/:destinationId',
  validate(destinationIdParamsSchema, 'params'),
  destinationController.deleteDestination
);
adminDestinationRoutes.post(
  '/:destinationId/images',
  validate(destinationIdParamsSchema, 'params'),
  uploadMultiple,
  validate(uploadDestinationImagesSchema),
  destinationController.uploadDestinationImages
);
adminDestinationRoutes.delete(
  '/:destinationId/images/:imageId',
  validate(destinationImageParamsSchema, 'params'),
  destinationController.deleteDestinationImage
);
adminDestinationRoutes.patch(
  '/:destinationId/images/:imageId/primary',
  validate(destinationImageParamsSchema, 'params'),
  destinationController.setPrimaryImage
);

export default destinationRoutes;
