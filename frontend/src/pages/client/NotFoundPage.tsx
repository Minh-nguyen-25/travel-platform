import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

/**
 * 404 Not Found Page.
 * Render khi không tìm thấy route phù hợp.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-primary-100 mb-2 select-none">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Trang không tồn tại</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
