import 'dotenv/config';
import app from './app';
import prisma from './config/db';

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Kiểm tra kết nối DB ngay khi startup
    // Nếu DB chết → phát hiện ngay, không phải đợi query đầu tiên
    await prisma.$connect();
    console.log('✅ Kết nối Database thành công');

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`📊 Prisma Studio: chạy "npm run db:studio"`);
    });
  } catch (error) {
    console.error('❌ Không thể kết nối Database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  Đang tắt server...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
