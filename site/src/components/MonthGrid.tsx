/** 月历网格：公历日 + 农历日/干支 + 宜忌点 + 今日红圈，点击日期回调 */
import type { DayData } from '@zeji/shared';
import { monthCells, todayYmd, type Ymd } from '../lib/date';

interface Props {
  y: number;
  m: number;
  /** 该月每日数据（键为日期数字 1..n） */
  dataByDay: Map<number, DayData>;
  onPick: (day: Ymd) => void;
}

const WEEK_HEADER = ['日', '一', '二', '三', '四', '五', '六'];

export default function MonthGrid({ y, m, dataByDay, onPick }: Props) {
  const cells = monthCells(y, m);
  const today = todayYmd();

  return (
    <section className="card">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {WEEK_HEADER.map((w) => (
          <div key={w} style={{ textAlign: 'center', fontFamily: 'var(--font-kai)', color: 'var(--ink-soft)', padding: '2px 0' }}>
            {w}
          </div>
        ))}

        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const data = dataByDay.get(d);
          const isToday = today.y === y && today.m === m && today.d === d;

          return (
            <button
              key={d}
              type="button"
              onClick={() => onPick({ y, m, d })}
              style={{
                appearance: 'none',
                background: 'transparent',
                border: isToday ? '2px solid var(--cinnabar)' : '1px solid var(--line)',
                borderRadius: 2,
                padding: '6px 4px',
                cursor: 'pointer',
                textAlign: 'center',
                minHeight: 62,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <span style={{ fontFamily: 'var(--font-latin)', fontSize: 16, color: 'var(--ink)', fontWeight: isToday ? 700 : 400 }}>
                {d}
              </span>
              <span style={{ fontFamily: 'var(--font-kai)', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
                {data
                  ? `${data.lunar.dayInChinese}${data.jieQi ? `·${data.jieQi}` : ''}`
                  : ''}
              </span>
              {data && (
                <span style={{ fontSize: 10, color: 'var(--ink-faint)' }}>
                  {data.lunar.dayInGanZhi}
                </span>
              )}
              {data && (data.yi.length > 0 || data.ji.length > 0) && (
                <span style={{ display: 'flex', gap: 3 }}>
                  {data.yi.length > 0 && <i style={{ width: 5, height: 5, background: 'var(--cinnabar)', borderRadius: '50%', fontStyle: 'normal' }} />}
                  {data.ji.length > 0 && <i style={{ width: 5, height: 5, background: 'var(--ink)', borderRadius: '50%', fontStyle: 'normal' }} />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="note" style={{ marginTop: 12 }}>
        <span style={{ color: 'var(--cinnabar)' }}>●</span> 宜　<span style={{ color: 'var(--ink)' }}>●</span> 忌
        　·　<span style={{ color: 'var(--cinnabar)' }}>红框</span> 今日　·　格中依次为：农历日、干支
      </p>
    </section>
  );
}
