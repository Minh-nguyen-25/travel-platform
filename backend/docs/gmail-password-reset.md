# Khôi phục mật khẩu bằng mã Gmail

## Phạm vi và tương thích

Dự án dùng Express/TypeScript, Prisma/PostgreSQL, bcryptjs cost 12, Redis
cho phiên đăng nhập và React/Vite. Luồng cũ gửi liên kết bằng Resend vẫn giữ
nguyên API, mẫu email và trang `/reset-password?token=...`. Liên kết
“Quên mật khẩu?” đã có trên trang đăng nhập, nay mở quy trình mã Gmail
ba bước tại `/forgot-password`.

Các endpoint mới, cùng prefix `/api/v1/auth`:

| Endpoint POST | Body | Kết quả |
|---|---|---|
| `/forgot-password/code` | `{ email }` | Thông báo chung, `expiresInSeconds`, `resendAfterSeconds` |
| `/reset-password/code/verify` | `{ email, code }` | `resetToken` ngẫu nhiên dùng cho bước cuối |
| `/reset-password/code` | `{ email, code, resetToken, password, confirmPassword }` | Thông báo đổi mật khẩu thành công |

Mã có 6 chữ số, được tạo bằng `crypto.randomInt`, mặc định sống 300 giây,
gửi lại sau 60 giây, tối đa 5 lần sai. Mỗi tài khoản chỉ có một thế hệ mã.
Mã mới vô hiệu mã và resetToken cũ. Xác minh không kéo dài hạn mã.
Backend bước cuối kiểm tra lại mã, resetToken, trạng thái tài khoản, hạn
dùng và số lần thử; việc chỉ sửa bước giao diện không cấp quyền đổi mật khẩu.

Database chỉ lưu HMAC-SHA256, không lưu mã nguyên bản. HMAC gắn với ID thế
hệ mã, tài khoản và hash mật khẩu hiện tại, nên đổi mật khẩu ở luồng khác
cũng vô hiệu mã đang chờ. `resetToken` chỉ lưu SHA-256 ở backend và chỉ giữ
trong bộ nhớ React; không đưa vào URL, localStorage hoặc sessionStorage.

Khóa `SELECT ... FOR UPDATE` trên đúng user trong transaction PostgreSQL
giúp tuần tự hóa gửi lại/xác minh/đổi mật khẩu giữa nhiều instance.
Lần thử sai được commit trước khi trả lỗi. Cập nhật hash mật khẩu, tiêu thụ
mã, vô hiệu liên kết khôi phục cũ và xóa refresh token PostgreSQL nằm trong
cùng transaction. Redis thu hồi session theo cơ chế sẵn có sau commit.
Không cấp token đăng nhập tự động sau khi đặt lại mật khẩu.

Phản hồi yêu cầu mã giống nhau cho email không tồn tại, tài khoản bị khóa,
OAuth-only, đang cooldown hoặc lỗi gửi thư. Tài khoản Google/Facebook-only
tiếp tục đăng nhập bằng nhà cung cấp tương ứng. Không giới hạn miền email
người nhận để tránh loại bỏ tài khoản hợp lệ hiện có.

## Chuẩn bị database — chỉ thực hiện sau khi tự kiểm tra môi trường đích

Migration mới: `prisma/migrations/20261024090000_add_password_reset_codes/migration.sql`.
Chỉ tạo bảng `password_reset_codes` với FK INTEGER đến `users.id`, unique
`user_id`, mã đã băm, ngày hết hạn, số lần thử, ngày xác minh/sử dụng và
resetToken đã băm. Không sửa cột hoặc dữ liệu user/địa điểm/lịch trình.
Không có seed hoặc reset database.

Từ thư mục `backend`:

```powershell
npm ci
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Đọc `DATABASE_URL` cục bộ hoặc trên dashboard của bạn, không đưa giá trị thật
vào chat/log/Git. Kiểm tra **tất cả migration đang chờ** vì lệnh deploy sẽ áp
dụng chúng, không chỉ migration mới. Khi đã kiểm tra và có bản sao lưu phù hợp:

```powershell
npx prisma migrate deploy
npm run build
```

Migration chưa được tự áp dụng vào database local hoặc production trong lần
triển khai code này. Tạo Prisma Client chỉ tạo mã local, không thay database.

Nếu cần hoàn tác, rollback code trước. File
`prisma/rollback/password-reset-codes.sql` chỉ là SQL tham khảo thủ công để
xóa bảng mã đang chờ; không chạy tự động. Với migration đã áp dụng thành công,
tạo một forward migration để hoàn tác và giữ lịch sử nhất quán; không dùng
`migrate reset`, không xóa migration history. Các bảng dữ liệu cũ không bị ảnh hưởng.

## Một Gmail hệ thống dùng cho mọi email khôi phục

Không cần Gmail riêng cho từng người dùng. Dùng một Gmail do quản trị viên
quản lý. Chỉ khai báo thông tin gửi thư tại **Backend Environment** hoặc
`backend/.env` hiện có; tự thêm các biến còn thiếu, không ghi đè cả file.
`.env.example` chỉ chứa tên biến và giá trị mẫu rỗng.

### Cách A: Gmail SMTP + App Password

Phù hợp local/máy chủ cho phép SMTP ra ngoài:

```ini
PASSWORD_RESET_MAIL_PROVIDER=gmail-smtp
GMAIL_USER=<Gmail hệ thống>
GMAIL_APP_PASSWORD=<App Password của Gmail hệ thống>
PASSWORD_RESET_CODE_TTL_SECONDS=300
PASSWORD_RESET_CODE_RESEND_SECONDS=60
PASSWORD_RESET_CODE_MAX_ATTEMPTS=5
```

1. Đăng nhập Gmail hệ thống, bật Xác minh 2 bước.
2. Trong Google Account → Security → App passwords, tạo mật khẩu ứng dụng
   dành cho TravelGo. Chỉ lưu trong biến môi trường Backend.
3. Không dùng mật khẩu đăng nhập Gmail thông thường. Tài khoản tổ chức,
   Advanced Protection hoặc chỉ dùng security key có thể không có tùy chọn
   App Password; dùng cách B khi phù hợp.
4. Khởi động lại backend sau khi cấu hình. SMTP dùng `smtp.gmail.com:465`,
   TLS bật, có timeout; không tắt kiểm tra chứng chỉ TLS.

Hướng dẫn chính thức:
[App Password của Google](https://support.google.com/mail/answer/185833?hl=vi),
[Gmail với Nodemailer](https://nodemailer.com/guides/using-gmail).

### Cách B: Gmail API + OAuth 2.0 cho Render Free

Render Free chặn SMTP port 25/465/587, nên App Password **không khắc phục**
việc không kết nối được SMTP ở gói này. Dùng Gmail API qua HTTPS port 443:

```ini
PASSWORD_RESET_MAIL_PROVIDER=gmail-api
GMAIL_USER=<Gmail hệ thống đã cấp quyền OAuth>
GMAIL_OAUTH_CLIENT_ID=<OAuth client riêng cho gửi mail>
GMAIL_OAUTH_CLIENT_SECRET=<OAuth client secret riêng>
GMAIL_OAUTH_REFRESH_TOKEN=<refresh token offline của Gmail hệ thống>
```

1. Trong Google Cloud project của bạn, bật Gmail API.
2. Cấu hình OAuth consent và một OAuth client riêng. Không sửa client/callback
   Google Login hiện có của website.
3. Gmail hệ thống cấp quyền scope
   `https://www.googleapis.com/auth/gmail.send` với `access_type=offline`.
   Có thể dùng [Google OAuth Playground](https://developers.google.com/oauthplayground/)
   để cấu hình: bật “Use your own OAuth credentials”, dùng OAuth client riêng,
   thêm redirect URI `https://developers.google.com/oauthplayground`, chọn
   scope Gmail send, đăng nhập Gmail hệ thống và đổi authorization code để
   nhận refresh token. Không gửi token/client secret vào cuộc trò chuyện.
4. Lưu 4 biến Gmail tương ứng trong Render **backend service → Environment**.
   Không đặt chúng trong Static Site hoặc bất kỳ biến `VITE_*` nào.
5. Hoàn thành consent publishing/verification theo loại tài khoản và yêu cầu
   Google. Refresh token từ ứng dụng External ở trạng thái Testing với Gmail
   scope thường hết hạn sau 7 ngày; cấu hình production phù hợp để tránh gửi
   thư bị gián đoạn. `invalid_grant` cần cấp quyền lại; không log response token.
6. Redeploy backend sau khi migration và cấu hình sẵn sàng, rồi deploy frontend.

Nguồn chính thức: [Render Free](https://render.com/docs/free),
[gửi MIME qua Gmail API](https://developers.google.com/workspace/gmail/api/guides/sending),
[OAuth offline access](https://developers.google.com/identity/protocols/oauth2/web-server#offline),
[hạn refresh token](https://developers.google.com/identity/protocols/oauth2#expiration).

`PASSWORD_RESET_CODE_SECRET` là HMAC secret tùy chọn riêng; nếu để trống,
backend dùng JWT_REFRESH_SECRET với domain separation. Không đưa secret ra
frontend. Các biến giới hạn được kiểm tra kiểu và khoảng giá trị khi startup.

## Gửi thư, lỗi và vận hành

Gửi Gmail diễn ra bất đồng bộ sau khi ghi mã, tránh tiết lộ thời gian SMTP/API
qua phản hồi công khai. Gửi thất bại vô hiệu đúng thế hệ mã đó; không vô hiệu
mã mới hơn. Log chỉ có thông báo cố định, không chứa mã, email đầy đủ, thông
tin Gmail hoặc raw provider error. Thông báo chung ở frontend không cam kết
email đã phát thành công; nên thử bằng một tài khoản do bạn quản lý sau khi
cấu hình và kiểm tra inbox/spam.

Đây là tác vụ gửi trong process, chưa phải hàng đợi bền vững. Nếu instance
restart trong lúc gửi, người dùng cần chờ cooldown rồi yêu cầu lại. Code vẫn
hết hạn theo database. Giới hạn IP tái sử dụng limiter có sẵn; cooldown và số
lần sai theo tài khoản được lưu trong PostgreSQL. Không thay đổi kiến trúc
đăng nhập, Redis hoặc bổ sung hệ thống queue.

## Kiểm tra

```powershell
# backend
npm run build
node --test tests/password-reset-code.test.cjs

# frontend, từ thư mục frontend
npm run lint
npm run build
npm test
```

Bài kiểm thử mới dùng transaction test double, email giả lập và Express router
thật: phản hồi chống dò tài khoản, HMAC, cooldown, concurrent resend, 5 lần
sai, hết hạn, không được bỏ xác minh, kiểm tra lại mã khi đổi mật khẩu, rollback,
single-use, bcrypt cost 12, đăng nhập bằng mật khẩu mới qua service có sẵn,
giới hạn IP và giữ tương thích endpoint liên kết cũ. Chúng không truy cập
database/Gmail thật. Cần kiểm tra PostgreSQL và inbox thật sau khi quản trị
viên chủ động áp dụng migration/cấu hình.

Kết quả kiểm tra trong lần triển khai:

- Backend build đạt; toàn bộ 178 bài kiểm thử đạt khi chạy `npm test` với
  Redis double cô lập. Các repository/database và nhà cung cấp bên ngoài
  trong suite được giả lập theo thiết kế của bài kiểm thử.
- Frontend lint, production build và 28 bài kiểm thử hiện có đều đạt.
- Chrome tự động kiểm tra frontend thật kết nối Express auth router thật
  với database/email/session double: yêu cầu mã, mã sai, xác minh, mật khẩu
  không khớp, đổi thành công, đăng nhập bằng mật khẩu mới, cooldown, gửi lại,
  hết hạn và quay về bước nhập mã. Desktop 1440px và mobile 390px không tràn
  ngang, không có lỗi JavaScript trang.
- Prisma Client generate và schema validate đạt. Chưa chạy migration hoặc
  kiểm tra khóa/giao dịch trên PostgreSQL thật; chưa gửi email Gmail thật.

Ảnh và báo cáo kiểm tra giao diện được lưu ngoài Git repository tại
`../outputs/password-reset/`. Redis double chỉ phục vụ kiểm tra, không nằm
trong code ứng dụng. Để chạy suite đầy đủ trong môi trường tích hợp của bạn,
dùng `npm test` ở backend với cấu hình test riêng; không trỏ vào database thật.

## File liên quan

Tạo mới: `src/services/password-reset-code.service.ts`,
`src/services/gmail-password-reset-mail.service.ts`, migration và rollback SQL
nêu trên, `tests/password-reset-code.test.cjs`, tài liệu này,
`frontend/src/components/auth/PasswordResetCodeFlow.tsx`.

Chỉnh sửa: `prisma/schema.prisma`, `src/config/env.ts`, `.env.example`,
`src/validators/auth.validator.ts`, `src/controllers/auth.controller.ts`,
`src/routes/auth.routes.ts`, `package.json`/lockfile (chỉ thêm Nodemailer và
type tương ứng), `frontend/src/services/auth.service.ts`,
`frontend/src/pages/client/ForgotPasswordPage.tsx`.

Trang đăng nhập, đăng ký, reset bằng liên kết, API du lịch, phân quyền và
database hiện tại không bị viết lại. Không chỉnh `.env` thật.
