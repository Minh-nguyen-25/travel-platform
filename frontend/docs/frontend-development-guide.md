# TRAVEL PLATFORM — HƯỚNG DẪN PHÁT TRIỂN FRONTEND

> **Tech Stack:** React 18 + Vite + TypeScript + Tailwind CSS v3 + React Router v6 + Axios  
> **Mục đích tài liệu:** Giúp các thành viên nắm rõ kiến trúc Frontend và biết cách thêm page, component, service mới đúng chuẩn mà **không phá vỡ khung Frontend Core**.

---

## MỤC LỤC

1. [Cấu trúc thư mục](#1-cấu-trúc-thư-mục)
2. [Cách khởi chạy dự án](#2-cách-khởi-chạy-dự-án)
3. [Kiến trúc tổng quan](#3-kiến-trúc-tổng-quan)
4. [Design System — Tailwind & CSS Variables](#4-design-system)
5. [Routing — Thêm Route và Page mới](#5-routing)
6. [Auth — Sử dụng useAuth](#6-auth)
7. [Gọi API — axiosClient & Services](#7-gọi-api)
8. [Layouts — MainLayout vs AdminLayout](#8-layouts)
9. [Common Components](#9-common-components)
10. [Quy tắc đặt tên file](#10-quy-tắc-đặt-tên-file)
11. [Quy định về file CORE & Phân quyền chỉnh sửa](#11-quy-định-core)
12. [Workflow phát triển một Feature](#12-workflow)
13. [Biến môi trường & Backend Port](#13-biến-môi-trường)
14. [Checklist trước khi tạo Pull Request](#14-checklist-pr)

---

## 1. Cấu trúc thư mục

```
frontend/
├── src/
│   ├── api/
│   │   └── axiosClient.ts        # CORE: Axios instance & Interceptors — KHÔNG để service tại đây
│   │
│   ├── services/                 # CHỨC NĂNG: Các file service gọi API (<feature>.service.ts)
│   │   ├── destination.service.ts
│   │   ├── trip.service.ts
│   │   └── ...
│   │
│   ├── components/
│   │   ├── common/               # Button, Input, Modal, Loading — dùng trong cả 2 khu vực
│   │   ├── client/               # Header, Footer — cho Client website
│   │   └── admin/                # AdminSidebar, AdminHeader — cho Admin Dashboard
│   │
│   ├── constants/
│   │   └── index.ts              # ROUTES, USER_ROLES, STORAGE_KEYS, PAGINATION
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx       # Auth state + login/logout/refresh
│   │
│   ├── hooks/
│   │   └── useAuth.ts            # Hook truy cập AuthContext
│   │
│   ├── layouts/
│   │   ├── MainLayout.tsx        # Layout cho Client: Header + Outlet + Footer
│   │   └── AdminLayout.tsx       # Layout cho Admin: Sidebar + Header + Outlet
│   │
│   ├── pages/
│   │   ├── client/               # Trang phía người dùng (HomePage, LoginPage...)
│   │   └── admin/                # Trang phía admin (DashboardPage, UsersPage...)
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx         # Bộ định tuyến tập trung — THÊM ROUTE TẠI ĐÂY
│   │   ├── ProtectedRoute.tsx    # Guard: phải đăng nhập
│   │   └── AdminRoute.tsx        # Guard: phải là ADMIN
│   │
│   ├── types/
│   │   └── auth.types.ts         # User, LoginRequest, AuthContextType...
│   │
│   ├── utils/
│   │   └── storage.utils.ts      # getToken(), setToken(), removeToken()
│   │
│   ├── vite-env.d.ts             # Type cho import.meta.env.VITE_*
│   ├── index.css                 # Tailwind directives + CSS variables
│   ├── App.tsx                   # Root: BrowserRouter > AuthProvider > AppRoutes
│   └── main.tsx                  # Entry point
│
├── docs/
│   └── frontend-development-guide.md  # Tài liệu này
│
├── index.html                    # HTML entry — có Google Font Inter
├── package.json
├── vite.config.ts                # alias @ → ./src
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── .env                          # Không commit — VITE_API_URL=http://localhost:3000/api/v1
└── .env.example                  # Template — commit file này
```

---

## 2. Cách khởi chạy dự án

```bash
# Từ thư mục gốc của dự án (travel-platform/)
cd frontend

# Lần đầu hoặc sau khi pull code mới
npm install

# Copy file env
copy .env.example .env
# Kiểm tra file .env đảm bảo VITE_API_URL=http://localhost:3000/api/v1 (trùng port Backend)

# Chạy dev server
npm run dev
# → http://localhost:5173

# Kiểm tra TypeScript
npm run type-check

# Build production
npm run build
```

---

## 3. Kiến trúc tổng quan

```
Browser
  └── main.tsx
        └── <StrictMode>
              └── <App>                   ← BrowserRouter
                    └── <AuthProvider>    ← Quản lý auth state
                          └── <AppRoutes> ← Định tuyến tập trung
                                ├── MainLayout (Client)
                                │     ├── Header (sticky)
                                │     ├── <Outlet /> ← PAGE được render ở đây
                                │     └── Footer
                                │
                                └── AdminLayout (Admin)
                                      ├── AdminSidebar (left)
                                      ├── AdminHeader (top)
                                      └── <Outlet /> ← ADMIN PAGE được render ở đây
```

**Luồng gọi API:**
```
Component / Page
  → src/services/<feature>.service.ts
    → src/api/axiosClient.ts
      → Tự động đính kèm Authorization: Bearer <accessToken>
      → Gửi request tới Backend (http://localhost:3000/api/v1)
      → Bắt 401 → Tự động refresh token (HttpOnly Cookie) → Retry request gốc
      → Refresh thất bại → Dispatch 'auth:logout' → AuthContext dọn dẹp state
```

---

## 4. Design System

### Tailwind Design Tokens

Tất cả màu sắc, font, spacing đã được cấu hình sẵn trong `tailwind.config.js`.
**KHÔNG hard-code màu hex/rgb trực tiếp vào component.**

```tsx
// ✅ Đúng
<div className="bg-primary-600 text-white rounded-lg p-4">

// ❌ Sai
<div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '16px' }}>
```

**Màu sắc chính:**
| Token | Dùng cho |
|---|---|
| `primary-600` | Màu chính (button, link, active) |
| `primary-50` - `primary-100` | Background nhẹ, hover state |
| `accent-500` | Màu nhấn phụ |
| `error` | Lỗi, xóa, cảnh báo nguy hiểm |
| `success` | Thành công, xác nhận |
| `warning` | Cảnh báo |
| `gray-700` - `gray-900` | Text chính |
| `gray-400` - `gray-500` | Text phụ, placeholder |

### CSS Variables

Được định nghĩa trong `src/index.css`. Dùng cho các giá trị không phải color:

```css
--header-height: 64px
--sidebar-width: 256px
--container-max-width: 1280px
```

### Common Utilities

```tsx
// Container (max-width 1280px, responsive padding)
<div className="container">

// Card
<div className="card p-6">

// Section padding
<section className="section">
  <div className="container">...</div>
</section>
```

---

## 5. Routing

### Thêm route Client mới

**Bước 1:** Tạo page component tại `src/pages/client/TenPage.tsx`  
**Bước 2:** Khai báo route tương ứng trong `src/routes/AppRoutes.tsx`

```tsx
// Nếu PUBLIC (ai cũng vào được):
<Route element={<MainLayout />}>
  <Route path="ten-route" element={<TenPage />} />
</Route>

// Nếu PROTECTED (phải đăng nhập):
<Route element={<ProtectedRoute />}>
  <Route element={<MainLayout />}>
    <Route path="ten-route" element={<TenPage />} />
  </Route>
</Route>
```

### Thêm route Admin mới

**Bước 1:** Tạo page tại `src/pages/admin/TenAdminPage.tsx`  
**Bước 2:** Thêm route trong `AppRoutes.tsx` bên trong `<Route element={<AdminRoute />}>`  
**Bước 3:** Thêm menu item vào `src/components/admin/AdminSidebar.tsx`  
**Bước 4:** Thêm page title vào `src/components/admin/AdminHeader.tsx` (PAGE_TITLES)

### Sử dụng ROUTES constant

```tsx
import { ROUTES } from '@/constants';

// ✅ Đúng — type-safe, không typo
<Link to={ROUTES.DESTINATIONS}>Địa điểm</Link>
navigate(ROUTES.ADMIN_DASHBOARD);

// Route có param
<Link to={ROUTES.DESTINATION_DETAIL(id)}>Chi tiết</Link>
<Link to={ROUTES.TRIP_DETAIL(tripId)}>Chuyến đi</Link>

// ❌ Sai
<Link to="/destinations">Địa điểm</Link>
```

---

## 6. Auth

### Cách dùng useAuth

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  // Hiển thị có điều kiện dựa trên auth
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <p>Chưa đăng nhập</p>;

  return <p>Xin chào, {user.fullName}!</p>;
}
```

### AuthContextType

| Property | Type | Mô tả |
|---|---|---|
| `user` | `User \| null` | Thông tin user hiện tại |
| `accessToken` | `string \| null` | Token hiện tại |
| `isAuthenticated` | `boolean` | Có đăng nhập không |
| `isLoading` | `boolean` | Đang check session lần đầu |
| `login(data)` | `Promise<void>` | Đăng nhập |
| `logout()` | `Promise<void>` | Đăng xuất |
| `refresh()` | `Promise<string \| null>` | Làm mới token |

---

## 7. Gọi API — axiosClient & Services

### Nguyên tắc bắt buộc:
1. **`src/api/axiosClient.ts`**: Chỉ chứa cấu hình Axios instance, interceptor token, interceptor 401 refresh. **KHÔNG** viết các hàm gọi API nghiệp vụ vào thư mục `src/api/`.
2. **`src/services/<feature>.service.ts`**: Toàn bộ hàm gọi API nghiệp vụ của từng chức năng phải nằm trong thư mục `src/services/`.

```
src/
├── api/
│   └── axiosClient.ts             # CORE Axios instance duy nhất
└── services/
    ├── destination.service.ts     # Service nghiệp vụ điểm đến
    ├── trip.service.ts            # Service nghiệp vụ chuyến đi
    ├── review.service.ts          # Service nghiệp vụ đánh giá
    └── ...
```

### Ví dụ tạo Service file (`src/services/destination.service.ts`):

```tsx
// src/services/destination.service.ts
import axiosClient from '@/api/axiosClient';

export interface Destination {
  id: number;
  name: string;
  address: string;
  ticketPrice: number;
  rating: number;
}

export const destinationService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    axiosClient.get<{ data: { items: Destination[]; total: number } }>('/destinations', { params }),

  getById: (id: number) =>
    axiosClient.get<{ data: Destination }>(`/destinations/${id}`),

  create: (data: Partial<Destination>) =>
    axiosClient.post<{ data: Destination }>('/destinations', data),
};
```

### Sử dụng Service trong Component/Page:

```tsx
import { useEffect, useState } from 'react';
import { destinationService, type Destination } from '@/services/destination.service';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    destinationService.getAll()
      .then(res => setDestinations(res.data.data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // render UI...
}
```

---

## 8. Layouts

### MainLayout — Client Website

```
Header (sticky, h-16)
  └── Logo + Nav + Auth buttons
main (flex-1)
  └── <Outlet /> ← Page content
Footer
```

**Không cần gọi MainLayout trong page component.** Route đã bọc sẵn trong `AppRoutes.tsx`.

### AdminLayout — Admin Dashboard

```
flex h-screen
  ├── AdminSidebar (w-64 hoặc w-16 khi collapsed)
  └── flex-col flex-1
        ├── AdminHeader (h-16, sticky)
        └── main (overflow-y-auto, p-6)
              └── <Outlet /> ← Admin page content
```

---

## 9. Common Components

### Button

```tsx
import Button from '@/components/common/Button';

<Button variant="primary" size="md">Lưu</Button>
<Button variant="secondary">Hủy</Button>
<Button variant="danger" isLoading={isDeleting}>Xóa</Button>
<Button variant="ghost" leftIcon={<PlusIcon />}>Thêm mới</Button>
```

| Prop | Type | Default |
|---|---|---|
| `variant` | `primary \| secondary \| danger \| ghost` | `primary` |
| `size` | `sm \| md \| lg` | `md` |
| `isLoading` | `boolean` | `false` |
| `leftIcon` | `ReactNode` | - |
| `rightIcon` | `ReactNode` | - |

### Input

```tsx
import Input from '@/components/common/Input';

<Input
  label="Email"
  type="email"
  placeholder="example@email.com"
  error={errors.email?.message}
  required
/>
```

### Modal

```tsx
import Modal from '@/components/common/Modal';
import { useState } from 'react';

const [open, setOpen] = useState(false);

<Modal isOpen={open} onClose={() => setOpen(false)} title="Xác nhận" size="sm">
  <p>Bạn có chắc không?</p>
  <div className="flex justify-end gap-2 mt-4">
    <Button variant="secondary" onClick={() => setOpen(false)}>Hủy</Button>
    <Button variant="danger">Xóa</Button>
  </div>
</Modal>
```

### Loading

```tsx
import Loading from '@/components/common/Loading';

// Toàn màn hình
<Loading fullPage message="Đang tải..." />

// Inline (trong button, card)
<Loading size="sm" />
```

---

## 10. Quy tắc đặt tên file

| Loại | Quy tắc | Vị trí thư mục | Ví dụ |
|---|---|---|---|
| Component | `PascalCase.tsx` | `src/components/**/` | `Button.tsx`, `TripCard.tsx` |
| Page | `PascalCase.tsx` (hậu tố `Page`) | `src/pages/client/` hoặc `admin/` | `HomePage.tsx`, `DashboardPage.tsx` |
| Hook | `camelCase.ts` (tiền tố `use`) | `src/hooks/` | `useAuth.ts`, `useTrip.ts` |
| Service | `camelCase.service.ts` | `src/services/` | `destination.service.ts`, `trip.service.ts` |
| Utils | `camelCase.utils.ts` | `src/utils/` | `storage.utils.ts` |
| Types | `camelCase.types.ts` | `src/types/` | `auth.types.ts`, `trip.types.ts` |
| Context | `PascalCase.tsx` (hậu tố `Context`) | `src/contexts/` | `AuthContext.tsx` |

**Tên biến và function:**
- `camelCase` cho biến, state, hàm
- `UPPER_SNAKE_CASE` cho constants

---

## 11. Quy định về file CORE & Phân quyền chỉnh sửa

Để đảm bảo dự án ổn định khi phát triển song song, quy định quyền chỉnh sửa như sau:

### Được phép chỉnh sửa khi làm Feature:
- **`src/routes/AppRoutes.tsx`**: Thành viên **ĐƯỢC PHÉP** thêm các thẻ `<Route path="..." element={<MyPage />} />` cho chức năng của mình.
- **`src/constants/index.ts`**: Được phép thêm hằng số đường dẫn mới vào object `ROUTES`.
- **`src/components/admin/AdminSidebar.tsx` & `AdminHeader.tsx`**: Được phép thêm menu item / page title cho chức năng Admin được giao.

### TUYỆT ĐỐI KHÔNG tái cấu trúc khung Core:
- **KHÔNG** tự ý thay đổi cấu trúc bọc layout trong `AppRoutes.tsx` (cấu trúc `MainLayout`, `AdminLayout`, `ProtectedRoute`, `AdminRoute`).
- **KHÔNG** sửa đổi `src/api/axiosClient.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts`, `src/App.tsx`, `src/main.tsx` trừ khi có sự đồng ý của nhóm trưởng hoặc PR chuyên biệt.

---

## 12. Workflow phát triển một Feature

```
1. Tạo nhánh mới từ main (theo pattern: tv<id>/<type>/<feature-name>)
   → git checkout -b tv3/feat/trip-management

2. Tạo Service file trong src/services/
   → src/services/trip.service.ts

3. Tạo Type file trong src/types/ (nếu cần)
   → src/types/trip.types.ts

4. Tạo components con của feature (nếu có)
   → src/components/trip/TripCard.tsx
   → src/components/trip/TripForm.tsx

5. Triển khai giao diện trang vào placeholder đã có sẵn:
   → src/pages/client/TripsPage.tsx

6. Khai báo route trong AppRoutes.tsx (nếu là route mới chưa có placeholder)

7. Kiểm tra trước khi commit:
   → npm run type-check  (bắt buộc 0 lỗi)
   → Test giao diện và luồng API trên trình duyệt

8. Tạo Pull Request theo template quy định
```

---

## 13. Biến môi trường & Backend Port

Hệ thống Backend mặc định chạy trên cổng **`3000`**, tiền tố API là **`/api/v1`**.

```bash
# File frontend/.env (local dev)
VITE_API_URL=http://localhost:3000/api/v1

# File frontend/.env.example (template)
VITE_API_URL=http://localhost:3000/api/v1
```

> **Lưu ý:**
> - Nếu Backend đổi port (ví dụ trong `backend/.env` đặt `PORT=3000`), giá trị `VITE_API_URL` phải tương ứng là `http://localhost:3000/api/v1`.
> - Luôn truy cập biến môi trường thông qua `import.meta.env.VITE_API_URL`.

---

## 14. Checklist trước khi tạo Pull Request

```
[ ] npm run type-check  → 0 errors
[ ] File service nghiệp vụ đặt tại src/services/*.service.ts (không để lẫn trong src/api/)
[ ] Không import axios trực tiếp, chỉ dùng axiosClient
[ ] Không hard-code màu hex/rgb (dùng Tailwind token)
[ ] Không hard-code URL path (dùng ROUTES.<key>)
[ ] Không hard-code localStorage key (dùng STORAGE_KEYS.<key>)
[ ] Giữ nguyên cấu trúc khung Core trong AppRoutes.tsx
[ ] UI responsive trên mobile (≥375px) và desktop (≥1280px)
[ ] Test đăng nhập / đăng xuất / tự động refresh token
[ ] Kiểm tra route bảo vệ: truy cập trang cá nhân khi chưa đăng nhập → redirect /login
```
