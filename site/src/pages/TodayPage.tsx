/** 今日页：黄历卡片 + 指南 + 十二时辰；支持前后一天快捷切换（按钮 + 左右方向键） */
import { useEffect, useMemo, useState } from 'react';
import TodayCard from '../components/TodayCard';
import GuideCard from '../components/GuideCard';
import HourLuckTable from '../components/HourLuckTable';
import { useShared } from '../hooks/useShared';
import { useProfileStore } from '../store/profileStore';
import { addDays, isSameDay, todayYmd, type Ymd } from '../lib/date';
import { Link } from 'react-router-dom';

export default function TodayPage() {
  const shared = useShared();
  const { birthDate, birthHour } = useProfileStore();
  const today = todayYmd();
  const [date, setDate] = useState<Ymd>(today);
  const isToday = isSameDay(date, today);

  // 左右方向键快捷切换（页面内无输入框时生效）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setDate((d) => addDays(d, -1));
      else if (e.key === 'ArrowRight') setDate((d) => addDays(d, 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const bundle = useMemo(() => {
    if (!shared) return null;
    const dayData = shared.buildDayData(date.y, date.m, date.d);
    const profile = birthDate ? { birthDate, birthHour } : null;
    const personal = profile ? shared.computePersonal(profile) : null;
    const guide = shared.generateGuide(dayData, personal);
    return { dayData, personal, guide };
  }, [shared, date.y, date.m, date.d, birthDate, birthHour]);

  if (!bundle) return <div className="loading">⋯ 择吉推演中 ⋯</div>;

  const { dayData, personal, guide } = bundle;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-ghost" onClick={() => setDate(addDays(date, -1))}>
          前一天
        </button>
        <h2 style={{ fontSize: 20, letterSpacing: '0.2em' }}>
          {date.y}年{date.m}月{date.d}日
          {!isToday && <span className="note" style={{ fontSize: 14 }}>　非今日</span>}
        </h2>
        <button type="button" className="btn btn-ghost" onClick={() => setDate(addDays(date, 1))}>
          后一天
        </button>
        {!isToday && (
          <button type="button" className="btn" onClick={() => setDate(today)}>
            回今天
          </button>
        )}
      </div>

      {!personal && (
        <p className="note" style={{ marginBottom: 16 }}>
          尚未设置生辰，仅显示通书黄历。前往
          <Link to="/settings" style={{ margin: '0 4px' }}>
            设置
          </Link>
          填写生辰，可得生肖避讳与幸运色、幸运数字。
        </p>
      )}
      <TodayCard dayData={dayData} />
      <div style={{ marginTop: 24 }}>
        <GuideCard guide={guide} personal={personal} />
      </div>
      <div style={{ marginTop: 24 }}>
        <HourLuckTable dayData={dayData} />
      </div>
    </>
  );
}
