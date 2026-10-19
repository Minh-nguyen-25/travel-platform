# Nâng cấp luồng chuyến đi — 16/10/2026

## Các thay đổi

| Phần | Hành vi mới |
| --- | --- |
| Chuyến đi | Biểu mẫu chỉnh tên, thành phố, ngày, số người, ngân sách và mô tả. Đổi ngày bắt đầu dịch các ngày có lịch trong cùng transaction. Không cho thu ngắn đến mức làm mất ngày có lịch. |
| Ngày | Chỉnh ngày/ghi chú, xóa có xác nhận, bổ sung các ngày còn thiếu mà không tạo lại ngày đã có. |
| Hoạt động | Chỉnh địa điểm, giờ, chi phí, phương tiện và ghi chú. Đổi địa điểm làm mất hiệu lực thông tin chặng cũ. Dùng “Tính lại giờ & chặng” để lập lại lịch sau chỉnh sửa. |
| AI Chat | Lưu hội thoại và câu trả lời, nguồn tham khảo, bản nháp trong PostgreSQL theo tài khoản. Tự mở lại hội thoại gần nhất, chọn hoặc xóa hội thoại. Backend lấy tối đa 12 tin gần nhất từ database làm ngữ cảnh và bỏ qua lịch sử do client gửi. |
| AI Planner | Thêm Ollama cho suy luận local bên cạnh hai provider hiện có. Model vẫn chỉ chọn ID địa điểm hợp lệ trong database. Không huấn luyện model mới và không tự bổ sung địa điểm chưa xác minh. |
| Kéo thả | Tính lại từng chặng và giờ; giữ giờ bắt đầu ngày và thời lượng từng hoạt động. Lưu thứ tự/giờ/chặng nguyên tử; từ chối khi dữ liệu đổi trong lúc tính hoặc khi lịch vượt 23:59. |
| Bản đồ | Bản đồ trong chi tiết chuyến đi và ngày đang chọn của trang chia sẻ. Tuyến công khai không cần tài khoản, chỉ lấy các điểm đã lưu, kiểm tra lại share token mỗi yêu cầu. |
| Chi phí | Thêm/sửa/xóa chi phí thực tế, ghi nhận/xóa thanh toán thủ công, trả từng phần, trạng thái còn nợ/đã trả; so sánh với dự toán và ngân sách. Tính tiền bằng Decimal và dùng transaction Serializable để tránh trả quá số còn nợ khi có yêu cầu đồng thời. |

Các ghi nhận thanh toán là sổ theo dõi tiền đã trả bên ngoài; chưa thực hiện thu tiền qua VNPay, MoMo, Stripe hoặc cổng khác. Cần chọn nhà cung cấp và cấu hình tài khoản merchant trước khi tích hợp giao dịch trực tuyến và webhook đối soát của nhà cung cấp.

## Cơ sở dữ liệu

Migration `20261016000000_travel_workflow_upgrade` thêm `ai_conversations`, `ai_messages`, `trip_expenses`, `expense_payments` và nguồn tính chặng trên `itineraries`. Không reset hoặc xóa các bảng hiện có.

```powershell
cd backend
npx prisma generate
npx prisma migrate deploy
```

Migration đã được áp dụng vào database local của worktree trong lần triển khai này. Giữ PostgreSQL và Redis chạy khi dùng ứng dụng hoặc chạy kiểm thử tích hợp.

## Bật AI local

Cài Ollama, tải model có khả năng gọi công cụ, rồi đặt các giá trị sau trong `backend/.env`:

```dotenv
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:7b
AI_REQUEST_TIMEOUT_MS=180000
```

```powershell
ollama pull qwen2.5:7b
ollama serve
```

Chỉ chạy `ollama serve` nếu dịch vụ chưa chạy. Nếu đã đặt `AI_MODEL`, biến đó được ưu tiên hơn `OLLAMA_MODEL`; bỏ override hoặc đổi sang model local đã tải. Khởi động lại backend sau khi sửa `.env`. Cấu hình AI hiện tại được giữ nguyên cho đến khi bạn chủ động chọn Ollama. Không có API key nào được gửi trong yêu cầu Ollama.

Adapter dùng `/api/chat`, JSON Schema cho lịch trình và vòng gọi công cụ có giới hạn theo [tài liệu Ollama](https://docs.ollama.com/api/chat). Năng lực và tốc độ phụ thuộc model, RAM/VRAM và phần cứng. Chưa kiểm thử suy luận với model local thật trong môi trường này.

Suy luận local vẫn có thể gọi dịch vụ bản đồ OSRM. Muốn planner không gọi định tuyến bên ngoài thì đặt `AI_ROUTING_ENABLED=false`. Bản đồ nền và tính tuyến khi kéo thả có cấu hình/dịch vụ riêng.

## Giới hạn và quy tắc

- Kéo thả dùng tối đa ba yêu cầu định tuyến đồng thời với hạn chờ chung 12 giây. Khi không lấy được tuyến, dùng khoảng cách tọa độ × 1,3 và vận tốc tham khảo, đánh dấu `ESTIMATE`. Đây là dự tính, không phải thời gian giao thông thực tế hay lịch phương tiện công cộng.
- Chặng `TRANSIT` luôn dùng ước tính. Bản đồ toàn ngày dùng phương tiện của chặng đầu; công cộng được xấp xỉ bằng ô tô. Tối đa 100 điểm cho một tuyến bản đồ theo giới hạn hiện có.
- Danh sách hội thoại hiển thị 100 hội thoại gần nhất. Các hội thoại và tin nhắn được lưu đến khi người dùng xóa hoặc tài khoản bị xóa. Bản nháp cũ được cấp lại chữ ký khi chủ tài khoản mở hội thoại.
- Chi phí và giao dịch thủ công chỉ hiển thị với chủ chuyến đi, không đưa vào dữ liệu chia sẻ. Xóa ngày không xóa sổ chi phí; xóa chuyến đi sẽ xóa sổ của chuyến đó. Muốn xóa chi phí có thanh toán, phải xóa các ghi nhận thanh toán trước.
- Đối soát so sánh toàn bộ chi phí phát sinh đã ghi với toàn bộ dự toán; người dùng cần ghi đủ chi phí để có số liệu đầy đủ. Tiền tệ giao diện là VND.

## Kiểm tra

```powershell
cd backend
npm test
# Dùng database đã migrate, có ít nhất hai địa điểm đang hoạt động:
node --test tests/travel-upgrade.integration.cjs

cd ../frontend
npm test
npm run build
```

Kiểm thử tích hợp tạo tài khoản riêng, thực hiện API thật với PostgreSQL, kiểm tra thanh toán đồng thời, quyền truy cập hội thoại và thu hồi chia sẻ, rồi dọn dữ liệu của chính các tài khoản kiểm thử. Chỉ giả lập biên AI và định tuyến để không gọi dịch vụ tính phí hoặc phụ thuộc mạng bên ngoài.
