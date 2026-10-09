import { formatAnswer } from '../lib/answer.js'

// 式の 表示。問題データの しるしを 見た目に する。
//   {3/4}  → たてに 重ねた 分数(分子が 空なら □)
//   x      → 数学の 書体の x(かけ算の × と まぎれない ように)
// それ以外の 文字は そのまま。

const XText = ({ s }) => (
  <>
    {s.split('x').map((part, i, arr) => (
      <span key={i}>
        {part}
        {i < arr.length - 1 && <span className="math-x">x</span>}
      </span>
    ))}
  </>
)

const Frac = ({ num, den }) => (
  <span className="frac" role="math" aria-label={`${den} ぶんの ${num}`}>
    <span className="frac-num"><XText s={num} /></span>
    <span className="frac-den">{den === '' ? <span className="frac-blank" /> : <XText s={den} />}</span>
  </span>
)

export const MathText = ({ text, className = '' }) => {
  const parts = []
  const re = /\{([^{}/]*)\/([^{}]*)\}/g
  let last = 0
  let m
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(<XText key={last} s={text.slice(last, m.index)} />)
    parts.push(<Frac key={`f${m.index}`} num={m[1]} den={m[2]} />)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(<XText key={last} s={text.slice(last)} />)
  return <span className={className}>{parts}</span>
}

// 文字の 長さの めやす(分数は 1けた ぶんの はばで たてに 重なる)
export const visualLength = (text) =>
  text.replace(/\{([^{}/]*)\/([^{}]*)\}/g, (_, a, b) => 'm'.repeat(Math.max(a.length, b.length))).length

// 問題と 答えを 1行に ならべる(ヒントの「れい」・おわりの 画面)
//   3 + 4 = 7 / x + 5 = 12 → x = 7 / 12 → 1, 2, 3, 4, 6, 12
export const QuestionWithAnswer = ({ q }) => {
  const sep = q.prefix ? '→' : '='
  const pre = q.prefix && q.prefix !== '→' ? q.prefix : null
  return (
    <>
      <MathText text={q.text} />
      <span className="mx-2 text-ink/70">{sep}</span>
      {pre && <MathText text={`${pre} `} />}
      <MathText text={formatAnswer(q.ans)} className="text-cta-700" />
    </>
  )
}
