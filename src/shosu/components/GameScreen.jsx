import { useState, useEffect } from 'react'
import { generateQuestions, checkAnswer, fmtNum, soundService, QUESTION_COUNT } from '../data.js'
import { HomeIcon } from './Icons.jsx'

// ── テンキー(数字 + 小数点)──────────────────────────────────
// 0 と OK は横2マス分
const KEYS = [
  { k: '7' }, { k: '8' }, { k: '9' }, { k: 'BS' },
  { k: '4' }, { k: '5' }, { k: '6' }, { k: 'C' },
  { k: '1' }, { k: '2' }, { k: '3' }, { k: '.' },
  { k: '0', span: 2 }, { k: 'OK', span: 2 },
]

const keyClass = (k) => {
  if (k === 'OK') return 'bg-emerald-400 border-emerald-600 text-white text-xl'
  if (k === '.') return 'bg-amber-400 border-amber-600 text-white text-3xl pb-3'
  if (k === 'BS' || k === 'C') return 'bg-slate-200 border-slate-300 text-slate-500 text-2xl'
  return 'bg-sky-400 border-sky-600 text-white text-3xl'
}

const TenKeyPad = ({ onKey, disabled }) => (
  <div className="grid grid-cols-4 gap-2.5 w-full">
    {KEYS.map(({ k, span }) => (
      <button key={k}
        className={`h-14 sm:h-16 rounded-2xl border-b-4 font-bold active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center justify-center
          ${span === 2 ? 'col-span-2' : ''} ${keyClass(k)}`}
        onClick={() => !disabled && onKey(k)}>
        {k === 'BS' ? '⌫' : k}
      </button>
    ))}
  </div>
)

export const GameScreen = ({ config, settings, onExit, onFinish }) => {
  const [qs, setQs] = useState([])
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('none')
  const [hint, setHint] = useState('')
  const [showFlashAns, setShowFlashAns] = useState(false)
  const [wrongList, setWrongList] = useState([])
  const [mistakeCount, setMistakeCount] = useState(0)
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    if (config.retryList?.length > 0) setQs(config.retryList)
    else setQs(generateQuestions(config.level, config.count ?? QUESTION_COUNT))
    setStartTime(Date.now())
  }, [])

  const q = qs[idx]
  const isTenkey = config.modeType === 'tenkey'

  const nextQ = (ci, cw, cm, cqs) => {
    setFeedback('none'); setInput(''); setHint(''); setShowFlashAns(false)
    if (ci < cqs.length - 1) setIdx(ci + 1)
    else onFinish({ timeMs: Date.now() - startTime, mistakeCount: cm, wrongList: cw, total: cqs.length })
  }

  const submit = () => {
    if (!input || feedback !== 'none') return
    const res = checkAnswer(q, input)
    if (res.correct) {
      setFeedback('correct'); setHint('')
      if (settings.isSoundEnabled) soundService.playCorrect()
      setTimeout(() => nextQ(idx, wrongList, mistakeCount, qs), 350)
    } else {
      setFeedback('wrong')
      setHint(res.pointMiss ? 'おしい！小数点の位置をたしかめよう' : '')
      if (settings.isSoundEnabled) soundService.playWrong()
      const nwl = [...wrongList, q]
      const nmc = mistakeCount + 1
      setWrongList(nwl); setMistakeCount(nmc)
      setInput('')
      setTimeout(() => setFeedback('none'), 500)
    }
  }

  const handleKey = (k) => {
    if (feedback === 'correct') return
    if (settings.isSoundEnabled) soundService.playTap()
    if (k === 'OK') { submit(); return }
    if (k === 'C') { setInput(''); setHint(''); return }
    if (k === 'BS') { setInput(prev => prev.slice(0, -1)); return }
    if (k === '.') {
      // 小数点は1つだけ。いきなり押したら「0.」にする
      setInput(prev => (prev.includes('.') ? prev : prev === '' ? '0.' : prev + '.'))
      return
    }
    setInput(prev => (prev.length >= 7 ? prev : prev + k))
  }

  const handleFlashTap = () => {
    if (showFlashAns) return
    if (settings.isSoundEnabled) soundService.playTap()
    setShowFlashAns(true)
    setTimeout(() => nextQ(idx, wrongList, mistakeCount, qs), 700)
  }

  if (!q) return null

  const answerText = fmtNum(q.ans)

  return (
    <div className="flex flex-col h-full w-full bg-teal-50 overflow-hidden">
      {/* プログレスバー */}
      <div className="h-1.5 bg-teal-200 shrink-0">
        <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${(idx / qs.length) * 100}%` }} />
      </div>

      {/* ヘッダー */}
      <header className="px-3 py-2 flex justify-between items-center shrink-0">
        <button onClick={onExit} className="text-slate-400 hover:text-slate-600 p-1">
          <HomeIcon className="w-7 h-7" />
        </button>
        <div className="font-bold text-teal-600 bg-white px-4 py-1 rounded-full shadow-sm text-sm">
          {idx + 1} / {qs.length}
        </div>
        <div className="w-9" />
      </header>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col px-4 pt-2 pb-3 gap-5 min-h-0 items-center justify-start">
        {/* 問題カード */}
        <div className="flex items-center justify-center w-full">
          <div className={`bg-white rounded-3xl shadow-lg flex flex-col items-center justify-center border-b-4 transition-all relative px-6 py-6 w-full max-w-md
            ${feedback === 'correct' ? 'border-emerald-400' : 'border-white'}
            ${feedback === 'wrong' ? 'border-rose-300 shake' : ''}`}>
            <div className="text-center text-[1.9rem] sm:text-[2.5rem] font-black text-slate-700 leading-snug whitespace-nowrap">
              {q.text}
            </div>
            <div className="mt-2 flex items-baseline justify-center gap-3 text-[2rem] sm:text-[2.6rem] font-black leading-none">
              <span className="text-teal-300">=</span>
              {isTenkey ? (
                <span className={`inline-block min-w-[1.2em] text-center ${input ? 'text-slate-800' : 'text-slate-200'}`}>
                  {input || '?'}
                </span>
              ) : (
                <span className={`inline-block min-w-[1.2em] text-center ${showFlashAns ? 'text-teal-600 animate-pop' : 'text-transparent'}`}>
                  {answerText}
                </span>
              )}
            </div>
            {isTenkey && (
              <div className={`mt-3 text-xs font-bold h-4 ${hint ? 'text-amber-500' : 'text-transparent'}`}>
                {hint || '　'}
              </div>
            )}
            {!isTenkey && <div onClick={handleFlashTap} className="absolute inset-0 z-10 cursor-pointer" />}
          </div>
        </div>

        {isTenkey ? (
          <div className="shrink-0 px-2 pb-1 w-full max-w-sm">
            <TenKeyPad onKey={handleKey} disabled={feedback === 'correct'} />
          </div>
        ) : (
          <div className="text-center text-slate-400 font-bold animate-pulse text-base">
            タップして答え合わせ
          </div>
        )}
      </div>
    </div>
  )
}
