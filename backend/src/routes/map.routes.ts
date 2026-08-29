import { Router } from 'express';
import * as mapController from '../controllers/map.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  userConcurrencyLimit,
  userRateLimit,
} from '../middlewares/rateLimit.middleware';
import {
  distanceRequestSchema,
  routeMatrixRequestSchema,
  routeRequestSchema,
} from '../validators/map.validator';

const router = Router();

router.use(authenticate);
router.use(userRateLimit({ namespace: 'maps', maxRequests: 60, windowMs: 60_000 }));
router.use(userConcurrencyLimit({ maxGlobal: 8, maxPerUser: 2 }));
router.post('/distance', validate(distanceRequestSchema), mapController.calculateDistance);
router.post('/route', validate(routeRequestSchema), mapController.calculateRoute);
router.post('/matrix', validate(routeMatrixRequestSchema), mapController.calculateMatrix);

export default router;
