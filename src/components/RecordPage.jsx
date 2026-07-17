import { LEVELS } from '../data.js'
import { ArrowLeftIcon, TrashIcon } from './Icons.jsx'

const fmtDate = (ts) => {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const RecordPage = ({ user, history, badges, onDelete, onDeleteAll, onBack }) => {
  const byLevel = {}
  for (const h of history) {
    (byLevel[h.level] ??= []).push(h)
  }

  const recent = [...history].sort((a, b) => b.date - a.date).slice(0, 50)

  return (
    <div className="flex flex-col h-full bg-indigo-50 animate-fade-in overflow-hidden">
      <header className="px-4 py-3 flex items-center justify-between border-b border-indigo-100 bg-white shrink-0">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black text-indigo-600">📊 {user.name} の記録</h1>
        <button onClick={onDeleteAll} className="text-slate-300 hover:text-rose-400 p-1">
          <TrashIcon className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto scroll-y">
        <div className="max-w-md mx-auto w-full p-4 flex flex-col gap-4">
          {/* レベル別まとめ */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 mb-3">レベル別のようす</h2>
            <div className="flex flex-col gap-1.5">
              {LEVELS.map(lv => {
                const list = byLevel[lv.id] ?? []
                const bests = list.filter(h => h.accuracy === 100)
                const bestTime = bests.length ? Math.min(...bests.map(h => parseFloat(h.timeStr))) : null
                return (
                  <div key={lv.id} className="flex items-center gap-2 text-sm">
                    <span className="w-7 text-center">{lv.icon}</span>
                    <span className="text-[10px] font-black text-indigo-400 w-12 shrink-0">レベル{lv.id}</span>
                    <span className="flex-1 text-[11px] font-bold text-slate-500 truncate">{lv.title}</span>
                    <span className="text-sm w-6 text-center">{badges[lv.id] ?? ''}</span>
                    <span className="text-[11px] font-bold text-slate-400 w-14 text-right">{list.length}回</span>
                    <span className="text-[11px] font-black text-emerald-500 w-16 text-right">
                      {bestTime != null ? `${bestTime.toFixed(1)}秒` : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="text-[9px] text-slate-300 font-bold text-right mt-2">タイムは正解率100%のベスト</div>
          </div>

          {/* 履歴 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 mb-3">さいきんの記録</h2>
            {recent.length === 0 && <p className="text-center text-slate-300 font-bold py-6 text-sm">まだ記録がありません</p>}
            <div className="flex flex-col gap-1">
              {recent.map(h => (
                <div key={h.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 text-sm">
                  <span className="text-lg w-7 text-center">{h.stamp}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-black text-slate-600">
                      レベル{h.level} <span className="text-slate-400 font-bold">({h.modeType === 'flash' ? 'フラッシュ' : 'テンキー'})</span>
                    </div>
                    <div className="text-[10px] text-slate-300 font-bold">{fmtDate(h.date)}</div>
                  </div>
                  <span className="text-[11px] font-black text-slate-500">{h.timeStr}秒</span>
                  {h.modeType === 'tenkey' && (
                    <span className={`text-[11px] font-black w-10 text-right ${h.accuracy === 100 ? 'text-emerald-500' : 'text-rose-400'}`}>{h.accuracy}%</span>
                  )}
                  <button onClick={() => onDelete(h.id)} className="text-slate-200 hover:text-rose-400 p-1">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
