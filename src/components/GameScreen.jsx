// 問題を とく 画面(テンキー/フラッシュ)
// ★急かさない: 時間は 計るが、とちゅうで 見せない・カウントダウンも しない。
// ★まちがえても 画面は 進まない。理由が あれば 添える(「なぜ ちがうか」)。
//   赤い ✕ や 下がる 音は 使わない(patterns/components.md §5)。
import { useState, useEffect, useRef } from 'react'
import { generateQuestions, levelLabel, QUESTION_COUNT } from '../units/index.js'
import { applyKey, checkAnswer, formatAnswer, inputText } from '../lib/answer.js'
import { sound } from '../lib/sound.js'
import { MathText, visualLength } from './MathText.jsx'
import { Header, PillButton, PrimaryButton, WIDTH } from './ui.jsx'
import { DeleteIcon, LightbulbIcon, CheckIcon, FracKeyIcon } from './Icons.jsx'
import { HintSheet } from './HintSheet.jsx'

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

const TenKey = ({ keys, onKey, disabled }) => {
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
            className={`h-14 sm:h-16 rounded-2xl border-2 border-b-4 font-bold shadow-sm flex items-center justify-center active:border-b-2 active:translate-y-0.5 transition-all ${keyTone(k)}`}>
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
  const missed = useRef(new Map()) // 1回目で せいかい できなかった 問題
  const startTime = useRef(Date.now())

  const q = qs[idx]
  const kind = q.ans.kind
  const isTenkey = config.modeType === 'tenkey'
  const canHint = !level.mix && (level.tip || unit.hintKind === 'decimal')
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

  return (
    <div className="flex flex-col h-full">
      <Header onBack={onExit} backLabel="やめる"
        right={canHint && isTenkey ? <PillButton tone="hint" icon={<LightbulbIcon className="w-5 h-5" />} label="ヒント" onClick={() => { play('tap'); setShowHint(true) }} /> : null}>
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

      <main className="flex-1 min-h-0 scroll-y px-4 pb-4">
        <div className={`${WIDTH} flex flex-col lg:flex-row gap-5 lg:items-start pt-1`}>
          {/* 問題カード */}
          <div key={nudge} onClick={!isTenkey && !revealed ? reveal : undefined}
            className={`flex-1 min-w-0 bg-card rounded-3xl shadow-md border-2 border-b-4 px-5 py-6 flex flex-col items-center text-center transition-colors ${border} ${nudge ? 'animate-nudge' : ''} ${!isTenkey && !revealed ? 'cursor-pointer' : ''}`}>
            {q.lead && <div className="text-base font-bold text-ink/70 mb-2">{q.lead}</div>}
            <div className={`font-bold text-ink leading-snug whitespace-nowrap max-w-full overflow-x-auto ${qSize(q.text)}`}>
              <MathText text={q.text} />
            </div>

            <div className={`mt-4 flex items-center justify-center gap-3 font-bold leading-tight ${listSize}`}>
              {prefix && <span className="text-ink/60 shrink-0"><MathText text={prefix} /></span>}
              <span className={`inline-block min-w-[2.2em] px-2 pb-1 border-b-4 ${kind === 'list' ? 'whitespace-normal break-words' : 'whitespace-nowrap'}
                ${isTenkey ? (input ? 'border-cta-300 text-ink' : 'border-ink/20 text-ink/60') : revealed ? 'border-cta-300 text-cta-700' : 'border-ink/20 text-ink/60'}`}>
                {isTenkey
                  ? (input ? <MathText text={answerShown} /> : '?')
                  : (revealed ? <span className="inline-block animate-pop-in"><MathText text={answerShown} /></span> : '?')}
              </span>
            </div>

            {/* 返し。高さを とって おき、出ても 画面が ずれない ように する */}
            <div className="mt-4 min-h-[56px] w-full flex flex-col items-center justify-center" aria-live="polite">
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

          {/* 答える ところ */}
          <div className="w-full max-w-sm mx-auto lg:w-[300px] lg:mx-0 shrink-0">
            {isTenkey ? (
              <TenKey keys={level.keys} onKey={handleKey} disabled={fb.status === 'correct'} />
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
        </div>
      </main>

      {showHint && <HintSheet unit={unit} level={level} item={q} onClose={() => setShowHint(false)} />}
    </div>
  )
}
