import { useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  closeOnBackdrop?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-5xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleKeyDown, isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-gray-900/55 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-label="Đóng hộp thoại"
      />
      <div className={`trip-modal-enter relative z-10 max-h-[calc(100vh-2rem)] w-full overflow-hidden rounded-2xl bg-white shadow-xl ${sizeClasses[size]}`}>
        {title && (
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 id="modal-title" className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Đóng"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
