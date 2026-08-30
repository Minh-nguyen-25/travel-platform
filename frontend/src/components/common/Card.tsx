import type { HTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'default' | 'elevated' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardElement = 'div' | 'section' | 'article';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Thẻ HTML ngữ nghĩa cần render */
  as?: CardElement;
  /** Kiểu surface giao diện */
  variant?: CardVariant;
  /** Khoảng cách padding bên trong */
  padding?: CardPadding;
  /** Nội dung */
  children: ReactNode;
  /** Class bổ sung */
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default:  'bg-white border border-stone-200/80 shadow-card',
  elevated: 'bg-white border border-stone-200/80 shadow-elevated',
  glass:    'bg-white/80 border border-white/60 shadow-glass backdrop-blur-md',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

/**
 * Card — Non-interactive container dùng chung cho TravelGo.
 *
 * Để tạo card có thể tương tác (clickable), bọc component hoặc nội dung
 * bên trong bằng thẻ `<Link to="...">` hoặc `<button className="...">` ngữ nghĩa.
 *
 * ```tsx
 * // Card thông tin tĩnh
 * <Card variant="default" padding="md">
 *   <h3>Tiêu đề</h3>
 *   <p>Nội dung</p>
 * </Card>
 *
 * // Card tương tác (bọc bằng Link)
 * <Link to={`/destinations/${id}`} className="block group ds-interactive rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
 *   <Card variant="default" padding="sm">
 *     <img ... />
 *     <h3 className="group-hover:text-primary-700">Tên địa điểm</h3>
 *   </Card>
 * </Link>
 * ```
 */
export default function Card({
  as: Component = 'div',
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <Component
      className={`
        rounded-2xl
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}
