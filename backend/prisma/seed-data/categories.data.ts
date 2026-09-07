export interface CategorySeedItem {
  name: string;
  description: string;
  legacyNames?: string[];
}

export const CATEGORIES_DATA: CategorySeedItem[] = [
  {
    name: 'Thiên nhiên',
    description: 'Thắng cảnh thiên nhiên, núi non hùng vĩ, sông suối và các vườn quốc gia bảo tồn nguyên sơ.',
    legacyNames: ['Núi & Rừng'],
  },
  {
    name: 'Văn hóa',
    description: 'Di sản văn hóa phi vật thể, làng nghề truyền thống, lễ hội dân gian và đền chùa cổ kính.',
  },
  {
    name: 'Lịch sử',
    description: 'Di tích lịch sử cách mạng, cố đô ngàn năm, bảo tàng tư liệu và các chứng tích trường tồn.',
    legacyNames: ['Di tích lịch sử'],
  },
  {
    name: 'Biển đảo',
    description: 'Bãi biển cát trắng nước trong, vịnh biển thơ mộng và các quần đảo hoang sơ tuyệt mỹ.',
    legacyNames: ['Biển & Đảo'],
  },
  {
    name: 'Ẩm thực',
    description: 'Chợ đêm ẩm thực, món ăn đường phố trứ danh và chuỗi nhà hàng đặc sản ba miền đặc sắc.',
  },
  {
    name: 'Nghỉ dưỡng',
    description: 'Khu nghỉ dưỡng cao cấp, suối khoáng nóng thư thái và các không gian retreat phục hồi sức khỏe.',
  },
  {
    name: 'Phiêu lưu',
    description: 'Trekking leo núi, khám phá hang động kỳ bí và các trải nghiệm thể thao mạo hiểm giàu cảm xúc.',
  },
  {
    name: 'Thành phố',
    description: 'Đô thị sôi động, quảng trường đi bộ, nhịp sống về đêm hiện đại và trung tâm thương mại náo nhiệt.',
    legacyNames: ['Giải trí & Mua sắm'],
  },
];
