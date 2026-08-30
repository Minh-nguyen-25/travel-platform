import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** Icon hoặc minh họa */
  icon?: ReactNode;
  /** Tiêu đề thông báo trạng thái rỗng */
  title: string;
  /** Mô tả chi tiết */
  description?: string;
  /** Nút hành động kêu gọi (CTA) */
  action?: ReactNode;
  /** Class tùy biến */
  className?: string;
}

/**
 * EmptyState — Hiển thị khi danh sách hoặc kết quả tìm kiếm rỗng.
 *
 * ```tsx
 * <EmptyState
 *   title="Không tìm thấy địa điểm phù hợp"
 *   description="Hãy thử thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn."
 *   action={<Button variant="outline" onClick={handleReset}>Đặt lại bộ lọc</Button>}
 * />
 * ```
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        p-8 md:p-12 bg-white rounded-2xl border border-line
        shadow-sm ${className}
      `}
    >
      <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mb-4">
        {icon ?? (
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m4.93 4.93 14.14 14.14" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-bold text-stone-900 mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-stone-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div className="flex items-center justify-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
}
