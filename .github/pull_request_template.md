## 📌 Mô tả công việc (Pull Request Summary)
<!-- Tóm tắt ngắn gọn những gì bạn đã làm trong nhánh này -->
- **Module:** 
- **Tính năng / Nhiệm vụ:** 

---

## 🛠️ Những thay đổi chính (Key Changes)
<!-- Liệt kê các file mới tạo hoặc sửa đổi chính -->
- [ ] Thêm Validator: `src/validators/...`
- [ ] Thêm Repository: `src/repositories/...`
- [ ] Thêm Service: `src/services/...`
- [ ] Thêm Controller: `src/controllers/...`
- [ ] Thêm Route: `src/routes/...`
- [ ] Đăng ký route vào: `src/routes/index.ts`

---

## 📡 Danh sách API Endpoints mới / Cập nhật
| Method | Endpoint | Auth | Role | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/...` | ❌ | All | Lấy danh sách ... |
| `POST` | `/api/v1/...` | ✅ | `USER` | Tạo mới ... |

---

## 🧪 Kết quả Kiểm thử (Testing)
<!-- Đính kèm ảnh chụp màn hình / response Postman / logs nếu có -->
- [ ] Đã test case Thành công (200 / 201)
- [ ] Đã test case Lỗi dữ liệu đầu vào (422 Validation Error)
- [ ] Đã test case Không tìm thấy (404 Not Found)
- [ ] Đã test case Phân quyền (401 Unauthorized / 403 Forbidden)

---

## ✅ Checklist tự kiểm tra trước khi tạo PR
- [ ] Code tuân thủ kiến trúc trong `backend/docs/travel-platform-development-guide.md`
- [ ] Truy vấn database nằm hoàn toàn trong `repository`, không gọi Prisma từ `controller`
- [ ] Dùng `AppError` để ném lỗi nghiệp vụ trong `service`
- [ ] Dùng `sendSuccess`, `sendPaginated`, `sendError` từ `response.utils.ts`
- [ ] Chạy `npx tsc --noEmit` **không có bất kỳ lỗi TypeScript nào**
- [ ] **Không sửa/xóa** các file core dùng chung (`app.ts`, `server.ts`, `middlewares/*`, `config/*`, `utils/*`) nếu chưa có sự đồng ý của Leader
- [ ] Không commit file `.env`, `node_modules`, `dist`
