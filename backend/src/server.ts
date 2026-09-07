// ─── FIRST IMPORT: env validation + dotenv loading ────────────────────────────
// Must precede all other imports so process.env is populated and validated
// before any module reads it. Exits with code 1 if required vars are missing.
import env from './config/env';

import app from './app';
import { cloudinaryConfigurationStatus } from './config/cloudinary';
import prisma from './config/db';
import redisClient, { disconnectRedis } from './config/redis';

// ─── Graceful shutdown ─────────────────────────────────────────────────────────
// Track whether shutdown is already in progress to disconnect exactly once.
let isShuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n⚠️  Nhận tín hiệu ${signal} — đang tắt server...`);
  try {
    await prisma.$disconnect();
    console.log('✅ Database đã ngắt kết nối');

    await disconnectRedis();
    // disconnectRedis logs its own confirmation message

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi trong quá trình tắt server:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ─── Startup ──────────────────────────────────────────────────────────────────
const start = async (): Promise<void> => {
  // Verify Database connectivity
  await prisma.$connect();
  console.log('✅ Kết nối Database thành công');

  if (cloudinaryConfigurationStatus.configured) {
    console.log(`✅ Cloudinary đã cấu hình qua ${cloudinaryConfigurationStatus.source}`);
  } else {
    console.warn(
      `⚠️  Cloudinary chưa được cấu hình (${cloudinaryConfigurationStatus.invalidKeys.join(', ')}). `
      + 'Chức năng upload ảnh sẽ tạm thời không hoạt động.'
    );
  }

  // Verify Redis connectivity (lazyConnect=true means we must connect explicitly)
  await redisClient.connect();
  await redisClient.ping();
  // Connection event handler in redis.ts logs '✅ Kết nối Redis thành công'

  app.listen(Number(env.PORT), () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${env.PORT}`);
    console.log(`📋 Health check: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`📊 Prisma Studio: chạy "npm run db:studio"`);
  });
};

start().catch(async (err) => {
  console.error('❌ Không thể khởi động server:', err);
  try {
    await prisma.$disconnect();
  } catch { /* ignore secondary errors */ }
  try {
    await disconnectRedis();
  } catch { /* ignore secondary errors */ }
  process.exit(1);
});
