/**
 * 择吉黄历 Worker：
 * - fetch 路由：GET /api/health、GET /api/today（调试）；POST /api/email（手动发测试早报，
 *   由站点 Pages Functions 同源代理调用）。设置读写已迁至站点 Pages Functions（同源 /api/settings）。
 * - scheduled：每天 23:17 UTC（北京时间 07:17）发送黄历早报邮件
 */
import type { Env } from './env';
import { handleCron, handleManualEmail } from './handlers/cron';
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
      } else if (request.method === 'POST' && p === '/api/email') {
        const auth = request.headers.get('X-Auth-Token');
        if (!env.AUTH_TOKEN || auth !== env.AUTH_TOKEN) {
          res = json({ error: 'unauthorized' }, 401);
        } else {
          res = json(await handleManualEmail(env));
        }
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
