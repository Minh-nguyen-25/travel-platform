interface LoadingProps {
  /** Hiển thị toàn màn hình (dùng khi check auth khi app load) */
  fullPage?: boolean;
  /** Text hiển thị dưới spinner */
  message?: string;
  /** Size của spinner */
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

/**
 * Loading spinner dùng chung.
 *
 * Full-page (khi check auth lần đầu):
 * ```tsx
 * <Loading fullPage message="Đang tải..." />
 * ```
 *
 * Inline (trong button, section):
 * ```tsx
 * <Loading size="sm" />
 * ```
 */
export default function Loading({ fullPage = false, message, size = 'md' }: LoadingProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          border-gray-200
          border-t-primary-600
          animate-spin
        `}
        role="status"
        aria-label="Đang tải"
      />
      {message && (
        <p className="text-sm text-gray-500">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
