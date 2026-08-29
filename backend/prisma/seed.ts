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

type SampleDestination = {
  name: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  ticketPrice: number;
  openingHoursNote: string;
  visitDuration: number;
  rating: string;
  categoryIds: number[];
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

  const trip = existing
    ? await prisma.trip.update({
      where: { id: existing.id },
      data: tripData,
    })
    : await prisma.trip.create({
        data: {
          userId,
          name: input.name,
          ...tripData,
        },
      });

  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
  await prisma.$transaction(
    Array.from({ length: totalDays }, (_, index) =>
      prisma.tripDay.upsert({
        where: {
          tripId_dayNumber: {
            tripId: trip.id,
            dayNumber: index + 1,
          },
        },
        update: {
          date: new Date(startDate.getTime() + index * 86_400_000),
        },
        create: {
          tripId: trip.id,
          dayNumber: index + 1,
          date: new Date(startDate.getTime() + index * 86_400_000),
          note: index === 0 ? 'Nhận phòng và khám phá khu vực trung tâm' : null,
        },
      })
    )
  );

  return trip;
}

async function seedSampleDestination(input: SampleDestination) {
  const existing = await prisma.destination.findFirst({
    where: { name: input.name },
    select: { id: true },
  });
  const destinationData = {
    description: input.description,
    address: input.address,
    latitude: new Prisma.Decimal(input.latitude),
    longitude: new Prisma.Decimal(input.longitude),
    ticketPrice: new Prisma.Decimal(input.ticketPrice),
    openingHoursNote: input.openingHoursNote,
    visitDuration: input.visitDuration,
    rating: new Prisma.Decimal(input.rating),
    isActive: true,
  };

  const destination = existing
    ? await prisma.destination.update({
        where: { id: existing.id },
        data: destinationData,
      })
    : await prisma.destination.create({
        data: {
          name: input.name,
          ...destinationData,
        },
      });

  await prisma.$transaction([
    prisma.destinationCategory.deleteMany({
      where: {
        destinationId: destination.id,
        categoryId: { notIn: input.categoryIds },
      },
    }),
    ...input.categoryIds.map((categoryId) =>
      prisma.destinationCategory.upsert({
        where: {
          destinationId_categoryId: {
            destinationId: destination.id,
            categoryId,
          },
        },
        update: {},
        create: {
          destinationId: destination.id,
          categoryId,
        },
      })
    ),
  ]);

  return destination;
}

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu mẫu...');

  // ─── 1. Tạo tài khoản Admin ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@travel.com' },
    update: {
      fullName: 'Admin Travel Platform',
      passwordHash: adminPassword,
      role: 'ADMIN',
      authProvider: 'LOCAL',
      isActive: true,
    },
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
    update: {
      fullName: 'Người dùng mẫu',
      passwordHash: userPassword,
      role: 'USER',
      authProvider: 'LOCAL',
      isActive: true,
    },
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
    prisma.category.upsert({ where: { name: 'Biển & Đảo' }, update: { description: 'Bãi biển, đảo, khu nghỉ dưỡng ven biển' }, create: { name: 'Biển & Đảo', description: 'Bãi biển, đảo, khu nghỉ dưỡng ven biển' } }),
    prisma.category.upsert({ where: { name: 'Núi & Rừng' }, update: { description: 'Trekking, leo núi, rừng quốc gia' }, create: { name: 'Núi & Rừng', description: 'Trekking, leo núi, rừng quốc gia' } }),
    prisma.category.upsert({ where: { name: 'Di tích lịch sử' }, update: { description: 'Đền chùa, cố đô, bảo tàng' }, create: { name: 'Di tích lịch sử', description: 'Đền chùa, cố đô, bảo tàng' } }),
    prisma.category.upsert({ where: { name: 'Ẩm thực' }, update: { description: 'Chợ đêm, phố ẩm thực, nhà hàng đặc sản' }, create: { name: 'Ẩm thực', description: 'Chợ đêm, phố ẩm thực, nhà hàng đặc sản' } }),
    prisma.category.upsert({ where: { name: 'Giải trí & Mua sắm' }, update: { description: 'Trung tâm thương mại, khu vui chơi' }, create: { name: 'Giải trí & Mua sắm', description: 'Trung tâm thương mại, khu vui chơi' } }),
  ]);
  console.log(`✅ Tạo ${categories.length} danh mục`);

  // ─── 4. Tạo địa điểm mẫu cho AI Planner ──────────────────────────────────
  const categoryIds = {
    coast: categories[0].id,
    nature: categories[1].id,
    history: categories[2].id,
    food: categories[3].id,
    entertainment: categories[4].id,
  } as const;
  const sampleDestinations: SampleDestination[] = [
    {
      name: 'Hồ Hoàn Kiếm',
      description: 'Không gian đi bộ và thắng cảnh trung tâm Thủ đô, phù hợp tham quan Đền Ngọc Sơn và khu phố cổ.',
      address: 'Phường Hoàn Kiếm, Hà Nội',
      latitude: '21.0286669',
      longitude: '105.8521484',
      ticketPrice: 0,
      openingHoursNote: 'Không gian hồ mở cửa cả ngày; Đền Ngọc Sơn có giờ tham quan riêng.',
      visitDuration: 90,
      rating: '4.7',
      categoryIds: [categoryIds.history, categoryIds.entertainment],
    },
    {
      name: 'Văn Miếu - Quốc Tử Giám',
      description: 'Quần thể di tích về giáo dục và văn hóa, nơi thờ Khổng Tử và ghi dấu trường đại học đầu tiên của Việt Nam.',
      address: '58 Quốc Tử Giám, phường Văn Miếu - Quốc Tử Giám, Hà Nội',
      latitude: '21.0280430',
      longitude: '105.8354820',
      ticketPrice: 70_000,
      openingHoursNote: 'Thường mở cửa ban ngày; nên kiểm tra giờ bán vé theo mùa trước khi đến.',
      visitDuration: 90,
      rating: '4.6',
      categoryIds: [categoryIds.history],
    },
    {
      name: 'Hoàng thành Thăng Long',
      description: 'Di sản văn hóa thế giới với các lớp di tích khảo cổ và kiến trúc gắn với lịch sử kinh thành Thăng Long.',
      address: '19C Hoàng Diệu, phường Ba Đình, Hà Nội',
      latitude: '21.0352410',
      longitude: '105.8402890',
      ticketPrice: 70_000,
      openingHoursNote: 'Mở cửa ban ngày, thường đóng cửa thứ Hai; kiểm tra lịch vận hành trước chuyến đi.',
      visitDuration: 120,
      rating: '4.5',
      categoryIds: [categoryIds.history],
    },
    {
      name: 'Bảo tàng Dân tộc học Việt Nam',
      description: 'Bảo tàng trưng bày văn hóa, kiến trúc và đời sống của 54 dân tộc Việt Nam, có khu ngoài trời rộng rãi.',
      address: '1 Nguyễn Văn Huyên, phường Nghĩa Đô, Hà Nội',
      latitude: '21.0403490',
      longitude: '105.7980900',
      ticketPrice: 40_000,
      openingHoursNote: 'Thường mở cửa ban ngày và đóng cửa thứ Hai; kiểm tra thông báo chính thức trước khi đến.',
      visitDuration: 150,
      rating: '4.6',
      categoryIds: [categoryIds.history],
    },
    {
      name: 'Phố ẩm thực Tạ Hiện',
      description: 'Tuyến phố sôi động trong khu phố cổ, tập trung món ăn đường phố và hoạt động giải trí về đêm.',
      address: 'Phố Tạ Hiện, phường Hoàn Kiếm, Hà Nội',
      latitude: '21.0352420',
      longitude: '105.8521620',
      ticketPrice: 0,
      openingHoursNote: 'Các hàng quán hoạt động chủ yếu từ chiều tối đến khuya.',
      visitDuration: 120,
      rating: '4.4',
      categoryIds: [categoryIds.food, categoryIds.entertainment],
    },
    {
      name: 'Bãi biển Mỹ Khê',
      description: 'Bãi biển đô thị nổi tiếng với bờ cát dài, thuận tiện tắm biển, ngắm bình minh và tham gia hoạt động ngoài trời.',
      address: 'Đường Võ Nguyên Giáp, quận Sơn Trà, Đà Nẵng',
      latitude: '16.0544068',
      longitude: '108.2472344',
      ticketPrice: 0,
      openingHoursNote: 'Mở cửa cả ngày; nên tắm trong khung giờ có lực lượng cứu hộ.',
      visitDuration: 120,
      rating: '4.6',
      categoryIds: [categoryIds.coast, categoryIds.entertainment],
    },
    {
      name: 'Danh thắng Ngũ Hành Sơn',
      description: 'Quần thể núi đá vôi, hang động và chùa cổ với nhiều điểm ngắm cảnh về phía biển Đà Nẵng.',
      address: '81 Huyền Trân Công Chúa, quận Ngũ Hành Sơn, Đà Nẵng',
      latitude: '16.0034180',
      longitude: '108.2631290',
      ticketPrice: 40_000,
      openingHoursNote: 'Mở cửa ban ngày; nên đi giày phù hợp vì có nhiều bậc đá.',
      visitDuration: 150,
      rating: '4.4',
      categoryIds: [categoryIds.nature, categoryIds.history],
    },
    {
      name: 'Chùa Linh Ứng Sơn Trà',
      description: 'Ngôi chùa trên bán đảo Sơn Trà nổi bật với tượng Quan Thế Âm và tầm nhìn bao quát vịnh Đà Nẵng.',
      address: 'Bãi Bụt, bán đảo Sơn Trà, quận Sơn Trà, Đà Nẵng',
      latitude: '16.1002910',
      longitude: '108.2770780',
      ticketPrice: 0,
      openingHoursNote: 'Mở cửa ban ngày; trang phục lịch sự và giữ yên tĩnh tại khu thờ tự.',
      visitDuration: 90,
      rating: '4.7',
      categoryIds: [categoryIds.nature, categoryIds.history],
    },
    {
      name: 'Cầu Rồng Đà Nẵng',
      description: 'Công trình biểu tượng bắc qua sông Hàn, nổi tiếng với màn phun lửa và phun nước vào một số tối trong tuần.',
      address: 'Đường Nguyễn Văn Linh, quận Hải Châu, Đà Nẵng',
      latitude: '16.0610750',
      longitude: '108.2274540',
      ticketPrice: 0,
      openingHoursNote: 'Tham quan cả ngày; kiểm tra lịch phun lửa, phun nước trước khi đi.',
      visitDuration: 60,
      rating: '4.6',
      categoryIds: [categoryIds.entertainment],
    },
    {
      name: 'Chợ Hàn Đà Nẵng',
      description: 'Khu chợ trung tâm lâu đời, phù hợp khám phá đặc sản địa phương, đồ khô và quà lưu niệm.',
      address: '119 Trần Phú, quận Hải Châu, Đà Nẵng',
      latitude: '16.0681870',
      longitude: '108.2231150',
      ticketPrice: 0,
      openingHoursNote: 'Hoạt động chủ yếu từ sáng đến đầu tối.',
      visitDuration: 90,
      rating: '4.2',
      categoryIds: [categoryIds.food, categoryIds.entertainment],
    },
    {
      name: 'Dinh Độc Lập',
      description: 'Di tích lịch sử quốc gia đặc biệt với kiến trúc thập niên 1960 và nhiều không gian trưng bày nguyên trạng.',
      address: '135 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM (Thành phố Hồ Chí Minh)',
      latitude: '10.7770280',
      longitude: '106.6953020',
      ticketPrice: 65_000,
      openingHoursNote: 'Mở cửa ban ngày; quầy vé có thể ngừng bán trước giờ đóng cửa.',
      visitDuration: 120,
      rating: '4.5',
      categoryIds: [categoryIds.history],
    },
    {
      name: 'Bảo tàng Chứng tích Chiến tranh',
      description: 'Bảo tàng chuyên đề lưu giữ tư liệu và hiện vật về các cuộc chiến tranh tại Việt Nam trong thời kỳ hiện đại.',
      address: '28 Võ Văn Tần, Quận 3, TP.HCM (Thành phố Hồ Chí Minh)',
      latitude: '10.7794760',
      longitude: '106.6921390',
      ticketPrice: 40_000,
      openingHoursNote: 'Mở cửa ban ngày; nội dung trưng bày có thể không phù hợp với trẻ nhỏ.',
      visitDuration: 120,
      rating: '4.5',
      categoryIds: [categoryIds.history],
    },
    {
      name: 'Chợ Bến Thành',
      description: 'Biểu tượng thương mại lâu đời của Sài Gòn với các quầy đặc sản, ẩm thực, hàng thủ công và quà lưu niệm.',
      address: 'Đường Lê Lợi, Quận 1, TP.HCM (Thành phố Hồ Chí Minh)',
      latitude: '10.7725260',
      longitude: '106.6980410',
      ticketPrice: 0,
      openingHoursNote: 'Khu chợ chính hoạt động ban ngày; khu vực chợ đêm có lịch riêng.',
      visitDuration: 90,
      rating: '4.1',
      categoryIds: [categoryIds.food, categoryIds.entertainment],
    },
    {
      name: 'Phố đi bộ Nguyễn Huệ',
      description: 'Quảng trường đi bộ trung tâm kết nối nhiều công trình kiến trúc, quán cà phê và hoạt động văn hóa đường phố.',
      address: 'Đường Nguyễn Huệ, Quận 1, TP.HCM (Thành phố Hồ Chí Minh)',
      latitude: '10.7744310',
      longitude: '106.7034390',
      ticketPrice: 0,
      openingHoursNote: 'Mở cửa cả ngày và sôi động nhất vào buổi tối, cuối tuần.',
      visitDuration: 90,
      rating: '4.5',
      categoryIds: [categoryIds.entertainment, categoryIds.food],
    },
    {
      name: 'Bưu điện Trung tâm Sài Gòn',
      description: 'Công trình kiến trúc cuối thế kỷ XIX còn hoạt động, nằm cạnh Nhà thờ Đức Bà ở trung tâm Quận 1.',
      address: '2 Công xã Paris, Quận 1, TP.HCM (Thành phố Hồ Chí Minh)',
      latitude: '10.7797870',
      longitude: '106.6990180',
      ticketPrice: 0,
      openingHoursNote: 'Mở cửa theo giờ hành chính mở rộng; nên kiểm tra giờ cuối tuần trước khi đến.',
      visitDuration: 60,
      rating: '4.4',
      categoryIds: [categoryIds.history, categoryIds.entertainment],
    },
  ];
  const destinations = [];
  for (const sampleDestination of sampleDestinations) {
    destinations.push(await seedSampleDestination(sampleDestination));
  }
  console.log(`✅ Tạo/cập nhật ${destinations.length} địa điểm mẫu cho AI Planner`);

  // Ảnh seed là URL công khai, vì seed database không nên phụ thuộc Cloudinary credentials.
  const seedImageUrls = [
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80',
  ];
  for (const [index, destination] of destinations.entries()) {
    const imageCount = await prisma.destinationImage.count({
      where: { destinationId: destination.id },
    });
    if (imageCount === 0) {
      await prisma.destinationImage.create({
        data: {
          destinationId: destination.id,
          imageUrl: seedImageUrls[index % seedImageUrls.length],
          isPrimary: true,
          displayOrder: 0,
        },
      });
    }
  }

  await prisma.travelPreference.upsert({
    where: { userId: testUser.id },
    update: {
      budgetLevel: 'MEDIUM',
      travelStyle: 'Khám phá văn hóa và ẩm thực',
      preferredActivities: ['Tham quan', 'Đi bộ', 'Ăn uống'],
      preferredCategories: ['Di tích lịch sử', 'Ẩm thực'],
    },
    create: {
      userId: testUser.id,
      budgetLevel: 'MEDIUM',
      travelStyle: 'Khám phá văn hóa và ẩm thực',
      preferredActivities: ['Tham quan', 'Đi bộ', 'Ăn uống'],
      preferredCategories: ['Di tích lịch sử', 'Ẩm thực'],
    },
  });

  for (const destination of destinations.slice(0, 3)) {
    await prisma.favorite.upsert({
      where: {
        userId_destinationId: {
          userId: testUser.id,
          destinationId: destination.id,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        destinationId: destination.id,
      },
    });
  }

  const reviewSamples = [
    { rating: 5, comment: 'Không gian đẹp, thuận tiện đi bộ và khám phá khu phố cổ.' },
    { rating: 5, comment: 'Nhiều giá trị lịch sử, khuôn viên được bảo tồn tốt.' },
    { rating: 4, comment: 'Khu di sản rộng, nên dành ít nhất hai giờ để tham quan.' },
  ];
  for (const [index, destination] of destinations.slice(0, 3).entries()) {
    const review = reviewSamples[index];
    await prisma.review.upsert({
      where: {
        userId_destinationId: {
          userId: testUser.id,
          destinationId: destination.id,
        },
      },
      update: { ...review, isVisible: true },
      create: {
        userId: testUser.id,
        destinationId: destination.id,
        ...review,
        isVisible: true,
      },
    });
  }
  for (const destination of destinations.slice(0, 3)) {
    const aggregate = await prisma.review.aggregate({
      where: { destinationId: destination.id, isVisible: true },
      _avg: { rating: true },
    });
    const averageRating = aggregate._avg.rating === null
      ? 0
      : Math.round(aggregate._avg.rating * 10) / 10;
    await prisma.destination.update({
      where: { id: destination.id },
      data: { rating: new Prisma.Decimal(averageRating) },
    });
  }
  console.log('✅ Tạo dữ liệu mẫu cho ảnh, sở thích, yêu thích và đánh giá');

  // ─── 5. Tạo chuyến đi mẫu cho tài khoản User ─────────────────────────────
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

  const firstTripDays = await prisma.tripDay.findMany({
    where: { tripId: trips[0].id },
    orderBy: { dayNumber: 'asc' },
  });
  const daNangDestinationIds = destinations.slice(5, 9).map(({ id }) => id);
  for (const [index, tripDay] of firstTripDays.entries()) {
    const destinationId = daNangDestinationIds[index % daNangDestinationIds.length];
    await prisma.itinerary.upsert({
      where: {
        tripDayId_sequenceOrder: {
          tripDayId: tripDay.id,
          sequenceOrder: 1,
        },
      },
      update: {
        destinationId,
        startTime: new Date('1970-01-01T08:00:00.000Z'),
        endTime: new Date('1970-01-01T10:00:00.000Z'),
        estimatedCost: new Prisma.Decimal(100_000),
        travelMode: 'DRIVING',
      },
      create: {
        tripDayId: tripDay.id,
        destinationId,
        sequenceOrder: 1,
        startTime: new Date('1970-01-01T08:00:00.000Z'),
        endTime: new Date('1970-01-01T10:00:00.000Z'),
        estimatedCost: new Prisma.Decimal(100_000),
        travelMode: 'DRIVING',
        note: 'Lịch trình mẫu có thể chỉnh sửa sau khi đăng nhập.',
      },
    });
  }
  console.log(`✅ Tạo/cập nhật ${firstTripDays.length} hoạt động lịch trình mẫu`);

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
