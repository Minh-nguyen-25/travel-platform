import { z } from 'zod';

// Helper parse mảng số hoặc parse chuỗi JSON
const parseCategoryIds = (val: unknown) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val.split(',').map((id) => Number(id.trim())).filter((id) => !isNaN(id));
    }
  }
  if (Array.isArray(val)) {
    return val.map((id) => Number(id));
  }
  return val;
};

// Schema tạo mới địa điểm (hỗ trợ multipart/form-data)
export const destinationSchema = z.object({
  name: z.string().trim().min(1, 'Tên địa điểm không được để trống').max(200, 'Tên tối đa 200 ký tự'),
  description: z.string().trim().optional(),
  address: z.string().trim().min(1, 'Địa chỉ không được để trống'),
  phoneNumber: z.string().trim().max(20, 'Số điện thoại tối đa 20 ký tự').optional().nullable(),
  latitude: z.preprocess((val) => Number(val), z.number().min(-90).max(90, 'Vĩ độ không hợp lệ')),
  longitude: z.preprocess((val) => Number(val), z.number().min(-180).max(180, 'Kinh độ không hợp lệ')),
  ticketPrice: z.preprocess((val) => (val !== undefined && val !== '' ? Number(val) : 0), z.number().min(0, 'Giá vé phải >= 0').default(0)),
  openingHoursNote: z.string().trim().optional().nullable(),
  visitDuration: z.preprocess((val) => (val !== undefined && val !== '' && val !== null ? Number(val) : undefined), z.number().int().positive().optional().nullable()),
  categoryIds: z.preprocess(parseCategoryIds, z.array(z.number().int().positive()).min(1, 'Cần chọn ít nhất 1 danh mục')),
});

export type DestinationDto = z.infer<typeof destinationSchema>;

// Schema cập nhật địa điểm
export const destinationUpdateSchema = destinationSchema.partial();
export type DestinationUpdateDto = z.infer<typeof destinationUpdateSchema>;

// Schema lọc và phân trang danh sách địa điểm
export const destinationFilterQuerySchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().int().min(1).max(100).default(10)),
  search: z.string().trim().optional(),
  categoryId: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().positive().optional()),
  minPrice: z.preprocess((val) => (val !== undefined && val !== '' ? Number(val) : undefined), z.number().min(0).optional()),
  maxPrice: z.preprocess((val) => (val !== undefined && val !== '' ? Number(val) : undefined), z.number().min(0).optional()),
  minRating: z.preprocess((val) => (val !== undefined && val !== '' ? Number(val) : undefined), z.number().min(0).max(5).optional()),
  sortBy: z.enum(['rating:desc', 'rating:asc', 'ticketPrice:asc', 'ticketPrice:desc', 'createdAt:desc', 'createdAt:asc', 'name:asc']).default('createdAt:desc'),
  includeInactive: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(false)),
});

export type DestinationFilterQuery = z.infer<typeof destinationFilterQuerySchema>;

// Schema bật / tắt trạng thái hiển thị
export const destinationStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'Trạng thái isActive là bắt buộc' }),
});
export type DestinationStatusDto = z.infer<typeof destinationStatusSchema>;