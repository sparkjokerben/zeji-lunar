/** 日期工具：翻月、当月网格、今日定位 */

export interface Ymd {
  y: number;
  m: number; // 1–12
  d: number;
}

export function todayYmd(): Ymd {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

export function ymdKey(t: Ymd): string {
  return `${t.y}-${String(t.m).padStart(2, '0')}-${String(t.d).padStart(2, '0')}`;
}

export function isSameDay(a: Ymd, b: Ymd): boolean {
  return a.y === b.y && a.m === b.m && a.d === b.d;
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

/** 月视图首格偏移（周日为一周起点） */
export function firstWeekday(y: number, m: number): number {
  return new Date(y, m - 1, 1).getDay();
}

/** 某月完整网格：前月补位 null + 当月日期（1..n） */
export function monthCells(y: number, m: number): (number | null)[] {
  const cells: (number | null)[] = [];
  const lead = firstWeekday(y, m);
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth(y, m); d += 1) cells.push(d);
  return cells;
}

export function prevMonth(y: number, m: number): Ymd {
  return m === 1 ? { y: y - 1, m: 12, d: 1 } : { y, m: m - 1, d: 1 };
}

export function nextMonth(y: number, m: number): Ymd {
  return m === 12 ? { y: y + 1, m: 1, d: 1 } : { y, m: m + 1, d: 1 };
}

/** 天干地支序号（月标题干支用） */
export const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
