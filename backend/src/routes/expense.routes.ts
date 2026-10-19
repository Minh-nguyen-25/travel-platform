import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.middleware';
import { expenseSchema, expenseService, paymentSchema } from '../services/expense.service';
import { sendSuccess } from '../utils/response.utils';

const router = Router({ mergeParams: true });
const id = z.coerce.number().int().positive();
const tripParams = z.object({ tripId: id });
const expenseParams = tripParams.extend({ expenseId: id });
const paymentParams = expenseParams.extend({ paymentId: id });
router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
router.get('/', validate(tripParams, 'params'), async (req, res) => {
  sendSuccess(res, await expenseService.list(req.user!.id, Number(req.params.tripId)));
});
router.post('/', validate(tripParams, 'params'), validate(expenseSchema), async (req, res) => {
  sendSuccess(res, await expenseService.create(req.user!.id, Number(req.params.tripId), req.body));
});
router.patch('/:expenseId', validate(expenseParams, 'params'), validate(expenseSchema), async (req, res) => {
  sendSuccess(res, await expenseService.update(req.user!.id, Number(req.params.tripId), Number(req.params.expenseId), req.body));
});
router.delete('/:expenseId', validate(expenseParams, 'params'), async (req, res) => {
  await expenseService.remove(req.user!.id, Number(req.params.tripId), Number(req.params.expenseId));
  sendSuccess(res, null);
});
router.post('/:expenseId/payments', validate(expenseParams, 'params'), validate(paymentSchema), async (req, res) => {
  sendSuccess(res, await expenseService.pay(req.user!.id, Number(req.params.tripId), Number(req.params.expenseId), req.body));
});
router.delete('/:expenseId/payments/:paymentId', validate(paymentParams, 'params'), async (req, res) => {
  await expenseService.removePayment(req.user!.id, Number(req.params.tripId), Number(req.params.expenseId), Number(req.params.paymentId));
  sendSuccess(res, null);
});
export default router;
