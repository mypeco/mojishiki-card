// おわりの 画面。
// ★観察した ことを 言い、どう 感じるべきかは 言わない(patterns/semantics.md §6)。
//   「すごい！」では なく「10もん中 8もん、1かいめで せいかい」。
//   くらべる 相手は 本人の 前の 回 だけ。
import { useEffect } from 'react'
import { levelLabel } from '../units/index.js'
import { sound } from '../lib/sound.js'
import { MathText, QuestionWithAnswer } from './MathText.jsx'
import { PrimaryButton, SecondaryButton } from './ui.jsx'
import { RotateIcon } from './Icons.jsx'

export const ResultScreen = ({ unit, level, result, prev, device, onRetry, onRetryWrong, onBack }) => {
  useEffect(() => { if (device.sound) sound.finish() }, [])

  const sec = (result.timeMs / 1000).toFixed(1)
  const isFlash = result.modeType === 'flash'
  const all = result.firstTry === result.total
  const stamp = result.stamp

  return (
    <div className="h-full scroll-y px-4 py-6">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto flex flex-col items-center gap-5 animate-pop-in">
        <div className="text-center">
          <div className="text-sm font-bold text-ink/70">{unit.title}・{levelLabel(unit, level.id)}{result.isRetry ? '(解き直し)' : ''}</div>
          <div className="text-lg font-bold text-ink"><MathText text={level.title} /></div>
        </div>

        {stamp && <div className="text-[5.5rem] leading-none select-none" role="img" aria-label={all ? 'ぜんぶ 1かいめで せいかい' : 'おわり'}>{stamp}</div>}

        <div className="w-full max-w-sm bg-card rounded-3xl border-2 border-ink/10 border-b-4 shadow-md p-5 flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-bold text-ink/70">{isFlash ? '「あってた」' : '1かいめで せいかい'}</span>
            <span className="text-3xl font-bold text-ink">{result.firstTry}<span className="text-base"> / {result.total}もん</span></span>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t-2 border-ink/10 pt-3">
            <span className="text-sm font-bold text-ink/70">かかった 時間</span>
            <span className="text-3xl font-bold text-ink">{sec}<span className="text-base"> びょう</span></span>
          </div>
          {prev && (
            <div className="text-sm font-bold text-ink/70 border-t-2 border-ink/10 pt-3">
              まえの 回: {prev.firstTry != null ? `${prev.firstTry} / ${prev.total}もん・` : `${prev.accuracy}%・`}{prev.timeStr}びょう
            </div>
          )}
        </div>

        {result.wrongList.length > 0 && (
          <div className="w-full max-w-sm">
            <h2 className="text-sm font-bold text-ink/70 mb-2">{isFlash ? '「ちがった」' : 'まちがえた'} 問題と 答え</h2>
            <ul className="bg-card rounded-2xl border-2 border-ink/10 divide-y-2 divide-ink/5">
              {result.wrongList.map((q, i) => (
                <li key={i} className="px-4 py-2.5 text-lg font-bold text-ink flex flex-wrap items-center gap-x-2">
                  {q.lead && <span className="text-xs text-ink/70 w-full">{q.lead}</span>}
                  <span><QuestionWithAnswer q={q} /></span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="w-full max-w-sm flex flex-col gap-3">
          {result.wrongList.length > 0 && (
            <SecondaryButton className="w-full min-h-[56px] text-base" onClick={onRetryWrong}>
              <RotateIcon className="w-5 h-5" /> {isFlash ? '「ちがった」' : 'まちがえた'} 問題を もう一度
            </SecondaryButton>
          )}
          <PrimaryButton className="w-full" onClick={onRetry}>ちがう 問題で もう一度</PrimaryButton>
          <button type="button" onClick={onBack}
            className="w-full min-h-[48px] rounded-2xl border-2 border-ink/15 text-ink/80 font-bold active:translate-y-0.5 transition-all">
            レベルを えらぶ
          </button>
        </div>
      </div>
    </div>
  )
}
