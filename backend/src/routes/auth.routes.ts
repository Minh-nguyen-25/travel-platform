import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc').max(128, 'Mật khẩu quá dài'),
});

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

export default router;
