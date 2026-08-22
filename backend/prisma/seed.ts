import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu mẫu...');

  // ─── 1. Tạo tài khoản Admin ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@travel.com' },
    update: {},
    create: {
      email: 'admin@travel.com',
      fullName: 'Admin Travel Platform',
      passwordHash: adminPassword,
      role: 'ADMIN',
      authProvider: 'LOCAL',
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ─── 2. Tạo tài khoản User mẫu ──────────────────────────────────────────
  const userPassword = await bcrypt.hash('User@123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@travel.com' },
    update: {},
    create: {
      email: 'user@travel.com',
      fullName: 'Người dùng mẫu',
      passwordHash: userPassword,
      role: 'USER',
      authProvider: 'LOCAL',
    },
  });
  console.log(`✅ User: ${testUser.email}`);

  // ─── 3. Tạo danh mục du lịch ────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Biển & Đảo' }, update: {}, create: { name: 'Biển & Đảo', description: 'Bãi biển, đảo, khu nghỉ dưỡng ven biển' } }),
    prisma.category.upsert({ where: { name: 'Núi & Rừng' }, update: {}, create: { name: 'Núi & Rừng', description: 'Trekking, leo núi, rừng quốc gia' } }),
    prisma.category.upsert({ where: { name: 'Di tích lịch sử' }, update: {}, create: { name: 'Di tích lịch sử', description: 'Đền chùa, cố đô, bảo tàng' } }),
    prisma.category.upsert({ where: { name: 'Ẩm thực' }, update: {}, create: { name: 'Ẩm thực', description: 'Chợ đêm, phố ẩm thực, nhà hàng đặc sản' } }),
    prisma.category.upsert({ where: { name: 'Giải trí & Mua sắm' }, update: {}, create: { name: 'Giải trí & Mua sắm', description: 'Trung tâm thương mại, khu vui chơi' } }),
  ]);
  console.log(`✅ Tạo ${categories.length} danh mục`);

  console.log('🎉 Seed hoàn tất!');
  console.log('─────────────────────────────');
  console.log('Tài khoản Admin: admin@travel.com / Admin@123');
  console.log('Tài khoản User:  user@travel.com  / User@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
