# 📦 Hướng dẫn Seed Dữ liệu Demo (Database Seeding Guide)

Tài liệu này hướng dẫn cách cấu hình và thực thi hệ thống seed dữ liệu tự động cho nền tảng **TravelGo**.

---

## 🎯 Mục đích & Đặc tính hệ thống Seed

1. **Đầy đủ dữ liệu demo**: Cung cấp 8 danh mục, 30 điểm đến du lịch Việt Nam (Bắc – Trung – Nam), 8 tài khoản người dùng demo với sở thích cá nhân hóa, 59 đánh giá chân thực kèm tính toán rating tự động, 27 địa điểm yêu thích và 7 lịch trình chuyến đi chi tiết.
2. **Idempotent (Tái thực thi an toàn)**: Script có thể chạy lại nhiều lần bất kỳ lúc nào mà không phát sinh bản ghi trùng lặp, không tăng số lượng dòng ngoài dự kiến.
3. **An toàn dữ liệu tuyệt đối**:
   - **Không xóa**: Không sử dụng `deleteMany()` để xóa trắng bảng, không reset database hay drop bảng.
   - **Bảo vệ tài khoản thật**: Không ghi đè mật khẩu hoặc role của bất kỳ tài khoản người dùng thật hay tài khoản `ADMIN` hiện có trong hệ thống.
   - **Chặn Production**: Tự động phát hiện và từ chối chạy nếu `NODE_ENV === "production"`. Script chỉ được phép thực thi thủ công trên môi trường Development hoặc Test.
4. **Bảo mật mật khẩu**:
   - Không hardcode mật khẩu trong source code.
   - Mật khẩu cho 8 tài khoản demo được lấy từ biến môi trường `SEED_DEMO_PASSWORD` và mã hóa bằng `bcrypt` (12 rounds) theo đúng chuẩn Auth của dự án.

---

## 📋 Điều kiện tiên quyết

Trước khi chạy seed, hãy đảm bảo:

1. **PostgreSQL đang chạy**:
   - Khởi động dịch vụ container:
     ```bash
     docker compose up -d
     ```
   - Xác nhận cổng kết nối `5433` (hoặc cổng cấu hình trong `DATABASE_URL`) đã sẵn sàng.
2. **Migrations đã được áp dụng đầy đủ**:
   ```bash
   cd backend
   npm run db:migrate
   ```
3. **Cấu hình biến môi trường**:
   - Mở file `backend/.env` (tạo từ `backend/.env.example` nếu chưa có).
   - Thiết lập giá trị cho `SEED_DEMO_PASSWORD`:
     ```env
     SEED_DEMO_PASSWORD=your_secure_password_for_local_testing
     ```
   *(Lưu ý: Không dùng mật khẩu thực tế hoặc cam kết thông tin nhạy cảm lên Git repository).*

---

## 🚀 Lệnh thực thi Seed

Tại thư mục `backend`, chạy lệnh:

```bash
npm run db:seed
```

Hoặc từ thư mục gốc của repository:

```bash
npm --prefix backend run db:seed
```

---

## 📊 Kết quả kiểm tra tính Idempotent

Hệ thống seed sử dụng khóa định danh duy nhất (`email` cho User, `name` cho Category, `name/alias` cho Destination, composite unique cho Relations/Reviews/Favorites/Itineraries) kết hợp cơ chế `upsert`.

Bảng số lượng dữ liệu ghi nhận thực tế trên hệ thống:

| Bảng dữ liệu | Trước seed | Sau seed lần 1 | Sau seed lần 2 (Idempotent) |
| :--- | :--- | :--- | :--- |
| `categories` | 5 | **8** | **8** (Không đổi) |
| `destinations` | 15 | **40** | **40** (Không đổi) |
| `destination_categories` | 24 | **90** | **90** (Không đổi) |
| `destination_images` | 15 | **78** | **78** (Không đổi) |
| `users` | 6 | **14** (Thêm 8 demo users) | **14** (Không đổi) |
| `travel_preferences` | 1 | **9** | **9** (Không đổi) |
| `reviews` | 3 | **62** | **62** (Không đổi) |
| `favorites` | 3 | **30** | **30** (Không đổi) |
| `trips` | 4 | **11** | **11** (Không đổi) |
| `trip_days` | 14 | **36** | **36** (Không đổi) |
| `itineraries` | 4 | **47** | **47** (Không đổi) |

---

## 👥 Danh sách 8 tài khoản Demo

Tất cả 8 tài khoản demo đều có role `USER`, authProvider `LOCAL`, trạng thái `isActive = true`, và mật khẩu tương ứng giá trị `SEED_DEMO_PASSWORD`:

1. `demo.an@example.com` (Nguyễn Văn An — Khám phá văn hóa & lịch sử)
2. `demo.binh@example.com` (Trần Thị Thanh Bình — Nghỉ dưỡng biển cao cấp)
3. `demo.chi@example.com` (Lê Quỳnh Chi — Food tour & Cà phê đô thị)
4. `demo.dung@example.com` (Phạm Hoàng Dũng — Trekking & Phượt mạo hiểm)
5. `demo.ha@example.com` (Hoàng Thu Hà — Sinh thái & Thiên nhiên xanh)
6. `demo.khanh@example.com` (Vũ Nam Khánh — Nghệ thuật, Cố đô & Lễ hội)
7. `demo.linh@example.com` (Đỗ Thùy Linh — Check-in cảnh đẹp & Nhiếp ảnh)
8. `demo.minh@example.com` (Bùi Nhật Minh — Du lịch chậm & Bình yên)
