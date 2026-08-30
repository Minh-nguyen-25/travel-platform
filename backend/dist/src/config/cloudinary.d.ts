import { v2 as cloudinary } from 'cloudinary';
export interface CloudinaryConfigurationStatus {
    configured: boolean;
    source: 'CLOUDINARY_URL' | 'individual_variables' | null;
    invalidKeys: string[];
}
export declare const cloudinaryConfigurationStatus: CloudinaryConfigurationStatus;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map