import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu mẫu Travel Platform...');

  // ─── 1. Tạo tài khoản Admin ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@travel.com' },
    update: {
      fullName: 'Admin Travel Platform',
      passwordHash: adminPassword,
      role: 'ADMIN',
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
  const categoriesData = [
    { id: 1, name: 'Biển & Đảo', description: 'Bãi biển trong xanh, đảo ngọc thiên đường, khu nghỉ dưỡng biển' },
    { id: 2, name: 'Núi & Rừng', description: 'Trekking đỉnh cao, săn mây, khám phá rừng quốc gia và thung lũng' },
    { id: 3, name: 'Di tích lịch sử', description: 'Cố đô, đền chùa ngàn năm, di sản thế giới UNESCO, bảo tàng' },
    { id: 4, name: 'Ẩm thực', description: 'Chợ đêm sầm uất, ẩm thực đường phố, đặc sản 3 miền hấp dẫn' },
    { id: 5, name: 'Văn hóa & Nghệ thuật', description: 'Làng nghề cổ truyền, lễ hội dân gian, kiến trúc di sản độc đáo' },
    { id: 6, name: 'Nghỉ dưỡng & Sinh thái', description: 'Resort cao cấp, cắm trại dã ngoại, suối khoáng nóng thư giãn' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
  }
  console.log(`✅ Tạo/Cập nhật ${categoriesData.length} danh mục du lịch`);

  // ─── 4. Tạo địa điểm du lịch mẫu ────────────────────────────────────────
  const destinationsData = [
    {
      id: 1,
      name: 'Vịnh Hạ Long',
      description: 'Di sản thiên nhiên thế giới UNESCO với hàng nghìn hòn đảo đá vôi kỳ vĩ nhô lên từ làn nước xanh ngọc lục bảo. Du khách có thể trải nghiệm du thuyền qua đêm, chèo thuyền kayak qua hang Luồn, hang Sửng Sốt và ngắm hoàng hôn rực rỡ trên vịnh.',
      address: 'Thành phố Hạ Long, Quảng Ninh',
      phoneNumber: '02033846564',
      latitude: 20.9101,
      longitude: 107.1839,
      ticketPrice: 290000,
      openingHoursNote: 'Mở cửa hàng ngày từ 07:00 đến 17:30',
      visitDuration: 240,
      rating: 4.9,
      categoryIds: [1, 3],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=1200&auto=format&fit=crop', isPrimary: false, displayOrder: 1 },
      ],
    },
    {
      id: 2,
      name: 'Phố cổ Hội An',
      description: 'Khu đô thị cổ lưu giữ nguyên vẹn quần thể kiến trúc thế kỷ 16-18 với những ngôi nhà sơn vàng hoa giấy, Chùa Cầu cổ kính và dòng sông Hoài thơ mộng. Đêm xuống, cả phố cổ lung linh trong muôn sắc đèn lồng thủ công tuyệt đẹp.',
      address: 'Phường Minh An, Thành phố Hội An, Quảng Nam',
      phoneNumber: '02353861327',
      latitude: 15.8794,
      longitude: 108.3282,
      ticketPrice: 120000,
      openingHoursNote: 'Khu phố cổ mở tự do cả ngày; các điểm tham quan vé từ 07:30 - 21:30',
      visitDuration: 180,
      rating: 4.8,
      categoryIds: [3, 4, 5],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop', isPrimary: false, displayOrder: 1 },
      ],
    },
    {
      id: 3,
      name: 'Quần thể danh thắng Tràng An',
      description: 'Di sản thế giới kép đầu tiên của Việt Nam với hệ thống núi non đá vôi kỳ vĩ soi bóng xuống dòng sông Sào Khê uốn lượn. Du khách sẽ được ngồi thuyền nan đi xuyên qua 9 hang động huyền bí và thăm phim trường King Kong.',
      address: 'Huyện Hoa Lư, Ninh Bình',
      phoneNumber: '02293620335',
      latitude: 20.2536,
      longitude: 105.9084,
      ticketPrice: 250000,
      openingHoursNote: 'Mở cửa từ 07:00 đến 17:00 các ngày trong tuần',
      visitDuration: 210,
      rating: 4.9,
      categoryIds: [2, 3, 6],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop', isPrimary: false, displayOrder: 1 },
      ],
    },
    {
      id: 4,
      name: 'Bà Nà Hills & Cầu Vàng',
      description: 'Khu du lịch trên đỉnh núi Chúa ở độ cao 1.487m với khí hậu mát mẻ 4 mùa trong 1 ngày. Điểm nhấn là Cầu Vàng danh tiếng được đôi bàn tay khổng lồ nâng đỡ giữa mây trời, làng Pháp cổ kính và hầm rượu Debay.',
      address: 'Xã Hòa Phú, Huyện Hòa Vang, Đà Nẵng',
      phoneNumber: '0905766777',
      latitude: 15.9989,
      longitude: 107.9866,
      ticketPrice: 850000,
      openingHoursNote: 'Cáp treo vận hành từ 08:00 - 22:00 hàng ngày',
      visitDuration: 300,
      rating: 4.7,
      categoryIds: [2, 6],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      id: 5,
      name: 'Đỉnh Fansipan — Nóc nhà Đông Dương',
      description: 'Nằm ở độ cao 3.143m trên dãy Hoàng Liên Sơn, Fansipan là đỉnh núi cao nhất 3 nước Đông Dương. Hệ thống cáp treo 3 dây hiện đại đưa du khách băng qua biển mây bồng bềnh, chiêm ngưỡng Đại tượng Phật A Di Đà và quần thể tâm linh trên đỉnh thiêng.',
      address: 'Thị xã Sa Pa, Lào Cai',
      phoneNumber: '02143818888',
      latitude: 22.3033,
      longitude: 103.7753,
      ticketPrice: 800000,
      openingHoursNote: 'Mở cửa từ 07:30 đến 17:30 hàng ngày',
      visitDuration: 180,
      rating: 4.8,
      categoryIds: [2, 5],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      id: 6,
      name: 'Bãi Sao & Quần đảo An Thới',
      description: 'Bãi Sao được mệnh danh là một trong những bãi biển đẹp nhất Phú Quốc với bờ cát trắng mịn như kem và làn nước trong vắt phẳng lặng. Tại đây du khách có thể lặn ngắm san hô, cano tham quan 4 đảo và thưởng thức hải sản tươi ngon.',
      address: 'Phường An Thới, Thành phố Phú Quốc, Kiên Giang',
      phoneNumber: '02973990011',
      latitude: 10.0526,
      longitude: 104.0322,
      ticketPrice: 0,
      openingHoursNote: 'Tự do tham quan bãi tắm cả ngày (dịch vụ thể thao biển 08:00 - 18:00)',
      visitDuration: 180,
      rating: 4.9,
      categoryIds: [1, 4],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      id: 7,
      name: 'Đại Nội Huế — Hoàng thành Cố đô',
      description: 'Quần thể di tích Cố đô Huế lưu giữ dấu ấn vàng son của 13 đời vua triều Nguyễn. Các công trình như Ngọ Môn, Điện Thái Hòa, Tử Cấm Thành mang đậm bản sắc văn hóa cung đình truyền thống của dân tộc.',
      address: 'Đường 23 Tháng 8, Phường Thuận Thành, Thành phố Huế',
      phoneNumber: '02343523237',
      latitude: 16.4699,
      longitude: 107.5796,
      ticketPrice: 200000,
      openingHoursNote: 'Mở cửa mùa hè: 06:30 - 17:30, mùa đông: 07:00 - 17:00',
      visitDuration: 150,
      rating: 4.7,
      categoryIds: [3, 5],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      id: 8,
      name: 'Hồ Tuyền Lâm & Rừng Thông Đà Lạt',
      description: 'Hồ nước ngọt nhân tạo lớn nhất Đà Lạt được bao bọc bởi những cánh rừng thông xanh ngát trải dài. Nơi đây là điểm đến lý tưởng để chèo thuyền SUP ngắm lá phong, cắm trại ven hồ và nghỉ dưỡng giữa khí trời cao nguyên trong lành.',
      address: 'Phường 4, Thành phố Đà Lạt, Lâm Đồng',
      phoneNumber: '02633800999',
      latitude: 11.8988,
      longitude: 108.4312,
      ticketPrice: 0,
      openingHoursNote: 'Mở cửa tham quan tự do cả ngày',
      visitDuration: 180,
      rating: 4.8,
      categoryIds: [2, 6],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 0 },
      ],
    },
  ];

  for (const dest of destinationsData) {
    const { categoryIds, images, ...destFields } = dest;
    await prisma.destination.upsert({
      where: { id: destFields.id },
      update: {
        ...destFields,
        isActive: true,
      },
      create: {
        ...destFields,
        isActive: true,
        categories: {
          create: categoryIds.map((cid) => ({ categoryId: cid })),
        },
        images: {
          create: images,
        },
      },
    });

    // Đồng bộ lại liên kết category & image nếu đã tồn tại
    await prisma.destinationCategory.deleteMany({ where: { destinationId: destFields.id } });
    await prisma.destinationCategory.createMany({
      data: categoryIds.map((cid) => ({ destinationId: destFields.id, categoryId: cid })),
    });

    await prisma.destinationImage.deleteMany({ where: { destinationId: destFields.id } });
    await prisma.destinationImage.createMany({
      data: images.map((img) => ({
        destinationId: destFields.id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder,
      })),
    });
  }

  // Đồng bộ lại PostgreSQL sequence cho các bảng có ID tự tăng tránh lỗi P2002
  await prisma.$executeRawUnsafe(`SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));`);
  await prisma.$executeRawUnsafe(`SELECT setval('destinations_id_seq', COALESCE((SELECT MAX(id) FROM destinations), 1));`);
  await prisma.$executeRawUnsafe(`SELECT setval('destination_images_id_seq', COALESCE((SELECT MAX(id) FROM destination_images), 1));`);

  console.log(`✅ Tạo/Cập nhật ${destinationsData.length} địa điểm du lịch tiêu biểu`);
  console.log('🎉 Seed hoàn tất thành công!');
  console.log('────────────────────────────────────────');
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