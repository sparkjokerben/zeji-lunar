/**
 * Worker 环境变量与绑定。
 * 敏感值（SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM / TO_EMAIL）
 * 通过 `npx wrangler secret put <名字>` 注入。
 * 注：设置同步 API 已迁至站点 Pages Functions（同源），AUTH_TOKEN 属 Pages 侧 secret。
 */
export interface Env {
  /** 设置存储（KV 命名空间 ZJ_KV，与 Pages Functions 共用同一 namespace） */
  ZJ_KV: KVNamespace;
  /** 手动发信鉴权 token（与站点 Pages AUTH_TOKEN、前端 VITE_AUTH_TOKEN 三处值一致） */
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
}
