/**
 * In-memory Access Token Store.
 *
 * Lưu trữ Access Token trong bộ nhớ RAM duy nhất của ứng dụng.
 * TUYỆT ĐỐI KHÔNG lưu vào localStorage / sessionStorage để phòng chống XSS.
 *
 * Cung cấp cơ chế subscribe/unsubscribe để AuthProvider và các thành phần khác
 * tự động đồng bộ khi Axios interceptor tự làm mới token thành công hoặc xóa token.
 */

let _token: string | null = null;

type TokenListener = (token: string | null) => void;
const listeners = new Set<TokenListener>();

/** Lấy token hiện tại trong RAM */
export const getToken = (): string | null => _token;

/**
 * Cập nhật token trong RAM và thông báo cho tất cả subscribers.
 */
export const setToken = (token: string): void => {
  _token = token;
  listeners.forEach((listener) => listener(token));
};

/**
 * Xóa token trong RAM và thông báo cho tất cả subscribers.
 */
export const removeToken = (): void => {
  _token = null;
  listeners.forEach((listener) => listener(null));
};

/**
 * Đăng ký lắng nghe thay đổi của token.
 * Trả về hàm hủy đăng ký (unsubscribe) để cleanup trong useEffect.
 */
export const subscribeToken = (listener: TokenListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
