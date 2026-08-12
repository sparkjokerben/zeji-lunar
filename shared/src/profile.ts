/**
 * 生辰设置：校验、默认值与序列化。
 * birthDate 为公历 YYYY-MM-DD；birthHour 0–23，未知为 null（按午时计，UI 注明）。
 */
import type { Profile } from './types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** lunar-typescript 可靠计算范围（香港天文台对照表体系） */
export const PROFILE_YEAR_MIN = 1901;
export const PROFILE_YEAR_MAX = 2100;

export const defaultProfile: Profile = { birthDate: '', birthHour: null };

/** 解析并校验任意输入；不合法返回 null */
export function parseProfile(raw: unknown): Profile | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { birthDate, birthHour } = raw as Record<string, unknown>;
  if (typeof birthDate !== 'string' || !DATE_RE.test(birthDate)) return null;

  const [y, m, d] = birthDate.split('-').map(Number);
  if (y < PROFILE_YEAR_MIN || y > PROFILE_YEAR_MAX) return null;
  // 真实日历日期校验（处理 2 月 30 日之类）
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;

  let hour: number | null = null;
  if (birthHour !== null && birthHour !== undefined) {
    if (typeof birthHour !== 'number' || !Number.isInteger(birthHour) || birthHour < 0 || birthHour > 23) {
      return null;
    }
    hour = birthHour;
  }
  return { birthDate, birthHour: hour };
}

/** 校验已构造的 Profile（parseProfile 之外的类型安全入口） */
export function isValidProfile(p: Profile): boolean {
  return parseProfile(p) !== null;
}
