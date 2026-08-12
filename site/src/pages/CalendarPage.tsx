/** 日历页：月视图翻月 + 点选日期详情抽屉 */
import { useMemo, useState } from 'react';
import type { DayData } from '@zeji/shared';
import MonthGrid from '../components/MonthGrid';
import DayDetailDrawer from '../components/DayDetailDrawer';
import { useShared } from '../hooks/useShared';
import { useProfileStore } from '../store/profileStore';
import { daysInMonth, nextMonth, prevMonth, todayYmd, type Ymd } from '../lib/date';

export default function CalendarPage() {
  const shared = useShared();
  const { birthDate, birthHour } = useProfileStore();
  const today = todayYmd();
  const [ym, setYm] = useState<Ymd>({ y: today.y, m: today.m, d: 1 });
  const [selected, setSelected] = useState<Ymd | null>(null);

  // 整月数据：一次性懒加载 shared 后同步计算（每月 ≤31 次 buildDayData，开销很小）
  const dataByDay = useMemo(() => {
    const m = new Map<number, DayData>();
    if (!shared) return m;
    const days = daysInMonth(ym.y, ym.m);
    for (let d = 1; d <= days; d += 1) {
      m.set(d, shared.buildDayData(ym.y, ym.m, d));
    }
    return m;
  }, [shared, ym.y, ym.m]);

  const selectedBundle = useMemo(() => {
    if (!shared || !selected) return null;
    const dayData = shared.buildDayData(selected.y, selected.m, selected.d);
    const profile = birthDate ? { birthDate, birthHour } : null;
    const personal = profile ? shared.computePersonal(profile) : null;
    const guide = shared.generateGuide(dayData, personal);
    return { dayData, personal, guide };
  }, [shared, selected, birthDate, birthHour]);

  if (!shared) return <div className="loading">⋯ 择吉推演中 ⋯</div>;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 20, letterSpacing: '0.2em' }}>
          {ym.y}年{ym.m}月
        </h2>
        <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setYm(prevMonth(ym.y, ym.m))}>
            上月
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setYm({ y: today.y, m: today.m, d: 1 })}>
            今月
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setYm(nextMonth(ym.y, ym.m))}>
            下月
          </button>
        </div>
      </div>

      <MonthGrid y={ym.y} m={ym.m} dataByDay={dataByDay} onPick={setSelected} />

      {selectedBundle && selected && (
        <DayDetailDrawer
          dayData={selectedBundle.dayData}
          guide={selectedBundle.guide}
          personal={selectedBundle.personal}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
