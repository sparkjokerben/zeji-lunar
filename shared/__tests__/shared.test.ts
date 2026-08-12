import { describe, expect, it } from 'vitest';
import { buildDayData } from '../src/dayData';
import { computePersonal, getChongStatus } from '../src/personal';
import { generateGuide } from '../src/guide';
import { parseProfile } from '../src/profile';
import { WUXING_NUMBERS } from '../src/elements';
import type { Profile } from '../src/types';

describe('profile', () => {
  it('接受合法生辰', () => {
    expect(parseProfile({ birthDate: '1990-06-15', birthHour: 10 })).toEqual({
      birthDate: '1990-06-15',
      birthHour: 10,
    });
  });

  it('时辰可缺省为 null', () => {
    expect(parseProfile({ birthDate: '1990-06-15', birthHour: null })).toEqual({
      birthDate: '1990-06-15',
      birthHour: null,
    });
  });

  it('拒绝非法输入', () => {
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile({})).toBeNull();
    expect(parseProfile({ birthDate: '1990-13-40', birthHour: 10 })).toBeNull(); // 非真实日期
    expect(parseProfile({ birthDate: '1990-02-30', birthHour: 10 })).toBeNull(); // 2月30日
    expect(parseProfile({ birthDate: '1990-06-15', birthHour: 24 })).toBeNull(); // 超范围时辰
    expect(parseProfile({ birthDate: '1990/06/15', birthHour: 10 })).toBeNull(); // 格式错误
    expect(parseProfile({ birthDate: '1899-01-01', birthHour: 10 })).toBeNull(); // 超出可靠范围
  });
});

describe('dayData', () => {
  it('装配完整且结构正确', () => {
    const d = buildDayData(2026, 8, 13);
    expect(d.solar).toEqual({ y: 2026, m: 8, d: 13, week: '星期四' });
    expect(d.lunar.monthInChinese).toMatch(/月$/);
    expect(d.lunar.dayInChinese).toBeTruthy();
    expect(d.lunar.ganZhi.gan).toHaveLength(1);
    expect(d.lunar.ganZhi.zhi).toHaveLength(1);
    expect(d.lunar.dayInGanZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(d.lunar.shengXiao.length).toBe(1);
    expect(d.lunar.full).toContain('年');
    expect(d.yi.length).toBeGreaterThan(0);
    expect(d.ji.length).toBeGreaterThan(0);
    expect(d.chongDesc).toMatch(/冲/);
    expect(d.tianShen).toBeTruthy();
    expect(d.zhiXing).toBeTruthy();
    expect(d.nineStar).toBeTruthy();
    expect(d.xiu).toBeTruthy();
    expect(d.naYin).toBeTruthy();
    expect(d.pengZu.gan).toBeTruthy();
    expect(d.pengZu.zhi).toBeTruthy();
    expect(d.positions.xi).toBeTruthy();
    expect(d.positions.fu).toBeTruthy();
    expect(d.positions.cai).toBeTruthy();
    expect(d.jiShi.length).toBeGreaterThan(0);
    expect(d.hours).toHaveLength(12);
    expect(d.hours[0].name).toBe('子时');
    expect(d.hours[0].range).toContain('–');
    expect(d.hours[0].ganZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  });

  it('立春日交节气', () => {
    const d = buildDayData(2026, 2, 4);
    expect(d.jieQi).toBe('立春');
  });

  it('除夕夜生肖以立春为界（2024-02-09 除夕属龙，2024-02-10 春节仍属龙）', () => {
    // 立春 2024-02-04 已过，两年支均为辰（龙）
    expect(buildDayData(2024, 2, 9).lunar.shengXiao).toBe('龙');
    expect(buildDayData(2024, 2, 10).lunar.shengXiao).toBe('龙');
  });

  it('立春前年后生肖切换（1984 年立春 2/4）', () => {
    expect(buildDayData(1984, 2, 3).lunar.shengXiao).toBe('猪'); // 立春前仍属癸亥年
    expect(buildDayData(1984, 2, 5).lunar.shengXiao).toBe('鼠'); // 立春后属甲子年
  });
});

describe('personal', () => {
  it('计算结果确定性且结构完整', () => {
    const p: Profile = { birthDate: '1990-06-15', birthHour: 10 };
    const a = computePersonal(p);
    const b = computePersonal(p);
    expect(a).toEqual(b);
    expect(['偏强', '偏弱']).toContain(a.strength);
    expect(['木', '火', '土', '金', '水']).toContain(a.xiShen);
    expect(['木', '火', '土', '金', '水']).toContain(a.yongShen);
    expect(a.shengXiao).toHaveLength(1);
    expect(a.userBranch).toHaveLength(1);
    expect(a.pillars.year).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(a.pillars.month).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(a.pillars.day).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(a.pillars.time).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(a.dayMaster.gan).toHaveLength(1);
    expect(a.dayMaster.wuXing).toMatch(/[木火土金水]/);
    expect(a.summary).toContain('日主');
    expect(a.luckyColor.name).toMatch(/[青赤黄白黑]/);
    expect(a.luckyNumbers).toEqual(WUXING_NUMBERS[a.xiShen]);
  });

  it('时辰未知按午时计且可算', () => {
    const r = computePersonal({ birthDate: '1990-06-15', birthHour: null });
    expect(r.pillars.time).toBeTruthy();
  });

  it('晚子时按当日八字口径（库默认 sect 1：23 时与当日日柱一致）', () => {
    const night = computePersonal({ birthDate: '1990-06-15', birthHour: 23 });
    const noon = computePersonal({ birthDate: '1990-06-15', birthHour: 10 });
    expect(night.pillars.day).toBe(noon.pillars.day);
  });

  it('六冲判断（《五行大义》地支六冲）', () => {
    expect(getChongStatus('卯', '酉').hit).toBe(true);
    expect(getChongStatus('酉', '卯').hit).toBe(true);
    expect(getChongStatus('卯', '午').hit).toBe(false);
    expect(getChongStatus('卯', '酉').text).toContain('相冲');
    expect(getChongStatus('卯', '午').text).toContain('无生肖冲碍');
  });
});

describe('guide', () => {
  it('无个性化时不含个人条目', () => {
    const d = buildDayData(2026, 8, 13);
    const g = generateGuide(d, null);
    expect(g.text).toContain('今日');
    expect(g.text).toContain('宜');
    expect(g.text).toContain('忌');
    expect(g.text).toContain('吉时择');
    expect(g.text).not.toContain('君属');
    expect(g.text).not.toContain('幸运色');
    expect(g.html).toContain('<table');
    expect(g.sentences.length).toBeGreaterThanOrEqual(3);
  });

  it('有个性化时含生肖与幸运条目', () => {
    const d = buildDayData(2026, 8, 13);
    const p = computePersonal({ birthDate: '1990-06-15', birthHour: 10 });
    const g = generateGuide(d, p);
    expect(g.text).toContain('君属');
    expect(g.text).toContain('幸运色');
    expect(g.text).toContain('幸运数字');
  });

  it('确定性（同输入同输出）', () => {
    const d = buildDayData(2026, 8, 13);
    const p = computePersonal({ birthDate: '1990-06-15', birthHour: 10 });
    expect(generateGuide(d, p).text).toBe(generateGuide(d, p).text);
  });

  it('生肖相冲日文案出现', () => {
    const d = buildDayData(2026, 8, 13);
    const dayZhi = d.lunar.ganZhi.zhi;
    // 构造一个生肖恰为当日所冲的用户
    const chongMap: Record<string, string> = {
      子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅',
      卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳',
    };
    const userZhi = chongMap[dayZhi];
    // 用已知属相为 userZhi 的出生年（如子年 1996 立春后）
    const birthYearByZhi: Record<string, string> = {
      子: '1996-06-15', 丑: '1997-06-15', 寅: '1998-06-15', 卯: '1999-06-15',
      辰: '2000-06-15', 巳: '2001-06-15', 午: '2002-06-15', 未: '2003-06-15',
      申: '2004-06-15', 酉: '2005-06-15', 戌: '2006-06-15', 亥: '2007-06-15',
    };
    const p = computePersonal({ birthDate: birthYearByZhi[userZhi], birthHour: 10 });
    expect(p.userBranch).toBe(userZhi);
    const g = generateGuide(d, p);
    expect(g.text).toContain('相冲');
    expect(g.text).toContain('大事宜缓');
  });
});
