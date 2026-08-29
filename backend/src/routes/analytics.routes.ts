import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { ROLE } from '../constants';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { analyticsOverviewQuerySchema } from '../validators/analytics.validator';

const router = Router();

router.use(authenticate, requireRole(ROLE.ADMIN));
router.get(
  '/overview',
  validate(analyticsOverviewQuerySchema, 'query'),
  analyticsController.getOverview
);

export default router;
