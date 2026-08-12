/** 点选日期详情抽屉：复用 TodayCard/GuideCard/HourLuckTable 渲染选中日 */
import type { DayData, GuideResult, PersonalResult } from '@zeji/shared';
import TodayCard from './TodayCard';
import GuideCard from './GuideCard';
import HourLuckTable from './HourLuckTable';

interface Props {
  dayData: DayData;
  guide: GuideResult;
  personal: PersonalResult | null;
  onClose: () => void;
}

export default function DayDetailDrawer({ dayData, guide, personal, onClose }: Props) {
  return (
    <div
      role="dialog"
      aria-label={`${dayData.solar.y}年${dayData.solar.m}月${dayData.solar.d}日黄历详情`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(47, 42, 36, 0.45)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '5vh 16px',
        zIndex: 50,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 640,
          width: '100%',
          background: 'var(--paper)',
          border: '3px double var(--ink)',
          padding: '20px 22px 28px',
          borderRadius: 2,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontSize: 18, letterSpacing: '0.15em' }}>
            {dayData.solar.y}年{dayData.solar.m}月{dayData.solar.d}日
          </h2>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '4px 14px' }}>
            关闭
          </button>
        </div>
        <TodayCard dayData={dayData} />
        <div style={{ marginTop: 24 }}>
          <GuideCard guide={guide} personal={personal} />
        </div>
        <div style={{ marginTop: 24 }}>
          <HourLuckTable dayData={dayData} />
        </div>
      </div>
    </div>
  );
}
