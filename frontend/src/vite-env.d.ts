/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MAP_TILE_URL?: string;
  readonly VITE_MAP_TILE_ATTRIBUTION?: string;
  readonly VITE_MAP_FALLBACK_TILE_URL?: string;
  readonly VITE_MAP_FALLBACK_TILE_ATTRIBUTION?: string;
  readonly VITE_MAP_TILE_TIMEOUT_MS?: string;
  // Thêm các biến VITE_* khác tại đây nếu cần
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
