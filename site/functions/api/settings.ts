/**
 * GET|PUT /api/settings：生辰设置读写（KV）。
 * Pages Function 与站点同源，浏览器无跨源请求，不需要 CORS。
 * 与 cron Worker 共用同一 KV namespace（site/wrangler.toml 绑定 ZJ_KV）。
 */
import { parseProfile, SETTINGS_KEY } from '@zeji/shared';
import type { Profile } from '@zeji/shared';

interface Env {
  /** KV namespace ZJ_KV（site/wrangler.toml 绑定） */
  ZJ_KV: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  };
  /** 弱鉴权 token（wrangler pages secret put AUTH_TOKEN 注入） */
  AUTH_TOKEN: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const onRequestGet = async ({ env }: { env: Env }): Promise<Response> => {
  const raw = await env.ZJ_KV.get(SETTINGS_KEY);
  if (!raw) return json({ profile: null });
  try {
    return json({ profile: parseProfile(JSON.parse(raw)) });
  } catch {
    return json({ profile: null });
  }
};

/**
 * 保存设置：X-Auth-Token 弱鉴权（token 对前端可见，本质是单用户场景下
 * 防"路人乱写"的弱保护，非安全边界，见站点"出处"页说明）。
 */
export const onRequestPut = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  const auth = request.headers.get('X-Auth-Token');
  if (!env.AUTH_TOKEN || auth !== env.AUTH_TOKEN) {
    return json({ error: 'unauthorized' }, 401);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }
  const profile = parseProfile(body);
  if (!profile) return json({ error: 'invalid profile' }, 400);
  await env.ZJ_KV.put(SETTINGS_KEY, JSON.stringify(profile));
  return json({ ok: true, profile });
};
