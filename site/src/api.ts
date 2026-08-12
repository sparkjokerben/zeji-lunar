/** Worker API 客户端（设置同步）；未配置 VITE_WORKER_URL 时返回 null 表示不可用 */
import type { Profile } from '@zeji/shared';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;

export const apiAvailable = Boolean(WORKER_URL && AUTH_TOKEN);

export interface SyncResult {
  ok: boolean;
  message: string;
}

export async function syncSettings(profile: Profile): Promise<SyncResult> {
  if (!WORKER_URL || !AUTH_TOKEN) {
    return { ok: false, message: '未配置云端同步（VITE_WORKER_URL / VITE_AUTH_TOKEN）' };
  }
  try {
    const res = await fetch(`${WORKER_URL}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': AUTH_TOKEN,
      },
      body: JSON.stringify(profile),
    });
    if (res.ok) return { ok: true, message: '已同步到云端（早报邮件将使用此生辰）' };
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, message: `同步失败（${res.status}）${data?.error ?? ''}` };
  } catch (e) {
    return { ok: false, message: `同步失败：${String(e)}` };
  }
}

export async function fetchSettings(): Promise<Profile | null> {
  if (!WORKER_URL) return null;
  try {
    const res = await fetch(`${WORKER_URL}/api/settings`);
    if (!res.ok) return null;
    const data = (await res.json()) as { profile?: Profile | null };
    return data.profile ?? null;
  } catch {
    return null;
  }
}
