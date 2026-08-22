import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken, setToken } from '@/utils/storage.utils';

/**
 * Axios Client dùng chung cho toàn bộ Frontend.
 *
 * KHÔNG tạo instance Axios riêng trong từng service.
 * Tất cả gọi API phải đi qua file này.
 *
 * Đọc baseURL từ biến môi trường VITE_API_URL (xem .env.example).
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
   * chứa Refresh Token khi gọi POST /auth/refresh.
   */
  withCredentials: true,
});

// ================================================================
// Request Interceptor
// Tự động gắn Authorization: Bearer <accessToken> vào mọi request.
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
// Response Interceptor
// Bắt lỗi 401 → tự động refresh token → retry request gốc.
// ================================================================

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

    // Chỉ xử lý lỗi 401 và chưa retry
    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest?._retry === true;

    // Tránh retry chính endpoint /auth/refresh để không vòng lặp vô tận
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');

    if (!is401 || alreadyRetried || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Nếu đang refresh, đưa request vào queue và chờ
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
      // Gọi refresh — Refresh Token HttpOnly Cookie được gửi tự động
      const response = await axios.post<{ data: { accessToken: string } }>(
        `${import.meta.env.VITE_API_URL as string}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newToken = response.data.data.accessToken;
      setToken(newToken);

      // Cập nhật header cho request gốc và retry
      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      return axiosClient(originalRequest);
    } catch (refreshError) {
      // Refresh thất bại → xóa token, dispatch event để AuthContext biết
      removeToken();
      processQueue(refreshError, null);

      /**
       * Dispatch custom event để AuthContext lắng nghe và clear state.
       * Tránh import circular dependency giữa axiosClient và AuthContext.
       */
      window.dispatchEvent(new Event('auth:logout'));

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosClient;
