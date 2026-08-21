import { Router, Request, Response } from 'express';

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

export default router;
