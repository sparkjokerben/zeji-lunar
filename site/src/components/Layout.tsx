import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import Seal from './Seal';

const NAV = [
  { to: '/', label: '今日' },
  { to: '/calendar', label: '日历' },
  { to: '/settings', label: '设置' },
  { to: '/about', label: '出处' },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 48px' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '20px 0 14px',
          borderBottom: '3px double var(--ink)',
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <Seal chars="择吉" />
        <div>
          <h1 style={{ fontSize: 24, letterSpacing: '0.18em' }}>择吉黄历</h1>
          <div className="note" style={{ marginTop: 2 }}>
            谨按通书 · 顺时而作
          </div>
        </div>
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-kai)',
                fontSize: 16,
                letterSpacing: '0.15em',
                color: isActive ? 'var(--cinnabar-deep)' : 'var(--ink-soft)',
                borderBottom: isActive ? '2px solid var(--cinnabar)' : '2px solid transparent',
                paddingBottom: 2,
              })}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="note" style={{ marginTop: 48, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
        <p style={{ margin: '0 0 4px' }}>
          数据基于《协纪辨方书》《玉匣记》等传统通书体系，供传统民俗文化参考，不构成任何决策依据。
        </p>
        <p style={{ margin: 0 }}>
          本网站不含任何西方占星、西方数字命理内容 · 生肖以立春为岁首（与八字年柱口径一致）
        </p>
      </footer>
    </div>
  );
}
