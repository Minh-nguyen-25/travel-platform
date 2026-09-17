import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
}

/**
 * Upload buffer lên Cloudinary. Nếu Cloudinary chưa được cấu hình hoặc lỗi,
 * tự động lưu trữ cục bộ vào thư mục uploads/ và phục vụ qua HTTP để không bao giờ mất ảnh thật.
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  originalFilename?: string
): Promise<UploadApiResponse> => {
  // 1. Thử upload lên Cloudinary nếu có cấu hình
  if (hasCloudinaryConfig) {
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `travel-platform/${folder}`,
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });
      return result;
    } catch (err) {
      console.warn('⚠️ Cloudinary upload thất bại, chuyển sang lưu trữ cục bộ:', err);
    }
  }

  // 2. Lưu trữ cục bộ (Local Storage Fallback)
  const ext = originalFilename ? path.extname(originalFilename) : '.jpg';
  const filename = `${Date.now()}-${randomUUID()}${ext || '.jpg'}`;
  const uploadDir = path.join(process.cwd(), 'uploads', folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const fileUrl = `${baseUrl}/uploads/${folder}/${filename}`;

  return {
    secure_url: fileUrl,
    url: fileUrl,
    public_id: filename,
    version: 1,
    width: 800,
    height: 600,
    format: ext.replace('.', ''),
    resource_type: 'image',
    created_at: new Date().toISOString(),
    bytes: buffer.length,
    type: 'upload',
    etag: filename,
    placeholder: false,
  } as UploadApiResponse;
};

export default cloudinary;