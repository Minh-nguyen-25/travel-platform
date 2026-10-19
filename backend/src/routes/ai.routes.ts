import { Router } from 'express';
import { z } from 'zod';
import { conversationService } from '../services/conversation.service';
import { sendSuccess } from '../utils/response.utils';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  userConcurrencyLimit,
  userRateLimit,
} from '../middlewares/rateLimit.middleware';
import { chatSchema, generateItinerarySchema } from '../validators/ai.validator';

const router = Router();

router.use(authenticate);
router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
const conversationParams = z.object({ conversationId: z.string().uuid() });
router.get('/conversations', async (req, res) => {
  sendSuccess(res, await conversationService.list(req.user!.id));
});
router.get('/conversations/:conversationId', validate(conversationParams, 'params'), async (req, res) => {
  sendSuccess(res, await conversationService.get(req.user!.id, String(req.params.conversationId)));
});
router.delete('/conversations/:conversationId', validate(conversationParams, 'params'), async (req, res) => {
  await conversationService.remove(req.user!.id, String(req.params.conversationId));
  sendSuccess(res, null, 'Conversation deleted');
});
router.use(userRateLimit({ namespace: 'ai', maxRequests: 6, windowMs: 10 * 60_000 }));
router.use(userConcurrencyLimit({ maxGlobal: 4, maxPerUser: 1 }));
router.post('/chat', validate(chatSchema), aiController.chat);
router.post(
  '/generate-itinerary',
  validate(generateItinerarySchema),
  aiController.generateItinerary
);

export default router;
