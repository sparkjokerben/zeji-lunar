/** /api/settings：个性化设置读写（KV 存储） */
import { parseProfile } from '@zeji/shared';
import type { Env } from '../env';
import type { Profile } from '@zeji/shared';

const KEY = 'settings:v1';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** 读取已保存的设置（不存在返回 null） */
export async function getSettings(env: Env): Promise<Profile | null> {
  const raw = await env.ZJ_KV.get(KEY);
  if (!raw) return null;
  try {
    return parseProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * 保存设置：X-Auth-Token 弱鉴权（token 对前端可见，本质是单用户场景下
 * 防"路人乱写"的弱保护，非安全边界，见站点"出处"页说明）。
 */
export async function putSettings(request: Request, env: Env): Promise<Response> {
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
  await env.ZJ_KV.put(KEY, JSON.stringify(profile));
  return json({ ok: true, profile });
}
