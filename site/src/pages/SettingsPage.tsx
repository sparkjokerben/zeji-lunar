/** 设置页：生辰 → 个性化预览（生肖/四柱/日主/强弱/喜用/幸运色数）+ 本地保存 + 云端同步 */
import { useMemo, useState } from 'react';
import { apiAvailable, sendTestEmail, syncSettings, type SyncResult } from '../api';
import { useProfileStore } from '../store/profileStore';
import { useShared } from '../hooks/useShared';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function SettingsPage() {
  const shared = useShared();
  const { birthDate, birthHour, setProfile } = useProfileStore();
  const [date, setDate] = useState(birthDate);
  const [hour, setHour] = useState<number | null>(birthHour);
  const [status, setStatus] = useState<SyncResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [mailStatus, setMailStatus] = useState<SyncResult | null>(null);
  const [sendingMail, setSendingMail] = useState(false);

  const profile = date ? { birthDate: date, birthHour: hour } : null;

  const personal = useMemo(() => {
    if (!shared || !profile) return null;
    return shared.computePersonal(profile);
  }, [shared, profile]);

  const saveLocal = () => {
    setProfile(profile ?? { birthDate: '', birthHour: null });
    setStatus({ ok: true, message: '已保存到本机浏览器（localStorage）' });
  };

  const saveSync = async () => {
    if (!profile) return;
    setSaving(true);
    setProfile(profile);
    const r = await syncSettings(profile);
    setStatus(r);
    setSaving(false);
  };

  const sendTest = async () => {
    setSendingMail(true);
    const r = await sendTestEmail();
    setMailStatus(r);
    setSendingMail(false);
  };

  return (
    <>
      <h2 style={{ fontSize: 20, letterSpacing: '0.2em', marginBottom: 20 }}>生辰设置</h2>

      <section className="card">
        <div className="field">
          <label htmlFor="birthDate">出生日期（公历）</label>
          <input
            id="birthDate"
            type="date"
            min="1901-01-01"
            max="2100-12-31"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="birthHour">出生时辰</label>
          <select
            id="birthHour"
            value={hour === null ? '' : hour}
            onChange={(e) => setHour(e.target.value === '' ? null : Number(e.target.value))}
          >
            <option value="">未知（按午时计）</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')} 时
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={saveLocal} disabled={!profile}>
            保存到本机
          </button>
          <button type="button" className="btn" onClick={saveSync} disabled={!profile || saving}>
            {saving ? '同步中…' : '保存并同步云端'}
          </button>
        </div>

        {!apiAvailable && (
          <p className="note" style={{ marginTop: 12 }}>
            云端同步未配置（需 VITE_AUTH_TOKEN 环境变量），仅本机保存。
          </p>
        )}
        {status && (
          <p className="note" style={{ marginTop: 12, color: status.ok ? 'var(--cinnabar-deep)' : 'var(--cinnabar)' }}>
            {status.message}
          </p>
        )}
      </section>

      {personal && (
        <section className="card" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, letterSpacing: '0.2em', color: 'var(--cinnabar-deep)', marginBottom: 14 }}>
            命理预览
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div className="note">
              <div className="muted">生肖</div>
              <div style={{ fontFamily: 'var(--font-kai)', fontSize: 18 }}>{personal.shengXiao}</div>
            </div>
            <div className="note">
              <div className="muted">四柱</div>
              <div style={{ fontFamily: 'var(--font-kai)', fontSize: 18, letterSpacing: '0.2em' }}>
                {Object.values(personal.pillars).join(' ')}
              </div>
            </div>
            <div className="note">
              <div className="muted">日主</div>
              <div style={{ fontFamily: 'var(--font-kai)', fontSize: 18 }}>
                {personal.dayMaster.gan}
                <span className="muted" style={{ marginLeft: 6 }}>
                  {personal.dayMaster.wuXing} · {personal.strength}
                </span>
              </div>
            </div>
            <div className="note">
              <div className="muted">喜用神</div>
              <div style={{ fontFamily: 'var(--font-kai)', fontSize: 18 }}>
                喜{personal.xiShen}　用{personal.yongShen}
              </div>
            </div>
            <div className="note">
              <div className="muted">幸运色 / 数字</div>
              <div style={{ fontFamily: 'var(--font-kai)', fontSize: 18 }}>
                {personal.luckyColor.name}
                <span style={{ color: 'var(--ink-soft)' }}>　{personal.luckyNumbers.join('、')}</span>
              </div>
            </div>
          </div>
          <hr className="hr" />
          <p className="note">{personal.summary}</p>
        </section>
      )}

      <section className="card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, letterSpacing: '0.2em', marginBottom: 12 }}>测试邮件</h2>
        <p className="note" style={{ marginBottom: 12 }}>
          立即把今日早报发到收件邮箱（内容与每日 07:17 自动发送一致；需先同步云端并完成 SMTP 配置）。
        </p>
        <button type="button" className="btn" onClick={sendTest} disabled={!apiAvailable || sendingMail}>
          {sendingMail ? '发送中…' : '发送今日早报测试邮件'}
        </button>
        {mailStatus && (
          <p className="note" style={{ marginTop: 12, color: mailStatus.ok ? 'var(--cinnabar-deep)' : 'var(--cinnabar)' }}>
            {mailStatus.message}
          </p>
        )}
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, letterSpacing: '0.2em', marginBottom: 12 }}>说明</h2>
        <ul className="note" style={{ paddingLeft: '1.4em', margin: 0, display: 'grid', gap: 6 }}>
          <li>
            日主强弱与喜用神为<b>简化扶抑法</b>（参考《子平真诠》），属民俗简化算法，非专业命理，仅供参考。
          </li>
          <li>生肖以立春为岁首（与八字年柱口径一致）；农历日期按传统历法（正月初一为岁首）。</li>
          <li>时辰未知时按午时计；23 时晚子时按当日八字计（库默认口径）。</li>
          <li>幸运色为《尚书·洪范》五行五色（木青、火赤、土黄、金白、水黑）；幸运数字为河图五行生成数（《周易·系辞上》，郑玄注）。</li>
          <li>同步云端后，每日早报邮件将使用该生辰计算个性化条目。</li>
        </ul>
      </section>
    </>
  );
}
