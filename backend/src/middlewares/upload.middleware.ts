import multer, { FileFilterCallback } from 'multer';
import { Request, RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../utils/app-error';

const storage = multer.memoryStorage();
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const detectImageType = (buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null => {
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
};

const validImage = (file: Express.Multer.File): boolean => {
  const actual = detectImageType(file.buffer);
  const claimed = file.mimetype === 'image/jpg' ? 'image/jpeg' : file.mimetype;
  const extension = file.originalname.toLowerCase().match(/\.([a-z]+)$/)?.[1];
  const expectedExtension = actual === 'image/jpeg' ? ['jpg', 'jpeg'] : actual === 'image/png' ? ['png'] : ['webp'];
  return Boolean(actual && claimed === actual && extension && expectedExtension.includes(extension));
};

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
    fileSize: MAX_IMAGE_BYTES,
    files: 5,
  },
});

const verifyUpload = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  handler(req, res, (error?: unknown) => {
    if (error) return next(error);
    const files = req.file ? [req.file] : Array.isArray(req.files) ? req.files : [];
    if (files.some((file) => !validImage(file))) {
      return next(new AppError('File phải là ảnh JPEG, PNG hoặc WebP hợp lệ, đúng phần mở rộng', HTTP_STATUS.BAD_REQUEST));
    }
    next();
  });
};

export const uploadSingle = verifyUpload(upload.single('image'));
export const uploadMultiple = verifyUpload(upload.array('images', 5));
