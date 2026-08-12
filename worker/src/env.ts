/**
 * Worker 环境变量与绑定。
 * 敏感值（AUTH_TOKEN / SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM / TO_EMAIL）
 * 通过 `npx wrangler secret put <名字>` 注入；SITE_ORIGIN 可在 wrangler.toml [vars] 配置。
 */
export interface Env {
  /** 设置存储（KV 命名空间 ZJ_KV） */
  ZJ_KV: KVNamespace;
  /** 站点同步设置用的弱鉴权 token（与前端 VITE_AUTH_TOKEN 一致） */
  AUTH_TOKEN: string;
  /** SMTP 服务器（如 smtp.qq.com / smtp.163.com / 企业邮箱），仅支持 465 隐式 TLS */
  SMTP_HOST: string;
  SMTP_PORT: string;
  /** SMTP 账号（通常为邮箱地址） */
  SMTP_USER: string;
  /** SMTP 授权码（QQ/163 等在邮箱设置里生成，非登录密码） */
  SMTP_PASS: string;
  /** 发件人邮箱 */
  SMTP_FROM: string;
  /** 收件邮箱 */
  TO_EMAIL: string;
  /** CORS 允许来源；缺省 *（仅本地调试） */
  SITE_ORIGIN?: string;
}
