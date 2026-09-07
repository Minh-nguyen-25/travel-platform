import { UploadApiResponse } from 'cloudinary';
import cloudinary, { cloudinaryConfigurationStatus } from '../config/cloudinary';
import { HTTP_STATUS } from '../constants';
import { UploadedDestinationImage } from '../types/destination.types';
import { AppError } from '../utils/app-error';

type CloudinarySdkError = Error & { http_code?: number };

const missingConfigurationError = (): AppError => {
  console.error(
    '[Cloudinary] Missing or placeholder configuration:',
    cloudinaryConfigurationStatus.invalidKeys.join(', ')
  );
  return new AppError(
    'Cloudinary chưa được cấu hình. Hãy thay các giá trị mẫu CLOUDINARY_* trong backend/.env rồi khởi động lại backend.',
    HTTP_STATUS.SERVICE_UNAVAILABLE
  );
};

const normalizeUploadError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;
  const cloudinaryError = error as Partial<CloudinarySdkError>;
  const providerMessage = cloudinaryError.message?.toLowerCase() ?? '';

  if (
    cloudinaryError.http_code === 401
    || /unknown api key|invalid signature|invalid cloud name|authentication/.test(providerMessage)
  ) {
    return new AppError(
      'Thông tin xác thực Cloudinary không hợp lệ. Hãy kiểm tra CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET trong backend/.env.',
      HTTP_STATUS.SERVICE_UNAVAILABLE
    );
  }

  if (/timeout|timed out|network|econn|enotfound|fetch failed/.test(providerMessage)) {
    return new AppError(
      'Không thể kết nối tới Cloudinary. Hãy kiểm tra mạng và thử tải ảnh lại.',
      HTTP_STATUS.SERVICE_UNAVAILABLE
    );
  }

  return new AppError(
    'Cloudinary không thể xử lý ảnh. Hãy kiểm tra định dạng, dung lượng ảnh và cấu hình tài khoản.',
    HTTP_STATUS.BAD_GATEWAY
  );
};

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<UploadApiResponse> => {
  if (!cloudinaryConfigurationStatus.configured) {
    return Promise.reject(missingConfigurationError());
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder.startsWith('travelgo/') ? folder : `travelgo/${folder}`,
        public_id: publicId,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],

      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary không trả về kết quả'));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

// Lấy publicId đầy đủ (bao gồm folder) từ URL Cloudinary.
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith('cloudinary.com')) return null;

    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const uploadIndex = segments.indexOf('upload');
    if (uploadIndex < 0) return null;

    const afterUpload = segments.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex((segment) => /^v\d+$/.test(segment));
    const publicIdSegments = versionIndex >= 0
      ? afterUpload.slice(versionIndex + 1)
      : afterUpload;

    if (publicIdSegments.length === 0) return null;

    const lastIndex = publicIdSegments.length - 1;
    publicIdSegments[lastIndex] = publicIdSegments[lastIndex].replace(/\.[^.]+$/, '');
    return decodeURIComponent(publicIdSegments.join('/')) || null;
  } catch {
    return null;
  }
};

export const uploadImagesToCloudinary = async (
  files: Express.Multer.File[],
  folder = 'destinations'
): Promise<UploadedDestinationImage[]> => {
  const results = await Promise.allSettled(
    files.map((file) => uploadToCloudinary(file.buffer, folder))
  );
  const successful = results
    .filter((result): result is PromiseFulfilledResult<UploadApiResponse> => result.status === 'fulfilled')
    .map(({ value }) => value);
  const failed = results.find((result) => result.status === 'rejected');

  if (failed) {
    await Promise.allSettled(successful.map(({ public_id }) => deleteFromCloudinary(public_id)));
    throw normalizeUploadError(failed.reason);
  }

  return successful.map((result) => ({
    imageUrl: result.secure_url,
    publicId: result.public_id,
  }));
};

export const deleteUploadedImages = async (
  images: UploadedDestinationImage[]
): Promise<void> => {
  await Promise.allSettled(images.map(({ publicId }) => deleteFromCloudinary(publicId)));
};

export const deleteCloudinaryImageByUrl = async (imageUrl: string): Promise<void> => {
  const publicId = getPublicIdFromUrl(imageUrl);
  if (!publicId) return;

  await deleteFromCloudinary(publicId);
};
