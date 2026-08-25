import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

/**
 * LoginPage — Trang đăng nhập.
 *
 * Đây là form cơ bản để hệ thống Auth hoạt động ngay khi Backend Auth được implement.
 * TODO (TV phụ trách Auth — Nhóm trưởng):
 *   - Implement POST /api/v1/auth/login trong Backend
 *   - Sau khi Backend hoàn thiện, trang này sẽ hoạt động tự động
 *   - Có thể nâng cấp UI chi tiết hơn (animation, forgot password, v.v.)
 *   - Thêm nút Đăng nhập bằng Google (gọi GET /api/v1/auth/google)
 */
export default function LoginPage() {
  const { login, mockLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect về trang trước sau khi login thành công
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ROUTES.HOME;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch {
      setError('Email hoặc mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = async (role: 'USER' | 'ADMIN') => {
    setError('');
    setIsLoading(true);
    try {
      await mockLogin(role);
      navigate(role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.TRIPS);
    } catch {
      setError('Không thể đăng nhập tài khoản mẫu. Hãy kiểm tra backend và dữ liệu seed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h1>
            <p className="text-sm text-gray-500">Chào mừng bạn trở lại!</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              id="password"
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={!email || !password}
            >
              Đăng nhập
            </Button>
          </form>

            {/* Google OAuth placeholder */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400">
                  <span className="bg-white px-3">hoặc</span>
                </div>
              </div>

              {/* TODO (TV Auth): Replace href với Google OAuth flow */}
              <a
                href={`${import.meta.env.VITE_API_URL}/auth/google`}
                className="mt-3 w-full flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Đăng nhập bằng Google
              </a>
            </div>

            {/* Dev Mode Quick Login */}
            {import.meta.env.DEV && <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center mb-2.5">
                🛠️ Chế độ Dev (Test Giao Diện)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void handleDevLogin('ADMIN')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors text-center"
                >
                  ⚡ Vào vai Admin
                </button>
                <button
                  type="button"
                  onClick={() => void handleDevLogin('USER')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors text-center"
                >
                  ⚡ Vào vai User
                </button>
              </div>
            </div>}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-primary-600 hover:text-primary-700">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    );
  }
