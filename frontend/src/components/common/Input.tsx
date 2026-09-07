import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId.replace(/:/g, '')}`;
    const hasError = Boolean(error);

    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="ml-0.5 text-error">*</span>}
          </label>
        )}

        <div className="relative flex min-w-0 items-center">
          {leftAddon && (
            <div className="absolute left-3.5 flex items-center text-gray-400 pointer-events-none" aria-hidden="true">
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              min-w-0 w-full h-11 px-3.5 py-2 text-sm text-gray-900
              bg-white border rounded-xl shadow-sm
              placeholder:text-gray-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${leftAddon ? 'pl-10' : ''}
              ${rightAddon ? 'pr-10' : ''}
              ${hasError
                ? 'border-error focus:border-error focus:ring-red-400/30'
                : 'border-gray-200 focus:border-primary-400 focus:ring-primary-100'
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
          <p id={`${inputId}-error`} className="text-xs text-error flex items-center gap-1 mt-0.5" role="alert">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
