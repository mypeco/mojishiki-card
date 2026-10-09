// あなたの おなまえは？(プロフィール えらび・はじめの 1タップ)
// ★gakushu-ui-kit patterns/accounts-ui.md の HTML/JS を React に うつしたもの。
//   文言・アイコンの 絵柄・色の ならび・画面の 作り(一覧と 作成は 別画面)・id は 変えない。
//   変えたのは 2つだけ:
//   - タップ領域を a11y/README.md の 48px に そろえた
//     (アイコン・いろの 選択 44→48px、削除 36px の 見た目の まわりに 48px の 当たり)
//   - 小さい 字の 色を ink/50・ink/60 → ink/70 に(クリーム地で 4.5:1 に とどく いちばん うすい 色)
import { useState, useEffect, useRef } from 'react'
import { ICON_OPTIONS, COLOR_OPTIONS, MAX_USERS, colorOf } from '../store.js'
import { SparklesIcon, PlusIcon, ArrowRightIcon, TrashIcon } from './Icons.jsx'

export const ProfileScreen = ({ users, onSelect, onCreate, onDelete }) => {
  // だれも いない ときは、いきなり 作成画面を 出す(押す ものが 何も ない 画面に しない)
  const [editing, setEditing] = useState(users.length === 0)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICON_OPTIONS[0])
  const [color, setColor] = useState(COLOR_OPTIONS[0].key)
  const nameRef = useRef(null)

  useEffect(() => {
    if (users.length === 0) setEditing(true)
  }, [users.length])

  useEffect(() => {
    if (editing) setTimeout(() => nameRef.current?.focus(), 50)
  }, [editing])

  const openCreate = () => {
    setName(''); setIcon(ICON_OPTIONS[0]); setColor(COLOR_OPTIONS[0].key)
    setEditing(true)
  }

  const confirmCreate = () => {
    const n = name.trim()
    if (!n) return // 押せない はずだが 二重に 確認
    setEditing(false)
    onCreate({ name: n, icon, color })
  }

  const remove = (u, e) => {
    e.stopPropagation()
    // ★必ず confirm を はさみ、「きろくも 消える」と 明記する(accounts.md §3)
    if (!confirm(`${u.name} さんと、きろくを さくじょしますか？\nもとに もどせません。`)) return
    onDelete(u.id)
  }

  const atLimit = users.length >= MAX_USERS

  return (
    <div id="user-screen" className="h-full bg-cream overflow-y-auto scroll-y">
      {!editing ? (
        <div id="user-list-view" className="min-h-full flex flex-col items-center justify-center px-6 py-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cta-600 mb-1 flex items-center justify-center gap-2">
            <SparklesIcon className="w-7 h-7 text-highlight-500" /> 計算カード
          </h1>
          <p id="user-screen-sub" className="text-sm font-bold text-ink/70 mb-8">
            {users.length ? 'あなたの おなまえは？' : 'はじめまして！あなたの おなまえは？'}
          </p>

          <div id="user-list" className="w-full max-w-sm sm:max-w-md flex flex-col gap-4 mb-4">
            {users.map(u => {
              const c = colorOf(u.color)
              return (
                <div key={u.id} className="relative">
                  <button type="button" onClick={() => onSelect(u)}
                    className={`w-full min-h-[76px] rounded-3xl shadow-md ${c.tile} border-b-4 ${c.bborder} flex items-center gap-4 px-4 py-3 pr-14 active:border-b-0 active:translate-y-1 transition-all text-left`}>
                    <span className="w-14 h-14 rounded-full bg-white/50 grid place-items-center text-3xl shrink-0 shadow-inner">{u.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-bold text-xl truncate">{u.name}</span>
                      <span className="block text-xs font-bold opacity-70 mt-0.5">Let's Play!</span>
                    </span>
                    <ArrowRightIcon className="w-6 h-6 opacity-50 shrink-0" />
                  </button>
                  <button type="button" onClick={e => remove(u, e)} aria-label={`${u.name}を けす`}
                    className="absolute -top-3 -right-3 w-12 h-12 grid place-items-center">
                    <span className="w-9 h-9 rounded-full bg-card border-2 border-ink/15 text-ink/60 grid place-items-center shadow-sm">
                      <TrashIcon className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              )
            })}
          </div>

          {!atLimit && (
            <button id="user-add-btn" type="button" onClick={openCreate}
              className="w-full max-w-sm sm:max-w-md min-h-[64px] rounded-3xl border-4 border-dashed border-ink/20 text-ink/70 font-bold flex flex-col items-center justify-center gap-2 py-5 active:scale-[.98] transition">
              <span className="w-10 h-10 rounded-full bg-ink/10 grid place-items-center"><PlusIcon className="w-5 h-5" /></span>
              あたらしく つくる
            </button>
          )}
          {atLimit && <p id="user-limit-note" className="text-xs font-bold text-ink/70 mt-2">※ 3にん まで つくれるよ</p>}

          <p className="mt-6 text-xs font-bold text-ink/70 leading-relaxed max-w-xs">
            音が 出ます。まわりが 気に なる ときは イヤホンを つけてね。
          </p>
        </div>
      ) : (
        <div id="user-edit-view" className="min-h-full flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm sm:max-w-md bg-card border-4 border-ink/10 rounded-3xl p-6 shadow-xl text-left">
            <h2 id="user-edit-title" className="text-xl font-bold text-center mb-6 text-ink">あたらしく つくる</h2>

            <label htmlFor="user-name-input" className="block text-xs font-bold text-ink/70 mb-1.5">なまえ(よびなで いいよ)</label>
            <input id="user-name-input" ref={nameRef} type="text" maxLength={10} placeholder="たろう" autoComplete="off"
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) confirmCreate() }}
              className="w-full min-h-[52px] rounded-2xl border-2 border-ink/15 px-4 text-xl font-bold text-ink text-center mb-5 focus:border-cta-400 outline-none" />

            <div className="text-xs font-bold text-ink/70 mb-1.5">アイコン</div>
            <div id="user-icon-picker" className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-cream rounded-xl border border-ink/10 mb-5">
              {ICON_OPTIONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)} aria-label={ic} aria-pressed={ic === icon}
                  className={`w-12 h-12 rounded-lg text-2xl grid place-items-center transition ${ic === icon ? 'bg-white shadow-md scale-110 border-2 border-cta-400' : 'hover:bg-white/60'}`}>
                  {ic}
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-ink/70 mb-1.5">いろ</div>
            <div id="user-color-picker" className="flex flex-wrap gap-3 justify-center mb-6">
              {COLOR_OPTIONS.map(c => (
                <button key={c.key} type="button" onClick={() => setColor(c.key)} aria-label={c.label} aria-pressed={c.key === color}
                  className={`w-12 h-12 rounded-full border-2 ${c.dot} transition ${c.key === color ? 'ring-4 ring-offset-2 ring-cta-200 scale-110 border-cta-500' : 'border-transparent opacity-70'}`} />
              ))}
            </div>

            <div className="flex gap-3">
              {users.length > 0 && (
                <button id="user-create-cancel" type="button" onClick={() => setEditing(false)}
                  className="flex-1 min-h-[48px] rounded-2xl border-2 border-ink/15 text-ink/70 font-bold active:translate-y-0.5 transition-all">やめる</button>
              )}
              <button id="user-create-confirm" type="button" disabled={!name.trim()} onClick={confirmCreate}
                className="flex-1 min-h-[48px] rounded-2xl bg-cta-600 text-white font-bold border-b-4 border-cta-800 disabled:opacity-40 disabled:pointer-events-none active:border-b-2 active:translate-y-0.5 transition-all">けってい</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
