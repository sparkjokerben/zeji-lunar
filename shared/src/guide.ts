/**
 * 今日指南生成器：确定性模板（无 LLM），站点与邮件共用同一算法。
 * 规则编号固定：R1 开场 → R2 宜忌 → R3 六冲避讳 → R4 吉时方位 → R5 幸运 → R6 彭祖 → R7 节气收尾。
 */
import { JIEQI_TEXT } from './elements';
import type { ChongStatus, DayData, GuideResult, PersonalResult } from './types';
import { getChongStatus } from './personal';

/** 彭祖百忌中具有强警示意味的词条，命中才单独成句 */
const PENGZU_STRONG = ['不开仓', '不针灸', '不远行', '不渡水', '不占病', '不迁徙', '不栽种'];

function pickChong(dayData: DayData, personal: PersonalResult | null): ChongStatus | null {
  if (!personal) return null;
  return getChongStatus(personal.userBranch, dayData.lunar.ganZhi.zhi);
}

export function generateGuide(dayData: DayData, personal: PersonalResult | null): GuideResult {
  const s: string[] = [];

  // R1 开场
  let open = `今日${dayData.lunar.monthInChinese}${dayData.lunar.dayInChinese}，${dayData.lunar.dayInGanZhi}日，值神${dayData.tianShen}。`;
  if (dayData.jieQi) open += `时值${dayData.jieQi}。`;
  s.push(open);

  // R2 宜忌（各取前 3）
  const yi = dayData.yi.slice(0, 3);
  const ji = dayData.ji.slice(0, 3);
  if (yi.length && ji.length) {
    s.push(`宜${yi.join('、')}；忌${ji.join('、')}。`);
  } else if (yi.length) {
    s.push(`宜${yi.join('、')}。`);
  } else if (ji.length) {
    s.push(`忌${ji.join('、')}。`);
  }

  // R3 生肖六冲避讳
  const chong = pickChong(dayData, personal);
  if (chong) s.push(chong.text);

  // R4 吉时 + 喜神方位
  const jiShi = dayData.jiShi.slice(0, 2);
  if (jiShi.length) {
    s.push(`吉时择${jiShi.join('、')}，喜神居${dayData.positions.xi}，利朝${dayData.positions.xi}问事。`);
  } else {
    s.push(`喜神居${dayData.positions.xi}，利朝${dayData.positions.xi}问事。`);
  }

  // R5 幸运色/数字（河图五色、五行生成数）
  if (personal) {
    s.push(
      `今日幸运色${personal.luckyColor.name}，幸运数字${personal.luckyNumbers.join('、')}，随身点缀可助心气。`,
    );
  }

  // R6 彭祖百忌（强警示词条）
  const pz = [dayData.pengZu.gan, dayData.pengZu.zhi].filter(Boolean);
  if (pz.length && pz.some((p) => PENGZU_STRONG.some((k) => p.includes(k)))) {
    s.push(`彭祖百忌：${pz.join('，')}。`);
  }

  // R7 节气起居收尾（当日交节优先，否则用当前所处节气）
  const seasonText = dayData.jieQi ? JIEQI_TEXT[dayData.jieQi] : (dayData.currentJieQi ? JIEQI_TEXT[dayData.currentJieQi] : undefined);
  if (seasonText) s.push(seasonText);

  const text = s.join('');
  return {
    sentences: s,
    text,
    html: guideToHtml(dayData, personal, text),
  };
}

/** 邮件用简易 HTML（双栏宜忌 + 指南段落） */
function guideToHtml(dayData: DayData, personal: PersonalResult | null, guideText: string): string {
  const yiItems = dayData.yi.slice(0, 6);
  const jiItems = dayData.ji.slice(0, 6);
  const lucky =
    personal
      ? `<p style="font-family:'Noto Serif SC','Songti SC',serif;color:#6B6154;font-size:13px;line-height:1.8;">幸运色：${personal.luckyColor.name}（${personal.luckyColor.hex}）　幸运数字：${personal.luckyNumbers.join('、')}　喜神方位：${dayData.positions.xi}</p>`
      : '';
  const week = `星期${'日一二三四五六'[new Date(dayData.solar.y, dayData.solar.m - 1, dayData.solar.d).getDay()]}`;

  return `<div style="max-width:560px;margin:0 auto;background:#F6F1E4;padding:28px;font-family:'Noto Serif SC','Songti SC',serif;color:#2F2A24;">
<h1 style="font-size:18px;letter-spacing:.12em;border-bottom:3px double #2F2A24;padding-bottom:12px;margin:0 0 16px;">择吉黄历 · 早报</h1>
<p style="font-size:15px;line-height:1.8;margin:0 0 8px;">${dayData.solar.y}年${dayData.solar.m}月${dayData.solar.d}日（${week}）</p>
<p style="font-size:15px;line-height:1.8;margin:0 0 16px;">${guideText}</p>
<table style="width:100%;border-collapse:collapse;margin:0 0 16px;"><tr>
<td style="width:50%;border:3px double #2F2A24;padding:12px;vertical-align:top;">
<div style="font-size:14px;letter-spacing:.2em;color:#A03A2E;margin-bottom:6px;">宜</div>
<div style="font-size:14px;line-height:2;">${yiItems.map((x) => `<div>${x}</div>`).join('')}</div>
</td>
<td style="width:50%;border:3px double #2F2A24;padding:12px;vertical-align:top;">
<div style="font-size:14px;letter-spacing:.2em;color:#2F2A24;margin-bottom:6px;">忌</div>
<div style="font-size:14px;line-height:2;">${jiItems.map((x) => `<div>${x}</div>`).join('')}</div>
</td>
</tr></table>
${lucky}
<p style="font-size:12px;color:#8A8172;line-height:1.6;margin:0;">数据基于《协纪辨方书》《玉匣记》等传统通书体系，供传统民俗文化参考，不构成决策依据。</p>
</div>`;
}
