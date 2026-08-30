import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import Loading from './Loading';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Icon đặt bên trái text */
  leftIcon?: React.ReactNode;
  /** Icon đặt bên phải text */
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white shadow-sm shadow-primary-900/15 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus:ring-primary-400 border-transparent',
  secondary:
    'bg-white text-gray-700 border-gray-200 shadow-sm hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 active:translate-y-0 active:scale-[0.98] focus:ring-primary-400',
  accent:
    'bg-accent-500 text-white shadow-sm shadow-accent-900/15 hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus:ring-accent-300 border-transparent',
  danger:
    'bg-error text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0 active:scale-[0.98] focus:ring-red-400 border-transparent',
  ghost:
    'bg-transparent text-gray-600 hover:bg-primary-50 hover:text-primary-800 active:scale-[0.98] focus:ring-primary-300 border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

/**
 * Button dùng chung.
 *
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Lưu thay đổi
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
          font-bold rounded-xl border
          transition-all duration-200 ease-travel
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <Loading size="sm" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
