interface LoadingProps {
  fullPage?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

export default function Loading({ fullPage = false, message, size = 'md' }: LoadingProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <span className="relative flex items-center justify-center" role="status" aria-label="Đang tải">
        <span className={`${sizeClasses[size]} animate-spin rounded-full border-primary-100 border-r-primary-600 border-t-accent-400`} />
        {size !== 'sm' && <span className="absolute h-1.5 w-1.5 rounded-full bg-primary-800" />}
      </span>
      {message && <p className="text-sm font-medium text-gray-500">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-sand-50/90 px-4 backdrop-blur-md">
        <div className="rounded-3xl border border-white bg-white/85 px-8 py-7 shadow-float">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}
