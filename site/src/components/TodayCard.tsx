/** 今日黄历主卡片（视觉核心）：公历大字、农历竖排、宜忌两栏、冲煞/值神/吉神方位 */
import type { DayData } from '@zeji/shared';
import Seal from './Seal';

export default function TodayCard({ dayData }: { dayData: DayData }) {
  const { solar, lunar } = dayData;

  return (
    <section className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        {/* 公历 */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <h2
              style={{
                fontFamily: 'var(--font-song)',
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: '0.06em',
                margin: 0,
              }}
            >
              {solar.y}年{solar.m}月{solar.d}日
            </h2>
            <span className="note">{solar.week}</span>
          </div>

          {/* 农历 */}
          <div className="vertical" style={{ marginTop: 8, fontSize: 17, fontFamily: 'var(--font-kai)' }}>
            {lunar.full}
          </div>

          {/* 干支信息行 */}
          <div style={{ marginTop: 14 }}>
            <span className="tag tag-cinnabar">{lunar.dayInGanZhi}日</span>
            <span className="tag tag-ink">值神 {dayData.tianShen}</span>
            <span className="tag tag-ink">建除 {dayData.zhiXing}</span>
            <span className="tag tag-ink">九星 {dayData.nineStar}</span>
            <span className="tag tag-ink">宿 {dayData.xiu}</span>
            <span className="tag tag-ink">纳音 {dayData.naYin}</span>
            {dayData.jieQi && <span className="tag tag-cinnabar">今交 {dayData.jieQi}</span>}
          </div>
        </div>

        {/* 当日生肖印章 */}
        <Seal chars={lunar.shengXiao} size={48} />
      </div>

      {/* 宜忌两栏（竖排） */}
      <div style={{ display: 'flex', gap: 40, marginTop: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <span
            className="vertical"
            style={{
              color: 'var(--cinnabar)',
              fontSize: 20,
              fontWeight: 600,
              writingMode: 'vertical-rl',
            }}
          >
            宜
          </span>
          <ul
            className="vertical"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              fontFamily: 'var(--font-kai)',
              fontSize: 17,
              color: 'var(--cinnabar-deep)',
            }}
          >
            {dayData.yi.map((x) => (
              <li key={x} style={{ marginBottom: 4 }}>
                {x}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <span className="vertical" style={{ fontSize: 20, fontWeight: 600 }}>
            忌
          </span>
          <ul
            className="vertical"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              fontFamily: 'var(--font-kai)',
              fontSize: 17,
            }}
          >
            {dayData.ji.map((x) => (
              <li key={x} style={{ marginBottom: 4 }}>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr className="hr" />

      {/* 冲煞 / 彭祖 / 方位 / 吉时 */}
      <div className="note" style={{ display: 'grid', gap: 6 }}>
        <div>
          <span style={{ display: 'inline-block', width: '4.5em', color: 'var(--ink-faint)' }}>冲煞</span>
          {dayData.chongDesc}
        </div>
        <div>
          <span style={{ display: 'inline-block', width: '4.5em', color: 'var(--ink-faint)' }}>彭祖</span>
          干 {dayData.pengZu.gan}；支 {dayData.pengZu.zhi}
        </div>
        <div>
          <span style={{ display: 'inline-block', width: '4.5em', color: 'var(--ink-faint)' }}>方位</span>
          喜神 {dayData.positions.xi} · 福神 {dayData.positions.fu} · 财神 {dayData.positions.cai}
          <span className="muted">（阳贵 {dayData.positions.yangGui} · 阴贵 {dayData.positions.yinGui}）</span>
        </div>
        <div>
          <span style={{ display: 'inline-block', width: '4.5em', color: 'var(--ink-faint)' }}>吉时</span>
          {dayData.jiShi.length ? (
            dayData.jiShi.map((h) => (
              <span key={h} className="tag tag-cinnabar" style={{ marginLeft: 4 }}>
                {h}
              </span>
            ))
          ) : (
            <span className="muted">今日无黄道吉时</span>
          )}
        </div>
      </div>
    </section>
  );
}
