import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label hiển thị phía trên input */
  label?: string;
  /** Thông báo lỗi — nếu có sẽ hiển thị border đỏ và message */
  error?: string;
  /** Ghi chú phụ bên dưới input */
  hint?: string;
  /** Icon hoặc element ở đầu input */
  leftAddon?: React.ReactNode;
  /** Icon hoặc element ở cuối input */
  rightAddon?: React.ReactNode;
}

/**
 * Input field dùng chung cho TravelGo.
 *
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="ten@example.vn"
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
          <label htmlFor={inputId} className="text-[13px] font-semibold text-stone-700">
            {label}
            {props.required && <span className="ml-1 text-error-600" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3.5 flex items-center text-stone-400 pointer-events-none" aria-hidden="true">
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-11 px-3.5 text-sm text-stone-900
              bg-white border rounded-xl
              placeholder:text-stone-400
              transition-[border-color,box-shadow,background-color] duration-150
              focus:outline-none focus:ring-4
              disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed
              ${leftAddon ? 'pl-10' : ''}
              ${rightAddon ? 'pr-10' : ''}
              ${hasError
                ? 'border-error-600 focus:border-error-600 focus:ring-error-500/15'
                : 'border-line hover:border-stone-400 focus:border-primary-600 focus:ring-primary-600/10'
              }
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {rightAddon && (
            <div className="absolute right-3 flex items-center text-stone-400">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-error-600 flex items-center gap-1 mt-0.5" role="alert">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-stone-500 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
