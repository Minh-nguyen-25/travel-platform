# TRAVEL PLATFORM --- HƯỚNG DẪN PHÁT TRIỂN DỰ ÁN

> **Đề tài:** Xây dựng nền tảng Web quản lý thông tin du lịch và đề xuất
> lịch trình cá nhân hóa\
> **Kiến trúc:** Full-stack Monorepo --- Node.js/Express + React/Vite +
> PostgreSQL + Redis\
> **Mục đích tài liệu:** Quy định cách cài đặt, phát triển, tích hợp và
> đưa một chức năng mới vào dự án.\
> **Phân công công việc:** Theo dõi tại Sheet phân công riêng của nhóm.

------------------------------------------------------------------------

## MỤC LỤC

1.  [Mục tiêu và phạm vi tài liệu](#1-mục-tiêu-và-phạm-vi-tài-liệu)
2.  [Cài đặt môi trường ban đầu](#2-cài-đặt-môi-trường-ban-đầu)
3.  [Tech Stack thống nhất](#3-tech-stack-thống-nhất)
4.  [Cấu trúc dự án và vai trò từng thư
    mục](#4-cấu-trúc-dự-án-và-vai-trò-từng-thư-mục)
5.  [Kiến trúc Backend và nguyên tắc bắt
    buộc](#5-kiến-trúc-backend-và-nguyên-tắc-bắt-buộc)
6.  [Quy trình Backend khi làm một Feature
    mới](#6-quy-trình-backend-khi-làm-một-feature-mới)
7.  [Quy trình Frontend khi làm một Feature
    mới](#7-quy-trình-frontend-khi-làm-một-feature-mới)
8.  [Authentication và
    Authorization](#8-authentication-và-authorization)
9.  [Database, Prisma và Migration](#9-database-prisma-và-migration)
10. [Upload ảnh](#10-upload-ảnh)
11. [Quy chuẩn API Response và Error
    Handling](#11-quy-chuẩn-api-response-và-error-handling)
12. [Quy chuẩn đặt tên](#12-quy-chuẩn-đặt-tên)
13. [Quy tắc tích hợp giữa các
    Module](#13-quy-tắc-tích-hợp-giữa-các-module)
14. [Kiểm tra trước khi tạo Pull
    Request](#14-kiểm-tra-trước-khi-tạo-pull-request)
15. [Git Workflow và Pull Request](#15-git-workflow-và-pull-request)
16. [Checklist nhanh khi nhận một chức năng
    mới](#16-checklist-nhanh-khi-nhận-một-chức-năng-mới)

------------------------------------------------------------------------

# 1. Mục tiêu và phạm vi tài liệu

Tài liệu này là **quy chuẩn phát triển chung** của Travel Platform. Mỗi
thành viên khi triển khai chức năng mới cần dùng tài liệu này để biết:

-   Cần tạo file nào và đặt ở thư mục nào.
-   Request đi qua các layer nào.
-   Cách sử dụng Prisma, validation, middleware và `AppError`.
-   Cách gọi API từ React.
-   Cách xử lý route cần đăng nhập hoặc quyền ADMIN.
-   Khi nào được sửa `schema.prisma`.
-   Cách tạo branch, commit và Pull Request.
-   Những file dùng chung không được tự ý thay đổi.

> **Nguyên tắc:** Mỗi feature có thể khác nhau về nghiệp vụ, nhưng phải
> tuân theo cùng kiến trúc và convention.

------------------------------------------------------------------------

# 2. Cài đặt môi trường ban đầu

## 2.1. Yêu cầu

Cài sẵn:

-   Git.
-   Node.js **v22.x**.
-   npm.
-   Docker Desktop.
-   VS Code hoặc IDE tương đương.

Kiểm tra:

``` bash
node -v
npm -v
git --version
docker --version
```

## 2.2. Clone dự án

``` bash
git clone https://github.com/Minh-nguyen-25/travel-platform.git
cd travel-platform
```

## 2.3. Cài Backend

``` bash
cd backend
npm install
```

Tạo `.env` từ `.env.example`:

``` powershell
Copy-Item ".env.example" ".env"
```

> Không commit file `.env` lên GitHub.

## 2.4. Khởi động PostgreSQL và Redis

Từ thư mục gốc `travel-platform`:

``` bash
docker compose up -d
```

Cấu hình hiện tại:

-   PostgreSQL: `5433`.
-   Redis: `6380`.

Kiểm tra container:

``` bash
docker compose ps
```

## 2.5. Đồng bộ Database

Từ `backend`:

``` bash
npm run db:migrate
npm run db:seed
npm run db:studio
```

Prisma Studio mặc định mở tại:

``` text
http://localhost:5555
```

## 2.6. Chạy Backend

``` bash
npm run dev
```

## 2.7. Cài và chạy Frontend

Mở terminal khác:

``` bash
cd travel-platform/frontend
npm install
npm run dev
```

Dùng URL mà Vite hiển thị trong terminal để mở giao diện.

> Sau khi setup xong, mỗi thành viên phải chạy được cả Backend, Frontend
> và Database trước khi bắt đầu feature.

------------------------------------------------------------------------

# 3. Tech Stack thống nhất

## Frontend

-   React.js.
-   Vite.
-   TypeScript.
-   HTML5.
-   CSS3.
-   Tailwind CSS.
-   Axios/HTTP client của dự án.

## Backend

-   Node.js.
-   Express.js.
-   TypeScript.
-   Zod để validate request.
-   JWT + bcrypt cho xác thực.
-   Passport khi triển khai Google OAuth.

## Database

-   PostgreSQL.
-   Prisma ORM.
-   Redis theo cấu hình hiện tại của dự án.

## Upload ảnh

-   Multer nhận file từ request.
-   Cloudinary lưu ảnh.

## Bản đồ và Routing

-   Leaflet + React-Leaflet để hiển thị bản đồ.
-   OpenStreetMap làm tile layer.
-   OSRM để tính tuyến đường, khoảng cách và thời gian di chuyển.

> Leaflet là thư viện hiển thị bản đồ; OpenStreetMap là nguồn tile/data
> bản đồ; OSRM phụ trách routing. Không coi ba thành phần này là cùng
> một công cụ.

## AI

-   OpenAI API hoặc Google Gemini API theo cấu hình được nhóm chốt khi
    triển khai.

------------------------------------------------------------------------

# 4. Cấu trúc dự án và vai trò từng thư mục

``` text
travel-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── config/
│       ├── constants/
│       ├── controllers/
│       ├── middlewares/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       └── validators/
│
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── constants/
│       ├── contexts/
│       ├── hooks/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── types/
│       └── utils/
│
└── docs/
```

## Backend

  -----------------------------------------------------------------------
  Thư mục                             Vai trò
  ----------------------------------- -----------------------------------
  `config/`                           Cấu hình DB, Passport, Cloudinary
                                      và các service dùng chung

  `constants/`                        Hằng số, HTTP status, giá trị dùng
                                      chung

  `controllers/`                      Nhận request, gọi service, trả
                                      response

  `middlewares/`                      Auth, role, validate, upload, error
                                      handler

  `repositories/`                     Truy vấn Prisma/Database

  `routes/`                           Khai báo endpoint và middleware

  `services/`                         Business logic

  `types/`                            TypeScript type/interface/DTO dùng
                                      ở Backend

  `utils/`                            Hàm tiện ích dùng chung

  `validators/`                       Zod schema validate
                                      body/query/params
  -----------------------------------------------------------------------

## Frontend

  Thư mục         Vai trò
  --------------- ----------------------------------------------
  `pages/`        Các màn hình/route chính
  `components/`   Component tái sử dụng
  `services/`     Hàm gọi Backend API
  `contexts/`     Global state như Authentication
  `hooks/`        Custom hooks
  `routes/`       Route config, `ProtectedRoute`, `AdminRoute`
  `types/`        TypeScript type cho dữ liệu Frontend
  `utils/`        Hàm format/helper
  `constants/`    Constant/config dùng ở Frontend
  `assets/`       Logo, icon, ảnh tĩnh

------------------------------------------------------------------------

# 5. Kiến trúc Backend và nguyên tắc bắt buộc

## 5.1. Luồng request chuẩn

``` text
Client Request
    ↓
app.ts
    ↓
routes/index.ts
    ↓
<feature>.routes.ts
    ↓
Middlewares
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL
```

Vai trò:

``` text
Route       → URL + middleware
Controller  → Request/Response
Service     → Business logic
Repository  → Database query
```

## 5.2. Nguyên tắc bắt buộc

1.  **Controller không query Database.** Không gọi `prisma.<model>`
    trong Controller.
2.  **Không tự `new PrismaClient()`.** Luôn dùng Prisma singleton từ
    `config/db.ts`.
3.  **Business error dùng `AppError`.**
4.  **Response dùng utility chung.** Không tự tạo format response khác.
5.  **Không sửa file Core dùng chung nếu chưa thống nhất.**
6.  **Không đặt business logic phức tạp trong Route hoặc Controller.**
7.  **Không copy cùng một query/logic sang nhiều nơi nếu có thể tái sử
    dụng.**

------------------------------------------------------------------------

# 6. Quy trình Backend khi làm một Feature mới

Không phải feature nào cũng bắt buộc có tất cả file. Tuy nhiên
CRUD/business module thông thường nên theo cấu trúc:

``` text
src/
├── validators/<feature>.validator.ts
├── repositories/<feature>.repository.ts
├── services/<feature>.service.ts
├── controllers/<feature>.controller.ts
├── routes/<feature>.routes.ts
└── types/<feature>.types.ts       # khi cần type riêng
```

Sau đó đăng ký route tại:

``` text
src/routes/index.ts
```

## Bước 1 --- Kiểm tra Database

Trước khi code:

-   Model đã tồn tại trong `schema.prisma` chưa?
-   Field cần dùng đã có chưa?
-   Relation có đúng không?
-   Có cần thay đổi schema không?

Nếu cần thay đổi schema, xem Mục 9 trước khi sửa.

## Bước 2 --- Validator

Ví dụ:

``` text
validators/review.validator.ts
```

Validator chịu trách nhiệm kiểm tra:

-   `body`.
-   `params`.
-   `query`.

Không dùng validator để xử lý business logic.

## Bước 3 --- Repository

Ví dụ:

``` text
repositories/review.repository.ts
```

Chỉ chứa truy vấn Database:

``` typescript
prisma.review.findMany(...)
prisma.review.findUnique(...)
prisma.review.create(...)
prisma.review.update(...)
prisma.review.delete(...)
```

Không trả HTTP response trong Repository.

## Bước 4 --- Service

Ví dụ:

``` text
services/review.service.ts
```

Service:

-   Kiểm tra nghiệp vụ.
-   Gọi repository.
-   Phối hợp nhiều repository khi cần.
-   Throw `AppError` cho lỗi có thể dự đoán.

Ví dụ:

``` typescript
if (!destination) {
  throw new AppError(
    'Không tìm thấy địa điểm',
    HTTP_STATUS.NOT_FOUND
  );
}
```

## Bước 5 --- Controller

Controller chỉ:

1.  Lấy dữ liệu từ `req`.
2.  Gọi service.
3.  Trả response bằng utility chung.

Không viết Prisma query trực tiếp.

## Bước 6 --- Route

Ví dụ:

``` text
routes/review.routes.ts
```

Route chịu trách nhiệm:

-   HTTP method.
-   URL.
-   Middleware.
-   Controller.

Ví dụ luồng:

``` text
POST /reviews
→ authenticate
→ upload
→ validate
→ createReview controller
```

## Bước 7 --- Đăng ký Route

Chỉ **thêm** route của feature vào `routes/index.ts`.

Không xóa hoặc sửa route của module khác.

## Bước 8 --- Test API

Tối thiểu kiểm tra:

-   Trường hợp thành công.
-   Thiếu/sai dữ liệu.
-   Không tìm thấy resource.
-   Chưa đăng nhập nếu route protected.
-   Sai quyền nếu route ADMIN.
-   Duplicate/conflict nếu nghiệp vụ có ràng buộc.
-   Pagination/filter nếu endpoint hỗ trợ.

------------------------------------------------------------------------

# 7. Quy trình Frontend khi làm một Feature mới

Frontend không cần mô phỏng cấu trúc Backend 1:1. Tạo đúng file theo nhu
cầu.

Ví dụ feature Destination:

``` text
frontend/src/
├── pages/
│   ├── Destinations/
│   └── DestinationDetail/
├── components/
│   └── destination/
│       ├── DestinationCard.tsx
│       └── FilterBar.tsx
├── services/
│   └── destination.service.ts
└── types/
    └── destination.types.ts
```

## Bước 1 --- Tạo type

Khai báo dữ liệu API trả về:

``` typescript
export interface Destination {
  id: number;
  name: string;
  primaryImage: string | null;
}
```

Không dùng `any` nếu có thể xác định kiểu.

## Bước 2 --- Tạo API Service

Tất cả request tới Backend nên đi qua service/API client thống nhất.

``` text
services/destination.service.ts
```

Không rải `axios.get(...)` trực tiếp khắp các component.

## Bước 3 --- Tạo Component tái sử dụng

Ví dụ:

``` text
DestinationCard
ReviewItem
RatingStars
ItineraryItem
```

Nếu component chỉ dùng trong một page và không có giá trị tái sử dụng,
có thể đặt gần page tương ứng.

## Bước 4 --- Tạo Page

Page chịu trách nhiệm ghép component và điều phối dữ liệu của màn hình.

Không nhét toàn bộ giao diện vào `App.tsx`.

## Bước 5 --- Đăng ký Route

Thêm route vào cấu hình route hiện tại.

Route yêu cầu login:

``` text
ProtectedRoute
```

Route Admin:

``` text
AdminRoute
```

## Bước 6 --- Xử lý trạng thái UI

Màn hình gọi API phải xử lý tối thiểu:

-   Loading.
-   Success.
-   Empty state.
-   Error.

Form cần:

-   Validate đầu vào.
-   Disable nút khi đang submit nếu phù hợp.
-   Hiển thị lỗi Backend rõ ràng.

------------------------------------------------------------------------

# 8. Authentication và Authorization

## 8.1. Token

Quy ước:

``` text
Access Token  → 15 phút
Refresh Token → 30 ngày
```

-   Access Token được frontend dùng trong
    `Authorization: Bearer <token>`.
-   Refresh Token lưu bằng **HttpOnly Cookie**.
-   Không lưu Refresh Token trong `localStorage`.

## 8.2. Refresh flow

``` text
Login
  ↓
Access Token + Refresh Cookie
  ↓
Frontend gọi API
  ↓
401 do Access Token hết hạn
  ↓
POST /api/v1/auth/refresh
  ↓
Nhận Access Token mới
  ↓
Retry request phù hợp
```

Frontend dùng Axios interceptor theo convention của dự án.

Khi dùng cookie giữa Frontend và Backend, cấu hình request/CORS phải hỗ
trợ credentials theo cấu hình Core.

## 8.3. Backend protected route

``` text
authenticate
```

sử dụng cho API cần đăng nhập.

Admin:

``` text
authenticate
→ requireRole('ADMIN')
```

## 8.4. Frontend route

-   `ProtectedRoute`: chặn user chưa đăng nhập.
-   `AdminRoute`: chỉ cho user có quyền ADMIN.

> Frontend guard chỉ phục vụ UX. Quyền truy cập thật sự vẫn phải được
> kiểm tra ở Backend.

------------------------------------------------------------------------

# 9. Database, Prisma và Migration

## 9.1. Khi nào được sửa `schema.prisma`?

Chỉ sửa khi feature thực sự cần:

-   Model mới.
-   Field mới.
-   Relation mới.
-   Constraint/index mới.
-   Thay đổi kiểu dữ liệu đã được nhóm thống nhất.

Không sửa schema chỉ để thuận tiện tạm thời cho code cá nhân.

## 9.2. Trước khi sửa schema

1.  Pull `main` mới nhất.
2.  Kiểm tra migration hiện có.
3.  Trao đổi nếu thay đổi ảnh hưởng module khác.
4.  Sau khi thống nhất mới sửa.

## 9.3. Migration

Sau khi thay đổi schema, dùng script/command Prisma mà dự án đã thống
nhất.

Tên migration phải mô tả thay đổi, ví dụ:

``` text
add_review_images
add_refresh_tokens
add_destination_indexes
```

> Không sửa nội dung migration cũ đã được commit và chia sẻ cho cả nhóm,
> trừ khi cả nhóm thống nhất xử lý lại lịch sử migration.

## 9.4. Prisma Client

Chỉ dùng singleton:

``` typescript
import prisma from '../config/db';
```

Không:

``` typescript
const prisma = new PrismaClient();
```

trong từng service/repository.

## 9.5. Transaction

Dùng transaction khi một nghiệp vụ có nhiều thay đổi DB cần thành công
hoặc thất bại cùng nhau.

Ví dụ:

``` text
Tạo Trip
+ tạo TripDay
+ tạo nhiều Itinerary
```

Nếu một bước thất bại, cần tránh trạng thái dữ liệu dở dang.

------------------------------------------------------------------------

# 10. Upload ảnh

Luồng chuẩn:

``` text
Frontend FormData
    ↓
Multer Middleware
    ↓
Controller/Service
    ↓
Upload Service / Cloudinary
    ↓
Nhận URL
    ↓
Repository lưu URL vào PostgreSQL
```

Quy tắc:

-   Multer xử lý `multipart/form-data`.
-   Cloudinary xử lý lưu file.
-   Database lưu URL/metadata, không lưu binary ảnh trực tiếp nếu kiến
    trúc hiện tại không yêu cầu.
-   Validate số lượng, loại và kích thước file theo cấu hình của dự án.
-   Khi xóa/thay ảnh, cần cân nhắc đồng bộ dữ liệu Cloudinary và
    Database.

------------------------------------------------------------------------

# 11. Quy chuẩn API Response và Error Handling

## 11.1. Thành công

``` json
{
  "success": true,
  "message": "Thành công",
  "data": {}
}
```

## 11.2. Created

``` json
{
  "success": true,
  "message": "Tạo thành công",
  "data": {}
}
```

HTTP status:

``` text
201 Created
```

## 11.3. Pagination

``` json
{
  "success": true,
  "message": "Thành công",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

## 11.4. Validation Error

``` json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": {
    "name": ["Tên không được để trống"]
  }
}
```

## 11.5. Business Error

Service dùng:

``` typescript
throw new AppError(
  'Không tìm thấy địa điểm',
  HTTP_STATUS.NOT_FOUND
);
```

Không dùng pattern:

``` typescript
(err as any).statusCode = 404;
```

## 11.6. Một số HTTP status thường dùng

  Status   Ý nghĩa
  -------- ------------------------------------
  `200`    Thành công
  `201`    Tạo mới thành công
  `400`    Request không hợp lệ
  `401`    Chưa xác thực / token không hợp lệ
  `403`    Không có quyền
  `404`    Không tìm thấy
  `409`    Xung đột dữ liệu
  `422`    Validation thất bại
  `500`    Lỗi hệ thống

------------------------------------------------------------------------

# 12. Quy chuẩn đặt tên

## File

Dùng convention hiện tại:

``` text
destination.controller.ts
destination.service.ts
destination.repository.ts
destination.routes.ts
destination.validator.ts
destination.types.ts
```

## Function/Variable

Dùng `camelCase`:

``` typescript
getDestinationById
createReview
currentUser
destinationId
```

## React Component

Dùng `PascalCase`:

``` text
DestinationCard
TripPlanner
ReviewItem
AdminLayout
```

## Type/Interface

Dùng `PascalCase`:

``` typescript
Destination
CreateTripInput
ApiResponse
AuthenticatedRequest
```

## API endpoint

Dùng danh từ, chữ thường, dạng REST:

``` text
/api/v1/destinations
/api/v1/reviews
/api/v1/trips
/api/v1/users/me
```

Tránh endpoint dạng:

``` text
/getAllDestinations
/createNewReview
```

------------------------------------------------------------------------

# 13. Quy tắc tích hợp giữa các Module

Một module cần dữ liệu/chức năng của module khác thì **ưu tiên dùng API
hoặc contract đã thống nhất**, không copy logic sang module của mình.

Ví dụ:

``` text
AI sinh lịch trình
    ↓
User xác nhận lưu
    ↓
Trip API
    ↓
Trip Service lưu dữ liệu
```

Không để AI module tự tạo một phiên bản Trip logic khác.

Các file dùng chung như:

``` text
app.ts
server.ts
config/*
middlewares/*
utils/*
routes/index.ts
```

phải được sửa thận trọng. Nếu thay đổi ảnh hưởng cả nhóm, trao đổi trước
khi merge.

------------------------------------------------------------------------

# 14. Kiểm tra trước khi tạo Pull Request

Trước khi PR, tự kiểm tra:

-   [ ] Code nằm đúng folder/layer.
-   [ ] Không query Prisma trực tiếp trong Controller.
-   [ ] Không tự `new PrismaClient()`.
-   [ ] Request input đã được validate.
-   [ ] Business error dùng `AppError`.
-   [ ] Response đúng format chung.
-   [ ] Route protected có `authenticate`.
-   [ ] Route Admin có kiểm tra role ở Backend.
-   [ ] Frontend có loading/error/empty state khi cần.
-   [ ] Không dùng `any` tùy tiện.
-   [ ] Không commit `.env`.
-   [ ] Không commit `node_modules`.
-   [ ] Không sửa/xóa code của module khác ngoài phạm vi cần thiết.
-   [ ] Nếu đổi Database đã có migration phù hợp.
-   [ ] Backend TypeScript không lỗi.
-   [ ] Frontend TypeScript/build không lỗi.
-   [ ] Đã test các trường hợp chính của feature.
-   [ ] Pull code mới nhất từ `main` và xử lý conflict trước khi PR.

------------------------------------------------------------------------

# 15. Git Workflow và Pull Request

## 15.1. Cập nhật `main`

``` bash
git checkout main
git pull origin main
```

## 15.2. Tạo branch

``` bash
git checkout -b feat/<ten-tinh-nang>
```

Ví dụ:

``` bash
git checkout -b feat/destination-crud
git checkout -b feat/auth-refresh-token
git checkout -b feat/review-images
```

Một branch nên tập trung vào một feature hoặc nhóm thay đổi có liên
quan.

## 15.3. Kiểm tra trước commit

Backend:

``` bash
cd backend
npx tsc --noEmit
```

Frontend:

``` bash
cd frontend
npx tsc --noEmit
```

Nếu `package.json` có script `build`, nên chạy thêm:

``` bash
npm run build
```

## 15.4. Commit

``` bash
git add .
git commit -m "feat: thêm API CRUD cho địa điểm du lịch"
```

Convention:

``` text
feat:  tính năng mới
fix:   sửa lỗi
docs:  tài liệu
refactor: tái cấu trúc không đổi hành vi
chore: công việc cấu hình/phụ trợ
```

## 15.5. Push

``` bash
git push origin feat/<ten-tinh-nang>
```

## 15.6. Pull Request

1.  Mở GitHub.
2.  Tạo Pull Request từ branch feature vào `main`.
3.  Ghi rõ chức năng đã làm.
4.  Ghi endpoint/page đã thêm.
5.  Ghi thay đổi Database/migration nếu có.
6.  Ghi cách test.
7.  Không tự merge nếu quy trình nhóm yêu cầu Team Lead review.
8.  Sau khi review đạt yêu cầu mới merge vào `main`.

------------------------------------------------------------------------

# 16. Checklist nhanh khi nhận một chức năng mới

Khi được giao một feature, thực hiện theo thứ tự:

``` text
1. Đọc yêu cầu
   ↓
2. Kiểm tra Database
   ↓
3. Xác định API cần có
   ↓
4. Xác định Backend files
   ↓
5. Tạo branch
   ↓
6. Validator
   ↓
7. Repository
   ↓
8. Service
   ↓
9. Controller
   ↓
10. Route
   ↓
11. Test API
   ↓
12. Tạo Frontend types
   ↓
13. Tạo API service
   ↓
14. Tạo components/pages
   ↓
15. Gắn route + auth guard nếu cần
   ↓
16. Test Backend + Frontend
   ↓
17. Type-check/build
   ↓
18. Commit + Push + Pull Request
```

## Mẫu file Backend thường gặp

``` text
backend/src/
├── validators/<feature>.validator.ts
├── repositories/<feature>.repository.ts
├── services/<feature>.service.ts
├── controllers/<feature>.controller.ts
├── routes/<feature>.routes.ts
└── types/<feature>.types.ts      # khi cần
```

## Mẫu file Frontend thường gặp

``` text
frontend/src/
├── pages/<Feature>/
├── components/<feature>/
├── services/<feature>.service.ts
└── types/<feature>.types.ts
```

> **Kết luận:** Nếu một thành viên có thể đọc yêu cầu feature, đối chiếu
> checklist này, xác định đúng các file cần tạo, chạy được Backend +
> Frontend và tạo PR không phá convention chung thì feature đã đi đúng
> quy trình phát triển của dự án.
