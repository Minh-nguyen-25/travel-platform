/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Thêm các biến VITE_* khác tại đây nếu cần
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
