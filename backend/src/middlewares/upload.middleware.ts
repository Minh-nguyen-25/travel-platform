import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

import path from 'path';

// Lưu file tạm trong memory — upload.service.ts sẽ đẩy lên Cloudinary hoặc Local Storage
const storage = multer.memoryStorage();

const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg', '.jfif', '.bmp'];

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype.startsWith('image/') || validExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file định dạng hình ảnh (jpg, png, webp, avif, svg...)'));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Dùng: router.post('/reviews', authenticate, uploadSingle, reviewController.create)
export const uploadSingle = uploadMiddleware.single('image');

// Dùng cho upload nhiều ảnh (mặc định tối đa 20 ảnh)
export const uploadMultiple = uploadMiddleware.array('images', 20);