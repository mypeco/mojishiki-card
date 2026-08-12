import { useEffect } from 'react'
import { soundService } from '../data.js'

export const ResultScreen = ({ result, modeType, onRetry, onHome, onRetryChallenge, settings }) => {
  useEffect(() => {
    if (settings?.isSoundEnabled !== false) soundService.playFinish()
  }, [])
  const sec = (result.timeMs / 1000).toFixed(1)
  const accuracy = Math.max(0, Math.round(((result.total - result.mistakeCount) / result.total) * 100))

  let stamp = '👍', msg = 'よくがんばった！'
  if (accuracy === 100) { stamp = '💮'; msg = 'パーフェクト！' }
  else if (accuracy >= 80) { stamp = '🎉'; msg = 'その調子！' }
  if (modeType === 'flash') { stamp = '⚡'; msg = 'スピードアップ！' }

  const hasMistakes = result.wrongList?.length > 0

  return (
    <div className="flex flex-col items-center justify-center h-full bg-teal-50 animate-pop p-6">
      <div className="text-[7rem] animate-bounce mb-2 select-none filter drop-shadow-md">{stamp}</div>
      <h2 className="text-2xl font-black text-teal-600 mb-4">{msg}</h2>

      <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-lg mb-4">
        <div className="flex justify-between items-end border-b border-teal-100 pb-2 mb-2">
          <span className="text-slate-400 font-bold text-sm">タイム</span>
          <span className="text-4xl font-black text-slate-700">{sec}<span className="text-base font-normal ml-1">秒</span></span>
        </div>
        {modeType === 'tenkey' && (
          <div className="flex justify-between items-end">
            <span className="text-slate-400 font-bold text-sm">正解率</span>
            <span className={`text-4xl font-black ${accuracy === 100 ? 'text-emerald-500' : 'text-rose-400'}`}>{accuracy}<span className="text-base font-normal ml-1">%</span></span>
          </div>
        )}
      </div>

      {hasMistakes && onRetryChallenge && (
        <button onClick={onRetryChallenge}
          className="w-full max-w-xs py-4 mb-3 bg-rose-400 text-white rounded-2xl font-black text-lg shadow-lg border-b-4 border-rose-600 active:border-b-0 active:translate-y-1 transition-all">
          🔄 まちがえた問題にリベンジ
        </button>
      )}

      <div className="flex gap-4 w-full max-w-xs">
        <button onClick={onHome} className="flex-1 py-4 bg-slate-400 text-white rounded-2xl font-bold shadow-md active:translate-y-1">もどる</button>
        <button onClick={onRetry} className="flex-1 py-4 bg-teal-400 text-white rounded-2xl font-bold shadow-md active:translate-y-1">もう一度</button>
      </div>
    </div>
  )
}
