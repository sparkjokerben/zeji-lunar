/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 同步设置用弱鉴权 token（与 Pages 的 AUTH_TOKEN secret 一致） */
  readonly VITE_AUTH_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
