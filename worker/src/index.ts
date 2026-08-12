/**
 * 择吉黄历 Worker：
 * - fetch 路由：GET /api/health、GET /api/today（调试）。设置读写已迁至站点
 *   Pages Functions（同源 /api/settings，无 CORS），Worker 只读 KV 供 cron 用。
 * - scheduled：每天 23:17 UTC（北京时间 07:17）发送黄历早报邮件
 */
import type { Env } from './env';
import { handleCron } from './handlers/cron';
import { handleToday } from './handlers/today';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let res: Response;
    try {
      const p = url.pathname;
      if (request.method === 'GET' && p === '/api/health') {
        res = json({ ok: true });
      } else if (request.method === 'GET' && p === '/api/today') {
        res = await handleToday(request, env);
      } else {
        res = json({ error: 'not found' }, 404);
      }
    } catch (e) {
      res = json({ error: String(e) }, 500);
    }
    return res;
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    try {
      await handleCron(env);
    } catch (e) {
      console.error('cron failed:', e);
    }
  },
};
