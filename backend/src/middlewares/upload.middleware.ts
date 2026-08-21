import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Lưu file tạm trong memory — upload.service.ts sẽ đẩy lên Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh: jpeg, jpg, png, webp'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Dùng: router.post('/reviews', authenticate, uploadSingle, reviewController.create)
export const uploadSingle = upload.single('image');

// Dùng cho upload nhiều ảnh (tối đa 5)
export const uploadMultiple = upload.array('images', 5);
