import { UploadApiResponse } from 'cloudinary';
import { UploadedDestinationImage } from '../types/destination.types';
export declare const uploadToCloudinary: (buffer: Buffer, folder: string, publicId?: string) => Promise<UploadApiResponse>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
export declare const getPublicIdFromUrl: (url: string) => string | null;
export declare const uploadImagesToCloudinary: (files: Express.Multer.File[], folder?: string) => Promise<UploadedDestinationImage[]>;
export declare const deleteUploadedImages: (images: UploadedDestinationImage[]) => Promise<void>;
export declare const deleteCloudinaryImageByUrl: (imageUrl: string) => Promise<void>;
//# sourceMappingURL=upload.service.d.ts.map