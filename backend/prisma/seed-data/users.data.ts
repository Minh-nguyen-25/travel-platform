export interface DemoUserSeedItem {
  email: string;
  fullName: string;
  avatarUrl?: string;
  travelPreference: {
    budgetLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    travelStyle: string;
    preferredActivities: string[];
    preferredCategories: string[];
  };
}

export const DEMO_USERS_DATA: DemoUserSeedItem[] = [
  {
    email: 'demo.an@example.com',
    fullName: 'Nguyễn Văn An',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    travelPreference: {
      budgetLevel: 'MEDIUM',
      travelStyle: 'Khám phá văn hóa & lịch sử',
      preferredActivities: ['Tham quan bảo tàng', 'Dạo phố cổ', 'Tìm hiểu kiến trúc cổ', 'Chụp ảnh di sản'],
      preferredCategories: ['Lịch sử', 'Văn hóa', 'Thành phố'],
    },
  },
  {
    email: 'demo.binh@example.com',
    fullName: 'Trần Thị Thanh Bình',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    travelPreference: {
      budgetLevel: 'HIGH',
      travelStyle: 'Nghỉ dưỡng biển cao cấp',
      preferredActivities: ['Tắm biển', 'Lặn ngắm san hô', 'Du thuyền ngắm hoàng hôn', 'Spa thư giãn'],
      preferredCategories: ['Biển đảo', 'Nghỉ dưỡng', 'Thiên nhiên'],
    },
  },
  {
    email: 'demo.chi@example.com',
    fullName: 'Lê Quỳnh Chi',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    travelPreference: {
      budgetLevel: 'MEDIUM',
      travelStyle: 'Food tour & Cà phê đô thị',
      preferredActivities: ['Khám phá chợ đêm', 'Thưởng thức ẩm thực đường phố', 'Check-in quán cà phê', 'Mua sắm đặc sản'],
      preferredCategories: ['Ẩm thực', 'Thành phố', 'Văn hóa'],
    },
  },
  {
    email: 'demo.dung@example.com',
    fullName: 'Phạm Hoàng Dũng',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    travelPreference: {
      budgetLevel: 'LOW',
      travelStyle: 'Trekking & Phượt mạo hiểm',
      preferredActivities: ['Leo núi săn mây', 'Chạy xe máy đường đèo', 'Cắm trại qua đêm', 'Thám hiểm hang động'],
      preferredCategories: ['Phiêu lưu', 'Thiên nhiên'],
    },
  },
  {
    email: 'demo.ha@example.com',
    fullName: 'Hoàng Thu Hà',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    travelPreference: {
      budgetLevel: 'MEDIUM',
      travelStyle: 'Sinh thái & Thiên nhiên xanh',
      preferredActivities: ['Đi thuyền sông nước', 'Tham quan miệt vườn', 'Ngắm cảnh ruộng bậc thang', 'Thư giãn suối khoáng'],
      preferredCategories: ['Thiên nhiên', 'Văn hóa', 'Ẩm thực'],
    },
  },
  {
    email: 'demo.khanh@example.com',
    fullName: 'Vũ Nam Khánh',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    travelPreference: {
      budgetLevel: 'MEDIUM',
      travelStyle: 'Nghệ thuật, Cố đô & Lễ hội',
      preferredActivities: ['Xem biểu diễn nghệ thuật truyền thống', 'Thăm viếng đền lăng', 'Trải nghiệm làm gốm/đèn lồng', 'Nghe ca trù/ca Huế'],
      preferredCategories: ['Văn hóa', 'Lịch sử'],
    },
  },
  {
    email: 'demo.linh@example.com',
    fullName: 'Đỗ Thùy Linh',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    travelPreference: {
      budgetLevel: 'HIGH',
      travelStyle: 'Check-in cảnh đẹp & Nhiếp ảnh',
      preferredActivities: ['Săn bình minh bờ biển', 'Chụp ảnh đường phố', 'Dạo cáp treo ngắm toàn cảnh', 'Nghỉ dưỡng resort view biển'],
      preferredCategories: ['Biển đảo', 'Nghỉ dưỡng', 'Thành phố'],
    },
  },
  {
    email: 'demo.minh@example.com',
    fullName: 'Bùi Nhật Minh',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    travelPreference: {
      budgetLevel: 'MEDIUM',
      travelStyle: 'Du lịch chậm (Slow Travel) & Bình yên',
      preferredActivities: ['Đọc sách ven hồ', 'Đi dạo đồi thông', 'Hái dâu tại vườn', 'Ngắm hoàng hôn trên cao nguyên'],
      preferredCategories: ['Nghỉ dưỡng', 'Thiên nhiên', 'Ẩm thực'],
    },
  },
];
