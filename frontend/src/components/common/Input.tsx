import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label hiển thị phía trên input */
  label?: string;
  /** Thông báo lỗi — nếu có sẽ border đỏ */
  error?: string;
  /** Ghi chú phụ bên dưới input */
  hint?: string;
  /** Icon hoặc element ở đầu input */
  leftAddon?: React.ReactNode;
  /** Icon hoặc element ở cuối input */
  rightAddon?: React.ReactNode;
}

/**
 * Input field dùng chung.
 *
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="example@email.com"
 *   error={errors.email?.message}
 * />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, id, className = '', ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="ml-0.5 text-error">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center text-gray-400 pointer-events-none">
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-10 px-3 py-2 text-sm text-gray-900
              bg-white border rounded-lg
              placeholder:text-gray-400
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${leftAddon ? 'pl-10' : ''}
              ${rightAddon ? 'pr-10' : ''}
              ${hasError
                ? 'border-error focus:border-error focus:ring-red-400/30'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/30'
              }
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {rightAddon && (
            <div className="absolute right-3 flex items-center text-gray-400">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-error flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
