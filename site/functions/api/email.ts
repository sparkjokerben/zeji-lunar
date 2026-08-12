/**
 * POST /api/email：手动发送今日早报测试邮件。
 * 同源入口（无 CORS）：校验 AUTH_TOKEN 后代理到 cron Worker 的 /api/email
 * （服务端到服务端 fetch，浏览器不直接接触 Worker，无跨域问题）。
 */
interface Env {
  AUTH_TOKEN: string;
  /** cron Worker 地址（site/wrangler.toml [vars] EMAIL_WORKER_URL） */
  EMAIL_WORKER_URL: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  const auth = request.headers.get('X-Auth-Token');
  if (!env.AUTH_TOKEN || auth !== env.AUTH_TOKEN) {
    return json({ error: 'unauthorized' }, 401);
  }
  const res = await fetch(`${env.EMAIL_WORKER_URL}/api/email`, {
    method: 'POST',
    headers: { 'X-Auth-Token': auth },
  });
  return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
