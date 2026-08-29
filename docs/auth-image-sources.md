# TravelGo — Tài liệu Nguồn ảnh Hero Authentication (Auth Image Sources)

Tài liệu này ghi nhận thông tin nguồn và bản quyền của các hình ảnh hero được sử dụng trên trang xác thực (Login & Register).

---

## Danh sách hình ảnh hiện tại

### 1. Phố cổ Hội An (`hoi-an-auth.webp`)
- **Tập tin cục bộ**: `frontend/src/assets/images/auth/hoi-an-auth.webp`
- **Địa danh**: Phố cổ Hội An, Tỉnh Quảng Nam, Việt Nam
- **Định dạng**: WebP
- **Kích thước file**: ~234 KB (239,726 bytes)
- **Nguồn gốc**: Nguồn gốc thông tin không khả dụng — tài nguyên có sẵn của dự án (*Source information unavailable — existing project asset*)
- **Trạng thái**: Đã tối ưu hóa WebP, sử dụng nội bộ cho dự án học tập/đồ án.

### 2. Vịnh Hạ Long (`ha-long-auth.webp`)
- **Tập tin cục bộ**: `frontend/src/assets/images/auth/ha-long-auth.webp`
- **Địa danh**: Vịnh Hạ Long, Tỉnh Quảng Ninh, Việt Nam
- **Định dạng**: WebP
- **Kích thước file**: ~223 KB (228,262 bytes)
- **Nguồn gốc**: Nguồn gốc thông tin không khả dụng — tài nguyên có sẵn của dự án (*Source information unavailable — existing project asset*)
- **Trạng thái**: Đã tối ưu hóa WebP, sử dụng nội bộ cho dự án học tập/đồ án.

### 3. Tràng An / Ninh Bình (`trang-an-auth.webp`)
- **Tập tin cục bộ**: `frontend/src/assets/images/auth/trang-an-auth.webp`
- **Địa danh**: Quần thể danh thắng Tràng An, Tỉnh Ninh Bình, Việt Nam
- **Định dạng**: WebP (chuyển đổi từ ảnh cung cấp thủ công `trang-an-auth.jpg`)
- **Kích thước file**: ~370 KB (378,438 bytes)
- **Kích thước pixel**: 1643 × 924
- **Nguồn gốc**: Nguồn gốc thông tin không khả dụng — tài nguyên được cung cấp thủ công cho dự án (*Source information unavailable — manually supplied project asset*)
- **Trạng thái**: Đã tối ưu hóa WebP, sử dụng nội bộ cho dự án học tập/đồ án.

### 4. Đà Lạt (`da-lat-auth.webp`)
- **Tập tin cục bộ**: `frontend/src/assets/images/auth/da-lat-auth.webp`
- **Địa danh**: Thành phố Đà Lạt, Tỉnh Lâm Đồng, Việt Nam
- **Định dạng**: WebP (chuyển đổi từ ảnh cung cấp thủ công `da-lat-auth.jpg`)
- **Kích thước file**: ~199 KB (203,512 bytes)
- **Kích thước pixel**: 1000 × 668
- **Nguồn gốc**: Nguồn gốc thông tin không khả dụng — tài nguyên được cung cấp thủ công cho dự án (*Source information unavailable — manually supplied project asset*)
- **Trạng thái**: Đã tối ưu hóa WebP, sử dụng nội bộ cho dự án học tập/đồ án.

### 5. Sa Pa (`sa-pa-auth.webp`)
- **Tập tin cục bộ**: `frontend/src/assets/images/auth/sa-pa-auth.webp`
- **Địa danh**: Thị xã Sa Pa, Tỉnh Lào Cai, Việt Nam
- **Định dạng**: WebP (chuyển đổi từ ảnh cung cấp thủ công `sa-pa-auth.jpg`)
- **Kích thước file**: ~494 KB (505,446 bytes)
- **Kích thước pixel**: 1920 × 1281
- **Nguồn gốc**: Nguồn gốc thông tin không khả dụng — tài nguyên được cung cấp thủ công cho dự án (*Source information unavailable — manually supplied project asset*)
- **Trạng thái**: Đã tối ưu hóa WebP, sử dụng nội bộ cho dự án học tập/đồ án.

### 6. Đà Nẵng (`da-nang-auth.webp`)
- **Tập tin cục bộ**: `frontend/src/assets/images/auth/da-nang-auth.webp`
- **Địa danh**: Bãi biển Mỹ Khê, Thành phố Đà Nẵng, Việt Nam
- **Định dạng**: WebP (chuyển đổi từ ảnh cung cấp thủ công `da-nang-auth.jpg`)
- **Kích thước file**: ~248 KB (254,346 bytes)
- **Kích thước pixel**: 1920 × 1298
- **Nguồn gốc**: Nguồn gốc thông tin không khả dụng — tài nguyên được cung cấp thủ công cho dự án (*Source information unavailable — manually supplied project asset*)
- **Trạng thái**: Đã tối ưu hóa WebP, sử dụng nội bộ cho dự án học tập/đồ án.

---

## Hướng dẫn mở rộng thêm địa danh mới
Khi thêm ảnh mới vào `frontend/src/assets/images/auth/`:
1. Chỉ sử dụng ảnh phong cảnh độ phân giải cao (khuyến nghị 1920×1080), đã chuyển đổi sang WebP chất lượng cao với dung lượng 200–400 KB.
2. Khai báo entry tương ứng trong `frontend/src/data/auth-heroes.ts`.
3. Ghi chép thông tin tác giả, đường dẫn trang nguồn và giấy phép bản quyền vào tài liệu này.
