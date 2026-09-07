import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import Loading from './Loading';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
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
    'bg-primary-600 text-white shadow-sm shadow-primary-900/15 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus:ring-primary-400 border-transparent',
  secondary:
    'bg-white text-gray-700 border-gray-200 shadow-sm hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 active:translate-y-0 active:scale-[0.98] focus:ring-primary-400',
  accent:
    'bg-accent-500 text-white shadow-sm shadow-accent-900/15 hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus:ring-accent-300 border-transparent',
  outline:
    'bg-transparent text-primary-700 border-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-400',
  danger:
    'bg-error text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0 active:scale-[0.98] focus:ring-red-400 border-transparent',
  ghost:
    'bg-transparent text-gray-600 hover:bg-primary-50 hover:text-primary-800 active:scale-[0.98] focus:ring-primary-300 border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5 font-semibold',
};

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
          font-bold rounded-xl border
          transition-all duration-200 ease-travel
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
          ${fullWidth ? 'w-full' : ''}
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
