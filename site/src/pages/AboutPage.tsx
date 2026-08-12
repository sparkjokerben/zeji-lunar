/** 出处页：数据来源与古籍出处（与 docs/sources.md 保持一致） */

const SOURCES: { data: string; source: string; carrier: string }[] = [
  {
    data: '公历↔农历转换、节气',
    source: '紫金山天文台《中国天文年历》、香港天文台公历农历对照表体系',
    carrier: 'lunar-typescript 算法依据',
  },
  {
    data: '宜忌、值神、冲煞、建除十二值星、九星、二十八宿、吉神方位、黄黑道时辰',
    source: '传统通书体系：《协纪辨方书》（乾隆钦定）、《玉匣记》、《象吉通书》',
    carrier: 'lunar-typescript',
  },
  {
    data: '八字、十神、日主、喜用神（强弱取用为本站自实现简化逻辑）',
    source: '子平法：《渊海子平》《三命通会》《子平真诠》；《滴天髓》',
    carrier: 'lunar-typescript + 本站 personal 模块',
  },
  {
    data: '五行五色（幸运色）',
    source: '《尚书·洪范》"一曰水，二曰火，三曰木，四曰金，五曰土"及五行五色配属',
    carrier: '本站 elements 模块',
  },
  {
    data: '河图数（幸运数字）',
    source: '《周易·系辞上》"天一地二，天三地四……"；五行生成数（郑玄注）',
    carrier: '本站 elements 模块',
  },
  {
    data: '生肖六冲避讳',
    source: '十二地支相冲（子午、丑未、寅申、卯酉、辰戌、巳亥），《五行大义》《淮南子·天文训》',
    carrier: '本站 elements 模块',
  },
  {
    data: '彭祖百忌',
    source: '彭祖百忌日口诀（传统择日忌用）',
    carrier: 'lunar-typescript',
  },
  {
    data: '二十四节气起居提醒',
    source: '按节气时序的传统养生语境文案（非医疗建议）',
    carrier: '本站 elements 模块',
  },
];

export default function AboutPage() {
  return (
    <>
      <h2 style={{ fontSize: 20, letterSpacing: '0.2em', marginBottom: 20 }}>数据来源与口径</h2>

      <section className="card">
        <p className="note" style={{ margin: 0 }}>
          本网站所有黄历内容均依据中国古籍与传统通书体系，计算由开源库
          <b> lunar-typescript</b>（MIT，作者 6tail）与本站自有模块完成，不重复造轮子；
          全站不包含任何西方占星、西方数字命理内容。
        </p>
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '3px double var(--ink)', fontFamily: 'var(--font-kai)' }}>
                <th style={{ textAlign: 'left', padding: '6px 10px', letterSpacing: '0.1em' }}>数据</th>
                <th style={{ textAlign: 'left', padding: '6px 10px', letterSpacing: '0.1em' }}>古籍出处</th>
                <th style={{ textAlign: 'left', padding: '6px 10px', letterSpacing: '0.1em' }}>载体</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((s) => (
                <tr key={s.data} style={{ borderBottom: '1px solid var(--line)', verticalAlign: 'top' }}>
                  <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{s.data}</td>
                  <td style={{ padding: '8px 10px' }}>{s.source}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{s.carrier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, letterSpacing: '0.2em', marginBottom: 12 }}>口径说明</h2>
        <ul className="note" style={{ paddingLeft: '1.4em', margin: 0, display: 'grid', gap: 6 }}>
          <li>农历日期按传统历法（正月初一为岁首）；生肖按八字年支（立春为岁首），两者口径不同属正常。</li>
          <li>时辰吉凶按黄黑道十二神（青龙、明堂、金匮、天德、玉堂、司命为黄道），见《协纪辨方书》。</li>
          <li>时辰未知按午时计；23 时晚子时按当日八字计（库默认口径）。</li>
          <li>日主强弱与喜用神采用简化扶抑法，属民俗简化算法，非专业命理。</li>
          <li>设置同步使用简单 token 鉴权（单用户场景的弱保护，非安全边界）。</li>
        </ul>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, letterSpacing: '0.2em', marginBottom: 12 }}>免责声明</h2>
        <p className="note" style={{ margin: 0 }}>
          本网站数据仅供传统民俗文化参考，不构成任何决策依据。请理性看待，
          生活安排以实际与常识为准。数据计算可能存在疏漏，如有疑义以权威古籍及专业历书为准。
        </p>
      </section>
    </>
  );
}
