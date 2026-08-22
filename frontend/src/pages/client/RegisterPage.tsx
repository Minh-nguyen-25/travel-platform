import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

/**
 * TODO: Nhóm trưởng (TV Auth) triển khai RegisterPage
 *
 * Bao gồm:
 * - Form đăng ký (fullName, email, password, confirmPassword)
 * - Validate phía client
 * - Gọi POST /api/v1/auth/register
 * - Sau khi đăng ký thành công → tự động đăng nhập hoặc redirect login
 */
export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h1>
          <p className="text-gray-500 text-sm mb-6">Đang phát triển — Feature owner: Nhóm trưởng</p>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          Đã có tài khoản?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-primary-600 hover:text-primary-700">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
