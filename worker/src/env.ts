/**
 * Worker 环境变量与绑定。
 * 敏感值（AUTH_TOKEN / RESEND_API_KEY / TO_EMAIL / SEND_DOMAIN）通过
 * `npx wrangler secret put <名字>` 注入；SITE_ORIGIN 可在 wrangler.toml [vars] 配置。
 */
export interface Env {
  /** 设置存储（KV 命名空间 ZJ_KV） */
  ZJ_KV: KVNamespace;
  /** 站点同步设置用的弱鉴权 token（与前端 VITE_AUTH_TOKEN 一致） */
  AUTH_TOKEN: string;
  /** Resend API Key */
  RESEND_API_KEY: string;
  /** 收件邮箱 */
  TO_EMAIL: string;
  /** 发件域名（须已在 Resend 验证），形如 your-domain.com */
  SEND_DOMAIN: string;
  /** CORS 允许来源；缺省 *（仅本地调试） */
  SITE_ORIGIN?: string;
}
