# Hướng dẫn Setup Dự án (Travel Platform)

## Yêu cầu hệ thống (Bắt buộc)
1. Cài đặt **Node.js** (Bản LTS).
2. Cài đặt **Docker Desktop** (Bật sẵn lên trước khi chạy code).

## Các bước khởi chạy môi trường

**Bước 1: Clone dự án và cài thư viện**
\`\`\`bash
git clone https://github.com/Minh-nguyen-25/travel-platform.git
cd travel-platform/backend
npm install
\`\`\`

**Bước 2: Cấu hình môi trường**
- Tạo một file `.env` bên trong thư mục `backend`.
- Copy toàn bộ nội dung từ file `.env.example` sang file `.env` vừa tạo.

**Bước 3: Khởi động Database (Bằng Docker)**
- Mở Terminal ở **thư mục gốc** (`travel-platform`), chạy lệnh:
\`\`\`bash
docker compose up -d
\`\`\`
*(Hệ thống sẽ tự tạo PostgreSQL ở cổng 5433 và Redis ở cổng 6380 để tránh xung đột với các app có sẵn trên Windows).*

**Bước 4: Đồng bộ cấu trúc bảng**
- Mở Terminal ở thư mục `backend`, chạy lệnh:
\`\`\`bash
npx prisma migrate dev
\`\`\`
*(Lệnh này sẽ đẩy toàn bộ 12 bảng vào Database).*