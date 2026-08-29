import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  userConcurrencyLimit,
  userRateLimit,
} from '../middlewares/rateLimit.middleware';
import { generateItinerarySchema } from '../validators/ai.validator';

const router = Router();

router.use(authenticate);
router.use(userRateLimit({ namespace: 'ai', maxRequests: 6, windowMs: 10 * 60_000 }));
router.use(userConcurrencyLimit({ maxGlobal: 4, maxPerUser: 1 }));
router.post(
  '/generate-itinerary',
  validate(generateItinerarySchema),
  aiController.generateItinerary
);

export default router;
