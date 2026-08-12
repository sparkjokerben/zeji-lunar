/** 今日页：黄历卡片 + 指南 + 十二时辰 */
import { useMemo } from 'react';
import TodayCard from '../components/TodayCard';
import GuideCard from '../components/GuideCard';
import HourLuckTable from '../components/HourLuckTable';
import { useShared } from '../hooks/useShared';
import { useProfileStore } from '../store/profileStore';
import { todayYmd } from '../lib/date';
import { Link } from 'react-router-dom';

export default function TodayPage() {
  const shared = useShared();
  const { birthDate, birthHour } = useProfileStore();
  const today = todayYmd();

  const bundle = useMemo(() => {
    if (!shared) return null;
    const dayData = shared.buildDayData(today.y, today.m, today.d);
    const profile = birthDate ? { birthDate, birthHour } : null;
    const personal = profile ? shared.computePersonal(profile) : null;
    const guide = shared.generateGuide(dayData, personal);
    return { dayData, personal, guide };
  }, [shared, today.y, today.m, today.d, birthDate, birthHour]);

  if (!bundle) return <div className="loading">⋯ 择吉推演中 ⋯</div>;

  const { dayData, personal, guide } = bundle;

  return (
    <>
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
