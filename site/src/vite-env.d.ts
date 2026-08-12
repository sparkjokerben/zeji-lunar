/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Worker 地址（含协议），如 https://api.your-domain.com 或本地 http://localhost:8787 */
  readonly VITE_WORKER_URL?: string;
  /** 同步设置用弱鉴权 token（与 Worker 的 AUTH_TOKEN secret 一致） */
  readonly VITE_AUTH_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
