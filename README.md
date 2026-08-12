# 择吉黄历（zeji-lunar）

基于《协纪辨方书》《玉匣记》等古籍的传统黄历个人网站，纯 Cloudflare 全栈部署，零服务器成本。

- 前端：React 19 + Vite + TS SPA → **Cloudflare Pages**
- 后端：Cloudflare Worker（Cron + KV）每天北京时间 07:17 通过 **SMTP（cloudflare:sockets 465 隐式 TLS）** 发送黄历早报邮件
- 计算：**lunar-typescript**（MIT，零依赖），浏览器与 Worker 复用同一 `shared` 模块
- 风格：古籍册页（米纸、朱砂、墨色、宋体/楷体），非赛博霓虹
- 内容：全站不包含任何西方占星与数字命理；数据出处见 [docs/sources.md](docs/sources.md)

## 目录

```
shared/   纯 TS 黄历计算（浏览器 + Worker 复用，lunar-typescript 装配、八字扶抑、指南生成、vitest）
site/     React SPA（今日/日历/设置/出处 四页）
worker/   CF Worker（fetch 路由 + Cron 邮件 + KV 设置）
docs/     数据来源文档
```

## 本地开发

```bash
npm install            # workspaces 一次装齐
npm run dev            # 前端 dev server (http://localhost:5173)
npm run test           # shared 单测（vitest）
npm run typecheck      # 三个包类型检查
```

Worker 本地调试（先在 `worker/` 下把 `.dev.vars.example` 复制为 `.dev.vars` 填入假值）：

```bash
npm run dev -w worker                          # wrangler dev
curl http://localhost:8787/api/health
curl "http://localhost:8787/api/today?date=2026-08-13"
curl -X PUT -H "X-Auth-Token: change-me" -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-06-15","birthHour":10}' http://localhost:8787/api/settings
# 手动触发 cron（发送邮件需真实 SMTP 配置）
curl "http://localhost:8787/cdn-cgi/handler/scheduled?format=json"
```

前端联调 Worker：创建 `site/.env.local`：

```
VITE_WORKER_URL=http://localhost:8787
VITE_AUTH_TOKEN=change-me
```

## 部署（一次性清单）

前置：Node ≥ 20；已安装 wrangler（`npm i -g wrangler` 或使用 `npx wrangler`）；域名已托管在 Cloudflare。

1. **站点**：
   ```bash
   npx wrangler pages project create zeji-site --production-branch main
   npm run build
   npx wrangler pages deploy site/dist
   ```
2. **自定义域名**：Cloudflare 控制台 → Pages 项目 → Custom domains → 添加域名（DNS 自动建 CNAME，目标 `*.pages.dev`，等证书签发）。
3. **Worker 基础设施**：
   ```bash
   npx wrangler kv namespace create ZJ_KV   # 把返回的 id 写入 worker/wrangler.toml
   cd worker && npm run deploy               # cron 随部署注册
   ```
   可选：为 Worker 绑定 `api.你的域名` 自定义域（Workers → 你的 worker → Settings → Domains）。
4. **SMTP 发件**：任选一个支持 465 隐式 TLS 的邮箱服务商（QQ/163/企业邮箱等），在邮箱设置里生成**授权码**（QQ/163 需开启 SMTP 服务并获取授权码，非登录密码）。注意：Cloudflare Workers 出站 TCP 仅禁止 25 端口，465 可用；若服务商拒绝来自数据中心 IP 的登录，需在服务商侧放行或换一家。
5. **Secrets**：
   ```bash
   npx wrangler secret put AUTH_TOKEN    # 任意长随机串
   npx wrangler secret put SMTP_HOST     # 如 smtp.qq.com
   npx wrangler secret put SMTP_PORT     # 465
   npx wrangler secret put SMTP_USER     # SMTP 账号（邮箱地址）
   npx wrangler secret put SMTP_PASS     # 邮箱授权码
   npx wrangler secret put SMTP_FROM     # 发件邮箱
   npx wrangler secret put TO_EMAIL      # 收件邮箱（可与发件相同）
   ```
   并配置 `[vars] SITE_ORIGIN = "https://你的域名"`（worker/wrangler.toml）。
6. **前端注入**：`site/.env.production`：
   ```
   VITE_WORKER_URL=https://api.你的域名
   VITE_AUTH_TOKEN=<与 AUTH_TOKEN 一致>
   ```
   重新 `npm run build && npx wrangler pages deploy site/dist`。

**上线自检**：`/api/health` 可用 → 设置页保存后刷新回读一致 → 手动触发 cron 收到邮件 → 次日 07:17 自动收到早报。

## 时间换算

Cron 仅 UTC：`17 23 * * *`（23:17 UTC）= 北京时间次日 07:17。Worker 内取"当日"一律按 `Asia/Shanghai` 时区计算，避免 00:00–07:59 UTC 取到昨天的日期。
