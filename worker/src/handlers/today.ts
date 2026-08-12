/** GET /api/today：今日（或指定日期）黄历 JSON，供调试与邮件逻辑复用 */
import { buildDayData, computePersonal, generateGuide } from '@zeji/shared';
import type { Env } from '../env';
import { getSettings } from './settings';
import { beijingDate } from './cron';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function handleToday(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const { y, m, d } = beijingDate();
  let yy = y;
  let mm = m;
  let dd = d;

  // 可选 ?date=YYYY-MM-DD（调试用）
  const dateParam = url.searchParams.get('date');
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const parts = dateParam.split('-').map(Number);
    if (parts[1] >= 1 && parts[1] <= 12 && parts[2] >= 1 && parts[2] <= 31) {
      [yy, mm, dd] = parts;
    }
  }

  const settings = await getSettings(env);
  const dayData = buildDayData(yy, mm, dd);
  const personal = settings ? computePersonal(settings) : null;
  const guide = generateGuide(dayData, personal);

  return json({ date: `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`, dayData, personal, guide });
}
