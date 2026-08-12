/** 五行 */
export type WuXing = '木' | '火' | '土' | '金' | '水';

/** 天干 */
export type Gan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

/** 地支 */
export type Zhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

/** 十神 */
export type ShiShen =
  | '比肩'
  | '劫财'
  | '食神'
  | '伤官'
  | '正财'
  | '偏财'
  | '正官'
  | '七杀'
  | '正印'
  | '偏印';

/** 用户生辰设置：birthDate 为公历 YYYY-MM-DD；birthHour 0–23，未知为 null */
export interface Profile {
  birthDate: string;
  birthHour: number | null;
}

/** 十二时辰一行 */
export interface HourData {
  index: number;
  /** 时辰名，如 "子时" */
  name: string;
  /** 时段，如 "23:00–00:59" */
  range: string;
  /** 时辰干支，如 "甲子" */
  ganZhi: string;
  /** 值神（黄黑道） */
  tianShen: string;
  yi: string[];
  ji: string[];
}

/** 单日黄历数据 DTO（由 lunar-typescript 装配而来） */
export interface DayData {
  solar: {
    y: number;
    m: number;
    d: number;
    /** 星期，如 "星期三" */
    week: string;
  };
  lunar: {
    /** 农历年，如 "丙午"（以正月初一为岁首的传统历法口径） */
    yearInGanZhi: string;
    monthInGanZhi: string;
    dayInGanZhi: string;
    /** 当日干支拆解（日支用于生肖六冲判断） */
    ganZhi: { gan: Gan; zhi: Zhi };
    /** 农历月，如 "六月" */
    monthInChinese: string;
    /** 农历日，如 "廿九" */
    dayInChinese: string;
    /** 当日生肖（八字年支生肖，立春为界） */
    shengXiao: string;
    /** 农历全串，如 "丙午年六月廿九" */
    full: string;
  };
  yi: string[];
  ji: string[];
  /** 冲煞描述，如 "鸡日冲兔(乙卯)煞东" */
  chongDesc: string;
  /** 值神 */
  tianShen: string;
  /** 建除十二值星 */
  zhiXing: string;
  /** 九星 */
  nineStar: string;
  /** 二十八星宿 */
  xiu: string;
  /** 日纳音 */
  naYin: string;
  /** 彭祖百忌（干/支） */
  pengZu: { gan: string; zhi: string };
  /** 吉神方位：喜神/福神/财神/阳贵/阴贵 */
  positions: { xi: string; fu: string; cai: string; yangGui: string; yinGui: string };
  /** 吉时，如 ["巳时", "申时"] */
  jiShi: string[];
  /** 当日交节气则返回节气名，否则 null */
  jieQi: string | null;
  /** 当前所处节气（最近已交节气），用于起居文案 */
  currentJieQi: string | null;
  /** 十二时辰吉凶表 */
  hours: HourData[];
}

/** 八字四柱 */
export interface Pillars {
  year: string;
  month: string;
  day: string;
  time: string;
}

/** 个性化计算结果 */
export interface PersonalResult {
  /** 用户生肖（八字年支，立春为界） */
  shengXiao: string;
  /** 用户生肖地支（六冲判断用） */
  userBranch: Zhi;
  pillars: Pillars;
  /** 日主天干及其五行 */
  dayMaster: { gan: Gan; wuXing: WuXing };
  /** 日主强弱（简化扶抑法） */
  strength: '偏强' | '偏弱';
  /** 扶抑得分（>0 偏强，≤0 偏弱） */
  score: number;
  /** 喜神五行 */
  xiShen: WuXing;
  /** 用神五行 */
  yongShen: WuXing;
  /** 一句强弱小结 */
  summary: string;
  /** 幸运色：正色名 + 近似 UI 色值（《尚书·洪范》五色） */
  luckyColor: { name: string; hex: string };
  /** 幸运数字：河图五行生成数 */
  luckyNumbers: number[];
}

/** 生肖六冲状态 */
export interface ChongStatus {
  hit: boolean;
  /** 用户生肖地支 */
  userBranch: Zhi;
  /** 当日地支 */
  dayBranch: Zhi;
  /** 当日冲的生肖 */
  dayChongShengXiao: string;
  /** 警示文案 */
  text: string;
}

/** 今日指南结果 */
export interface GuideResult {
  sentences: string[];
  /** 合并成段（站点正文用） */
  text: string;
  /** 邮件 HTML 用 */
  html: string;
}
