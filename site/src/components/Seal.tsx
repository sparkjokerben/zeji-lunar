/** 朱砂印章装饰：两字竖排 */
export default function Seal({ chars, size = 44 }: { chars: string; size?: number }) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        background: 'var(--cinnabar)',
        color: '#F6F1E4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        boxShadow: 'inset 0 0 0 2px rgba(246,241,228,0.55)',
      }}
    >
      <span
        style={{
          writingMode: 'vertical-rl',
          fontFamily: 'var(--font-kai)',
          fontSize: size * 0.42,
          letterSpacing: '0.05em',
          lineHeight: 1.15,
        }}
      >
        {chars}
      </span>
    </div>
  );
}
