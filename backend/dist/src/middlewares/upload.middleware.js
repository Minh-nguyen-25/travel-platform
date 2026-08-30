"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const constants_1 = require("../constants");
const app_error_1 = require("../utils/app-error");
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new app_error_1.AppError('Chỉ chấp nhận file ảnh: jpeg, jpg, png, webp', constants_1.HTTP_STATUS.BAD_REQUEST));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
});
exports.uploadSingle = upload.single('image');
exports.uploadMultiple = upload.array('images', 5);
//# sourceMappingURL=upload.middleware.js.map