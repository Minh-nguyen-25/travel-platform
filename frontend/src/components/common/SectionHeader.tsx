import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  /** Nhãn phân loại nhỏ phía trên tiêu đề (tùy chọn, chữ tự nhiên, tracking nhẹ) */
  eyebrow?: string;
  /** Tiêu đề chính */
  title: string;
  /** Phụ đề mô tả (tùy chọn) */
  subtitle?: string;
  /** Nút hoặc link hành động góc phải (tùy chọn, áp dụng khi align="left") */
  action?: ReactNode;
  /** Căn lề: 'left' (mặc định) hoặc 'center' */
  align?: 'left' | 'center';
  /** Class tùy biến */
  className?: string;
}

/**
 * SectionHeader — Tiêu đề phân đoạn dùng chung cho các trang Client.
 *
 * ```tsx
 * <SectionHeader
 *   eyebrow="Khám phá Việt Nam"
 *   title="Điểm đến thịnh hành"
 *   subtitle="Những địa danh được cộng đồng du lịch yêu thích nhất trong tháng."
 *   action={<Link to="/destinations">Xem tất cả →</Link>}
 * />
 * ```
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={`
        ${isCenter ? 'text-center' : 'flex flex-col md:flex-row md:items-end justify-between gap-4'}
        mb-8 md:mb-10
        ${className}
      `}
    >
      <div className={isCenter ? 'max-w-2xl mx-auto' : 'max-w-xl'}>
        {eyebrow && (
          <p className="text-xs font-semibold text-primary-700 tracking-normal mb-1.5">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-normal leading-snug">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm md:text-base text-stone-600 mt-2 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {!isCenter && action && (
        <div className="flex-shrink-0 pt-2 md:pt-0">
          {action}
        </div>
      )}
    </div>
  );
}
