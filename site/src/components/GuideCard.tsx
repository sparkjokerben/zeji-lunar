/** 今日指南 + 个性化（幸运色/数字/喜神方位） */
import type { GuideResult, PersonalResult } from '@zeji/shared';

const WX_COLOR_VAR: Record<string, string> = {
  青: 'var(--wx-green)',
  赤: 'var(--wx-red)',
  黄: 'var(--wx-yellow)',
  白: 'var(--wx-white)',
  黑: 'var(--wx-black)',
};

export default function GuideCard({
  guide,
  personal,
}: {
  guide: GuideResult;
  personal: PersonalResult | null;
}) {
  return (
    <section className="card">
      <h2
        style={{
          fontSize: 16,
          letterSpacing: '0.2em',
          color: 'var(--cinnabar-deep)',
          marginBottom: 12,
        }}
      >
        今日指南
      </h2>

      <p
        style={{
          fontFamily: 'var(--font-kai)',
          fontSize: 17,
          lineHeight: 2.1,
          margin: 0,
          textAlign: 'justify',
        }}
      >
        {guide.text}
      </p>

      {personal && (
        <div style={{ display: 'flex', gap: 28, marginTop: 16, flexWrap: 'wrap' }}>
          <div>
            <span className="note" style={{ color: 'var(--ink-faint)' }}>
              幸运色
            </span>{' '}
            <span
              style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                background: WX_COLOR_VAR[personal.luckyColor.name] ?? 'var(--wx-black)',
                border: '1px solid var(--line)',
                verticalAlign: '-3px',
                marginRight: 6,
                borderRadius: 2,
              }}
            />
            <span style={{ fontFamily: 'var(--font-kai)' }}>{personal.luckyColor.name}</span>
          </div>
          <div>
            <span className="note" style={{ color: 'var(--ink-faint)' }}>
              幸运数字
            </span>{' '}
            <span style={{ fontFamily: 'var(--font-kai)' }}>
              {personal.luckyNumbers.join('、')}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
