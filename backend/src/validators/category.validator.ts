import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Tên danh mục không được để trống').max(100, 'Tên danh mục tối đa 100 ký tự'),
  description: z.string().trim().max(500, 'Mô tả tối đa 500 ký tự').optional().nullable(),
});

export type CategoryDto = z.infer<typeof categorySchema>;

export const categoryUpdateSchema = categorySchema.partial();
export type CategoryUpdateDto = z.infer<typeof categoryUpdateSchema>;