# Thiết kế tích hợp nâng cấp AI Chat từ Travel_2

**Ngày:** 2026-09-16  
**Trạng thái:** Đã duyệt thiết kế  
**Dự án đích:** `travel-platform/travel-platform`  
**Nguồn tham chiếu:** working tree chưa commit tại `C:\Users\LOQ\OneDrive\Desktop\Travel_2\travel-platform`

## Mục tiêu

Tích hợp chọn lọc gói nâng cấp AI Chat từ `Travel_2` vào dự án đích mà không làm mất các thay đổi mới hơn trong dự án đích. Sau khi tích hợp, chatbot có thể tìm dữ liệu địa điểm phù hợp, tra cứu chuyến đi của người dùng, chuẩn bị bản nháp lịch trình và để người dùng xem trước khi lưu.

## Phạm vi

Phạm vi bao gồm:

- Tool calling cho OpenAI và Gemini trong AI Chat.
- Ba công cụ backend: `search_destinations`, `get_my_trips`, `prepare_itinerary`.
- Tìm kiếm và xếp hạng địa điểm theo tiếng Việt có dấu hoặc không dấu.
- Nguồn địa điểm trong phản hồi chat.
- Bản xem trước lịch trình và thao tác lưu chuyến đi do người dùng chủ động thực hiện.
- Model Gemini riêng cho chat thông qua `GEMINI_CHAT_MODEL`.
- Các kiểm thử tương ứng từ `Travel_2`, được điều chỉnh theo mã nguồn hiện tại.

Không thuộc phạm vi:

- Sao chép toàn bộ `Travel_2` hoặc hạ cấp những tính năng mới hơn của dự án đích.
- Sao chép file `.env`, API key, secret hoặc dữ liệu build.
- Thay đổi endpoint công khai hiện có của AI Chat.
- Cho AI tự động lưu, đặt vé, thanh toán hoặc thực hiện hành động bên ngoài hệ thống.
- Refactor các module không liên quan đến AI Chat.

## Phương án

Sử dụng tích hợp chọn lọc: chuyển từng thay đổi AI của working tree `Travel_2`, sau đó điều chỉnh theo giao diện, cấu hình và API nội bộ hiện có trong dự án đích. Không sao chép nguyên repository hoặc ghi đè file nếu file đích đã có thay đổi mới hơn.

## Kiến trúc

Endpoint `/ai/chat` và luồng xác thực hiện tại được giữ nguyên. Hợp đồng phản hồi được mở rộng với:

- `sources`: danh sách `{ id, name }` của các địa điểm đã được dùng làm ngữ cảnh.
- `draft`: bản nháp gồm lịch trình sinh ra, payload có thể lưu, cảnh báo và mức ngân sách; giá trị là `null` nếu không có bản nháp.

AI provider được phép yêu cầu backend thực hiện công cụ. Backend xác thực tất cả tham số, thực hiện truy vấn bằng quyền của người dùng hiện tại, sau đó gửi kết quả về provider để tạo câu trả lời cuối. Mỗi request có tối đa hai vòng tool calling và ba lời gọi công cụ trong một vòng.

## Thành phần backend

### Cấu hình AI

`AiConfig` bổ sung `chatModel`. Với Gemini, Planner tiếp tục dùng `GEMINI_MODEL`, còn Chat dùng `GEMINI_CHAT_MODEL` nếu được khai báo. `.env.example` chỉ chứa giá trị mẫu, không chứa secret.

Cấu hình từ `Travel_2` sẽ được xem là tham chiếu, không tự động ghi đè lựa chọn provider/model hiện có nếu dự án đích có chính sách mới hơn.

### Tìm kiếm địa điểm

Tiện ích `ai-search`:

- Chuẩn hóa từ khóa thành chữ thường không dấu.
- Loại các từ chung không mang ý nghĩa tìm kiếm.
- Xếp hạng theo trọng số: tên, địa chỉ, danh mục, mô tả.
- Dùng rating và ID làm tiêu chí phụ để kết quả ổn định.
- Trả về danh sách xếp hạng có giới hạn.

Repository thực hiện lọc ban đầu trên PostgreSQL bằng biểu thức chuẩn hóa tiếng Việt, sau đó xếp hạng lại trong ứng dụng. Khi truy vấn không có từ khóa cụ thể, repository trả về danh sách giới hạn theo rating.

### Agent và công cụ

- `search_destinations` nhận truy vấn tối đa 100 ký tự và trả về các địa điểm đang hoạt động.
- `get_my_trips` chỉ dùng `userId` đã xác thực từ request và trả về tối đa năm chuyến gần nhất.
- `prepare_itinerary` chỉ chạy khi người dùng thực sự yêu cầu lập lịch và đã cung cấp thành phố, số ngày cùng ngày bắt đầu hợp lệ.

Ngày bắt đầu do model tự suy diễn bị từ chối. Hệ thống chỉ ghép thông tin từ các tin nhắn theo sau một yêu cầu lập lịch đang hoạt động; ngày của một chủ đề cũ không được tái sử dụng cho yêu cầu mới.

## Thành phần frontend

Kiểu `AiChatResult` được mở rộng đồng bộ với backend. Mỗi tin nhắn trả lời có thể lưu `sources` và `draft` riêng.

Trang AI Chat:

- Hiển thị tối đa tám nguồn trước, phần còn lại có thể mở rộng.
- Liên kết mỗi nguồn đến trang chi tiết địa điểm bằng route hiện có.
- Hiển thị bản nháp theo ngày, hoạt động, chi phí, số người và cảnh báo.
- Lưu chuyến đi qua service hiện có chỉ sau khi người dùng bấm nút.
- Quản lý trạng thái đang lưu, lỗi và ID chuyến đã lưu theo từng tin nhắn.
- Xóa các trạng thái này khi người dùng đặt lại cuộc hội thoại.

Component `AiDraftPreview` chỉ nhận dữ liệu hiển thị và callback lưu. Component không tự gọi API, giúp luồng lưu dễ kiểm thử và giữ trách nhiệm tại trang chat.

## Luồng dữ liệu

1. Frontend gửi tin nhắn, lịch sử giới hạn và locale đến endpoint chat hiện có.
2. Backend xác thực input, tải sở thích, chuyến đi và các địa điểm liên quan đến câu hỏi.
3. Provider trả lời trực tiếp hoặc yêu cầu một trong ba công cụ.
4. Backend xác thực và thực hiện công cụ, sau đó gửi kết quả trở lại provider.
5. Backend trả về `reply`, `sources`, `draft`, metadata và số liệu ngữ cảnh.
6. Frontend hiển thị câu trả lời, nguồn và bản nháp.
7. Nếu người dùng bấm lưu, frontend gửi `tripDraft` qua luồng lưu hiện có và hiển thị liên kết chuyến đi sau khi thành công.

## Xử lý lỗi và an toàn

- Dùng Zod để từ chối tham số công cụ thiếu, thừa hoặc sai kiểu.
- Từ chối ngày không hợp lệ, số ngày ngoài 1–14 và truy vấn quá dài.
- Từ chối lời gọi công cụ không có ID/tên hợp lệ, công cụ không hỗ trợ hoặc quá giới hạn.
- Lỗi không tìm thấy địa điểm hoặc không thể tạo bản nháp được chuyển thành kết quả công cụ có kiểm soát; lỗi hạ tầng vẫn được ném ra.
- Tiếp tục dùng timeout, retry và mã lỗi upstream `502`, `503`, `504` hiện có.
- Không gửi proof/chữ ký của bản nháp ra phần UI hiển thị.
- Không được sao chép `backend/.env` hoặc `frontend/.env` từ dự án tham chiếu.

## Kiểm thử

Tích hợp và điều chỉnh các nhóm test sau:

- Provider: Gemini là mặc định theo thiết kế tham chiếu, OpenAI vẫn có thể chọn, model chat Gemini có thể ghi đè riêng.
- Search: chuẩn hóa tiếng Việt, xếp hạng địa điểm và fallback có giới hạn.
- Repository: truy vấn không dấu có thể tìm địa điểm phù hợp nằm ngoài nhóm rating cao nhất.
- Agent: tool calling của OpenAI/Gemini, replay kết quả công cụ, phân quyền theo `userId`, chống suy diễn/tái sử dụng ngày sai và tạo bản nháp mà không tự lưu.
- Frontend: bản xem trước hiển thị địa điểm và ngày, không làm lộ dữ liệu proof.
- Regression: toàn bộ test frontend/backend hiện có.
- Kiểm tra tĩnh: type-check và build cho cả frontend lẫn backend.

## Tiêu chí chấp nhận

- AI Chat hoạt động với cả OpenAI và Gemini theo cấu hình.
- Gemini Chat có thể dùng model khác Gemini Planner.
- Truy vấn không dấu tìm được địa điểm tiếng Việt phù hợp.
- Nguồn địa điểm hiển thị và liên kết đúng.
- AI chỉ tạo bản nháp khi yêu cầu và ngày bắt đầu đủ điều kiện.
- Chuyến đi chỉ được lưu sau thao tác rõ ràng của người dùng.
- Không có secret hoặc file `.env` thật được thêm vào Git.
- Các tính năng mới hơn của dự án đích không bị ghi đè hoặc hạ cấp.
- Toàn bộ test, type-check và build nêu trên thành công.

