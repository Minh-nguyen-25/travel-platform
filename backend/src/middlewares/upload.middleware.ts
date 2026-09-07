import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../utils/app-error';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Chỉ chấp nhận file ảnh: jpeg, jpg, png, webp', HTTP_STATUS.BAD_REQUEST));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});

export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 5);
