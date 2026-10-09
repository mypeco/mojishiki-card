// 画面を またいで 使う 部品。見た目の 決めごとは gakushu-ui-kit patterns/components.md が 正。
import { useEffect } from 'react'
import { colorOf } from '../store.js'
import { ArrowLeftIcon, XIcon } from './Icons.jsx'

// 一覧・問題画面の はば(patterns/layout.md。広げすぎない)
export const WIDTH = 'w-full max-w-md lg:max-w-2xl mx-auto'

// 画面の 上の 帯。もどるボタンは いつも 左はし
export const Header = ({ onBack, backLabel = 'もどる', children, right }) => (
  <header className="shrink-0 px-4 pt-3 pb-2">
    <div className={`${WIDTH} flex items-center gap-3`}>
      {onBack && (
        <button type="button" onClick={onBack} aria-label={backLabel} title={backLabel}
          className="w-12 h-12 shrink-0 rounded-full bg-card border-2 border-ink/15 border-b-4 border-b-ink/25 text-ink/70 grid place-items-center active:border-b-2 active:translate-y-0.5 transition-all">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
      )}
      <div className="flex-1 min-w-0">{children}</div>
      {right && <div className="flex items-center gap-3 shrink-0">{right}</div>}
    </div>
  </header>
)

// ことばつきの 小さい ボタン(ヘッダー用)。せまい 画面では アイコン だけ
export const PillButton = ({ icon, label, onClick, tone = 'neutral' }) => {
  const tones = {
    neutral: 'bg-card border-ink/15 border-b-ink/25 text-ink/80',
    hint: 'bg-highlight-50 border-highlight-300 border-b-highlight-500 text-highlight-800',
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className={`min-h-[48px] min-w-[48px] px-3 rounded-full border-2 border-b-4 font-bold text-sm flex items-center justify-center gap-1.5 active:border-b-2 active:translate-y-0.5 transition-all ${tones[tone]}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

// いま だれが つかって いるか。押すと「あなたの おなまえは？」に もどる
export const UserBadge = ({ user, onClick }) => {
  const c = colorOf(user.color)
  return (
    <button type="button" onClick={onClick}
      className={`w-12 h-12 shrink-0 rounded-full ${c.tile} border-2 ${c.ring} grid place-items-center text-xl active:scale-95 transition`}
      aria-label={`${user.name}(べつの 人に かえる)`} title={user.name}>
      {user.icon}
    </button>
  )
}

// 押しボタン(patterns/components.md §1)
export const PrimaryButton = ({ children, onClick, className = '', disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    className={`min-h-[56px] px-5 rounded-2xl bg-cta-600 text-white font-bold text-base border-b-4 border-cta-800 shadow-md active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none ${className}`}>
    {children}
  </button>
)

export const SecondaryButton = ({ children, onClick, className = '' }) => (
  <button type="button" onClick={onClick}
    className={`min-h-[48px] px-4 rounded-2xl bg-cta-50 border-2 border-cta-300 border-b-4 border-b-cta-500 text-cta-700 font-bold text-sm active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 ${className}`}>
    {children}
  </button>
)

// モーダル/ボトムシート(patterns/components.md §7)。
// 説明・設定の シートなので、✕・うしろを 押す・Escape の どれでも 閉じる。
export const Sheet = ({ title, titleIcon, onClose, children, footer }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 bg-ink/50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-card w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl border-2 border-ink/10 max-h-[92dvh] overflow-y-auto scroll-y animate-rise-in">
        <div className="flex items-center gap-3 mb-4">
          <h2 id="sheet-title" className="flex-1 text-lg font-bold text-ink flex items-center gap-2">{titleIcon}{title}</h2>
          <button type="button" onClick={onClose} aria-label="とじる"
            className="w-12 h-12 shrink-0 rounded-full bg-ink/5 text-ink/70 grid place-items-center active:translate-y-0.5 transition-all">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {children}
        {footer && <div className="mt-5">{footer}</div>}
      </div>
    </div>
  )
}

// 設定の トグル(patterns/components.md §8)
export const Toggle = ({ label, note, checked, onChange }) => (
  <label className="flex items-center gap-3 py-3.5 cursor-pointer min-h-[56px]">
    <span className="flex-1 min-w-0">
      <span className="block text-base font-bold text-ink">{label}</span>
      {note && <span className="block text-xs font-bold text-ink/70 mt-0.5">{note}</span>}
    </span>
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="w-14 h-8 shrink-0 rounded-full bg-ink/20 peer-checked:bg-success-500 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-cta-600 transition relative border-2 border-ink/10">
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : ''}`} />
    </span>
  </label>
)

// みち(patterns/components.md §3)。縦に 番号つきで つなぐ
export const Path = ({ children }) => (
  <div className="relative">
    <div className="absolute left-5 top-6 bottom-8 w-1 rounded-full bg-ink/10" aria-hidden="true" />
    {children}
  </div>
)

// ★番号の 丸は ぜんぶ 同じ 色。できた しるしは カードの 中の 💮 だけが 言う(ものさしは 1本)
export const PathStep = ({ mark, children }) => (
  <div className="relative pl-14 pb-3">
    <span className="absolute left-0 top-4 z-10 w-11 h-11 rounded-full bg-cta-600 text-white text-lg font-bold grid place-items-center shadow-sm border-4 border-cream">
      {mark}
    </span>
    {children}
  </div>
)

// カード型の 選ぶ ボタン(patterns/components.md §2)
export const CardButton = ({ onClick, children, className = '' }) => (
  <button type="button" onClick={onClick}
    className={`w-full min-h-[76px] p-3.5 rounded-3xl text-left bg-card border-2 border-cta-300 border-b-4 border-b-cta-600 shadow-sm active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-3 ${className}`}>
    {children}
  </button>
)
