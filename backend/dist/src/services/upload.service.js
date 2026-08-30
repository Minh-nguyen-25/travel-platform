"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCloudinaryImageByUrl = exports.deleteUploadedImages = exports.uploadImagesToCloudinary = exports.getPublicIdFromUrl = exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = __importStar(require("../config/cloudinary"));
const constants_1 = require("../constants");
const app_error_1 = require("../utils/app-error");
const missingConfigurationError = () => {
    console.error('[Cloudinary] Missing or placeholder configuration:', cloudinary_1.cloudinaryConfigurationStatus.invalidKeys.join(', '));
    return new app_error_1.AppError('Cloudinary chưa được cấu hình. Hãy thay các giá trị mẫu CLOUDINARY_* trong backend/.env rồi khởi động lại backend.', constants_1.HTTP_STATUS.SERVICE_UNAVAILABLE);
};
const normalizeUploadError = (error) => {
    if (error instanceof app_error_1.AppError)
        return error;
    const cloudinaryError = error;
    const providerMessage = cloudinaryError.message?.toLowerCase() ?? '';
    if (cloudinaryError.http_code === 401
        || /unknown api key|invalid signature|invalid cloud name|authentication/.test(providerMessage)) {
        return new app_error_1.AppError('Thông tin xác thực Cloudinary không hợp lệ. Hãy kiểm tra CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET trong backend/.env.', constants_1.HTTP_STATUS.SERVICE_UNAVAILABLE);
    }
    if (/timeout|timed out|network|econn|enotfound|fetch failed/.test(providerMessage)) {
        return new app_error_1.AppError('Không thể kết nối tới Cloudinary. Hãy kiểm tra mạng và thử tải ảnh lại.', constants_1.HTTP_STATUS.SERVICE_UNAVAILABLE);
    }
    return new app_error_1.AppError('Cloudinary không thể xử lý ảnh. Hãy kiểm tra định dạng, dung lượng ảnh và cấu hình tài khoản.', constants_1.HTTP_STATUS.BAD_GATEWAY);
};
const uploadToCloudinary = (buffer, folder, publicId) => {
    if (!cloudinary_1.cloudinaryConfigurationStatus.configured) {
        return Promise.reject(missingConfigurationError());
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream({
            folder: `travel-platform/${folder}`,
            public_id: publicId,
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        }, (error, result) => {
            if (error || !result)
                return reject(error ?? new Error('Cloudinary không trả về kết quả'));
            resolve(result);
        });
        stream.end(buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    await cloudinary_1.default.uploader.destroy(publicId);
};
exports.deleteFromCloudinary = deleteFromCloudinary;
// Lấy publicId đầy đủ (bao gồm folder) từ URL Cloudinary.
const getPublicIdFromUrl = (url) => {
    try {
        const parsedUrl = new URL(url);
        if (!parsedUrl.hostname.endsWith('cloudinary.com'))
            return null;
        const segments = parsedUrl.pathname.split('/').filter(Boolean);
        const uploadIndex = segments.indexOf('upload');
        if (uploadIndex < 0)
            return null;
        const afterUpload = segments.slice(uploadIndex + 1);
        const versionIndex = afterUpload.findIndex((segment) => /^v\d+$/.test(segment));
        const publicIdSegments = versionIndex >= 0
            ? afterUpload.slice(versionIndex + 1)
            : afterUpload;
        if (publicIdSegments.length === 0)
            return null;
        const lastIndex = publicIdSegments.length - 1;
        publicIdSegments[lastIndex] = publicIdSegments[lastIndex].replace(/\.[^.]+$/, '');
        return decodeURIComponent(publicIdSegments.join('/')) || null;
    }
    catch {
        return null;
    }
};
exports.getPublicIdFromUrl = getPublicIdFromUrl;
const uploadImagesToCloudinary = async (files, folder = 'destinations') => {
    const results = await Promise.allSettled(files.map((file) => (0, exports.uploadToCloudinary)(file.buffer, folder)));
    const successful = results
        .filter((result) => result.status === 'fulfilled')
        .map(({ value }) => value);
    const failed = results.find((result) => result.status === 'rejected');
    if (failed) {
        await Promise.allSettled(successful.map(({ public_id }) => (0, exports.deleteFromCloudinary)(public_id)));
        throw normalizeUploadError(failed.reason);
    }
    return successful.map((result) => ({
        imageUrl: result.secure_url,
        publicId: result.public_id,
    }));
};
exports.uploadImagesToCloudinary = uploadImagesToCloudinary;
const deleteUploadedImages = async (images) => {
    await Promise.allSettled(images.map(({ publicId }) => (0, exports.deleteFromCloudinary)(publicId)));
};
exports.deleteUploadedImages = deleteUploadedImages;
const deleteCloudinaryImageByUrl = async (imageUrl) => {
    const publicId = (0, exports.getPublicIdFromUrl)(imageUrl);
    if (!publicId)
        return;
    await (0, exports.deleteFromCloudinary)(publicId);
};
exports.deleteCloudinaryImageByUrl = deleteCloudinaryImageByUrl;
//# sourceMappingURL=upload.service.js.map