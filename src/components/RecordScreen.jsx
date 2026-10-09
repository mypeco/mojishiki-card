// きろく。単元ごとの ようすと、さいきんの きろく。
// ★くらべる 相手は 本人の 過去 だけ(ほかの 人の きろくは 出さない)。
// 「保護者・教育者の方へ」は 支援者エリアの 色(support)で 分ける。
import { UNITS, getUnit, levelLabel } from '../units/index.js'
import { badgeKey } from '../store.js'
import { MathText } from './MathText.jsx'
import { Header, WIDTH } from './ui.jsx'
import { TrashIcon } from './Icons.jsx'

const fmtDate = (ts) => {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥']

export const RecordScreen = ({ user, data, onBack, onDelete, onDeleteAll }) => {
  const history = data.history
  const recent = [...history].sort((a, b) => b.date - a.date).slice(0, 50)

  return (
    <div className="flex flex-col h-full animate-pop-in">
      <Header onBack={onBack}>
        <h1 className="text-xl font-bold text-ink truncate">{user.icon} {user.name} の きろく</h1>
      </Header>

      <main className="flex-1 min-h-0 scroll-y px-4 pb-8">
        <div className={`${WIDTH} flex flex-col gap-5`}>
          {/* 単元ごとの ようす(やった レベル だけ 出す) */}
          <section className="bg-card rounded-3xl border-2 border-ink/10 p-4">
            <h2 className="text-base font-bold text-ink mb-3">単元ごとの ようす</h2>
            <div className="flex flex-col gap-4">
              {UNITS.map(u => {
                const rows = u.levels.map(lv => {
                  const list = history.filter(h => h.unit === u.id && h.level === lv.id)
                  const perfect = list.filter(h => h.modeType === 'tenkey' && h.accuracy === 100)
                  const best = perfect.length ? Math.min(...perfect.map(h => parseFloat(h.timeStr))) : null
                  return { lv, count: list.length, best, badge: data.badges[badgeKey(u.id, lv.id)] }
                }).filter(r => r.count > 0)
                return (
                  <div key={u.id}>
                    <h3 className="text-sm font-bold text-ink/80 mb-1">{u.icon} {CIRCLED[u.no - 1]} {u.title}</h3>
                    {rows.length === 0 ? (
                      <p className="text-xs font-bold text-ink/70 pl-2">まだ</p>
                    ) : (
                      <table className="w-full text-sm">
                        <tbody>
                          {rows.map(({ lv, count, best, badge }) => (
                            <tr key={lv.id} className="border-t border-ink/5">
                              <td className="py-1.5 pr-2 text-xs font-bold text-ink/70 whitespace-nowrap">{levelLabel(u, lv.id)}</td>
                              <td className="py-1.5 pr-2 font-bold text-ink"><MathText text={lv.title} /></td>
                              <td className="py-1.5 w-8 text-center">{badge ?? ''}</td>
                              <td className="py-1.5 w-12 text-right text-xs font-bold text-ink/70 whitespace-nowrap">{count}回</td>
                              <td className="py-1.5 w-16 text-right text-xs font-bold text-ink whitespace-nowrap">{best != null ? `${best.toFixed(1)}秒` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-xs font-bold text-ink/70 text-right mt-3">秒 … テンキーで ぜんぶ 1かいめで せいかい した ときの いちばん 短い 時間</p>
          </section>

          {/* さいきんの きろく */}
          <section className="bg-card rounded-3xl border-2 border-ink/10 p-4">
            <h2 className="text-base font-bold text-ink mb-2">さいきんの きろく</h2>
            {recent.length === 0 && <p className="text-center text-sm font-bold text-ink/70 py-6">まだ きろくが ありません</p>}
            <ul className="flex flex-col">
              {recent.map(h => {
                const u = getUnit(h.unit)
                return (
                  <li key={h.id} className="flex items-center gap-3 py-1.5 border-t border-ink/5">
                    <span className="text-xl w-8 text-center shrink-0" aria-hidden="true">{h.stamp}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-ink truncate">
                        {u ? `${CIRCLED[u.no - 1]} ${u.title}・${levelLabel(u, h.level)}` : h.unit}
                        <span className="text-ink/70">({h.modeType === 'flash' ? 'フラッシュ' : 'テンキー'})</span>
                      </div>
                      <div className="text-xs font-bold text-ink/70">{fmtDate(h.date)}</div>
                    </div>
                    <span className="text-sm font-bold text-ink whitespace-nowrap">{h.timeStr}秒</span>
                    <span className="text-sm font-bold text-ink w-16 text-right whitespace-nowrap">
                      {h.modeType === 'tenkey' ? (h.retried ? `${h.accuracy}→100%` : `${h.accuracy}%`) : ''}
                    </span>
                    <button type="button" onClick={() => onDelete(h.id)} aria-label="この きろくを けす"
                      className="w-12 h-12 shrink-0 rounded-full text-ink/60 grid place-items-center active:bg-ink/5">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* 保護者・教育者の方へ(patterns/accounts.md §7) */}
          <section className="bg-support-50 rounded-3xl border-2 border-support-200 p-4 text-support-800">
            <h2 className="text-base font-bold mb-2">保護者・教育者の方へ</h2>
            <ul className="list-disc pl-5 text-sm font-bold leading-relaxed space-y-1">
              <li>記録は この端末の ブラウザの 中に だけ あります(サーバーには 送っていません)。</li>
              <li>ブラウザの データを 消すと、記録も 消えます。端末を またいで 持ち運ぶ ことは できません。</li>
              <li>% は「1回目で 正解した 問題の 割合」です。フラッシュは 本人の 自己申告なので % を 出していません。</li>
              <li>記録は 1人 300件まで 残り、それより 古いものから 消えます。</li>
            </ul>
            <button type="button" onClick={onDeleteAll}
              className="mt-4 min-h-[48px] px-4 rounded-2xl bg-card border-2 border-support-300 border-b-4 border-b-support-500 text-support-800 font-bold text-sm flex items-center gap-2 active:border-b-2 active:translate-y-0.5 transition-all">
              <TrashIcon className="w-5 h-5" /> この人の きろくを ぜんぶ けす
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}
