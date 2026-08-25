import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import tripRoutes from './trip.routes';
import userRoutes from './user.routes';

const router = Router();

// Health check — endpoint duy nhất trong Core
// Feature routes sẽ được thêm vào đây khi thành viên hoàn thành feature của mình
// Ví dụ: router.use('/auth', authRoutes);
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Travel Platform API is running',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trips', tripRoutes);

export default router;
