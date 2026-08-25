import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SampleTrip = {
  name: string;
  destinationCity: string;
  startDate: string;
  endDate: string;
  budget: number;
  numberOfPeople: number;
  description: string;
  isAiGenerated?: boolean;
  isPublic?: boolean;
  shareToken?: string;
};

const toDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

async function seedSampleTrip(userId: number, input: SampleTrip) {
  const existing = await prisma.trip.findFirst({
    where: { userId, name: input.name },
    select: { id: true },
  });
  const startDate = toDate(input.startDate);
  const endDate = toDate(input.endDate);
  const tripData = {
    destinationCity: input.destinationCity,
    startDate,
    endDate,
    budget: new Prisma.Decimal(input.budget),
    numberOfPeople: input.numberOfPeople,
    description: input.description,
    isAiGenerated: input.isAiGenerated ?? false,
    isPublic: input.isPublic ?? false,
    shareToken: input.shareToken ?? null,
  };

  if (existing) {
    return prisma.trip.update({
      where: { id: existing.id },
      data: tripData,
    });
  }

  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
  return prisma.trip.create({
    data: {
      userId,
      name: input.name,
      ...tripData,
      tripDays: {
        create: Array.from({ length: totalDays }, (_, index) => ({
          dayNumber: index + 1,
          date: new Date(startDate.getTime() + index * 86_400_000),
          note: index === 0 ? 'Nhận phòng và khám phá khu vực trung tâm' : null,
        })),
      },
    },
  });
}

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

  // ─── 4. Tạo chuyến đi mẫu cho tài khoản User ─────────────────────────────
  const sampleTrips: SampleTrip[] = [
    {
      name: 'Kỳ nghỉ Đà Nẵng 4N3Đ',
      destinationCity: 'Đà Nẵng',
      startDate: '2026-08-24',
      endDate: '2026-08-27',
      budget: 8_000_000,
      numberOfPeople: 2,
      description: 'Nghỉ dưỡng biển, tham quan bán đảo Sơn Trà và khám phá ẩm thực địa phương.',
      isPublic: true,
      shareToken: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    },
    {
      name: 'Săn mây Đà Lạt',
      destinationCity: 'Đà Lạt',
      startDate: '2026-09-15',
      endDate: '2026-09-18',
      budget: 6_500_000,
      numberOfPeople: 3,
      description: 'Săn mây, tham quan vườn hoa và thưởng thức cà phê giữa cao nguyên.',
      isAiGenerated: true,
    },
    {
      name: 'Cuối tuần ở Hội An',
      destinationCity: 'Hội An',
      startDate: '2026-06-12',
      endDate: '2026-06-14',
      budget: 4_000_000,
      numberOfPeople: 2,
      description: 'Dạo phố cổ, trải nghiệm ẩm thực và ngắm đèn lồng bên sông Hoài.',
    },
  ];
  const trips = [];
  for (const sampleTrip of sampleTrips) {
    trips.push(await seedSampleTrip(testUser.id, sampleTrip));
  }
  console.log(`✅ Tạo/cập nhật ${trips.length} chuyến đi mẫu cho userId=${testUser.id}`);

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
