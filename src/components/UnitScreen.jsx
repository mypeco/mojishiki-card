// 単元の 中の レベルの「みち」と、答え方(テンキー/フラッシュ)の きりかえ
import { levelNo } from '../units/index.js'
import { badgeKey } from '../store.js'
import { MathText } from './MathText.jsx'
import { Header, Path, PathStep, CardButton, WIDTH } from './ui.jsx'

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥']

const MODES = [
  ['tenkey', 'テンキー', 'キーで 答えを 入れる'],
  ['flash', 'フラッシュ', 'めくって 答えを 見る'],
]

export const UnitScreen = ({ unit, data, onBack, onStart, onChangeMode }) => {
  const counts = {}
  for (const h of data.history) if (h.unit === unit.id) counts[h.level] = (counts[h.level] ?? 0) + 1

  return (
    <div className="flex flex-col h-full animate-pop-in">
      <Header onBack={onBack} backLabel="単元を えらぶ">
        <h1 className="text-xl sm:text-2xl font-bold text-ink truncate">
          <span aria-hidden="true">{unit.icon} </span>{CIRCLED[unit.no - 1]} {unit.title}
        </h1>
      </Header>

      <main className="flex-1 min-h-0 scroll-y px-4 pb-6">
        <div className={WIDTH}>
          {/* 答え方 */}
          <div className="flex gap-3 mb-5" role="radiogroup" aria-label="答え方">
            {MODES.map(([k, label, note]) => {
              const on = data.modeType === k
              return (
                <button key={k} type="button" role="radio" aria-checked={on} onClick={() => onChangeMode(k)}
                  className={`flex-1 min-h-[60px] px-3 py-2 rounded-2xl border-2 border-b-4 font-bold transition-all flex flex-col items-center justify-center leading-tight active:border-b-2 active:translate-y-0.5
                    ${on ? 'bg-cta-600 border-cta-700 border-b-cta-800 text-white' : 'bg-card border-ink/15 border-b-ink/25 text-ink/80'}`}>
                  <span className="text-base">{on ? '● ' : '○ '}{label}</span>
                  <span className={`text-xs mt-0.5 ${on ? 'text-white/90' : 'text-ink/70'}`}>{note}</span>
                </button>
              )
            })}
          </div>

          <Path>
            {unit.levels.map(lv => {
              const badge = data.badges[badgeKey(unit.id, lv.id)]
              const cnt = counts[lv.id] ?? 0
              return (
                <PathStep key={lv.id} mark={lv.mix ? '👑' : levelNo(unit, lv.id)}>
                  <CardButton onClick={() => onStart(unit.id, lv.id)}>
                    <span className="flex-1 min-w-0">
                      <span className="block text-lg font-bold text-ink leading-snug"><MathText text={lv.title} /></span>
                      <span className="block text-sm font-bold text-ink/70 mt-0.5"><MathText text={lv.desc} /></span>
                    </span>
                    <span className="shrink-0 flex flex-col items-end gap-0.5 text-right">
                      {badge && <span className="text-2xl leading-none" role="img" aria-label="ぜんぶ 1かいめで せいかい">{badge}</span>}
                      <span className="text-xs font-bold text-ink/70">{cnt > 0 ? `${cnt}回` : 'まだ'}</span>
                    </span>
                  </CardButton>
                </PathStep>
              )
            })}
          </Path>
        </div>
      </main>
    </div>
  )
}
