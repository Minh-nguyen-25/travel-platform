import type { ReactNode } from 'react';

export type BadgeVariant =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'glass';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Kiểu giao diện */
  variant?: BadgeVariant;
  /** Kích thước badge */
  size?: BadgeSize;
  /** Hiển thị chấm tròn nhỏ trước nội dung */
  dot?: boolean;
  /** Icon đặt trước nội dung */
  icon?: ReactNode;
  /** Nội dung */
  children: ReactNode;
  /** Class tùy biến */
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-50 text-primary-800 border-primary-200/80',
  accent:  'bg-accent-50 text-accent-800 border-accent-200/80',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  error:   'bg-error-50 text-error-700 border-error-200',
  info:    'bg-info-50 text-info-700 border-info-200',
  neutral: 'bg-stone-100 text-stone-700 border-line',
  glass:   'bg-stone-900/65 text-white border-white/20 backdrop-blur-md',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary-600',
  accent:  'bg-accent-600',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  error:   'bg-error-600',
  info:    'bg-info-600',
  neutral: 'bg-stone-500',
  glass:   'bg-teal-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

/**
 * Badge / Pill component dùng chung cho TravelGo.
 *
 * ```tsx
 * <Badge variant="primary">Thiên nhiên</Badge>
 * <Badge variant="success" dot>Hoạt động</Badge>
 * <Badge variant="glass">⭐ 4.9 (3.5k)</Badge>
 * ```
 */
export default function Badge({
  variant = 'primary',
  size = 'md',
  dot = false,
  icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
