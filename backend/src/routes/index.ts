import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import destinationRoutes from './destination.routes';
import categoryRoutes from './category.routes';

const router = Router();

// ─── Health check ─────────────────────────────────────────────────────────────
// Public endpoint — intentionally NOT protected so infrastructure probes work.
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

// ─── Feature routes ───────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/categories', categoryRoutes);

export default router;
