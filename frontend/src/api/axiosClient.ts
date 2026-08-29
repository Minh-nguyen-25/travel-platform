import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken, setToken } from '@/utils/storage.utils';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const sessionEndpoints = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
];

const isSessionEndpoint = (url?: string): boolean =>
  sessionEndpoints.some((endpoint) => url?.includes(endpoint));

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && !isSessionEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown, token?: string): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

const announceTokenRefresh = (token: string): void => {
  window.dispatchEvent(new CustomEvent<string>('auth:token-refreshed', { detail: token }));
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest !== undefined &&
      !originalRequest._retry &&
      !isSessionEndpoint(originalRequest.url);

    if (!shouldRefresh || !originalRequest) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post<{ data: { accessToken: string } }>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken = response.data.data.accessToken;

      setToken(newToken);
      announceTokenRefresh(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);

      return axiosClient(originalRequest);
    } catch (refreshError) {
      removeToken();
      processQueue(refreshError);
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosClient;
