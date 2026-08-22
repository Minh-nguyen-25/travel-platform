# 🌍 Travel Platform — Nền tảng Du lịch & Đề xuất Lịch trình Cá nhân hóa

> Dự án đồ án: **"Xây dựng nền tảng Web quản lý thông tin du lịch và đề xuất lịch trình cá nhân hóa"**  
> Nhóm 5 thành viên | Kiến trúc Monorepo: Node.js/Express + React/Vite + PostgreSQL + Redis

---

## 📚 Tài liệu Hướng dẫn cho Thành viên Nhóm

Mọi thành viên **bắt buộc đọc** tài liệu phát triển chuẩn trước khi code:
* 📖 **Tài liệu Kiến trúc & Quy chuẩn Code:** [`backend/docs/travel-platform-development-guide.md`](./backend/docs/travel-platform-development-guide.md)
* ⚡ **File Test API nhanh:** [`backend/requests.http`](./backend/requests.http)
* 📋 **Checklist & Quy trình tạo Pull Request:** [`.github/pull_request_template.md`](./.github/pull_request_template.md)

---

## 🚀 Hướng dẫn Cài đặt & Chạy Môi trường

### 1. Yêu cầu hệ thống
* **Node.js:** `v20.x` hoặc `v22.x LTS` (Khuyến nghị dùng `nvm`)
* **Docker Desktop:** Bật sẵn lên trước khi chạy database

### 2. Khởi chạy Database & Cache (Docker)
Mở Terminal tại thư mục gốc (`travel-platform`), chạy:
```bash
docker compose up -d
```
*(PostgreSQL chạy cổng `5433`, Redis chạy cổng `6380` để tránh xung đột trên Windows).*

### 3. Cài đặt & Khởi động Backend
```bash
cd backend
npm install
npm run db:migrate   # Đồng bộ 12 bảng vào PostgreSQL
npm run db:seed      # Nạp dữ liệu tài khoản Admin/User & Danh mục mẫu
npm run dev          # Khởi động server tại http://localhost:3000
```

### 4. Kiểm tra Database & Health Check
* **Health Check API:** `http://localhost:3000/api/v1/health`
* **Giao diện trực quan Prisma Studio:**
  ```bash
  npm run db:studio   # Mở http://localhost:5555
  ```

---

## 🌿 Git Workflow cho Thành viên

1. **Lấy code mới nhất:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Tạo nhánh tính năng:**
   ```bash
   git checkout -b feat/<ten-tinh-nang>
   # Ví dụ: git checkout -b feat/destination-crud
   ```
3. **Kiểm tra lỗi trước khi commit:**
   ```bash
   npx tsc --noEmit
   ```
4. **Commit & Push:**
   ```bash
   git add .
   git commit -m "feat: mô tả công việc đã làm"
   git push origin feat/<ten-tinh-nang>
   ```
5. Mở GitHub và tạo **Pull Request (PR)** để Nhóm trưởng review & merge.