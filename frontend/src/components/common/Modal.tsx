import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

export interface ModalProps {
  /** Kiểm soát hiển thị Modal */
  isOpen: boolean;
  /** Callback đóng Modal */
  onClose: () => void;
  /** Tiêu đề Modal */
  title?: string;
  /** Nội dung bên trong */
  children: ReactNode;
  /** Kích thước Modal */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Có đóng khi click backdrop không */
  closeOnBackdrop?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

/**
 * Modal dùng chung cho TravelGo.
 *
 * ```tsx
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Xác nhận xóa" size="sm">
 *   <p>Bạn có chắc muốn xóa không?</p>
 *   <div className="flex justify-end gap-2 mt-4">
 *     <Button variant="secondary" onClick={() => setIsOpen(false)}>Hủy</Button>
 *     <Button variant="danger" onClick={handleDelete}>Xóa</Button>
 *   </div>
 * </Modal>
 * ```
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  // Đóng khi bấm Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Khóa scroll body khi modal mở
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal box */}
      <div
        className={`
          relative z-10 w-full ${sizeClasses[size]}
          bg-white rounded-2xl shadow-xl border border-stone-200/80
          transition-[transform,opacity] duration-200
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <h2 id="modal-title" className="text-base font-bold text-stone-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
