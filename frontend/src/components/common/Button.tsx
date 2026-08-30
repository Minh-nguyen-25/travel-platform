import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import Loading from './Loading';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Kiểu giao diện của button */
  variant?: ButtonVariant;
  /** Kích thước button */
  size?: ButtonSize;
  /** Trạng thái loading */
  isLoading?: boolean;
  /** Chiếm toàn bộ chiều rộng container */
  fullWidth?: boolean;
  /** Icon đặt bên trái text */
  leftIcon?: React.ReactNode;
  /** Icon đặt bên phải text */
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 focus-visible:ring-primary-600/30 border-transparent shadow-sm',
  accent:
    'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 focus-visible:ring-accent-500/30 border-transparent shadow-sm',
  secondary:
    'bg-white text-stone-700 border-line hover:bg-stone-50 active:bg-stone-100 focus-visible:ring-primary-600/20 shadow-sm',
  outline:
    'bg-transparent text-primary-700 border-primary-600 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-600/20',
  danger:
    'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500/30 border-transparent shadow-sm',
  ghost:
    'bg-transparent text-stone-600 hover:bg-stone-100 active:bg-stone-200 focus-visible:ring-stone-400 border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl font-semibold',
};

/**
 * Button dùng chung cho TravelGo.
 *
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Lưu thay đổi
 * </Button>
 *
 * <Button variant="accent" leftIcon={<SparklesIcon />}>
 *   AI Tạo lịch trình
 * </Button>
 *
 * <Button variant="danger" isLoading={isDeleting}>
 *   Xóa
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          font-medium border
          transition-[background-color,border-color,color,box-shadow,transform] duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none
          active:scale-[0.98]
          ${fullWidth ? 'w-full' : ''}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <Loading size="sm" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
