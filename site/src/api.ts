/** 设置同步：同源 Pages Function /api/settings（无 CORS）；未配置 VITE_AUTH_TOKEN 时不可用 */
import type { Profile } from '@zeji/shared';

const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;

export const apiAvailable = Boolean(AUTH_TOKEN);

export interface SyncResult {
  ok: boolean;
  message: string;
}

export async function syncSettings(profile: Profile): Promise<SyncResult> {
  if (!AUTH_TOKEN) {
    return { ok: false, message: '未配置云端同步（VITE_AUTH_TOKEN），仅本机保存' };
  }
  try {
    const res = await fetch('/api/settings', {
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
