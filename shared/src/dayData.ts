/**
 * 单日黄历装配：把 lunar-typescript（1.8.6）输出整理为 DayData DTO。
 *
 * 数据载体 lunar-typescript（MIT，6tail）：
 * - 公历↔农历转换与节气：算法依据紫金山天文台《中国天文年历》、香港天文台公历农历对照表体系
 * - 宜忌/值神/冲煞/建除/九星/星宿/吉神方位/彭祖百忌：传统通书体系（《协纪辨方书》《玉匣记》等）
 *
 * 口径说明：农历日期按传统历法（正月初一为岁首）；当日生肖按八字年支（立春为岁首），
 * 与子平传统及八字年柱口径一致（站点"出处"页有说明）。
 */
import { Solar } from 'lunar-typescript';
import type { DayData, Gan, HourData, Zhi } from './types';
import { ZHI_SHENGXIAO } from './elements';

/** 时辰名（地支） → 序号 0–11，用于前端展示顺序 */
const HOUR_NAMES: Record<string, string> = {
  子: '子时',
  丑: '丑时',
  寅: '寅时',
  卯: '卯时',
  辰: '辰时',
  巳: '巳时',
  午: '午时',
  未: '未时',
  申: '申时',
  酉: '酉时',
  戌: '戌时',
  亥: '亥时',
};

export function buildDayData(y: number, m: number, d: number): DayData {
  const lunar = Solar.fromYmdHms(y, m, d, 12, 0, 0).getLunar();

  const dayGan = lunar.getDayGan() as Gan;
  const dayZhi = lunar.getDayZhi() as Zhi;
  const yi = lunar.getDayYi();
  const ji = lunar.getDayJi();

  // 十二时辰表：库的 getTimes() 返回 13 项（早子时 00:00 与晚子时 23:00 分开），
  // 按传统通书习惯合并为一行"子时 23:00–00:59"（保留晚子时，其干支按当日日干五鼠遁起）。
  const times = lunar.getTimes();
  const hasEarlyZi = times.some((t) => t.getZhi() === '子' && t.getMinHm().startsWith('00'));
  let hoursList = hasEarlyZi ? times.filter((t) => !(t.getZhi() === '子' && t.getMinHm().startsWith('00'))) : times;
  // 把晚子时（23:00，位于数组末尾）移到最前，形成"子时 23:00–00:59"居首的传统时辰表
  const lateZiIndex = hoursList.findIndex((t) => t.getZhi() === '子');
  if (lateZiIndex > 0) {
    hoursList = [hoursList[lateZiIndex], ...hoursList.slice(0, lateZiIndex), ...hoursList.slice(lateZiIndex + 1)];
  }

  const hours: HourData[] = hoursList.map((t, i) => ({
    index: i,
    name: HOUR_NAMES[t.getZhi()] ?? `${t.getZhi()}时`,
    range: t.getZhi() === '子' ? '23:00–00:59' : `${t.getMinHm()}–${t.getMaxHm()}`,
    ganZhi: t.getGanZhi(),
    tianShen: t.getTianShen(),
    yi: t.getYi(),
    ji: t.getJi(),
  }));

  // 吉时 = 黄道值神时辰（《协纪辨方书》黄黑道十二神体系）
  const jiShi = hoursList
    .filter((t) => t.getTianShenLuck() === '吉')
    .map((t) => HOUR_NAMES[t.getZhi()] ?? `${t.getZhi()}时`);

  const currentJieQi = lunar.getCurrentJieQi();

  // 农历月/日中文（月补 "月" 字：库返回 "七"；闰月为 "闰六"）
  const monthInChinese = `${lunar.getMonthInChinese()}月`;
  const dayInChinese = lunar.getDayInChinese();

  return {
    solar: {
      y,
      m,
      d,
      week: `星期${lunar.getWeekInChinese()}`,
    },
    lunar: {
      yearInGanZhi: lunar.getYearInGanZhi(),
      monthInGanZhi: lunar.getMonthInGanZhi(),
      dayInGanZhi: lunar.getDayInGanZhi(),
      ganZhi: { gan: dayGan, zhi: dayZhi },
      monthInChinese,
      dayInChinese,
      shengXiao: lunar.getYearShengXiaoByLiChun(),
      full: `${lunar.getYearInGanZhi()}年${monthInChinese}${dayInChinese}`,
    },
    yi,
    ji,
    // 1.8.6 的 getDayChongDesc() 仅返回 "(癸丑)牛"，完整冲干支从括号中提取后自行组装
    chongDesc: `${ZHI_SHENGXIAO[lunar.getDayZhi() as Zhi]}日冲${lunar.getDayChongShengXiao()}(${lunar.getDayChongDesc().match(/\((.+)\)/)?.[1] ?? ''})煞${lunar.getDaySha()}`,
    tianShen: lunar.getDayTianShen(),
    zhiXing: lunar.getZhiXing(),
    nineStar: lunar.getDayNineStar().getNameInXuanKong(),
    xiu: lunar.getXiu(),
    naYin: lunar.getDayNaYin(),
    pengZu: { gan: lunar.getPengZuGan(), zhi: lunar.getPengZuZhi() },
    // 用 Desc 变体取方位描述（八卦名 → 干支方位，如 "艮" → "东北"）
    positions: {
      xi: lunar.getDayPositionXiDesc(),
      fu: lunar.getDayPositionFuDesc(),
      cai: lunar.getDayPositionCaiDesc(),
      yangGui: lunar.getDayPositionYangGuiDesc(),
      yinGui: lunar.getDayPositionYinGuiDesc(),
    },
    jiShi,
    jieQi: lunar.getJieQi() || null,
    currentJieQi: currentJieQi ? currentJieQi.getName() : null,
    hours,
  };
}

export { ZHI_SHENGXIAO };
