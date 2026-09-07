import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { CATEGORIES_DATA } from './seed-data/categories.data';
import { DESTINATIONS_DATA } from './seed-data/destinations.data';
import { DEMO_USERS_DATA } from './seed-data/users.data';
import { REVIEWS_DATA, FAVORITES_DATA } from './seed-data/reviews.data';
import { TRIPS_DATA } from './seed-data/trips.data';

const prisma = new PrismaClient();

// ─── KIỂM TRA AN TOÀN MÔI TRƯỜNG ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('=============================================================');
  console.error('⛔ CẢNH BÁO AN TOÀN: Script seed BỊ CẤM CHẠY trong production!');
  console.error('   Biến NODE_ENV đang là "production".');
  console.error('   Vui lòng chỉ chạy seed trong môi trường development hoặc test.');
  console.error('=============================================================');
  process.exit(1);
}

// ─── KIỂM TRA MẬT KHẨU DEMO TỪ BIẾN MÔI TRƯỜNG ──────────────────────────────
const rawDemoPassword = process.env.SEED_DEMO_PASSWORD;
if (!rawDemoPassword || rawDemoPassword.trim() === '') {
  console.error('=============================================================');
  console.error('❌ LỖI CẤU HÌNH: Thiếu biến môi trường SEED_DEMO_PASSWORD!');
  console.error('   Vui lòng cấu hình SEED_DEMO_PASSWORD trong file backend/.env:');
  console.error('   Ví dụ: SEED_DEMO_PASSWORD=your_secure_demo_password');
  console.error('   (Tuyệt đối không hardcode mật khẩu trong source code)');
  console.error('=============================================================');
  process.exit(1);
}

const toDateOnly = (dateStr: string): Date => new Date(`${dateStr}T00:00:00.000Z`);
const toTimeOnly = (timeStr: string): Date => new Date(`1970-01-01T${timeStr}:00.000Z`);

async function getDatabaseCounts() {
  const [
    categories,
    destinations,
    destinationCategories,
    destinationImages,
    users,
    travelPreferences,
    reviews,
    favorites,
    trips,
    tripDays,
    itineraries,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.destination.count(),
    prisma.destinationCategory.count(),
    prisma.destinationImage.count(),
    prisma.user.count(),
    prisma.travelPreference.count(),
    prisma.review.count(),
    prisma.favorite.count(),
    prisma.trip.count(),
    prisma.tripDay.count(),
    prisma.itinerary.count(),
  ]);

  return {
    categories,
    destinations,
    destinationCategories,
    destinationImages,
    users,
    travelPreferences,
    reviews,
    favorites,
    trips,
    tripDays,
    itineraries,
  };
}

async function main() {
  console.log('🚀 Bắt đầu quá trình seed dữ liệu tự động cho TravelGo...');
  const initialCounts = await getDatabaseCounts();
  console.log('📊 Trạng thái bảng ban đầu:', initialCounts);

  // Hash mật khẩu demo (12 rounds tương đương chuẩn auth backend)
  const passwordHash = await bcrypt.hash(rawDemoPassword!.trim(), 12);

  // ─── 1. SEED CATEGORIES (DANH MỤC) ─────────────────────────────────────────
  console.log('\n📁 [1/8] Seed Danh mục (Categories)...');
  const categoryMap = new Map<string, number>();

  for (const cat of CATEGORIES_DATA) {
    // Kiểm tra danh mục trùng theo tên hoặc legacyNames
    let existing = await prisma.category.findUnique({
      where: { name: cat.name },
    });

    if (!existing && cat.legacyNames && cat.legacyNames.length > 0) {
      for (const legacy of cat.legacyNames) {
        const legacyCat = await prisma.category.findUnique({
          where: { name: legacy },
        });
        if (legacyCat) {
          // Nâng cấp danh mục cũ thành tên chuẩn mới để bảo toàn id và quan hệ
          existing = await prisma.category.update({
            where: { id: legacyCat.id },
            data: {
              name: cat.name,
              description: cat.description,
            },
          });
          console.log(`   🔄 Đã cập nhật danh mục cũ "${legacy}" thành chuẩn mới "${cat.name}" (ID: ${existing.id})`);
          break;
        }
      }
    }

    const record = existing
      ? await prisma.category.update({
          where: { id: existing.id },
          data: { description: cat.description },
        })
      : await prisma.category.create({
          data: {
            name: cat.name,
            description: cat.description,
          },
        });

    categoryMap.set(cat.name, record.id);
    if (cat.legacyNames) {
      for (const legacy of cat.legacyNames) {
        categoryMap.set(legacy, record.id);
      }
    }
  }
  console.log(`   ✅ Hoàn tất seed ${CATEGORIES_DATA.length} danh mục.`);

  // ─── 2. SEED DESTINATIONS (ĐỊA ĐIỂM DU LỊCH) ────────────────────────────────
  console.log('\n🗺️  [2/8] Seed Địa điểm du lịch (Destinations) & Ảnh...');
  const destinationMap = new Map<string, number>();

  for (const dest of DESTINATIONS_DATA) {
    // Tìm kiếm địa điểm đã tồn tại theo tên chính hoặc tên alias
    const existing = await prisma.destination.findFirst({
      where: {
        OR: [
          { name: dest.name },
          ...(dest.aliases ? dest.aliases.map((alias) => ({ name: alias })) : []),
        ],
      },
      select: { id: true, name: true },
    });

    const destData = {
      name: dest.name,
      description: dest.description,
      address: dest.address,
      phoneNumber: dest.phoneNumber ?? null,
      latitude: new Prisma.Decimal(dest.latitude),
      longitude: new Prisma.Decimal(dest.longitude),
      ticketPrice: new Prisma.Decimal(dest.ticketPrice),
      openingHoursNote: dest.openingHoursNote,
      visitDuration: dest.visitDuration,
      isActive: true,
    };

    const destRecord = existing
      ? await prisma.destination.update({
          where: { id: existing.id },
          data: destData,
        })
      : await prisma.destination.create({
          data: destData,
        });

    destinationMap.set(dest.name, destRecord.id);
    if (dest.aliases) {
      for (const alias of dest.aliases) {
        destinationMap.set(alias, destRecord.id);
      }
    }

    // ─── Liên kết Destination - Category (N - N) ───────────────────────────
    for (const catName of dest.categoryNames) {
      const categoryId = categoryMap.get(catName);
      if (categoryId) {
        await prisma.destinationCategory.upsert({
          where: {
            destinationId_categoryId: {
              destinationId: destRecord.id,
              categoryId,
            },
          },
          update: {},
          create: {
            destinationId: destRecord.id,
            categoryId,
          },
        });
      }
    }

    // ─── Seed Destination Images (Idempotent & bảo vệ ảnh admin/user) ─────
    // Xóa các ảnh Unsplash không khớp từng được seed trước đây của địa điểm này
    await prisma.destinationImage.deleteMany({
      where: {
        destinationId: destRecord.id,
        imageUrl: {
          startsWith: 'https://images.unsplash.com',
        },
      },
    });

    for (const img of dest.images) {
      const existingImg = await prisma.destinationImage.findFirst({
        where: {
          destinationId: destRecord.id,
          imageUrl: img.imageUrl,
        },
      });

      if (existingImg) {
        await prisma.destinationImage.update({
          where: { id: existingImg.id },
          data: {
            isPrimary: img.isPrimary,
            displayOrder: img.displayOrder,
          },
        });
      } else {
        await prisma.destinationImage.create({
          data: {
            destinationId: destRecord.id,
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary,
            displayOrder: img.displayOrder,
          },
        });
      }
    }
  }
  console.log(`   ✅ Hoàn tất seed ${DESTINATIONS_DATA.length} địa điểm và bộ sưu tập ảnh.`);

  // ─── 3. SEED DEMO USERS (TÀI KHOẢN NGƯỜI DÙNG DEMO) ───────────────────────
  console.log('\n👤 [3/8] Seed Tài khoản người dùng demo (Users)...');
  const userMap = new Map<string, number>();

  // Xác minh không ảnh hưởng tài khoản ADMIN hiện có
  const existingAdmins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  });
  console.log(`   🛡️  Bảo vệ tài khoản quản trị hiện có: ${existingAdmins.map((a) => a.email).join(', ') || 'Chưa có'}`);

  for (const user of DEMO_USERS_DATA) {
    const userRecord = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        avatarUrl: user.avatarUrl ?? null,
        authProvider: 'LOCAL',
        role: 'USER',
        isActive: true,
        passwordHash,
      },
      create: {
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl ?? null,
        authProvider: 'LOCAL',
        role: 'USER',
        isActive: true,
        passwordHash,
      },
    });

    userMap.set(user.email, userRecord.id);

    // ─── 4. SEED TRAVEL PREFERENCES ────────────────────────────────────────
    await prisma.travelPreference.upsert({
      where: { userId: userRecord.id },
      update: {
        budgetLevel: user.travelPreference.budgetLevel,
        travelStyle: user.travelPreference.travelStyle,
        preferredActivities: user.travelPreference.preferredActivities,
        preferredCategories: user.travelPreference.preferredCategories,
      },
      create: {
        userId: userRecord.id,
        budgetLevel: user.travelPreference.budgetLevel,
        travelStyle: user.travelPreference.travelStyle,
        preferredActivities: user.travelPreference.preferredActivities,
        preferredCategories: user.travelPreference.preferredCategories,
      },
    });
  }
  console.log(`   ✅ Hoàn tất seed ${DEMO_USERS_DATA.length} tài khoản demo và sở thích du lịch.`);

  // ─── 5. SEED REVIEWS & CẬP NHẬT RATING ĐỊA ĐIỂM ────────────────────────────
  console.log('\n⭐ [4/8] Seed Đánh giá (Reviews) & Tính toán Rating trung bình...');
  for (const rev of REVIEWS_DATA) {
    const userId = userMap.get(rev.userEmail);
    const destinationId = destinationMap.get(rev.destinationName);

    if (!userId || !destinationId) {
      continue;
    }

    const createdAt = new Date(Date.now() - rev.daysAgo * 86_400_000);

    await prisma.review.upsert({
      where: {
        userId_destinationId: {
          userId,
          destinationId,
        },
      },
      update: {
        rating: rev.rating,
        comment: rev.comment,
        isVisible: true,
      },
      create: {
        userId,
        destinationId,
        rating: rev.rating,
        comment: rev.comment,
        isVisible: true,
        createdAt,
      },
    });
  }

  // Tái tính toán rating trung bình thực tế cho tất cả địa điểm có review
  for (const dest of DESTINATIONS_DATA) {
    const destId = destinationMap.get(dest.name);
    if (!destId) continue;

    const aggregate = await prisma.review.aggregate({
      where: {
        destinationId: destId,
        isVisible: true,
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avgRating = aggregate._avg.rating !== null ? Number(aggregate._avg.rating.toFixed(1)) : 0;
    await prisma.destination.update({
      where: { id: destId },
      data: {
        rating: new Prisma.Decimal(avgRating),
      },
    });
  }
  console.log(`   ✅ Hoàn tất seed ${REVIEWS_DATA.length} đánh giá và cập nhật rating trung bình thực tế.`);

  // ─── 6. SEED FAVORITES (YÊU THÍCH) ──────────────────────────────────────────
  console.log('\n❤️  [5/8] Seed Địa điểm yêu thích (Favorites)...');
  for (const fav of FAVORITES_DATA) {
    const userId = userMap.get(fav.userEmail);
    const destinationId = destinationMap.get(fav.destinationName);

    if (!userId || !destinationId) {
      continue;
    }

    await prisma.favorite.upsert({
      where: {
        userId_destinationId: {
          userId,
          destinationId,
        },
      },
      update: {},
      create: {
        userId,
        destinationId,
      },
    });
  }
  console.log(`   ✅ Hoàn tất seed ${FAVORITES_DATA.length} mục yêu thích.`);

  // ─── 7. SEED TRIPS, TRIP DAYS & ITINERARIES ────────────────────────────────
  console.log('\n🧳 [6/8] Seed Chuyến đi (Trips), Ngày (TripDays) & Lịch trình (Itineraries)...');
  for (const trip of TRIPS_DATA) {
    const userId = userMap.get(trip.userEmail);
    if (!userId) {
      continue;
    }

    const startDate = toDateOnly(trip.startDate);
    const endDate = toDateOnly(trip.endDate);

    const existingTrip = await prisma.trip.findFirst({
      where: {
        userId,
        name: trip.name,
      },
      select: { id: true },
    });

    const tripData = {
      destinationCity: trip.destinationCity,
      startDate,
      endDate,
      budget: new Prisma.Decimal(trip.budget),
      numberOfPeople: trip.numberOfPeople,
      description: trip.description,
      isPublic: trip.isPublic,
      isAiGenerated: trip.isAiGenerated,
      shareToken: trip.shareToken ?? null,
    };

    const tripRecord = existingTrip
      ? await prisma.trip.update({
          where: { id: existingTrip.id },
          data: tripData,
        })
      : await prisma.trip.create({
          data: {
            userId,
            name: trip.name,
            ...tripData,
          },
        });

    for (const day of trip.days) {
      const dayDate = new Date(startDate.getTime() + (day.dayNumber - 1) * 86_400_000);

      const dayRecord = await prisma.tripDay.upsert({
        where: {
          tripId_dayNumber: {
            tripId: tripRecord.id,
            dayNumber: day.dayNumber,
          },
        },
        update: {
          date: dayDate,
          note: day.note ?? null,
        },
        create: {
          tripId: tripRecord.id,
          dayNumber: day.dayNumber,
          date: dayDate,
          note: day.note ?? null,
        },
      });

      for (const itn of day.itineraries) {
        const destId = destinationMap.get(itn.destinationName);
        if (!destId) {
          continue;
        }

        const startTime = toTimeOnly(itn.startTime);
        const endTime = toTimeOnly(itn.endTime);

        await prisma.itinerary.upsert({
          where: {
            tripDayId_sequenceOrder: {
              tripDayId: dayRecord.id,
              sequenceOrder: itn.sequenceOrder,
            },
          },
          update: {
            destinationId: destId,
            startTime,
            endTime,
            estimatedCost: new Prisma.Decimal(itn.estimatedCost),
            travelDistanceKm: new Prisma.Decimal(itn.travelDistanceKm),
            travelDurationMinutes: itn.travelDurationMinutes,
            travelMode: itn.travelMode,
            note: itn.note,
          },
          create: {
            tripDayId: dayRecord.id,
            destinationId: destId,
            sequenceOrder: itn.sequenceOrder,
            startTime,
            endTime,
            estimatedCost: new Prisma.Decimal(itn.estimatedCost),
            travelDistanceKm: new Prisma.Decimal(itn.travelDistanceKm),
            travelDurationMinutes: itn.travelDurationMinutes,
            travelMode: itn.travelMode,
            note: itn.note,
          },
        });
      }
    }
  }
  console.log(`   ✅ Hoàn tất seed ${TRIPS_DATA.length} chuyến đi với đầy đủ ngày và chi tiết lịch trình.`);

  // ─── 8. THỐNG KÊ KẾT QUẢ VÀ KIỂM TRA IDEMPOTENT ────────────────────────────
  const finalCounts = await getDatabaseCounts();
  console.log('\n=============================================================');
  console.log('🎉 SEED DỮ LIỆU THÀNH CÔNG VÀ AN TOÀN!');
  console.log('=============================================================');
  console.table({
    'Categories (Danh mục)': { 'Trước seed': initialCounts.categories, 'Sau seed': finalCounts.categories },
    'Destinations (Địa điểm)': { 'Trước seed': initialCounts.destinations, 'Sau seed': finalCounts.destinations },
    'DestinationCategories (Liên kết)': { 'Trước seed': initialCounts.destinationCategories, 'Sau seed': finalCounts.destinationCategories },
    'DestinationImages (Hình ảnh)': { 'Trước seed': initialCounts.destinationImages, 'Sau seed': finalCounts.destinationImages },
    'Users (Người dùng)': { 'Trước seed': initialCounts.users, 'Sau seed': finalCounts.users },
    'TravelPreferences (Sở thích)': { 'Trước seed': initialCounts.travelPreferences, 'Sau seed': finalCounts.travelPreferences },
    'Reviews (Đánh giá)': { 'Trước seed': initialCounts.reviews, 'Sau seed': finalCounts.reviews },
    'Favorites (Yêu thích)': { 'Trước seed': initialCounts.favorites, 'Sau seed': finalCounts.favorites },
    'Trips (Chuyến đi)': { 'Trước seed': initialCounts.trips, 'Sau seed': finalCounts.trips },
    'TripDays (Ngày trong chuyến đi)': { 'Trước seed': initialCounts.tripDays, 'Sau seed': finalCounts.tripDays },
    'Itineraries (Lịch trình)': { 'Trước seed': initialCounts.itineraries, 'Sau seed': finalCounts.itineraries },
  });
}

main()
  .catch((error) => {
    console.error('❌ QUÁ TRÌNH SEED GẶP LỖI:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
