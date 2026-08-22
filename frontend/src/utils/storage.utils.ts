import { STORAGE_KEYS } from '@/constants';

/**
 * localStorage wrapper cho Access Token.
 * Tất cả code liên quan đến lưu/đọc token phải dùng các hàm này.
 * Không tự gọi localStorage.getItem/setItem trực tiếp trong component.
 */

export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const setToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
};
