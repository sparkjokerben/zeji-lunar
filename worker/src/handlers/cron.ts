/** Cron 入口：北京时间取当日 → 计算黄历+个性化+指南 → Resend 发早报邮件 */
import { buildDayData, computePersonal, generateGuide } from '@zeji/shared';
import type { Env } from '../env';
import { getSettings } from './settings';
import { sendEmail } from './email';

/**
 * 北京时间取当日（Cron 仅支持 UTC 时区）。
 * 关键正确性点：cron 在 00:00–07:59 UTC 执行时必须取"北京时间当日"，
 * 否则会取到昨天的日期。
 */
export function beijingDate(): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { y: get('year'), m: get('month'), d: get('day') };
}

export async function handleCron(env: Env): Promise<void> {
  const { y, m, d } = beijingDate();
  const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // 幂等：当天已成功发送则跳过（防 cron 重放/重复触发）
  const last = await env.ZJ_KV.get('email:lastDate');
  if (last === dateKey) return;

  const settings = await getSettings(env);
  const dayData = buildDayData(y, m, d);
  const personal = settings ? computePersonal(settings) : null;
  const guide = generateGuide(dayData, personal);

  const subject = `${dateKey} 黄历早报 · ${dayData.lunar.dayInGanZhi}日`;
  try {
    await sendEmail(env, { subject, html: guide.html });
    await env.ZJ_KV.put('email:lastDate', dateKey);
    await env.ZJ_KV.delete('email:lastFail');
  } catch (e) {
    // 记录失败，下次 cron 会重试（因 lastDate 未更新）
    await env.ZJ_KV.put(
      'email:lastFail',
      JSON.stringify({ date: dateKey, error: String(e), at: new Date().toISOString() }),
    );
    throw e;
  }
}
