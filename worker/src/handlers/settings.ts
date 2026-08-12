/** 读取云端生辰设置（KV）。写入由站点 Pages Functions 负责，Worker 仅 cron/调试读取。 */
import { parseProfile, SETTINGS_KEY } from '@zeji/shared';
import type { Env } from '../env';
import type { Profile } from '@zeji/shared';

/** 读取已保存的设置（不存在或解析失败返回 null） */
export async function getSettings(env: Env): Promise<Profile | null> {
  const raw = await env.ZJ_KV.get(SETTINGS_KEY);
  if (!raw) return null;
  try {
    return parseProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}
