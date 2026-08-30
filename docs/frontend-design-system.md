# TravelGo Frontend Design System — "Cinematic AI Travel"

Tài liệu hướng dẫn sử dụng Design System thống nhất dành cho các thành viên phát triển giao diện TravelGo.

---

## 1. Triết lý Thiết kế: "Cinematic AI Travel"

1. **Bản sắc thương hiệu**:
   - **Primary**: Deep Teal (`#0f766e` / `primary-700` đến `primary-800`). Đại diện cho sự tin cậy, vững chắc và chiều sâu cảnh quan Việt Nam.
   - **Accent**: Warm Amber (`#d97706` / `accent-600` đến `accent-700`). Đại diện cho ánh hoàng hôn ấm áp và điểm nhấn AI/CTA nổi bật.
   - **Neutrals**: Stone (`stone-50` đến `stone-900`). Thay thế cho tone xám lạnh, mang lại cảm giác cao cấp, ấm áp và tự nhiên.
2. **Typography**: Google Fonts `Inter` hỗ trợ trọn vẹn ký tự tiếng Việt với các cấp độ từ Display đến Body/Label.
3. **Motion có kiểm soát**: Chuyển động nhẹ nhàng (150ms–250ms), tập trung vào `transform`, `box-shadow`, `border-color`, `background-color`. Không dùng `transition-all` bừa bãi.
4. **Trải nghiệm Client vs Admin**:
   - **Client**: Trực quan, giàu hình ảnh, thẻ bo góc `rounded-2xl`, hiệu ứng hover êm ái.
   - **Admin**: Dày đặc thông tin hơn, độ tương phản cao, thẻ bo góc chuẩn, giảm tải hiệu ứng trang trí.

---

## 2. Hệ thống Semantic Tokens

### 2.1. Màu sắc (Color Tokens)

| Nhóm | Token Utility | Mã màu Hex | Mục đích sử dụng |
|---|---|---|---|
| **Primary (Teal)** | `bg-primary-700`, `text-primary-700` | `#0f766e` | Màu thương hiệu chủ đạo, nút chính, tiêu đề quan trọng |
| **Primary Hover** | `hover:bg-primary-800` | `#115e59` | Trạng thái hover của nút chính |
| **Primary Light** | `bg-primary-50`, `text-primary-800` | `#f0fdfa` | Nền badge, item active menu |
| **Accent (Amber)** | `bg-accent-600`, `text-accent-600` | `#d97706` | Nút AI Lập lịch, điểm nhấn xếp hạng sao, khuyến mãi |
| **Accent Hover** | `hover:bg-accent-700` | `#b45309` | Hover nút AI |
| **Accent Light** | `bg-accent-50`, `text-accent-800` | `#fffbeb` | Badge nổi bật, highlight |
| **Surface Page** | `bg-surface-page` (`bg-stone-50`) | `#fafaf9` | Nền toàn bộ website |
| **Surface Card** | `bg-surface-card` (`bg-white`) | `#ffffff` | Nền card, modal, dropdown |
| **Surface Muted** | `bg-surface-muted` (`bg-stone-100`) | `#f5f5f4` | Nền bảng, ô phụ trợ |
| **Border Line** | `border-line` (`border-stone-200`) | `#e7e5e4` | Đường viền mặc định |
| **Border Line Subtle** | `border-line-subtle` (`border-stone-100`) | `#f5f5f4` | Đường kẻ phân cách mờ |
| **Border Line Strong** | `border-line-strong` (`border-stone-300`) | `#d6d3d1` | Viền input hover, viền card đậm |
| **Content Primary** | `text-content-primary` (`text-stone-900`) | `#1c1917` | Tiêu đề chính, văn bản có độ tương phản cao |
| **Content Secondary**| `text-content-secondary` (`text-stone-600`)| `#57534e` | Mô tả, phụ đề, label form |
| **Content Muted** | `text-content-muted` (`text-stone-400`) | `#a8a29e` | Placeholder, thời gian phụ |

### 2.2. Trạng thái phản hồi (Feedback States)

| Trạng thái | Nền (`50`) | Viền (`200`) | Chữ / Nút (`600`/`700`) |
|---|---|---|---|
| **Success** | `bg-success-50` (`#ecfdf5`) | `border-success-200` (`#a7f3d0`) | `text-success-700` / `bg-success-600` |
| **Warning** | `bg-warning-50` (`#fffbeb`) | `border-warning-200` (`#fde68a`) | `text-warning-700` / `bg-warning-600` |
| **Error / Danger** | `bg-error-50` (`#fef2f2`) | `border-error-200` (`#fecaca`) | `text-error-700` / `bg-error-600` |
| **Info** | `bg-info-50` (`#f0f9ff`) | `border-info-200` (`#bae6fd`) | `text-info-700` / `bg-info-600` |

---

## 3. Danh mục Component Dùng Chung (`src/components/common/`)

### 3.1. `Button`
```tsx
import Button from '@/components/common/Button';

// Nút chính (Teal)
<Button variant="primary" size="md" onClick={handleSave}>Lưu thay đổi</Button>

// Nút AI / Kêu gọi hành động (Amber)
<Button variant="accent" size="lg" leftIcon={<SparklesIcon />}>Tạo lịch trình AI</Button>

// Nút phụ (White/Stone)
<Button variant="secondary" size="md">Hủy bỏ</Button>

// Nút viền (Outline)
<Button variant="outline" size="sm">Xem chi tiết</Button>

// Nút nguy hiểm (Danger)
<Button variant="danger" size="md" isLoading={isDeleting}>Xóa mục này</Button>
```

### 3.2. `Input`
```tsx
import Input from '@/components/common/Input';

<Input
  label="Địa chỉ Email"
  type="email"
  placeholder="ten@example.vn"
  required
  error={errors.email?.message}
  hint="Chúng tôi sẽ không chia sẻ email của bạn cho bên thứ ba."
/>
```

### 3.3. `Badge`
```tsx
import Badge from '@/components/common/Badge';

<Badge variant="primary">Thiên nhiên</Badge>
<Badge variant="accent">AI Đề xuất</Badge>
<Badge variant="success" dot>Đang hoạt động</Badge>
<Badge variant="glass">⭐ 4.9 (1.2k)</Badge>
```

### 3.4. `Card` (Non-Interactive Container)
```tsx
import Card from '@/components/common/Card';
import { Link } from 'react-router-dom';

// Card hiển thị thông tin tĩnh
<Card variant="default" padding="md">
  <h3 className="font-bold text-stone-900">Thông tin chuyến đi</h3>
  <p className="text-stone-600">Nội dung chi tiết...</p>
</Card>

// Card có thể click: Bọc bằng semantic Link hoặc button
<Link
  to="/destinations/ha-long"
  className="block group ds-interactive rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
>
  <Card variant="default" padding="none" className="overflow-hidden">
    <img src="..." alt="Hạ Long" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
    <div className="p-4">
      <h3 className="font-bold group-hover:text-primary-700">Vịnh Hạ Long</h3>
    </div>
  </Card>
</Link>
```

### 3.5. `SectionHeader`
```tsx
import SectionHeader from '@/components/common/SectionHeader';
import { Link } from 'react-router-dom';

<SectionHeader
  eyebrow="Khám phá Việt Nam"
  title="Điểm đến thịnh hành"
  subtitle="Những địa danh được cộng đồng yêu thích nhất trong mùa này."
  action={<Link to="/destinations" className="text-primary-700 font-semibold hover:underline">Xem tất cả →</Link>}
/>
```

### 3.6. `EmptyState`
```tsx
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';

<EmptyState
  title="Chưa có chuyến đi nào"
  description="Bạn chưa lưu hoặc tạo chuyến đi nào. Hãy bắt đầu lên kế hoạch ngay hôm nay!"
  action={<Button variant="accent">Khám phá ngay</Button>}
/>
```

---

## 4. Quy định & Hướng dẫn dành cho thành viên

1. **Tuyệt đối không dùng mã màu Hex rời rạc** trong JSX/TSX. Hãy sử dụng các class semantic (`primary-700`, `accent-600`, `stone-600`, `line`, `surface-card`, v.v.).
2. **Không tự ý cài đặt thêm thư viện UI khác** (Storybook, Ant Design, MUI, Chakra) khi chưa có sự thống nhất chung.
3. **Card luôn là semantic non-interactive container**. Khi cần card có thể bấm, hãy bọc bằng thẻ `<Link>` hoặc `<button>`.
4. **Không can thiệp vào các trang đã hoàn thiện của đồng đội** (Auth pages, Destination screens, AI Preferences).
