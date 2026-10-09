// ホーム: 6つの 単元の「みち」。いちばん 上に「つづきから」を 1つだけ 置く
// (つぎに 何を するかを 毎回 6つから 選ばせない)。
import { UNITS, getUnit, getLevel, levelLabel } from '../units/index.js'
import { badgeKey } from '../store.js'
import { MathText } from './MathText.jsx'
import { Header, PillButton, UserBadge, Path, PathStep, CardButton, WIDTH } from './ui.jsx'
import { ChartIcon, SettingsIcon, PlayIcon } from './Icons.jsx'

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥']

export const HomeScreen = ({ user, data, onOpenUnit, onStart, onOpenRecord, onOpenSettings, onSwitchUser }) => {
  const last = data.last && getUnit(data.last.unit)
  const lastLevel = last && getLevel(last, data.last.level)

  return (
    <div className="flex flex-col h-full animate-pop-in">
      <Header right={<>
        <PillButton icon={<ChartIcon className="w-5 h-5" />} label="きろく" onClick={onOpenRecord} />
        <PillButton icon={<SettingsIcon className="w-5 h-5" />} label="せってい" onClick={onOpenSettings} />
        <UserBadge user={user} onClick={onSwitchUser} />
      </>}>
        <h1 className="text-xl sm:text-2xl font-bold text-cta-700 truncate">🧮 計算カード</h1>
      </Header>

      <main className="flex-1 min-h-0 scroll-y px-4 pb-6">
        <div className={WIDTH}>
          {lastLevel && (
            <section className="mb-5">
              <h2 className="text-sm font-bold text-ink/70 mb-2">つづきから</h2>
              <button type="button" onClick={() => onStart(last.id, lastLevel.id)}
                className="w-full min-h-[64px] px-4 py-3 rounded-3xl bg-cta-600 text-white border-b-4 border-cta-800 shadow-md active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-3 text-left">
                <span className="text-3xl shrink-0" aria-hidden="true">{last.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold opacity-90">{CIRCLED[last.no - 1]} {last.title}・{levelLabel(last, lastLevel.id)}</span>
                  <span className="block text-lg font-bold truncate"><MathText text={lastLevel.title} /></span>
                </span>
                <PlayIcon className="w-7 h-7 shrink-0" />
              </button>
            </section>
          )}

          <h2 className="text-sm font-bold text-ink/70 mb-2">どれを れんしゅうする？</h2>
          <Path>
            {UNITS.map(u => {
              const levels = u.levels.filter(l => !l.mix)
              const done = levels.filter(l => data.badges[badgeKey(u.id, l.id)]).length
              return (
                <PathStep key={u.id} mark={u.no}>
                  <CardButton onClick={() => onOpenUnit(u.id)}>
                    <span className="w-14 h-14 rounded-2xl bg-cta-100 border-2 border-cta-300 grid place-items-center shrink-0 text-3xl" aria-hidden="true">{u.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-lg font-bold text-ink leading-snug">{u.title}</span>
                      <span className="block text-xs font-bold text-ink/70 mt-0.5">{u.sub}</span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-ink/70 text-right" aria-label={`💮 ${done} / ${levels.length}`}>
                      {done > 0 ? <>💮 {done}<span className="text-xs"> / {levels.length}</span></> : <span className="text-xs">{levels.length}レベル</span>}
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
