# Hướng dẫn Phát triển Backend — Travel Platform

> **Dành cho tất cả thành viên nhóm.**
> Tài liệu này mô tả kiến trúc thực tế của project và cách triển khai feature theo chuẩn nhất quán.
> Đọc kỹ trước khi bắt đầu code bất kỳ feature nào.

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Quy trình tạo feature mới](#2-quy-trình-tạo-feature-mới)
3. [Danh sách file theo feature](#3-danh-sách-file-theo-feature)
4. [Quy tắc đặt tên](#4-quy-tắc-đặt-tên)
5. [CRUD chuẩn](#5-crud-chuẩn)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Validation & Error Handling](#7-validation--error-handling)
8. [Database & Prisma](#8-database--prisma)
9. [Upload file](#9-upload-file)
10. [API Response Convention](#10-api-response-convention)
11. [Ví dụ hoàn chỉnh — Feature Destination](#11-ví-dụ-hoàn-chỉnh--feature-destination)
12. [Checklist trước khi tạo Pull Request](#12-checklist-trước-khi-tạo-pull-request)
13. [Git Workflow](#13-git-workflow)
14. [Các vấn đề cần thống nhất](#14-các-vấn-đề-cần-thống-nhất)

---

## 1. Tổng quan kiến trúc

### Cấu trúc thư mục

```
backend/
├── prisma/
│   ├── schema.prisma        ← Định nghĩa bảng DB (nguồn sự thật duy nhất)
│   ├── seed.ts              ← Dữ liệu mẫu cho dev
│   └── migrations/          ← Lịch sử thay đổi DB (KHÔNG sửa tay)
│
└── src/
    ├── server.ts            ← Entry point: kết nối DB → lắng nghe port
    ├── app.ts               ← Khởi tạo Express, đăng ký middleware & routes
    │
    ├── config/              ← Khởi tạo kết nối bên ngoài (1 lần duy nhất)
    │   ├── db.ts            ← PrismaClient singleton
    │   ├── passport.ts      ← Google OAuth config
    │   └── cloudinary.ts    ← Cloudinary SDK init
    │
    ├── constants/           ← Hằng số dùng chung toàn project
    │   └── index.ts
    │
    ├── types/               ← TypeScript types/interfaces dùng chung
    │   ├── express.d.ts     ← Mở rộng req.user
    │   ├── api.types.ts     ← ApiResponse<T>, PaginatedResponse<T>
    │   └── common.types.ts  ← JwtPayload, PaginationQuery
    │
    ├── utils/               ← Hàm tiện ích thuần túy, không phụ thuộc Express
    │   ├── response.utils.ts   ← sendSuccess(), sendError(), sendPaginated()
    │   ├── jwt.utils.ts        ← generateAccessToken(), verifyAccessToken()
    │   └── pagination.utils.ts ← calculatePagination()
    │
    ├── middlewares/         ← Xử lý trung gian, tái sử dụng ở nhiều route
    │   ├── auth.middleware.ts         ← Verify JWT → req.user
    │   ├── role.middleware.ts         ← Kiểm tra quyền (ADMIN/USER)
    │   ├── validate.middleware.ts     ← Validate body/query/params bằng Zod
    │   ├── upload.middleware.ts       ← Nhận file ảnh bằng Multer
    │   └── errorHandler.middleware.ts ← Bắt lỗi toàn cục (đặt cuối app.ts)
    │
    ├── validators/          ← Schema Zod cho từng feature
    │   └── destination.validator.ts
    │
    ├── repositories/        ← Tầng truy cập DB (Prisma queries)
    │   └── destination.repository.ts
    │
    ├── services/            ← Business logic, xử lý nghiệp vụ
    │   ├── upload.service.ts          ← Dùng chung: upload Cloudinary
    │   └── destination.service.ts
    │
    ├── controllers/         ← Nhận request → gọi service → trả response
    │   └── destination.controller.ts
    │
    └── routes/              ← Định nghĩa endpoint & kết nối middleware
        ├── index.ts                   ← Tập hợp tất cả routes
        └── destination.routes.ts
```

---

### Luồng xử lý một Request

```
Client
  │
  ▼
app.ts (helmet, cors, body-parser, passport)
  │
  ▼
routes/index.ts → /api/v1/<feature>
  │
  ▼
feature.routes.ts
  │
  ├── [Nếu cần đăng nhập] → authenticate middleware
  ├── [Nếu cần quyền]     → requireRole middleware
  ├── [Nếu có upload]     → uploadSingle middleware
  ├── [Luôn có]           → validate middleware
  │
  ▼
controller
  │
  ▼
service (business logic)
  │
  ▼
repository (Prisma query)
  │
  ▼
PostgreSQL
  │
  ▼ (kết quả trả về ngược lên)
controller → sendSuccess() / sendError() / sendPaginated()
  │
  ▼
Client (JSON response)

[Nếu có lỗi ở bất kỳ tầng nào]
  │
  ▼
errorHandler.middleware.ts (tự động bắt nhờ express-async-errors)
  │
  ▼
Client (JSON error response)
```

---

### Quy tắc gọi giữa các tầng

| Tầng | Được phép gọi | KHÔNG được phép gọi |
|------|--------------|---------------------|
| `controller` | `service`, `utils/response.utils` | Repository, Prisma trực tiếp |
| `service` | `repository`, `utils/*`, `config/cloudinary`, `constants` | Controller, Express (req/res) |
| `repository` | `config/db` (Prisma), `constants` | Service, Controller, Express |
| `middleware` | `utils/*`, `config/db`, `constants` | Service, Repository |
| `validator` | `constants` (cho giá trị hợp lệ) | Không gọi gì khác |

> **Quy tắc vàng:** Controller không được query DB trực tiếp. Service không được biết Express tồn tại.

---

## 2. Quy trình tạo feature mới

### Bước 0: Kiểm tra schema.prisma

```bash
# Mở Prisma Studio để xem bảng đã có chưa
npm run db:studio
```

Kiểm tra bảng feature cần dùng đã có trong `prisma/schema.prisma` chưa.

**Nếu cần thêm/sửa bảng:**
```bash
# Sửa prisma/schema.prisma
# Sau đó tạo migration
npx prisma migrate dev --name them_bang_xxx
```

> **QUAN TRỌNG:** Không sửa file migration đã có. Chỉ tạo migration mới.

---

### Bước 1: Tạo Validator — `src/validators/<feature>.validator.ts`

Đây là bước đầu tiên vì validator xác định dữ liệu nào được phép vào hệ thống.

```typescript
// src/validators/destination.validator.ts
import { z } from 'zod';

export const createDestinationSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  ticketPrice: z.number().min(0).optional(),
});

export type CreateDestinationDto = z.infer<typeof createDestinationSchema>;
```

---

### Bước 2: Tạo Repository — `src/repositories/<feature>.repository.ts`

Repository chỉ chứa Prisma queries. **Không có business logic ở đây.**

```typescript
// src/repositories/destination.repository.ts
import prisma from '../config/db';

export const findAllDestinations = (skip: number, take: number) => {
  return prisma.destination.findMany({ skip, take, where: { isActive: true } });
};

export const countDestinations = () => {
  return prisma.destination.count({ where: { isActive: true } });
};

export const findDestinationById = (id: number) => {
  return prisma.destination.findUnique({ where: { id } });
};
```

---

### Bước 3: Tạo Service — `src/services/<feature>.service.ts`

Service xử lý business logic, gọi repository, không biết Express.

```typescript
// src/services/destination.service.ts
import * as destinationRepo from '../repositories/destination.repository';
import { calculatePagination } from '../utils/pagination.utils';
import { PaginationQuery } from '../types/common.types';

export const getAllDestinations = async (query: PaginationQuery) => {
  const total = await destinationRepo.countDestinations();
  const pagination = calculatePagination(query, total);
  const data = await destinationRepo.findAllDestinations(pagination.skip, pagination.limit);
  return { data, pagination };
};
```

---

### Bước 4: Tạo Controller — `src/controllers/<feature>.controller.ts`

Controller nhận request, gọi service, trả response.

```typescript
// src/controllers/destination.controller.ts
import { Request, Response } from 'express';
import * as destinationService from '../services/destination.service';
import { sendSuccess, sendPaginated } from '../utils/response.utils';

export const getAll = async (req: Request, res: Response) => {
  const { data, pagination } = await destinationService.getAllDestinations(req.query);
  sendPaginated(res, data, pagination);
};
```

---

### Bước 5: Tạo Route — `src/routes/<feature>.routes.ts`

Route kết nối middleware + controller.

```typescript
// src/routes/destination.routes.ts
import { Router } from 'express';
import * as destinationController from '../controllers/destination.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { paginationSchema } from '../validators/destination.validator';

const router = Router();

router.get('/', validate(paginationSchema, 'query'), destinationController.getAll);

export default router;
```

---

### Bước 6: Đăng ký vào `src/routes/index.ts`

**ĐÂY LÀ FILE DÙNG CHUNG — CHỈ THÊM, KHÔNG XÓA DÒNG NGƯỜI KHÁC.**

```typescript
// src/routes/index.ts
import destinationRoutes from './destination.routes';

// Thêm dòng này vào router:
router.use('/destinations', destinationRoutes);
```

---

### Bước 7: Test API

```bash
# GET list
GET http://localhost:3000/api/v1/destinations

# GET detail
GET http://localhost:3000/api/v1/destinations/1

# POST (cần token)
POST http://localhost:3000/api/v1/destinations
Authorization: Bearer <token>
Content-Type: application/json
{ "name": "Hồ Gươm", "address": "Hà Nội", ... }
```

---

## 3. Danh sách file theo feature

### BẮT BUỘC tạo khi có feature mới

| File | Mô tả |
|------|-------|
| `src/validators/<feature>.validator.ts` | Schema Zod |
| `src/repositories/<feature>.repository.ts` | Prisma queries |
| `src/services/<feature>.service.ts` | Business logic |
| `src/controllers/<feature>.controller.ts` | Xử lý request/response |
| `src/routes/<feature>.routes.ts` | Định nghĩa endpoint |

### File cần SỬA khi tạo feature mới

| File | Sửa gì |
|------|--------|
| `src/routes/index.ts` | Thêm `router.use('/feature', featureRoutes)` |
| `prisma/schema.prisma` | **CHỈ KHI CẦN** thêm bảng mới |

### NÊN tạo tùy chức năng

| File | Khi nào cần |
|------|-------------|
| `src/types/<feature>.types.ts` | Khi có nhiều DTO phức tạp |
| `prisma/migrations/...` | Khi sửa schema.prisma |

### KHÔNG được sửa (trừ Team Lead)

| File | Lý do |
|------|-------|
| `src/app.ts` | Ảnh hưởng toàn bộ server |
| `src/server.ts` | Entry point |
| `src/config/*.ts` | Cấu hình global |
| `src/middlewares/*.ts` | Tất cả team dùng |
| `src/utils/*.ts` | Tất cả team dùng |
| `src/constants/index.ts` | Thêm thì ok, xóa/sửa thì báo nhóm |
| `src/types/express.d.ts`, `api.types.ts` | Hỏi Team Lead trước |

---

## 4. Quy tắc đặt tên

### File & Folder

```
✅ destination.controller.ts     (kebab-case + suffix rõ ràng)
✅ destination.repository.ts
✅ destination.service.ts
✅ destination.routes.ts
✅ destination.validator.ts
✅ destination.types.ts

❌ DestinationController.ts      (PascalCase cho file)
❌ destinationcontroller.ts      (không có suffix)
❌ dest.ts                       (viết tắt)
```

### Function (camelCase)

```typescript
✅ getAllDestinations()
✅ getDestinationById()
✅ createDestination()
✅ updateDestination()
✅ deleteDestination()

❌ GetAllDestinations()     // PascalCase
❌ get_all_destinations()   // snake_case
❌ getdests()               // viết tắt
```

### Interface & Type (PascalCase)

```typescript
✅ interface CreateDestinationDto { ... }
✅ interface UpdateDestinationDto { ... }
✅ type DestinationWithCategories = ...

// Suffix DTO cho dữ liệu vào (request body)
// Suffix Response cho dữ liệu ra
```

### API Endpoint (kebab-case, số nhiều)

```
✅ GET    /api/v1/destinations
✅ GET    /api/v1/destinations/:id
✅ POST   /api/v1/destinations
✅ PATCH  /api/v1/destinations/:id
✅ DELETE /api/v1/destinations/:id
✅ GET    /api/v1/destinations/:id/reviews
✅ POST   /api/v1/auth/login

❌ /api/v1/getDestinations     // động từ trong URL
❌ /api/v1/Destination         // số ít, PascalCase
❌ /api/v1/destination_list    // snake_case
```

### Prisma Model & DB Table

```
Model Prisma: PascalCase → User, Destination, TripDay
Bảng DB:     snake_case → users, destinations, trip_days  (dùng @@map)
Cột DB:      snake_case → full_name, created_at           (dùng @map)
Field Prisma: camelCase → fullName, createdAt
```

---

## 5. CRUD chuẩn

### GET list (có phân trang)

**Luồng:** Route → validate(query) → Controller → Service → Repository → sendPaginated

```typescript
// routes:
router.get('/', validate(listDestinationSchema, 'query'), destinationController.getAll);

// controller:
export const getAll = async (req: Request, res: Response) => {
  const { data, pagination } = await destinationService.getAllDestinations(req.query as any);
  sendPaginated(res, data, pagination);
};

// service:
export const getAllDestinations = async (query: SearchQuery) => {
  const total = await destinationRepo.countDestinations(query.search);
  const pagination = calculatePagination(query, total);
  const data = await destinationRepo.findAllDestinations(
    pagination.skip, pagination.limit, query.search
  );
  return { data, pagination };
};
```

### GET detail

**Luồng:** Route → Controller → Service → Repository → sendSuccess / throw Error

```typescript
// routes:
router.get('/:id', destinationController.getOne);

// controller:
export const getOne = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const destination = await destinationService.getDestinationById(id);
  sendSuccess(res, destination);
};

// service:
export const getDestinationById = async (id: number) => {
  const destination = await destinationRepo.findDestinationById(id);
  if (!destination) {
    const err = new Error('Không tìm thấy địa điểm');
    (err as any).statusCode = 404;
    throw err;
  }
  return destination;
};
```

### POST (tạo mới)

**Luồng:** Route → authenticate → requireRole → validate(body) → Controller → Service → sendSuccess(201)

```typescript
router.post('/',
  authenticate,
  requireRole('ADMIN'),
  validate(createDestinationSchema),
  destinationController.create
);

// controller:
export const create = async (req: Request, res: Response) => {
  const destination = await destinationService.createDestination(req.body);
  sendSuccess(res, destination, 'Tạo địa điểm thành công', HTTP_STATUS.CREATED);
};
```

### PATCH (cập nhật một phần)

```typescript
// Dùng PATCH thay vì PUT (chỉ cập nhật field được gửi lên)
router.patch('/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateDestinationSchema),
  destinationController.update
);
```

### DELETE

```typescript
router.delete('/:id', authenticate, requireRole('ADMIN'), destinationController.remove);

// controller:
export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await destinationService.deleteDestination(id);
  sendSuccess(res, null, 'Xóa địa điểm thành công');
};
```

---

## 6. Authentication & Authorization

### Khi nào dùng middleware nào

```typescript
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { ROLE } from '../constants';

// PUBLIC — không cần đăng nhập
router.get('/', destinationController.getAll);
router.get('/:id', destinationController.getOne);

// PROTECTED — cần đăng nhập (bất kỳ user nào)
router.post('/:id/favorites', authenticate, favoriteController.add);

// PROTECTED — chỉ ADMIN
router.post('/', authenticate, requireRole(ROLE.ADMIN), destinationController.create);
router.delete('/:id', authenticate, requireRole(ROLE.ADMIN), destinationController.remove);
```

### Cách lấy thông tin user đã đăng nhập

```typescript
// Trong controller, sau khi qua authenticate:
export const createReview = async (req: Request, res: Response) => {
  const userId = req.user!.id;        // ID người dùng hiện tại
  const userRole = req.user!.role;    // 'USER' hoặc 'ADMIN'
  const userEmail = req.user!.email;
  // req.user đã được Omit passwordHash — an toàn để dùng
};
```

### Thứ tự middleware BẮT BUỘC

```typescript
router.post('/',
  authenticate,           // 1. Xác thực token
  requireRole('ADMIN'),   // 2. Kiểm tra quyền (phải sau authenticate)
  uploadSingle,           // 3. Xử lý file (nếu có)
  validate(schema),       // 4. Validate body
  controller.create       // 5. Xử lý nghiệp vụ
);
```

---

## 7. Validation & Error Handling

### Validator với Zod

```typescript
// src/validators/review.validator.ts
import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const listReviewSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),  // z.coerce cho query params
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// Dùng z.coerce cho query params vì chúng luôn là string từ URL
```

### Áp dụng validate middleware

```typescript
router.post('/', validate(createReviewSchema), controller.create);         // body
router.get('/', validate(listReviewSchema, 'query'), controller.getAll);   // query
router.get('/:id', validate(idParamSchema, 'params'), controller.getOne); // params
```

### Xử lý lỗi trong Service

```typescript
// Cách đúng — throw lỗi có statusCode
export const createReview = async (userId: number, destinationId: number, data: CreateReviewDto) => {
  const existing = await reviewRepo.findByUserAndDestination(userId, destinationId);
  if (existing) {
    const err = new Error('Bạn đã đánh giá địa điểm này rồi');
    (err as any).statusCode = HTTP_STATUS.CONFLICT;
    throw err;
  }
  return reviewRepo.create(userId, destinationId, data);
};
```

### Controller KHÔNG cần try/catch

```typescript
// ĐÚNG — express-async-errors tự forward lỗi đến errorHandler
export const create = async (req: Request, res: Response) => {
  const review = await reviewService.createReview(...);
  sendSuccess(res, review, 'Đánh giá thành công', HTTP_STATUS.CREATED);
};

// SAI — try/catch dư thừa (trừ khi xử lý lỗi đặc biệt)
export const create = async (req: Request, res: Response) => {
  try {
    const review = await reviewService.createReview(...);
    sendSuccess(res, review);
  } catch (err) {
    sendError(res, 'Lỗi', 500); // ❌ Không cần, errorHandler đã lo
  }
};
```

> `express-async-errors` đã được import trong `app.ts`. Mọi lỗi async throw đều được bắt tự động.

---

## 8. Database & Prisma

### Khi nào sửa schema.prisma

- **CÓ** — khi cần thêm bảng, cột, index mới
- **KHÔNG** — khi chỉ thêm business logic, không có thay đổi DB

### Cách tạo migration

```bash
npx prisma migrate dev --name <tên_mô_tả_thay_đổi>

# Ví dụ đặt tên đúng:
npx prisma migrate dev --name add_table_reviews
npx prisma migrate dev --name add_column_is_verified_to_users
npx prisma migrate dev --name remove_phone_from_destinations

# Sai:
npx prisma migrate dev --name fix          # không rõ nghĩa
npx prisma migrate dev --name update_db    # không rõ nghĩa
```

### Quy tắc sử dụng Prisma

```typescript
// ✅ Đúng
import prisma from '../config/db';

// ❌ Sai — tự tạo PrismaClient
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // KHÔNG BAO GIỜ

// ✅ Đúng — query trong repository
export const findAll = () => prisma.destination.findMany();

// ❌ Sai — query trong controller
export const getAll = async (req: Request, res: Response) => {
  const data = await prisma.destination.findMany(); // KHÔNG
};
```

### Transaction (nhiều thao tác DB liên quan)

```typescript
export const createTripWithDays = async (data: CreateTripDto) => {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.create({ data: { ... } });
    await tx.tripDay.createMany({ data: [...] });
    return trip;
  });
};
```

---

## 9. Upload file

### Luồng upload ảnh

```
Client (multipart/form-data)
  ↓
uploadSingle middleware (Multer — nhận file, lưu vào memory)
  ↓
Controller (req.file.buffer có sẵn)
  ↓
Service gọi uploadToCloudinary(buffer, 'folder-name')
  ↓
Cloudinary trả về { secure_url, ... }
  ↓
Repository lưu URL vào DB
```

### Ví dụ trong route

```typescript
import { uploadSingle } from '../middlewares/upload.middleware';

router.post('/:id/images',
  authenticate,
  requireRole('ADMIN'),
  uploadSingle,              // ← Xử lý multipart, gắn req.file
  destinationController.addImage
);
```

### Ví dụ trong controller

```typescript
export const addImage = async (req: Request, res: Response) => {
  if (!req.file) {
    sendError(res, 'Vui lòng chọn ảnh', HTTP_STATUS.BAD_REQUEST);
    return;
  }
  const id = Number(req.params.id);
  const image = await destinationService.addImage(id, req.file.buffer);
  sendSuccess(res, image, 'Upload ảnh thành công', HTTP_STATUS.CREATED);
};
```

### Ví dụ trong service

```typescript
import { uploadToCloudinary } from './upload.service';

export const addImage = async (destinationId: number, buffer: Buffer) => {
  const result = await uploadToCloudinary(buffer, 'destinations');
  return destinationRepo.createImage(destinationId, result.secure_url);
};
```

> **Không lưu binary ảnh vào PostgreSQL.** Chỉ lưu URL string sau khi upload Cloudinary.

---

## 10. API Response Convention

Mọi response phải dùng hàm trong `utils/response.utils.ts`. Không tự `res.json()`.

| Trường hợp | Function | Status |
|-----------|----------|--------|
| Thành công | `sendSuccess(res, data, message)` | 200 |
| Tạo mới | `sendSuccess(res, data, message, 201)` | 201 |
| Danh sách | `sendPaginated(res, data, pagination)` | 200 |
| Lỗi tùy chỉnh | `sendError(res, message, statusCode)` | tùy |

### Format chuẩn

```json
// Success
{ "success": true, "message": "Thành công", "data": { ... } }

// Created
{ "success": true, "message": "Tạo thành công", "data": { ... } }

// Paginated
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 } }

// Validation Error (422)
{ "success": false, "message": "Dữ liệu không hợp lệ", "errors": { "name": ["..."] } }

// Unauthorized (401)
{ "success": false, "message": "Không có token xác thực" }

// Forbidden (403)
{ "success": false, "message": "Bạn không có quyền thực hiện hành động này" }

// Not Found (404)
{ "success": false, "message": "Không tìm thấy địa điểm" }

// Conflict (409)
{ "success": false, "message": "Bạn đã đánh giá địa điểm này rồi" }

// Server Error (500)
{ "success": false, "message": "Lỗi hệ thống" }
```

---

## 11. Ví dụ hoàn chỉnh — Feature Destination

### Cấu trúc file cần tạo

```
backend/src/
├── validators/
│   └── destination.validator.ts
├── repositories/
│   └── destination.repository.ts
├── services/
│   └── destination.service.ts
├── controllers/
│   └── destination.controller.ts
└── routes/
    └── destination.routes.ts
```

File cần sửa: `src/routes/index.ts`

---

### 1. `src/validators/destination.validator.ts`

```typescript
import { z } from 'zod';

export const listDestinationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

export const createDestinationSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(200),
  description: z.string().optional(),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  ticketPrice: z.number().min(0).optional().default(0),
  categoryIds: z.array(z.number().int()).optional(),
});

export const updateDestinationSchema = createDestinationSchema.partial();

export type ListDestinationQuery = z.infer<typeof listDestinationSchema>;
export type CreateDestinationDto = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationDto = z.infer<typeof updateDestinationSchema>;
```

---

### 2. `src/repositories/destination.repository.ts`

```typescript
import prisma from '../config/db';
import { CreateDestinationDto, UpdateDestinationDto } from '../validators/destination.validator';

export const countDestinations = (search?: string) =>
  prisma.destination.count({
    where: { isActive: true, ...(search && { name: { contains: search, mode: 'insensitive' } }) },
  });

export const findAllDestinations = (skip: number, take: number, search?: string) =>
  prisma.destination.findMany({
    skip, take,
    where: { isActive: true, ...(search && { name: { contains: search, mode: 'insensitive' } }) },
    include: { categories: { include: { category: true } }, images: { where: { isPrimary: true } } },
    orderBy: { rating: 'desc' },
  });

export const findDestinationById = (id: number) =>
  prisma.destination.findUnique({
    where: { id, isActive: true },
    include: {
      categories: { include: { category: true } },
      images: { orderBy: { displayOrder: 'asc' } },
    },
  });

export const createDestination = (data: CreateDestinationDto) => {
  const { categoryIds, ...rest } = data;
  return prisma.destination.create({
    data: {
      ...rest,
      ...(categoryIds && { categories: { create: categoryIds.map((cId) => ({ categoryId: cId })) } }),
    },
  });
};

export const updateDestination = (id: number, data: UpdateDestinationDto) => {
  const { categoryIds: _ignored, ...rest } = data;
  return prisma.destination.update({ where: { id }, data: rest });
};

export const softDeleteDestination = (id: number) =>
  prisma.destination.update({ where: { id }, data: { isActive: false } });
```

---

### 3. `src/services/destination.service.ts`

```typescript
import * as repo from '../repositories/destination.repository';
import { calculatePagination } from '../utils/pagination.utils';
import { HTTP_STATUS } from '../constants';
import { ListDestinationQuery, CreateDestinationDto, UpdateDestinationDto } from '../validators/destination.validator';

export const getAllDestinations = async (query: ListDestinationQuery) => {
  const total = await repo.countDestinations(query.search);
  const pagination = calculatePagination(query, total);
  const data = await repo.findAllDestinations(pagination.skip, pagination.limit, query.search);
  return { data, pagination };
};

export const getDestinationById = async (id: number) => {
  const destination = await repo.findDestinationById(id);
  if (!destination) {
    const err = new Error('Không tìm thấy địa điểm');
    (err as any).statusCode = HTTP_STATUS.NOT_FOUND;
    throw err;
  }
  return destination;
};

export const createDestination = (data: CreateDestinationDto) =>
  repo.createDestination(data);

export const updateDestination = async (id: number, data: UpdateDestinationDto) => {
  await getDestinationById(id);
  return repo.updateDestination(id, data);
};

export const deleteDestination = async (id: number) => {
  await getDestinationById(id);
  return repo.softDeleteDestination(id);
};
```

---

### 4. `src/controllers/destination.controller.ts`

```typescript
import { Request, Response } from 'express';
import * as destinationService from '../services/destination.service';
import { sendSuccess, sendPaginated } from '../utils/response.utils';
import { HTTP_STATUS } from '../constants';

export const getAll = async (req: Request, res: Response) => {
  const { data, pagination } = await destinationService.getAllDestinations(req.query as any);
  sendPaginated(res, data, pagination);
};

export const getOne = async (req: Request, res: Response) => {
  const destination = await destinationService.getDestinationById(Number(req.params.id));
  sendSuccess(res, destination);
};

export const create = async (req: Request, res: Response) => {
  const destination = await destinationService.createDestination(req.body);
  sendSuccess(res, destination, 'Tạo địa điểm thành công', HTTP_STATUS.CREATED);
};

export const update = async (req: Request, res: Response) => {
  const destination = await destinationService.updateDestination(Number(req.params.id), req.body);
  sendSuccess(res, destination, 'Cập nhật địa điểm thành công');
};

export const remove = async (req: Request, res: Response) => {
  await destinationService.deleteDestination(Number(req.params.id));
  sendSuccess(res, null, 'Xóa địa điểm thành công');
};
```

---

### 5. `src/routes/destination.routes.ts`

```typescript
import { Router } from 'express';
import * as destinationController from '../controllers/destination.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { listDestinationSchema, createDestinationSchema, updateDestinationSchema } from '../validators/destination.validator';

const router = Router();

// Public
router.get('/', validate(listDestinationSchema, 'query'), destinationController.getAll);
router.get('/:id', destinationController.getOne);

// Admin only
router.post('/', authenticate, requireRole('ADMIN'), validate(createDestinationSchema), destinationController.create);
router.patch('/:id', authenticate, requireRole('ADMIN'), validate(updateDestinationSchema), destinationController.update);
router.delete('/:id', authenticate, requireRole('ADMIN'), destinationController.remove);

export default router;
```

---

### 6. Sửa `src/routes/index.ts`

```typescript
import { Router, Request, Response } from 'express';
import destinationRoutes from './destination.routes';
// import authRoutes from './auth.routes';       ← TV khác thêm vào đây

const router = Router();

router.get('/health', (_req: Request, res: Response) => { ... });

// Feature routes
router.use('/destinations', destinationRoutes);
// router.use('/auth', authRoutes);              ← TV khác thêm vào đây

export default router;
```

---

### API Request & Response hoàn chỉnh

```
GET /api/v1/destinations?page=1&limit=5&search=hồ
→ 200 { success: true, data: [...], pagination: { page: 1, limit: 5, total: 12, totalPages: 3 } }

GET /api/v1/destinations/1
→ 200 { success: true, data: { id: 1, name: "Hồ Gươm", categories: [...], images: [...] } }

GET /api/v1/destinations/9999
→ 404 { success: false, message: "Không tìm thấy địa điểm" }

POST /api/v1/destinations (không có token)
→ 401 { success: false, message: "Không có token xác thực" }

POST /api/v1/destinations (token USER)
→ 403 { success: false, message: "Bạn không có quyền thực hiện hành động này" }

POST /api/v1/destinations (ADMIN, body thiếu trường)
→ 422 { success: false, message: "Dữ liệu không hợp lệ", errors: { name: ["..."] } }

POST /api/v1/destinations (ADMIN, body hợp lệ)
→ 201 { success: true, message: "Tạo địa điểm thành công", data: { id: 5, ... } }
```

---

## 12. Checklist trước khi tạo Pull Request

### Code structure
- [ ] File đặt đúng folder
- [ ] Tên file đúng convention: `<feature>.<layer>.ts`
- [ ] Không query DB trong controller
- [ ] Không dùng Express (req/res) trong service
- [ ] Không tự `new PrismaClient()` — luôn import từ `config/db.ts`

### Database
- [ ] Nếu sửa schema.prisma → đã tạo migration mới
- [ ] Không sửa migration file đã tồn tại
- [ ] Tên migration mô tả rõ thay đổi

### Validation & Error
- [ ] Mọi POST/PATCH đều có `validate(schema)` middleware
- [ ] GET list có `validate(schema, 'query')`
- [ ] Service throw lỗi có `statusCode`
- [ ] Không có try/catch dư thừa trong controller

### Auth & Authorization
- [ ] Route cần đăng nhập có `authenticate`
- [ ] Route cần quyền ADMIN có `requireRole('ADMIN')` sau `authenticate`
- [ ] Thứ tự middleware đúng: authenticate → requireRole → uploadSingle → validate → controller

### Response
- [ ] Dùng `sendSuccess()`, `sendError()`, `sendPaginated()` — không tự `res.json()`
- [ ] Status code đúng (200, 201, 204...)
- [ ] Message tiếng Việt, rõ nghĩa

### TypeScript
- [ ] `npx tsc --noEmit` không có lỗi
- [ ] Không dùng `any` tùy tiện

### Ảnh hưởng chung
- [ ] Chỉ THÊM route vào `routes/index.ts`, không xóa dòng của người khác
- [ ] Không tự sửa `app.ts`, `server.ts`, `config/*`, `middlewares/*`, `utils/*`
- [ ] Nếu phải sửa file dùng chung → báo Team Lead trước

### Git
- [ ] Không commit `.env`
- [ ] Không commit `node_modules/` hoặc `dist/`
- [ ] Commit message theo convention

### Test
- [ ] Test thành công, validation error, not found, unauthorized
- [ ] Test với Postman / Thunder Client / curl

---

## 13. Git Workflow

### Tạo branch

```bash
# Format: <type>/<ten-feature>
git checkout -b feat/destination-api
git checkout -b feat/auth-jwt
git checkout -b feat/review-crud
git checkout -b fix/auth-token-expired
```

**Loại branch:** `feat/`, `fix/`, `docs/`, `refactor/`

---

### Commit message

```
feat: thêm API CRUD cho Destination
feat: thêm xác thực JWT cho auth module
fix: sửa lỗi pagination trả về sai total
refactor: tách upload logic vào upload.service.ts
docs: thêm hướng dẫn phát triển
chore: cập nhật package.json dependencies
```

**Loại commit:** `feat`, `fix`, `refactor`, `docs`, `chore`, `test`

---

### Khi nào pull/rebase từ main

```bash
# Trước khi bắt đầu feature mới
git checkout main && git pull origin main
git checkout -b feat/my-feature

# Khi main có update mới (giữa chừng)
git checkout main && git pull origin main
git checkout feat/my-feature
git rebase main   # Giải quyết conflict nếu có
```

---

### Tạo Pull Request

1. `git push origin feat/destination-api`
2. Mở GitHub → "Compare & pull request"
3. Tiêu đề: `feat: Destination API — CRUD + Upload ảnh`
4. Description gồm: làm gì, endpoints mới, đã test gì, có ảnh hưởng file dùng chung không
5. Request review từ Team Lead trước khi merge

---

### File cần đặc biệt cẩn thận

| File | Mức độ | Hành động |
|------|--------|-----------|
| `prisma/schema.prisma` | 🔴 Cao | Báo nhóm trước, tạo migration sau |
| `src/routes/index.ts` | 🟡 Trung bình | Chỉ THÊM dòng mới |
| `src/app.ts` | 🔴 Cao | Hỏi Team Lead |
| `src/constants/index.ts` | 🟡 Trung bình | Thêm thì ok, sửa/xóa báo nhóm |
| `package.json` | 🟡 Trung bình | Hỏi Team Lead nếu thêm dependency lớn |

---

## 14. Các vấn đề khác

> TV phụ trách feature tương ứng cần làm theo.

---

### ✅ Error Handling — Dùng `AppError` class

**Đã triển khai vào Core.** File: `src/utils/app-error.ts`

Mọi service **BẮT BUỘC** dùng `AppError` khi throw lỗi có thể dự đoán:

```typescript
import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../constants';

// Ví dụ trong service:
export const getDestinationById = async (id: number) => {
  const destination = await repo.findDestinationById(id);
  if (!destination) {
    throw new AppError('Không tìm thấy địa điểm', HTTP_STATUS.NOT_FOUND);
  }
  return destination;
};

// Các ví dụ thường gặp:
throw new AppError('Email đã tồn tại', HTTP_STATUS.CONFLICT);
throw new AppError('Sai mật khẩu', HTTP_STATUS.UNAUTHORIZED);
throw new AppError('Bạn đã đánh giá địa điểm này rồi', HTTP_STATUS.CONFLICT);
throw new AppError('Không tìm thấy chuyến đi', HTTP_STATUS.NOT_FOUND);
```

> **KHÔNG dùng:** `(err as any).statusCode = 404` — pattern cũ, không type-safe.

---

### ✅ Soft Delete vs Hard Delete

| Bảng | Kiểu xóa | Cách thực hiện |
|------|----------|----------------|
| `User` | **Soft delete** | `isActive = false` (đã có trong schema) |
| `Destination` | **Soft delete** | `isActive = false` (đã có trong schema) |
| `Review` | **Hard delete** | `prisma.review.delete({ where: { id } })` |
| `Favorite` | **Hard delete** | `prisma.favorite.deleteMany({ where: { userId, destinationId } })` |
| `Trip` | **Hard delete** | `prisma.trip.delete({ where: { id } })` — TripDay/Itinerary xóa theo Cascade |

**Lưu ý cho TV phụ trách:**
- `User` soft delete: set `isActive = false`, không xóa thật → giữ lịch sử review/trip
- `Destination` soft delete: set `isActive = false`, filter `where: { isActive: true }` ở mọi query GET
- `Trip` hard delete: schema đã có `onDelete: Cascade` cho TripDay và Itinerary → tự động xóa theo

---

### ✅ Refresh Token — Access Token 15 phút + Refresh Token 30 ngày

**TV phụ trách Auth cần implement.**

**Cấu hình token:**
```typescript
// src/utils/jwt.utils.ts (TV Auth cập nhật)
accessToken:  expires in 15m   → gửi trong JSON response body
refreshToken: expires in 30d   → gửi trong HttpOnly + Secure Cookie
```

**Flow:**
```
Login → trả accessToken (body) + set refreshToken (cookie httpOnly)
  ↓
accessToken hết hạn (15 phút)
  ↓
Client gọi POST /api/v1/auth/refresh (tự động gửi cookie)
  ↓
Server verify refreshToken → trả accessToken mới
  ↓
Logout → xóa cookie refreshToken
```

**TV Auth cần thêm `cookie-parser`:**
```bash
npm install cookie-parser
npm install --save-dev @types/cookie-parser
```

Và import vào `app.ts` (báo Team Lead để thêm):
```typescript
import cookieParser from 'cookie-parser';
app.use(cookieParser());
```

**Endpoint cần tạo (TV Auth):**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET  /api/v1/auth/google`
- `GET  /api/v1/auth/google/callback`

---

### ✅ Response ảnh Destination

**TV phụ trách Destination áp dụng ngay từ đầu.**

**List API** — `GET /api/v1/destinations` — trả `primaryImage` (string URL):
```typescript
// Repository — chỉ lấy ảnh primary
images: { where: { isPrimary: true }, take: 1 }

// Response:
{
  "id": 1,
  "name": "Hồ Gươm",
  "rating": 4.5,
  "primaryImage": "https://res.cloudinary.com/..."  // ← string, null nếu chưa có
}
```

**Detail API** — `GET /api/v1/destinations/:id` — trả `images[]` (array):
```typescript
// Repository — lấy toàn bộ ảnh, sắp xếp theo displayOrder
images: { orderBy: { displayOrder: 'asc' } }

// Response:
{
  "id": 1,
  "name": "Hồ Gươm",
  "images": [
    { "id": 1, "imageUrl": "https://...", "isPrimary": true, "displayOrder": 0 },
    { "id": 2, "imageUrl": "https://...", "isPrimary": false, "displayOrder": 1 }
  ]
}
```

---

*Tài liệu được tạo dựa trên codebase thực tế — phiên bản Backend Core hoàn chỉnh.*
*Cập nhật lần cuối: 2026-08-21 — Đã chốt tất cả quyết định kiến trúc.*

