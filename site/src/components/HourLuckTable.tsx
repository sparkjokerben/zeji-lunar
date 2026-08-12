/** 十二时辰吉凶表（黄黑道值神 + 时辰宜忌） */
import type { DayData } from '@zeji/shared';

export default function HourLuckTable({ dayData }: { dayData: DayData }) {
  return (
    <section className="card">
      <h2 style={{ fontSize: 16, letterSpacing: '0.2em', color: 'var(--cinnabar-deep)', marginBottom: 12 }}>
        十二时辰
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '3px double var(--ink)', fontFamily: 'var(--font-kai)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', letterSpacing: '0.15em' }}>时辰</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', letterSpacing: '0.15em' }}>时段</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', letterSpacing: '0.15em' }}>干支</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', letterSpacing: '0.15em' }}>值神</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', letterSpacing: '0.15em' }}>宜</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', letterSpacing: '0.15em' }}>忌</th>
            </tr>
          </thead>
          <tbody>
            {dayData.hours.map((h, i) => {
              const isJi = isYellow(h);
              return (
                <tr key={h.index} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '6px 8px', fontFamily: 'var(--font-kai)', whiteSpace: 'nowrap' }}>
                    {h.name}
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{h.range}</td>
                  <td style={{ padding: '6px 8px', fontFamily: 'var(--font-kai)' }}>{h.ganZhi}</td>
                  <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                    <span style={isJi ? { color: 'var(--cinnabar)' } : { color: 'var(--ink-soft)' }}>
                      {h.tianShen}
                    </span>
                    {isJi && <span style={{ color: 'var(--cinnabar)', marginLeft: 4 }}>吉</span>}
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--cinnabar-deep)', fontSize: 13 }}>{h.yi.join('、')}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--ink-soft)', fontSize: 13 }}>{h.ji.join('、')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        值神为黄黑道十二神（青龙、明堂、金匮、天德、玉堂、司命为黄道，余为黑道），黄道时辰宜事，见《协纪辨方书》。
      </p>
    </section>
  );
}

/** 黄道值神判定：黄黑道十二神，黄道六神 */
const YELLOW_SHEN = new Set(['青龙', '明堂', '金匮', '天德', '玉堂', '司命']);
function isYellow(h: { tianShen: string }): boolean {
  return YELLOW_SHEN.has(h.tianShen);
}
