import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken, setToken } from '@/utils/access-token.store';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

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

const AUTH_SKIP_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
]);

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

let isRefreshing = false;

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

    if (!is401 || alreadyRetried || isSkipped) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
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
      const fullRefreshUrl = `${API_BASE_URL}/auth/refresh`;
      const response = await axios.post<{ data: { accessToken: string } }>(
        fullRefreshUrl,
        {},
        { withCredentials: true },
      );

      const newToken = response.data.data.accessToken;
      setToken(newToken);

      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      return axiosClient(originalRequest);
    } catch (refreshError) {
      removeToken();
      processQueue(refreshError, null);
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosClient;
