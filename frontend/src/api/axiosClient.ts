import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken, setToken } from '@/utils/access-token.store';

/**
 * Axios Client dùng chung cho toàn bộ Frontend.
 *
 * KHÔNG tạo instance Axios riêng trong từng service.
 * Tất cả gọi API phải đi qua file này.
 *
 * Đọc baseURL từ biến môi trường VITE_API_URL.
 */

// ================================================================
// Tạo Instance
// ================================================================
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
  /**
   * withCredentials: true — bắt buộc để browser tự động gửi HttpOnly Cookie
   * chứa Refresh Token khi gọi API.
   */
  withCredentials: true,
});

// ================================================================
// Request Interceptor
// Tự động gắn Authorization: Bearer <accessToken> vào mọi request từ in-memory store.
// ================================================================
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ================================================================
// Response Interceptor & Refresh Queue
// Bắt lỗi 401 → tự động refresh token một lần → retry request gốc.
// ================================================================

/** Danh sách các endpoint không được trigger refresh token khi bị 401 */
const AUTH_SKIP_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
]);

/**
 * Chuẩn hóa URL để kiểm tra chính xác pathname trong skip list.
 * Loại bỏ /api/v1 prefix và query string, hỗ trợ cả URL tuyệt đối lẫn tương đối.
 */
const isAuthSkipPath = (url?: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url, 'http://localhost');
    let pathname = parsed.pathname;
    if (pathname.startsWith('/api/v1')) {
      pathname = pathname.slice('/api/v1'.length);
    }
    return AUTH_SKIP_PATHS.has(pathname);
  } catch {
    return false;
  }
};

/** Flag để tránh tạo nhiều refresh request đồng thời */
let isRefreshing = false;

/** Queue các request đang chờ refresh */
type FailedQueueCallback = (token: string | null) => void;
let failedQueue: { resolve: FailedQueueCallback; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Extend InternalAxiosRequestConfig để thêm flag _retry
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig;

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest?._retry === true;
    const isSkipped = isAuthSkipPath(originalRequest?.url);

    // Không xử lý nếu không phải 401, đã retry, hoặc là auth skip path (login, register, refresh, logout)
    if (!is401 || alreadyRetried || isSkipped) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Nếu đang trong quá trình refresh, đưa request vào queue chờ token mới
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (token && originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
        }
        return axiosClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Gọi refresh bằng axios gốc (bare axios) với full URL và withCredentials: true
      // KHÔNG dùng axiosClient để tránh re-enter interceptor stack
      const fullRefreshUrl = `${import.meta.env.VITE_API_URL as string}/auth/refresh`;
      const response = await axios.post<{ data: { accessToken: string } }>(
        fullRefreshUrl,
        {},
        { withCredentials: true },
      );

      const newToken = response.data.data.accessToken;
      // Cập nhật token store (tự động thông báo cho AuthProvider)
      setToken(newToken);

      // Cập nhật Authorization header cho request gốc
      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      return axiosClient(originalRequest);
    } catch (refreshError) {
      // Refresh thất bại → xóa token trong store, reject toàn bộ queue, dispatch event logout
      removeToken();
      processQueue(refreshError, null);

      /**
       * Dispatch custom event để AuthProvider clear state người dùng.
       */
      window.dispatchEvent(new Event('auth:logout'));

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosClient;
