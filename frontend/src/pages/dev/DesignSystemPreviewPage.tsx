import { useState } from 'react';
import { Link } from 'react-router-dom';
import TravelGoLogo from '@/components/common/TravelGoLogo';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import SectionHeader from '@/components/common/SectionHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';

export default function DesignSystemPreviewPage() {
  const [inputValue, setInputValue] = useState('');
  const [hasInputError, setHasInputError] = useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-24">
      {/* Dev Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-line px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TravelGoLogo variant="dark" />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200 text-xs font-semibold">
              Design System Preview (DEV)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-stone-600 hover:text-primary-700 transition-colors"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">
        {/* Intro */}
        <div>
          <SectionHeader
            eyebrow="Nền tảng giao diện TravelGo"
            title="Hệ thống Design System — Cinematic AI Travel"
            subtitle="Tập hợp toàn bộ tokens, typographic scale, trạng thái màu sắc, và components dùng chung chuẩn hóa."
          />
        </div>

        {/* 1. Brand Logo & Variants */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-line pb-3">
            1. Brand Logo (`TravelGoLogo`)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-line flex flex-col gap-3 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-normal">
                Variant: Dark (Trên nền sáng / Form panels)
              </span>
              <div className="p-4 bg-stone-50 rounded-xl flex items-center">
                <TravelGoLogo variant="dark" />
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col gap-3 shadow-sm">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-normal">
                Variant: Light (Trên nền tối / Cinematic Hero)
              </span>
              <div className="p-4 bg-stone-800/80 rounded-xl flex items-center">
                <TravelGoLogo variant="light" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Color Tokens */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-line pb-3">
            2. Color Palette & Semantic Tokens
          </h2>

          {/* Primary Teal */}
          <div>
            <h3 className="text-sm font-bold text-stone-700 mb-3">Primary Teal (Thương hiệu chính)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
              {[
                { label: '50', bg: 'bg-primary-50', text: 'text-stone-900' },
                { label: '100', bg: 'bg-primary-100', text: 'text-stone-900' },
                { label: '200', bg: 'bg-primary-200', text: 'text-stone-900' },
                { label: '300', bg: 'bg-primary-300', text: 'text-stone-900' },
                { label: '400', bg: 'bg-primary-400', text: 'text-stone-900' },
                { label: '500', bg: 'bg-primary-500', text: 'text-white' },
                { label: '600', bg: 'bg-primary-600', text: 'text-white' },
                { label: '700 (Main)', bg: 'bg-primary-700', text: 'text-white' },
                { label: '800 (Hover)', bg: 'bg-primary-800', text: 'text-white' },
                { label: '900', bg: 'bg-primary-900', text: 'text-white' },
              ].map((swatch) => (
                <div key={swatch.label} className={`${swatch.bg} ${swatch.text} p-3 rounded-xl text-center text-xs font-semibold shadow-sm`}>
                  {swatch.label}
                </div>
              ))}
            </div>
          </div>

          {/* Accent Amber */}
          <div>
            <h3 className="text-sm font-bold text-stone-700 mb-3">Accent Amber (Điểm nhấn AI & Hoàng hôn)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
              {[
                { label: '50', bg: 'bg-accent-50', text: 'text-stone-900' },
                { label: '100', bg: 'bg-accent-100', text: 'text-stone-900' },
                { label: '200', bg: 'bg-accent-200', text: 'text-stone-900' },
                { label: '300', bg: 'bg-accent-300', text: 'text-stone-900' },
                { label: '400', bg: 'bg-accent-400', text: 'text-stone-900' },
                { label: '500', bg: 'bg-accent-500', text: 'text-white' },
                { label: '600 (Main)', bg: 'bg-accent-600', text: 'text-white' },
                { label: '700', bg: 'bg-accent-700', text: 'text-white' },
                { label: '800', bg: 'bg-accent-800', text: 'text-white' },
                { label: '900', bg: 'bg-accent-900', text: 'text-white' },
              ].map((swatch) => (
                <div key={swatch.label} className={`${swatch.bg} ${swatch.text} p-3 rounded-xl text-center text-xs font-semibold shadow-sm`}>
                  {swatch.label}
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Feedback */}
          <div>
            <h3 className="text-sm font-bold text-stone-700 mb-3">Feedback States (Success / Warning / Error / Info)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-success-700">
                <span className="font-bold text-sm block">Success State</span>
                <span className="text-xs">Xác nhận thành công, bảo mật đã duyệt.</span>
              </div>
              <div className="p-4 rounded-xl bg-warning-50 border border-warning-200 text-warning-700">
                <span className="font-bold text-sm block">Warning State</span>
                <span className="text-xs">Cảnh báo tài khoản hoặc thông báo chú ý.</span>
              </div>
              <div className="p-4 rounded-xl bg-error-50 border border-error-200 text-error-700">
                <span className="font-bold text-sm block">Error State</span>
                <span className="text-xs">Lỗi xác thực, vi phạm trường dữ liệu.</span>
              </div>
              <div className="p-4 rounded-xl bg-info-50 border border-info-200 text-info-700">
                <span className="font-bold text-sm block">Info State</span>
                <span className="text-xs">Thông tin gợi ý và hướng dẫn lịch trình.</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Typography Scale */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-line pb-3">
            3. Typography Scale (Tiếng Việt)
          </h2>
          <div className="bg-white p-6 rounded-2xl border border-line space-y-6">
            <div>
              <span className="text-xs text-stone-400 font-mono block">Display / Hero — text-4xl md:text-5xl font-bold</span>
              <p className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mt-1">
                Hành Trình Khám Phá Việt Nam Cùng AI
              </p>
            </div>
            <div>
              <span className="text-xs text-stone-400 font-mono block">Page Title (H1) — text-2xl md:text-3xl font-bold</span>
              <p className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mt-1">
                Chào mừng bạn trở lại
              </p>
            </div>
            <div>
              <span className="text-xs text-stone-400 font-mono block">Section Title (H2) — text-xl md:text-2xl font-bold</span>
              <p className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight mt-1">
                Điểm đến nổi bật trong tuần
              </p>
            </div>
            <div>
              <span className="text-xs text-stone-400 font-mono block">Card Title (H3) — text-base font-semibold</span>
              <p className="text-base font-semibold text-stone-900 mt-1">
                Phố Cổ Hội An — Di sản văn hóa lung linh ánh hoa đăng
              </p>
            </div>
            <div>
              <span className="text-xs text-stone-400 font-mono block">Body Regular — text-sm text-stone-600 leading-relaxed</span>
              <p className="text-sm text-stone-600 leading-relaxed mt-1">
                Khám phá và tận hưởng từng khoảnh khắc du lịch độc đáo trên dải đất hình chữ S. Hệ thống AI hỗ trợ cá nhân hóa từng chặng đường theo sở thích và ngân sách của bạn.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Buttons */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-line pb-3">
            4. Buttons (`Button.tsx`)
          </h2>

          <div className="bg-white p-6 rounded-2xl border border-line space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Teal</Button>
              <Button variant="accent">Accent Amber (AI)</Button>
              <Button variant="secondary">Secondary White</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-line">
              <Button variant="primary" size="sm">Small (h-8)</Button>
              <Button variant="primary" size="md">Medium (h-10)</Button>
              <Button variant="primary" size="lg">Large (h-12)</Button>
              <Button
                variant="accent"
                size="md"
                isLoading={isBtnLoading}
                onClick={() => {
                  setIsBtnLoading(true);
                  setTimeout(() => setIsBtnLoading(false), 1500);
                }}
              >
                {isBtnLoading ? 'Đang xử lý...' : 'Click Test Loading'}
              </Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </div>
        </section>

        {/* 5. Inputs */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-line pb-3">
            5. Inputs (`Input.tsx`)
          </h2>

          <div className="bg-white p-6 rounded-2xl border border-line grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              hint="Nhập đầy đủ tên theo giấy tờ"
            />
            <Input
              label="Địa chỉ Email"
              type="email"
              placeholder="ten@example.vn"
              required
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              error={hasInputError ? 'Vui lòng nhập định dạng email hợp lệ' : undefined}
            />
            <Input
              label="Mã giảm giá"
              placeholder="TRAVELGO2026"
              disabled
              hint="Trường đã bị vô hiệu hóa"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHasInputError(!hasInputError)}
            >
              Toggle Input Error State
            </Button>
          </div>
        </section>

        {/* 6. Badges */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-line pb-3">
            6. Badges (`Badge.tsx`)
          </h2>

          <div className="bg-white p-6 rounded-2xl border border-line flex flex-wrap items-center gap-3">
            <Badge variant="primary">Primary Teal</Badge>
            <Badge variant="accent">Accent AI</Badge>
            <Badge variant="success" dot>Hoạt động</Badge>
            <Badge variant="warning" dot>Tạm dừng</Badge>
            <Badge variant="error" dot>Đã hủy</Badge>
            <Badge variant="info">Thông tin</Badge>
            <Badge variant="neutral">Văn hóa</Badge>
            <div className="p-2 bg-stone-900 rounded-xl">
              <Badge variant="glass">⭐ 4.9 (3.5k)</Badge>
            </div>
          </div>
        </section>

        {/* 7. Surface Cards & Clickable Pattern */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-line pb-3">
            7. Cards (`Card.tsx`) & Clickable Semantic Patterns
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" padding="md">
              <h3 className="font-bold text-stone-900 mb-2">Default Card Surface</h3>
              <p className="text-sm text-stone-600">Container tĩnh chuẩn cho nội dung và dữ liệu trang web.</p>
            </Card>

            <Card variant="elevated" padding="md">
              <h3 className="font-bold text-stone-900 mb-2">Elevated Card Surface</h3>
              <p className="text-sm text-stone-600">Bóng đổ nổi bật cho thẻ cần tạo trọng tâm thị giác.</p>
            </Card>

            {/* Clickable Destination Card Sample (Wrapped in semantic Link) */}
            <Link
              to="/destinations"
              className="block group ds-interactive rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <Card variant="default" padding="none" className="overflow-hidden h-full flex flex-col">
                <div className="relative h-36 bg-stone-800 flex items-center justify-center text-white overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent z-10" />
                  <span className="text-xs text-stone-300 z-20">Ảnh minh họa điểm đến</span>
                  <div className="absolute top-3 right-3 z-20">
                    <Badge variant="glass">⭐ 4.9</Badge>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 group-hover:text-primary-700 transition-colors">
                      Vịnh Hạ Long, Quảng Ninh
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">3 Ngày 2 Đêm • Thiên nhiên kỳ vĩ</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                    <span className="text-stone-500">Từ</span>
                    <span className="font-bold text-sm text-primary-700">1.850.000 đ</span>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* 8. Empty State & Loading */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-line pb-3">
            8. Empty States & Loading Spinners
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              title="Chưa có chuyến đi nào"
              description="Bắt đầu tạo kế hoạch du lịch cá nhân hóa với sự hỗ trợ của TravelGo AI."
              action={<Button variant="accent">Lập lịch trình ngay</Button>}
            />

            <div className="p-8 bg-white rounded-2xl border border-line flex flex-col items-center justify-center gap-6">
              <div className="flex items-center gap-6">
                <Loading size="sm" />
                <Loading size="md" />
                <Loading size="lg" />
              </div>
              <p className="text-xs font-medium text-stone-500">Spinner thương hiệu Teal tiêu chuẩn</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
