import type { IconName } from '@/components/trip/TripIcon';

export interface CategoryVisual {
  image: string;
  icon: IconName;
}

export interface RegionVisual {
  name: string;
  kicker: string;
  description: string;
  image: string;
  tags: string[];
}

const categoryFallbacks: CategoryVisual[] = [
  { image: '/images/destinations/my-khe.jpg', icon: 'globe' },
  { image: '/images/destinations/ha-giang.jpg', icon: 'compass' },
  { image: '/images/destinations/hoi-an.jpg', icon: 'map-pin' },
  { image: '/images/destinations/ta-hien.jpg', icon: 'sparkles' },
  { image: '/images/destinations/nguyen-hue.jpg', icon: 'suitcase' },
  { image: '/images/destinations/ninh-binh.jpg', icon: 'route' },
  { image: '/images/destinations/da-lat.jpg', icon: 'heart' },
];

const categoryMatchers: Array<{ keywords: string[]; visual: CategoryVisual }> = [
  { keywords: ['biển', 'đảo', 'beach', 'island'], visual: { image: '/images/destinations/my-khe.jpg', icon: 'globe' } },
  { keywords: ['núi', 'rừng', 'thiên nhiên', 'trekking', 'phiêu lưu'], visual: { image: '/images/destinations/ha-giang.jpg', icon: 'compass' } },
  { keywords: ['lịch sử', 'di tích', 'di sản', 'văn hóa'], visual: { image: '/images/destinations/hoi-an.jpg', icon: 'map-pin' } },
  { keywords: ['ẩm thực', 'món ăn', 'food'], visual: { image: '/images/destinations/ta-hien.jpg', icon: 'sparkles' } },
  { keywords: ['mua sắm', 'giải trí', 'thành phố', 'đô thị'], visual: { image: '/images/destinations/nguyen-hue.jpg', icon: 'suitcase' } },
  { keywords: ['nghỉ dưỡng', 'lãng mạn', 'thư giãn'], visual: { image: '/images/destinations/da-lat.jpg', icon: 'heart' } },
];

export const getCategoryVisual = (categoryName: string, index: number): CategoryVisual => {
  const normalizedName = categoryName.toLocaleLowerCase('vi');
  const matched = categoryMatchers.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(keyword)),
  );
  return matched?.visual ?? categoryFallbacks[index % categoryFallbacks.length];
};

export const HOME_REGIONS: RegionVisual[] = [
  {
    name: 'Miền Bắc',
    kicker: 'Hùng vĩ & nguyên bản',
    description: 'Từ những cung đèo chạm mây đến lớp trầm tích văn hóa nghìn năm.',
    image: '/images/destinations/ha-giang.jpg',
    tags: ['Núi', 'Văn hóa', 'Lịch sử'],
  },
  {
    name: 'Miền Trung',
    kicker: 'Di sản bên bờ biển',
    description: 'Một dải đất của biển xanh, phố cổ và những hương vị khó quên.',
    image: '/images/destinations/hoi-an.jpg',
    tags: ['Biển', 'Di sản', 'Ẩm thực'],
  },
  {
    name: 'Miền Nam',
    kicker: 'Phóng khoáng & rực rỡ',
    description: 'Nhịp sống trẻ hòa cùng miền sông nước hào sảng và hiếu khách.',
    image: '/images/destinations/nguyen-hue.jpg',
    tags: ['Sông nước', 'Thành phố', 'Ẩm thực'],
  },
];
