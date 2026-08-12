/**
 * 个性化计算：生肖、四柱、日主五行、日主强弱（简化扶抑法）、喜用神、幸运色、幸运数字、六冲避讳。
 *
 * 全部基于中国古籍规则，不引入任何西方学说：
 * - 四柱/十神/生克：子平法（《渊海子平》《三命通会》《子平真诠》）
 * - 强弱取用（扶抑）：《子平真诠》"论用神"（扶之抑之）；得令失令、中和：《滴天髓》
 * - 五行五色：《尚书·洪范》
 * - 河图生成数（幸运数字）：《周易·系辞上》"天一地二…"及郑玄注五行生成数
 * - 十二地支六冲：《五行大义》《淮南子·天文训》
 *
 * 必须声明：本站为简化民俗算法，非专业命理，供日常生活参考。
 */
import { Solar } from 'lunar-typescript';
import {
  GAN_WUXING,
  WUXING_COLOR,
  WUXING_KE,
  WUXING_NUMBERS,
  WUXING_SHENG,
  ZHI_BENQI_WUXING,
  ZHI_CHONG,
  ZHI_SHENGXIAO,
} from './elements';
import type { ChongStatus, Gan, PersonalResult, Profile, WuXing, Zhi } from './types';

type Relation = '生我' | '同我' | '我生' | '我克' | '克我';

/** 五行关系：other 相对于日主 dm */
function relation(dm: WuXing, other: WuXing): Relation {
  if (dm === other) return '同我';
  if (WUXING_SHENG[other] === dm) return '生我'; // other 生 dm → 印
  if (WUXING_SHENG[dm] === other) return '我生'; // dm 生 other → 食伤
  if (WUXING_KE[other] === dm) return '克我'; // other 克 dm → 官杀
  return '我克'; // dm 克 other → 财
}

/** 生 dm 的五行（印） */
function shengMe(dm: WuXing): WuXing {
  return (Object.keys(WUXING_SHENG) as WuXing[]).find((k) => WUXING_SHENG[k] === dm)!;
}

/** 克 dm 的五行（官杀） */
function keMe(dm: WuXing): WuXing {
  return (Object.keys(WUXING_KE) as WuXing[]).find((k) => WUXING_KE[k] === dm)!;
}

/**
 * 同党（印、比劫）为生扶 +1；异党（官杀 −1.2、财 −1、食伤 −1）为克泄。
 * 分值依据《子平真诠》扶抑轻重惯例：官杀制身最重，财食伤次之。
 */
function relScore(dm: WuXing, rel: Relation): number {
  switch (rel) {
    case '生我':
    case '同我':
      return 1;
    case '克我':
      return -1.2;
    case '我克':
    case '我生':
      return -1;
  }
}

export function computePersonal(profile: Profile): PersonalResult {
  const [y, m, d] = profile.birthDate.split('-').map(Number);
  // 时辰未知（null）按午时正计，UI 明示；23 时晚子时由库按次日八字口径处理（sect 2）
  const hour = profile.birthHour ?? 12;
  const lunar = Solar.fromYmdHms(y, m, d, hour, 0, 0).getLunar();
  const ec = lunar.getEightChar();

  const yearGan = ec.getYearGan() as Gan;
  const yearZhi = ec.getYearZhi() as Zhi;
  const monthGan = ec.getMonthGan() as Gan;
  const monthZhi = ec.getMonthZhi() as Zhi;
  const dayGan = ec.getDayGan() as Gan;
  const dayZhi = ec.getDayZhi() as Zhi;
  const timeGan = ec.getTimeGan() as Gan;
  const timeZhi = ec.getTimeZhi() as Zhi;

  const dm = GAN_WUXING[dayGan]; // 日主五行

  // ---- 第 1 步：月令得令/失令 ----
  const monthWx = ZHI_BENQI_WUXING[monthZhi];
  const monthRel = relation(dm, monthWx);
  const lingScore = monthRel === '生我' || monthRel === '同我' ? 2 : -2;

  // ---- 第 2 步：全局扶抑打分 ----
  // 天干（日主本身不计）；地支取本气藏干（《渊海子平》支藏干），分值 ×0.8，月支权重再 ×2
  const gans: Gan[] = [yearGan, monthGan, dayGan, timeGan];
  const zhis: Zhi[] = [yearZhi, monthZhi, dayZhi, timeZhi];

  let score = 0;
  gans.forEach((g, i) => {
    if (i === 2) return;
    score += relScore(dm, relation(dm, GAN_WUXING[g]));
  });
  zhis.forEach((z, i) => {
    const rel = relation(dm, ZHI_BENQI_WUXING[z]);
    score += relScore(dm, rel) * 0.8 * (i === 1 ? 2 : 1); // 月支 ×2
  });
  score += lingScore;

  // 中和归偏弱（保守取生扶，规则写死）
  const strength: '偏强' | '偏弱' = score > 0 ? '偏强' : '偏弱';

  // ---- 第 3 步：喜用神定则 ----
  // 印星（生我）是否现于四柱天干或月支本气
  const hasYin =
    gans.some((g) => g !== dayGan && relation(dm, GAN_WUXING[g]) === '生我') ||
    monthRel === '生我';
  // 财星（我克）是否现于四柱天干
  const hasCai = gans.some((g) => g !== dayGan && relation(dm, GAN_WUXING[g]) === '我克');

  let xiShen: WuXing;
  let yongShen: WuXing;
  if (strength === '偏弱') {
    xiShen = shengMe(dm); // 喜印（生日主）
    yongShen = dm; // 用比劫
    if (!hasYin) [xiShen, yongShen] = [yongShen, xiShen]; // 无印则以比劫为喜、印为用
  } else {
    xiShen = WUXING_KE[dm]; // 喜财（日主所克）
    yongShen = WUXING_SHENG[dm]; // 用食伤（日主所生）
    if (!hasCai) {
      xiShen = WUXING_SHENG[dm]; // 无财则以食伤为喜
      yongShen = keMe(dm); // 官杀为用
    }
  }

  const deLing = lingScore > 0 ? '得令' : '失令';
  const summary = `日主${dayGan}${dm}，生于${monthZhi}月${deLing}；全局${score > 0 ? '生扶略旺' : '克泄稍衰'}，扶抑取喜${xiShen}、用${yongShen}相济。`;

  return {
    shengXiao: ZHI_SHENGXIAO[yearZhi],
    userBranch: yearZhi,
    pillars: {
      year: ec.getYear(),
      month: ec.getMonth(),
      day: ec.getDay(),
      time: ec.getTime(),
    },
    dayMaster: { gan: dayGan, wuXing: dm },
    strength,
    score,
    xiShen,
    yongShen,
    summary,
    luckyColor: WUXING_COLOR[xiShen],
    luckyNumbers: WUXING_NUMBERS[xiShen],
  };
}

/** 生肖六冲避讳：用户生肖地支 vs 当日地支（《五行大义》地支六冲） */
export function getChongStatus(userBranch: Zhi, dayBranch: Zhi): ChongStatus {
  const hit = ZHI_CHONG[userBranch] === dayBranch;
  const userShengXiao = ZHI_SHENGXIAO[userBranch];
  const dayChongShengXiao = ZHI_SHENGXIAO[dayBranch];
  return {
    hit,
    userBranch,
    dayBranch,
    dayChongShengXiao,
    text: hit
      ? `君属${userShengXiao}，今日冲${dayChongShengXiao}（日支${dayBranch}），生肖相冲，大事宜缓，出行当心。`
      : `君属${userShengXiao}，今日无生肖冲碍，诸事可从宜而行。`,
  };
}
