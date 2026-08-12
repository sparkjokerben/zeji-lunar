/**
 * 择吉黄历 Worker：
 * - fetch 路由：/api/health、/api/today、GET|PUT /api/settings（CORS）
 * - scheduled：每天 23:17 UTC（北京时间 07:17）发送黄历早报邮件
 */
import type { Env } from './env';
import { handleCron } from './handlers/cron';
import { getSettings, putSettings } from './handlers/settings';
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
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': env.SITE_ORIGIN ?? '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    let res: Response;
    try {
      const p = url.pathname;
      if (request.method === 'GET' && p === '/api/health') {
        res = json({ ok: true });
      } else if (request.method === 'GET' && p === '/api/today') {
        res = await handleToday(request, env);
      } else if (request.method === 'GET' && p === '/api/settings') {
        res = json({ profile: await getSettings(env) });
      } else if (request.method === 'PUT' && p === '/api/settings') {
        res = await putSettings(request, env);
      } else {
        res = json({ error: 'not found' }, 404);
      }
    } catch (e) {
      res = json({ error: String(e) }, 500);
    }

    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
    return new Response(res.body, { status: res.status, headers });
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    try {
      await handleCron(env);
    } catch (e) {
      console.error('cron failed:', e);
    }
  },
};
