"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const cloudinary_1 = require("./config/cloudinary");
const db_1 = __importDefault(require("./config/db"));
const PORT = process.env.PORT || 3000;
const start = async () => {
    try {
        // Kiểm tra kết nối DB ngay khi startup
        // Nếu DB chết → phát hiện ngay, không phải đợi query đầu tiên
        await db_1.default.$connect();
        console.log('✅ Kết nối Database thành công');
        if (cloudinary_1.cloudinaryConfigurationStatus.configured) {
            console.log(`✅ Cloudinary đã cấu hình qua ${cloudinary_1.cloudinaryConfigurationStatus.source}`);
        }
        else {
            console.warn(`⚠️  Cloudinary chưa được cấu hình (${cloudinary_1.cloudinaryConfigurationStatus.invalidKeys.join(', ')}). `
                + 'Chức năng upload ảnh sẽ tạm thời không hoạt động.');
        }
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
            console.log(`📋 Health check: http://localhost:${PORT}/api/v1/health`);
            console.log(`📊 Prisma Studio: chạy "npm run db:studio"`);
        });
    }
    catch (error) {
        console.error('❌ Không thể kết nối Database:', error);
        await db_1.default.$disconnect();
        process.exit(1);
    }
};
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('⚠️  Đang tắt server...');
    await db_1.default.$disconnect();
    process.exit(0);
});
start();
//# sourceMappingURL=server.js.map