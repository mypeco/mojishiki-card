// 問題を とく 画面(テンキー/フラッシュ)
// ★急かさない: 時間は 計るが、とちゅうで 見せない・カウントダウンも しない。
// ★まちがえても 画面は 進まない。理由が あれば 添える(「なぜ ちがうか」)。
//   赤い ✕ や 下がる 音は 使わない(patterns/components.md §5)。
import { useState, useEffect, useRef, useMemo } from 'react'
import { generateQuestions, levelLabel, QUESTION_COUNT } from '../units/index.js'
import { applyKey, checkAnswer, formatAnswer, inputText } from '../lib/answer.js'
import { sound } from '../lib/sound.js'
import { MathText, visualLength } from './MathText.jsx'
import { Header, PillButton, PrimaryButton, WIDTH } from './ui.jsx'
import { DeleteIcon, LightbulbIcon, CheckIcon, FracKeyIcon, PencilIcon } from './Icons.jsx'
import { HintSheet } from './HintSheet.jsx'
import { MemoPad } from './MemoPad.jsx'
import { deviceStore, setDevice } from '../store.js'
import { layoutHissan } from '../lib/hissan.js'

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥']

// ── テンキー ───────────────────────────────────────────────────
// キーの 場所は 単元が かわっても 動かさない。要らない キーの 場所は 空ける
// (押しても 何も 起きない キーを 置かない)。
//   7 8 9 ⌫
//   4 5 6 C
//   1 2 3 [ . ／ , x ]
//   [−] 0 [+] OK
const FORM_KEYS = ['.', '/', ',', 'x']

const KEY_LABEL = {
  BS: { aria: '1もじ けす', node: <DeleteIcon className="w-8 h-8" /> },
  C: { aria: 'ぜんぶ けす', node: 'C' },
  OK: { aria: 'こたえる', node: 'OK' },
  '/': { aria: '分数', node: <FracKeyIcon className="w-8 h-8" /> },
  ',': { aria: 'くぎり', node: <span className="-mt-3">,</span> },
  '.': { aria: '小数点', node: <span className="-mt-3">.</span> },
  x: { aria: 'エックス', node: <span className="math-x">x</span> },
  '−': { aria: 'マイナス', node: '−' },
  '+': { aria: 'プラス', node: '+' },
}

const keyTone = (k) => {
  if (k === 'OK') return 'bg-cta-600 border-cta-700 border-b-cta-800 text-white text-2xl'
  if (k === 'BS' || k === 'C') return 'bg-ink/5 border-ink/15 border-b-ink/30 text-ink/80 text-2xl'
  if (/^\d$/.test(k)) return 'bg-card border-ink/15 border-b-ink/30 text-ink text-3xl'
  return 'bg-cta-50 border-cta-300 border-b-cta-500 text-cta-800 text-3xl'
}

// compact: メモを 開いて いる とき。キーを 低く して、メモに 高さを まわす(48px は 切らない)
const TenKey = ({ keys, onKey, disabled, compact }) => {
  const form = FORM_KEYS.find(k => keys.includes(k)) ?? null
  const layout = [
    '7', '8', '9', 'BS',
    '4', '5', '6', 'C',
    '1', '2', '3', form,
    keys.includes('−') ? '−' : null, '0', keys.includes('+') ? '+' : null, 'OK',
  ]
  return (
    <div className="grid grid-cols-4 gap-3 w-full">
      {layout.map((k, i) => (k === null
        ? <div key={`sp${i}`} aria-hidden="true" />
        : (
          <button key={k} type="button" disabled={disabled} onClick={() => onKey(k)}
            aria-label={KEY_LABEL[k]?.aria ?? k}
            className={`${compact ? 'h-14' : 'h-14 sm:h-16'} rounded-2xl border-2 border-b-4 font-bold shadow-sm flex items-center justify-center active:border-b-2 active:translate-y-0.5 transition-all ${keyTone(k)}`}>
            {KEY_LABEL[k]?.node ?? k}
          </button>
        )))}
    </div>
  )
}

// 問題文の 大きさ(長い 式でも 1行に おさめる)
const qSize = (t) => {
  const n = visualLength(t)
  if (n <= 9) return 'text-5xl'
  if (n <= 13) return 'text-4xl'
  if (n <= 18) return 'text-3xl'
  return 'text-2xl'
}

// メモを「ひろい」に した ときは 問題を 1行に ちぢめる(1だん 小さく)
const qSizeCompact = (t) => {
  const n = visualLength(t)
  if (n <= 13) return 'text-4xl'
  if (n <= 18) return 'text-3xl'
  return 'text-2xl'
}

// キーボードの キー → テンキーの キー
const KEYBOARD = { Enter: 'OK', Backspace: 'BS', Delete: 'C', '-': '−', '+': '+', '.': '.', '/': '/', ',': ',', x: 'x', X: 'x' }

export const GameScreen = ({ unit, level, config, device, onExit, onFinish }) => {
  const [qs] = useState(() => config.retryList ?? generateQuestions(unit.id, level.id, QUESTION_COUNT))
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [fb, setFb] = useState({ status: 'none', msg: '', lastWrong: '' })
  const [nudge, setNudge] = useState(0) // ゆらす たびに ふやす(うごきを 1回だけ 走らせる)
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  // メモを 開いて いるか。この 端末で さいごに えらんだ ほうを 覚えて おく
  const [showMemo, setShowMemo] = useState(() => deviceStore.d.memo === true)
  const [memoWide, setMemoWide] = useState(() => deviceStore.d.memoWide === true) // メモの 大きさ ふつう/ひろい
  const [hissanOn, setHissanOn] = useState(() => deviceStore.d.hissan === true) // ひっ算の 形を 下に しくか
  const missed = useRef(new Map()) // 1回目で せいかい できなかった 問題
  const startTime = useRef(Date.now())

  const q = qs[idx]
  const kind = q.ans.kind
  const isTenkey = config.modeType === 'tenkey'
  const canHint = !level.mix && (level.tip || unit.hintKind === 'decimal')
  // ひっ算の 形は ヒントと 同じ 足場。まとめ(mix)では 出さない
  const hissan = useMemo(() => (level.mix ? null : layoutHissan(q.text)), [level.mix, q.text])
  const wide = showMemo && memoWide
  const play = (name) => { if (device.sound) sound[name]() }

  const advance = () => {
    setInput(''); setFb({ status: 'none', msg: '', lastWrong: '' }); setRevealed(false); setShowHint(false)
    if (idx < qs.length - 1) { setIdx(idx + 1); return }
    const wrongList = [...missed.current.values()]
    onFinish({ timeMs: Date.now() - startTime.current, total: qs.length, firstTry: qs.length - wrongList.length, wrongList })
  }

  const miss = () => { if (!missed.current.has(idx)) missed.current.set(idx, q) }

  const submit = () => {
    if (fb.status === 'correct') return
    const r = checkAnswer(q, input)
    if (r.status === 'incomplete') {
      setFb({ status: 'info', msg: r.msg || 'さいごまで 入れよう', lastWrong: '' })
      return
    }
    if (r.status === 'correct') {
      play('correct')
      setFb({ status: 'correct', msg: '', lastWrong: '' })
      setTimeout(advance, 600)
      return
    }
    miss()
    play('soft')
    setNudge(n => n + 1)
    if (r.status === 'almost') {
      // 値は あって いる → 入力を のこして 直せる ように する
      setFb({ status: 'almost', msg: r.msg, lastWrong: '' })
    } else {
      // ちがう → 入力は 消すが、さっきの 答えは 画面に のこす(おぼえて おかなくて いい ように)
      setFb({ status: 'wrong', msg: r.msg || 'もう一度 計算して みよう', lastWrong: input })
      setInput('')
    }
  }

  const handleKey = (k) => {
    if (fb.status === 'correct' || !isTenkey) return
    play('tap')
    if (k === 'OK') { submit(); return }
    setInput(prev => applyKey(kind, prev, k))
    if (fb.status === 'info') setFb({ status: 'none', msg: '', lastWrong: '' })
  }

  // キーボードでも 答えられる(数字・Enter・Backspace など)
  const keyRef = useRef(handleKey)
  keyRef.current = handleKey
  useEffect(() => {
    const onKey = (e) => {
      if (showHint || e.metaKey || e.ctrlKey || e.altKey) return
      const k = /^\d$/.test(e.key) ? e.key : KEYBOARD[e.key]
      if (!k) return
      const allowed = /^\d$/.test(k) || ['OK', 'BS', 'C'].includes(k) || level.keys.includes(k)
      if (!allowed) return
      e.preventDefault()
      keyRef.current(k)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showHint, level.keys])

  const toggleMemo = () => {
    play('tap')
    setShowMemo(!showMemo)
    setDevice({ memo: !showMemo })
  }
  const toggleWide = () => {
    play('tap')
    setMemoWide(!memoWide)
    setDevice({ memoWide: !memoWide })
  }
  const toggleHissan = () => {
    play('tap')
    setHissanOn(!hissanOn)
    setDevice({ hissan: !hissanOn })
  }

  const reveal = () => {
    if (revealed) return
    play('tap')
    setRevealed(true)
  }
  const selfCheck = (ok) => {
    play('tap')
    if (!ok) miss()
    advance()
  }

  const border = fb.status === 'correct' ? 'border-success-500 border-b-success-700'
    : (fb.status === 'wrong' || fb.status === 'almost') ? 'border-highlight-400 border-b-highlight-600'
      : 'border-ink/10 border-b-ink/20'

  const prefix = q.prefix ?? '='
  const answerShown = isTenkey ? inputText(kind, input) : formatAnswer(q.ans)
  const listSize = kind === 'list' ? 'text-3xl' : 'text-4xl sm:text-5xl'

  // 答える ところ(テンキー/フラッシュ)。「ひろい」の ときは メモの よこに うつす
  const answerArea = (
    <div className={wide ? 'w-full max-w-sm mx-auto shrink-0 lg:col-start-2 lg:row-start-2 lg:max-w-none lg:self-end' : 'w-full max-w-sm mx-auto lg:w-[300px] lg:mx-0 shrink-0'}>
      {isTenkey ? (
        <TenKey keys={level.keys} onKey={handleKey} disabled={fb.status === 'correct'} compact={showMemo} />
      ) : !revealed ? (
        <PrimaryButton className="w-full" onClick={reveal}>答えを 見る</PrimaryButton>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-ink/70 text-center">じぶんの 答えと あってた？</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => selfCheck(true)}
              className="flex-1 min-h-[60px] rounded-2xl bg-success-50 border-2 border-success-500 border-b-4 border-b-success-700 text-ink font-bold text-lg active:border-b-2 active:translate-y-0.5 transition-all">
              ○ あってた
            </button>
            <button type="button" onClick={() => selfCheck(false)}
              className="flex-1 min-h-[60px] rounded-2xl bg-highlight-50 border-2 border-highlight-400 border-b-4 border-b-highlight-600 text-ink font-bold text-lg active:border-b-2 active:translate-y-0.5 transition-all">
              △ ちがった
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <Header onBack={onExit} backLabel="やめる"
        right={<>
          {canHint && isTenkey && <PillButton tone="hint" icon={<LightbulbIcon className="w-5 h-5" />} label="ヒント" onClick={() => { play('tap'); setShowHint(true) }} />}
          <PillButton icon={<PencilIcon className="w-5 h-5" />} label="メモ" pressed={showMemo} onClick={toggleMemo} />
        </>}>
        <div className="text-xs font-bold text-ink/70 truncate">{CIRCLED[unit.no - 1]} {unit.title}・{levelLabel(unit, level.id)}{config.retryList ? '(解き直し)' : ''}</div>
        <div className="text-base font-bold text-ink truncate"><MathText text={level.title} /></div>
      </Header>

      {/* 進みぐあい(いま 何問め か) */}
      <div className="shrink-0 px-4 pb-2">
        <div className={`${WIDTH} flex items-center gap-3`}>
          <div className="flex gap-1.5 flex-1" role="img" aria-label={`${idx + 1}問め / 全${qs.length}問`}>
            {qs.map((_, i) => (
              <span key={i} className={`h-2 flex-1 rounded-full ${i < idx ? 'bg-cta-600' : i === idx ? 'bg-ink/40' : 'bg-ink/10'}`} />
            ))}
          </div>
          <span className="text-sm font-bold text-ink/70 shrink-0">{idx + 1} / {qs.length}</span>
        </div>
      </div>

      {/* ならべ方は 3とおり。メモの 木の 位置は かえない(かえると 書いた ものが 消える)
          ・メモ なし: 問題と テンキーで 画面を つかう
          ・ふつう: 問題と テンキーを 中身の 高さに ちぢめ、のこりの 高さ ぜんぶを メモに わたす
          ・ひろい: 横長(lg)では メモを 左に 高さ いっぱい、右の 列に ちぢめた 問題と テンキー。
                   せまい 画面では 上から 問題(1行)・メモ・テンキー
          入りきらない せまい 画面では 上(または 全体)が スクロールする。メモの 上では スクロールしない */}
      <div className={wide ? 'flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] scroll-y lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-4' : 'contents'}>
        <main className={wide ? 'shrink-0 lg:col-start-2 lg:row-start-1' : `min-h-0 scroll-y px-4 ${showMemo ? 'shrink pb-3' : 'flex-1 pb-4'}`}>
          <div className={wide ? 'w-full flex' : `${WIDTH} flex flex-col lg:flex-row gap-5 lg:items-start pt-1`}>
            {/* 問題カード */}
            <div key={nudge} onClick={!isTenkey && !revealed ? reveal : undefined}
              className={`flex-1 min-w-0 bg-card rounded-3xl shadow-md border-2 border-b-4 text-center transition-colors ${wide ? 'px-4 py-2 flex flex-wrap items-center justify-center gap-x-5' : `px-5 ${showMemo ? 'py-4' : 'py-6'} flex flex-col items-center`} ${border} ${nudge ? 'animate-nudge' : ''} ${!isTenkey && !revealed ? 'cursor-pointer' : ''}`}>
              {q.lead && <div className={wide ? 'w-full text-sm font-bold text-ink/70' : 'text-base font-bold text-ink/70 mb-2'}>{q.lead}</div>}
              <div className={`font-bold text-ink leading-snug whitespace-nowrap max-w-full overflow-x-auto ${wide ? qSizeCompact(q.text) : qSize(q.text)}`}>
                <MathText text={q.text} />
              </div>

              <div className={`flex items-center justify-center gap-3 font-bold leading-tight ${wide ? 'text-3xl' : `mt-4 ${listSize}`}`}>
                {prefix && <span className="text-ink/60 shrink-0"><MathText text={prefix} /></span>}
                <span className={`inline-block min-w-[2.2em] px-2 pb-1 border-b-4 ${kind === 'list' ? 'whitespace-normal break-words' : 'whitespace-nowrap'}
                  ${isTenkey ? (input ? 'border-cta-300 text-ink' : 'border-ink/20 text-ink/60') : revealed ? 'border-cta-300 text-cta-700' : 'border-ink/20 text-ink/60'}`}>
                  {isTenkey
                    ? (input ? <MathText text={answerShown} /> : '?')
                    : (revealed ? <span className="inline-block animate-pop-in"><MathText text={answerShown} /></span> : '?')}
                </span>
              </div>

              {/* 返し。高さを とって おき、出ても 画面が ずれない ように する */}
              <div className={wide ? 'mt-1 min-h-[44px] w-full flex flex-col items-center justify-center' : 'mt-4 min-h-[56px] w-full flex flex-col items-center justify-center'} aria-live="polite">
                {fb.status === 'correct' && (
                  <span className="inline-flex items-center gap-1.5 text-lg font-bold text-success-700"><CheckIcon className="w-6 h-6" /> せいかい</span>
                )}
                {(fb.status === 'wrong' || fb.status === 'almost' || fb.status === 'info') && (
                  <div className="rounded-2xl bg-highlight-50 border-2 border-highlight-300 px-4 py-2 text-base font-bold text-ink">
                    <span aria-hidden="true">💭 </span>{fb.msg}
                    {fb.lastWrong && (
                      <span className="block text-sm text-ink/70 mt-0.5">さっきの 答え: <MathText text={inputText(kind, fb.lastWrong)} /></span>
                    )}
                  </div>
                )}
                {!isTenkey && !revealed && <span className="text-sm font-bold text-ink/70">カードを 押すと 答えが 出るよ</span>}
              </div>
            </div>
            {!wide && answerArea}
          </div>
        </main>
        <div className="contents">
          {showMemo && (
            <MemoPad resetKey={idx} onClose={toggleMemo} wide={wide} onToggleWide={toggleWide}
              hissan={hissan} hissanOn={hissanOn} onToggleHissan={toggleHissan} />
          )}
          {wide && answerArea}
        </div>
      </div>

      {showHint && <HintSheet unit={unit} level={level} item={q} onClose={() => setShowHint(false)} />}
    </div>
  )
}
