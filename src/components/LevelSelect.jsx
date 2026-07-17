import { LEVELS } from '../data.js'
import { ExprText } from './GameScreen.jsx'
import { ArrowLeftIcon, Volume2Icon, VolumeXIcon } from './Icons.jsx'

export const LevelSelect = ({ user, settings, onUpdateSettings, badges, counts, onStart, onOpenRecord, onBack }) => {
  const modeType = settings.modeType ?? 'tenkey'
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-50 to-violet-50 animate-fade-in overflow-hidden">
      {/* ヘッダー */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
        <button onClick={onBack} className="text-slate-400 active:text-slate-600 p-1">
          <ArrowLeftIcon className="w-7 h-7" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-3xl">{user.icon}</span>
          <span className="text-xl font-black text-slate-600 truncate">{user.name}、<span className="text-indigo-500">レベルを選ぼう！</span></span>
        </div>
        <button onClick={() => onUpdateSettings({ ...settings, isSoundEnabled: !settings.isSoundEnabled })}
          className={`p-2 rounded-xl border-2 transition-all ${settings.isSoundEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
          {settings.isSoundEnabled ? <Volume2Icon className="w-5 h-5" /> : <VolumeXIcon className="w-5 h-5" />}
        </button>
        <button onClick={onOpenRecord}
          className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-500 text-xs font-bold active:bg-slate-50">
          📊 記録
        </button>
      </header>

      {/* 答え方の切り替え */}
      <div className="px-4 pb-2 shrink-0">
        <div className="max-w-md mx-auto flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm">
          <span className="text-xs font-black text-slate-400 px-2 shrink-0">答え方</span>
          {[['tenkey', '⌨️ テンキー', 'キーで式を入力'], ['flash', '⚡ フラッシュ', 'タップでめくる']].map(([k, l, d]) => (
            <button key={k} onClick={() => onUpdateSettings({ ...settings, modeType: k })}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all flex flex-col items-center leading-tight
                ${modeType === k ? 'bg-indigo-500 text-white shadow' : 'bg-slate-50 text-slate-400'}`}>
              <span>{l}</span>
              <span className={`text-[9px] font-bold ${modeType === k ? 'text-indigo-100' : 'text-slate-300'}`}>{d}</span>
            </button>
          ))}
        </div>
      </div>

      {/* レベル一覧 */}
      <div className="flex-1 overflow-y-auto scroll-y">
        <div className="max-w-md mx-auto w-full p-4 pt-2 flex flex-col gap-2.5">
          {LEVELS.map(lv => {
            const badge = badges[lv.id]
            const cnt = counts[lv.id] ?? 0
            return (
              <button key={lv.id} onClick={() => onStart(lv.id)}
                className="bg-white rounded-2xl px-4 py-3 shadow-sm border-b-4 border-indigo-100 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-3 text-left">
                <div className="text-3xl shrink-0 w-10 text-center">{lv.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black text-indigo-400 shrink-0">レベル{lv.id}</span>
                    <span className="font-black text-slate-700 text-sm truncate">{lv.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold truncate">{lv.desc}</div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <span className="text-slate-500 font-black text-sm bg-indigo-50 rounded-lg px-2 py-0.5">
                    <ExprText text={lv.example} />
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 h-4 flex items-center gap-1">
                    {badge && <span className="text-sm">{badge}</span>}
                    {cnt > 0 ? `${cnt}回チャレンジ` : 'まだ'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
