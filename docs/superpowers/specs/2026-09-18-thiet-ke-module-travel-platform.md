# THIẾT KẾ CÁC MODULE CHƯƠNG TRÌNH CHÍNH CỦA TRAVEL PLATFORM

## 1. Mục đích tài liệu

Tài liệu trình bày thiết kế các module chương trình chính của Travel Platform — nền tảng web quản lý thông tin du lịch và đề xuất lịch trình cá nhân hóa. Nội dung được tổ chức theo chức năng nghiệp vụ để phù hợp với báo cáo đồ án, đồng thời mô tả ngắn cách mỗi module được triển khai trong kiến trúc phần mềm.

## 2. Phạm vi hệ thống

Travel Platform hỗ trợ hai nhóm người sử dụng:

- **Người dùng:** tìm kiếm địa điểm, lưu sở thích, đánh giá, yêu thích, tạo lịch trình bằng AI, quản lý và chia sẻ chuyến đi.
- **Quản trị viên:** quản lý người dùng, địa điểm, danh mục, đánh giá và theo dõi số liệu tổng quan.

Hệ thống được xây dựng theo kiến trúc monorepo gồm:

- Frontend: React, TypeScript và Vite.
- Backend: Node.js, Express và TypeScript.
- Cơ sở dữ liệu: PostgreSQL, truy cập thông qua Prisma ORM.
- Bộ nhớ đệm và giới hạn yêu cầu: Redis.
- Dịch vụ ngoài: OpenAI/Gemini, OSRM, Cloudinary và dịch vụ email.

## 3. Nguyên tắc phân chia module

Các module được phân chia theo nghiệp vụ. Mỗi module đảm nhiệm một nhóm chức năng có mục đích rõ ràng và trao đổi dữ liệu qua giao diện API xác định.

Ở mức triển khai, một module backend thường gồm bốn lớp:

1. **Giao diện:** tiếp nhận thao tác và hiển thị kết quả cho người dùng.
2. **Controller và API:** tiếp nhận yêu cầu, xác thực và kiểm tra dữ liệu.
3. **Service:** thực hiện quy tắc nghiệp vụ.
4. **Repository:** truy xuất PostgreSQL thông qua Prisma.

Luồng xử lý tổng quát:

`Người dùng → Giao diện React → REST API Express → Service → Repository/Prisma → PostgreSQL`

Các chức năng AI và bản đồ có thêm kết nối đến dịch vụ ngoài:

`AI Service → OpenAI/Gemini`

`Map Service → OSRM`

## 4. Thiết kế các module chính

### 4.1. Module xác thực và quản lý tài khoản

**Mục đích:** xác minh danh tính, quản lý phiên đăng nhập, hồ sơ và quyền truy cập của người dùng.

**Chức năng chính:**

- Đăng ký và đăng nhập bằng email, mật khẩu.
- Đăng nhập bằng Google hoặc Facebook.
- Làm mới phiên đăng nhập và đăng xuất.
- Gửi yêu cầu và xác nhận đặt lại mật khẩu.
- Xem, cập nhật hồ sơ và ảnh đại diện.
- Kiểm tra trạng thái tài khoản và vai trò `USER` hoặc `ADMIN`.

**Dữ liệu đầu vào:** họ tên, email, mật khẩu, thông tin OAuth, mã khôi phục mật khẩu và dữ liệu hồ sơ.

**Kết quả đầu ra:** phiên đăng nhập hợp lệ, thông tin người dùng hoặc thông báo lỗi xác thực.

**Dữ liệu sử dụng:** `User`, `RefreshToken`, `PasswordResetToken`.

**Quan hệ:** cung cấp danh tính và quyền truy cập cho tất cả module được bảo vệ.

### 4.2. Module quản lý địa điểm và danh mục

**Mục đích:** cung cấp kho dữ liệu địa điểm du lịch để người dùng tra cứu và các module khác tái sử dụng.

**Chức năng chính:**

- Hiển thị, tìm kiếm, lọc và phân trang danh sách địa điểm.
- Xem thông tin chi tiết, tọa độ, giá vé, thời gian tham quan và hình ảnh.
- Phân loại địa điểm theo danh mục.
- Cho phép quản trị viên tạo, cập nhật, kích hoạt hoặc ngừng hiển thị địa điểm.
- Quản lý danh mục và quan hệ giữa địa điểm với danh mục.

**Dữ liệu đầu vào:** từ khóa, bộ lọc, mã địa điểm, thông tin địa điểm, hình ảnh và danh mục.

**Kết quả đầu ra:** danh sách địa điểm, thông tin chi tiết hoặc kết quả thao tác quản trị.

**Dữ liệu sử dụng:** `Destination`, `Category`, `DestinationCategory`, `DestinationImage`.

**Quan hệ:** cung cấp dữ liệu nền cho module đánh giá, yêu thích, AI, bản đồ và chuyến đi.

### 4.3. Module đánh giá và yêu thích

**Mục đích:** ghi nhận phản hồi và các địa điểm người dùng quan tâm.

**Chức năng chính:**

- Thêm, cập nhật và xóa đánh giá địa điểm.
- Kiểm tra điểm đánh giá hợp lệ và giới hạn mỗi người dùng một đánh giá cho một địa điểm.
- Tải và quản lý ảnh đính kèm đánh giá.
- Thêm hoặc xóa địa điểm khỏi danh sách yêu thích.
- Hiển thị danh sách yêu thích của người dùng.
- Cho phép quản trị viên kiểm duyệt và ẩn đánh giá không phù hợp.

**Dữ liệu đầu vào:** mã địa điểm, số sao, bình luận, hình ảnh và thao tác yêu thích.

**Kết quả đầu ra:** nội dung đánh giá, trạng thái yêu thích và danh sách địa điểm đã lưu.

**Dữ liệu sử dụng:** `Review`, `ReviewImage`, `Favorite`, `Destination`, `User`.

**Quan hệ:** phụ thuộc module tài khoản và địa điểm; cung cấp dữ liệu tương tác phục vụ trải nghiệm người dùng.

### 4.4. Module quản lý sở thích du lịch

**Mục đích:** lưu hồ sơ sở thích để cá nhân hóa kết quả đề xuất.

**Chức năng chính:**

- Tạo và cập nhật sở thích của người dùng.
- Lưu mức ngân sách, phong cách du lịch, hoạt động và danh mục yêu thích.
- Tự động điền sở thích đã lưu khi người dùng mở chức năng lập lịch trình.
- Xóa hồ sơ sở thích khi người dùng yêu cầu.

**Dữ liệu đầu vào:** mức ngân sách, phong cách, danh sách hoạt động và danh mục.

**Kết quả đầu ra:** hồ sơ sở thích đã được kiểm tra và chuẩn hóa.

**Dữ liệu sử dụng:** `TravelPreference`, `User`.

**Quan hệ:** phụ thuộc module tài khoản và cung cấp dữ liệu cho module AI.

### 4.5. Module AI và đề xuất cá nhân hóa

**Mục đích:** tạo lịch trình du lịch phù hợp với yêu cầu và sở thích riêng của người dùng.

**Chức năng chính:**

- Tiếp nhận điểm đến, ngày khởi hành, số ngày, số người, ngân sách, phương tiện và yêu cầu bổ sung.
- Kết hợp thông tin vừa nhập với sở thích đã lưu.
- Tra cứu các địa điểm đang hoạt động phù hợp với thành phố đích.
- Xây dựng ngữ cảnh và yêu cầu OpenAI hoặc Gemini tạo lịch trình.
- Kiểm tra cấu trúc, địa điểm và số ngày trong kết quả AI.
- Ước tính chi phí và bổ sung khoảng cách, thời gian di chuyển.
- Hỗ trợ AI Chat để tư vấn và tạo bản nháp lịch trình trong hội thoại.
- Tạo bản nháp có thông tin xác minh để người dùng lưu thành chuyến đi.

**Dữ liệu đầu vào:** thông tin chuyến đi, sở thích cá nhân và yêu cầu bằng ngôn ngữ tự nhiên.

**Kết quả đầu ra:** lịch trình theo từng ngày, tổng chi phí, cảnh báo, nguồn tham khảo và bản nháp chuyến đi.

**Dữ liệu sử dụng:** dữ liệu sở thích, địa điểm và các chuyến đi liên quan của người dùng.

**Quan hệ:** sử dụng module sở thích, địa điểm và bản đồ; chuyển bản nháp hợp lệ cho module chuyến đi.

### 4.6. Module quản lý chuyến đi và lịch trình

**Mục đích:** lưu trữ, chỉnh sửa và chia sẻ kế hoạch du lịch hoàn chỉnh.

**Chức năng chính:**

- Tạo chuyến đi thủ công hoặc từ bản nháp AI.
- Xem, cập nhật và xóa chuyến đi thuộc quyền sở hữu của người dùng.
- Quản lý các ngày trong chuyến đi.
- Thêm, sửa, xóa và sắp xếp hoạt động trong từng ngày.
- Liên kết hoạt động với địa điểm có trong hệ thống.
- Tổng hợp chi phí dự kiến.
- Bật hoặc tắt chia sẻ công khai bằng liên kết an toàn.
- Cho phép khách xem chuyến đi được chia sẻ mà không cần đăng nhập.

**Dữ liệu đầu vào:** thông tin chuyến đi, ngày, địa điểm, thời gian, chi phí, phương tiện và ghi chú.

**Kết quả đầu ra:** chi tiết chuyến đi, lịch trình từng ngày, tổng chi phí và liên kết chia sẻ.

**Dữ liệu sử dụng:** `Trip`, `TripDay`, `Itinerary`, `Destination`, `User`.

**Quan hệ:** phụ thuộc module tài khoản và địa điểm; nhận bản nháp từ module AI và dùng dữ liệu định tuyến khi có.

### 4.7. Module bản đồ và định tuyến

**Mục đích:** cung cấp thông tin di chuyển để hỗ trợ sắp xếp lịch trình hợp lý.

**Chức năng chính:**

- Tính khoảng cách giữa hai tọa độ.
- Tính tuyến đường và thời gian dự kiến.
- Tính ma trận khoảng cách, thời gian cho nhiều địa điểm.
- Chọn hồ sơ định tuyến phù hợp với phương tiện.
- Trả cảnh báo khi dịch vụ định tuyến thiếu dữ liệu hoặc quá thời gian.

**Dữ liệu đầu vào:** tọa độ điểm đầu, điểm cuối, danh sách tọa độ và phương tiện di chuyển.

**Kết quả đầu ra:** khoảng cách, thời gian dự kiến và dữ liệu tuyến đường.

**Dịch vụ ngoài:** OSRM.

**Quan hệ:** được module AI và module chuyến đi sử dụng.

### 4.8. Module quản trị và thống kê

**Mục đích:** hỗ trợ quản trị viên vận hành và theo dõi hệ thống.

**Chức năng chính:**

- Kiểm tra quyền quản trị trước khi thực hiện thao tác.
- Quản lý tài khoản và trạng thái hoạt động của người dùng.
- Quản lý địa điểm, hình ảnh và danh mục.
- Kiểm duyệt nội dung đánh giá.
- Tổng hợp số liệu về người dùng, địa điểm, đánh giá và chuyến đi.
- Hiển thị dữ liệu tổng quan trên bảng điều khiển quản trị.

**Dữ liệu đầu vào:** yêu cầu quản lý, bộ lọc, dữ liệu cập nhật và khoảng thời gian thống kê.

**Kết quả đầu ra:** danh sách quản trị, kết quả thao tác và các chỉ số tổng quan.

**Dữ liệu sử dụng:** dữ liệu từ người dùng, địa điểm, đánh giá và chuyến đi.

**Quan hệ:** phụ thuộc module xác thực để phân quyền và truy xuất dữ liệu từ các module nghiệp vụ.

## 5. Quan hệ giữa các module

| Module nguồn | Module đích | Dữ liệu hoặc dịch vụ trao đổi |
|---|---|---|
| Xác thực và tài khoản | Các module được bảo vệ | Danh tính, vai trò và quyền truy cập |
| Địa điểm và danh mục | Đánh giá và yêu thích | Thông tin địa điểm |
| Địa điểm và danh mục | AI và đề xuất | Danh sách địa điểm ứng viên |
| Sở thích du lịch | AI và đề xuất | Ngân sách, phong cách và hoạt động yêu thích |
| AI và đề xuất | Bản đồ và định tuyến | Các cặp tọa độ và phương tiện |
| AI và đề xuất | Chuyến đi và lịch trình | Bản nháp lịch trình đã được kiểm tra |
| Chuyến đi và lịch trình | Địa điểm và danh mục | Địa điểm của từng hoạt động |
| Quản trị và thống kê | Các module nghiệp vụ | Dữ liệu quản lý và số liệu tổng hợp |

## 6. Thành phần hỗ trợ dùng chung

Các thành phần sau phục vụ nhiều module nhưng không được tách thành module nghiệp vụ độc lập:

- **Bảo mật:** JWT, phân quyền, giới hạn tần suất, giới hạn xử lý đồng thời và kiểm tra dữ liệu đầu vào.
- **PostgreSQL và Prisma:** lưu trữ, truy vấn và bảo đảm tính toàn vẹn dữ liệu.
- **Redis:** hỗ trợ giới hạn yêu cầu và dữ liệu tạm thời.
- **Cloudinary:** lưu trữ ảnh đại diện, địa điểm và đánh giá.
- **Dịch vụ email:** gửi liên kết khôi phục mật khẩu.
- **OpenAI/Gemini:** sinh nội dung tư vấn và lịch trình cá nhân hóa.
- **OSRM:** tính tuyến đường, khoảng cách và thời gian di chuyển.

## 7. Thiết kế xử lý lỗi

- Dữ liệu được kiểm tra tại giao diện để phản hồi nhanh và được kiểm tra lại tại backend để bảo đảm an toàn.
- Backend sử dụng bộ xử lý lỗi tập trung và cấu trúc phản hồi thống nhất.
- Hệ thống không trả mật khẩu, token, khóa API hoặc chi tiết lỗi nội bộ về frontend.
- Mọi thao tác trên dữ liệu người dùng đều phải kiểm tra quyền sở hữu hoặc vai trò quản trị.
- Khi AI hoặc OSRM không khả dụng, hệ thống trả thông báo dễ hiểu và bảo toàn dữ liệu người dùng đã nhập.
- Lỗi định tuyến không làm mất toàn bộ lịch trình; hệ thống có thể trả lịch trình cùng cảnh báo.
- Các thao tác tạo chuyến đi cùng ngày và hoạt động được thực hiện trong giao dịch để tránh dữ liệu dở dang.

## 8. Thiết kế kiểm thử

### 8.1. Kiểm thử đơn vị

Kiểm tra quy tắc nghiệp vụ của từng service như xác thực, quyền sở hữu, giới hạn ngày, thứ tự hoạt động, tính chi phí và chuẩn hóa dữ liệu AI.

### 8.2. Kiểm thử tích hợp

Kiểm tra sự phối hợp giữa route, middleware, controller, service, repository và cơ sở dữ liệu. Các tình huống gồm yêu cầu hợp lệ, dữ liệu sai, chưa đăng nhập, không đủ quyền và không tìm thấy dữ liệu.

### 8.3. Kiểm thử giao diện

Kiểm tra biểu mẫu, trạng thái tải, thông báo lỗi, điều hướng, hiển thị danh sách và các thao tác của người dùng.

### 8.4. Kiểm thử phân quyền và bảo mật

Kiểm tra người dùng không thể truy cập chức năng quản trị, dữ liệu của người khác hoặc lưu bản nháp AI không hợp lệ.

### 8.5. Kiểm thử tích hợp dịch vụ ngoài

Giả lập OpenAI/Gemini, OSRM, Cloudinary và dịch vụ email để kiểm thử ổn định, không phụ thuộc mạng hoặc phát sinh chi phí ngoài ý muốn.

### 8.6. Kiểm thử luồng nghiệp vụ chính

Luồng kiểm thử tổng thể:

`Đăng nhập → lưu sở thích → tạo lịch trình AI → xem kết quả → lưu chuyến đi → xem hoặc chia sẻ chuyến đi`

## 9. Kết luận

Thiết kế gồm tám module nghiệp vụ chính với trách nhiệm và quan hệ rõ ràng. Cách phân chia này giúp hệ thống dễ phát triển, kiểm thử và bảo trì, đồng thời phản ánh trực tiếp các chức năng được trình bày trong báo cáo đồ án Travel Platform.
