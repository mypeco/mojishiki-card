// ⑤ 文字式 ── 同じ文字の項のたし算から、中2の単項式の乗除まで
// もとの「文字式カード」の問題の作り方をそのまま引きついでいる。
import { ri, pick } from '../lib/rand.js'
import { ansPoly, powStr } from '../lib/answer.js'

const coefStr = (c) => powStr(c, 1)

// 各問題は { text, ans }。答えは多項式 { 次数: 係数 }
const q = (text, p) => ({ text, ans: ansPoly(p) })

const gen1 = () => {
  const a = ri(1, 8), b = ri(1, 8)
  return q(`${coefStr(a)} + ${coefStr(b)}`, { 1: a + b })
}

const gen2 = () => {
  const a = ri(2, 9), b = ri(1, a)
  return q(`${coefStr(a)} − ${coefStr(b)}`, { 1: a - b })
}

const gen3 = () => {
  if (Math.random() < 0.5) {
    const a = ri(1, 8), b = ri(a + 1, 9)
    return q(`${coefStr(a)} − ${coefStr(b)}`, { 1: a - b })
  }
  const a = ri(1, 9), b = ri(1, 9)
  return q(`${coefStr(-a)} + ${coefStr(b)}`, { 1: b - a })
}

const gen4 = () => {
  const a = ri(1, 6), c = ri(1, 9)
  const v = ri(1, 4)
  if (v === 1) {
    const b = ri(1, 6)
    return q(`${coefStr(a)} + ${c} + ${coefStr(b)}`, { 1: a + b, 0: c })
  }
  if (v === 2) {
    const b = ri(1, 6)
    return q(`${coefStr(a)} + ${coefStr(b)} + ${c}`, { 1: a + b, 0: c })
  }
  if (v === 3) {
    let b = ri(1, 6)
    while (b === a) b = ri(1, 6)
    return q(`${coefStr(a)} + ${c} − ${coefStr(b)}`, { 1: a - b, 0: c })
  }
  const b = ri(1, 6)
  return q(`${coefStr(a)} − ${c} + ${coefStr(b)}`, { 1: a + b, 0: -c })
}

const gen5 = () => {
  const v = ri(1, 4)
  if (v === 1) {
    const a = ri(2, 9), m = ri(2, 6)
    return q(`${coefStr(a)} × ${m}`, { 1: a * m })
  }
  if (v === 2) {
    const a = ri(2, 9), m = ri(2, 6)
    return q(`${m} × ${coefStr(a)}`, { 1: a * m })
  }
  if (v === 3) {
    const a = ri(2, 9), m = ri(2, 6)
    return q(`${coefStr(a * m)} ÷ ${m}`, { 1: a })
  }
  const a = ri(2, 6), m = ri(2, 5)
  return q(`${coefStr(-a)} × ${m}`, { 1: -a * m })
}

const gen6 = () => {
  const m = pick([2, 3, 4, 5, -2, -3])
  const a = ri(1, 5)
  const b = ri(1, 5) * pick([1, -1])
  const inner = `${coefStr(a)} ${b > 0 ? '+' : '−'} ${Math.abs(b)}`
  const mStr = m < 0 ? `−${Math.abs(m)}` : `${m}`
  return q(`${mStr}(${inner})`, { 1: m * a, 0: m * b })
}

const gen7 = () => {
  const a = ri(1, 5), c = ri(1, 5), b = ri(1, 9), d = ri(1, 9)
  const s1 = pick([1, -1]), s2 = pick([1, -1])
  const op = pick(['+', '−'])
  const left = `(${coefStr(a)} ${s1 > 0 ? '+' : '−'} ${b})`
  const right = `(${coefStr(c)} ${s2 > 0 ? '+' : '−'} ${d})`
  const ra = op === '+' ? a + c : a - c
  const rb = op === '+' ? s1 * b + s2 * d : s1 * b - s2 * d
  if (ra === 0 && rb === 0) return gen7()
  return q(`${left} ${op} ${right}`, { 1: ra, 0: rb })
}

// レベル8: 累乗の表し方(中1「積の表し方」)
const gen8 = () => {
  const v = ri(1, 6)
  if (v === 1) return q('x × x', { 2: 1 })
  if (v === 2) return q('x × x × x', { 3: 1 })
  const a = ri(2, 9)
  if (v === 3) return q(`${a} × x × x`, { 2: a })
  if (v === 4) return q(`x × x × ${a}`, { 2: a })
  if (v === 5) return q(`x × ${a} × x`, { 2: a })
  return q(`${a} × x × x × x`, { 3: a })
}

// レベル9: 中2チャレンジ(単項式の乗法・除法・同類項)
const gen9 = () => {
  const v = ri(1, 6)
  if (v === 1) {
    const a = ri(2, 5), b = ri(2, 5)
    return q(`${coefStr(a)} × ${coefStr(b)}`, { 2: a * b })
  }
  if (v === 2) {
    const a = ri(2, 9)
    return q(`x × ${coefStr(a)}`, { 2: a })
  }
  if (v === 3) {
    const a = ri(1, 8), b = ri(1, 8)
    return q(`${powStr(a, 2)} + ${powStr(b, 2)}`, { 2: a + b })
  }
  if (v === 4) {
    let a = ri(1, 9), b = ri(1, 9)
    while (b === a) b = ri(1, 9)
    return q(`${powStr(a, 2)} − ${powStr(b, 2)}`, { 2: a - b })
  }
  if (v === 5) {
    const a = ri(2, 5), b = ri(2, 5)
    return q(`${powStr(a * b, 2)} ÷ ${coefStr(b)}`, { 1: a })
  }
  const a = ri(1, 5), b = ri(1, 6), c = ri(1, 5)
  return q(`${powStr(a, 2)} + ${coefStr(b)} + ${powStr(c, 2)}`, { 2: a + c, 1: b })
}

const ex = (text, p) => q(text, p)
const KEYS = ['x', '+', '−']

export default {
  id: 'moji',
  no: 5,
  icon: '🔤',
  title: '文字式',
  sub: 'x の 項を まとめよう',
  levels: [
    { id: 1, icon: '🌱', title: '文字の 項の たし算', desc: '同じ 文字の 項を まとめよう', keys: KEYS, gen: gen1,
      tip: { ex: ex('3x + 5x', { 1: 8 }), steps: ['x の 数(係数)どうしを たす', '3 + 5 = 8', '→ 8x'] } },
    { id: 2, icon: '🌿', title: '文字の 項の ひき算', desc: '係数どうしを ひき算しよう', keys: KEYS, gen: gen2,
      tip: { ex: ex('7x − 3x', { 1: 4 }), steps: ['係数どうしを ひく', '7 − 3 = 4', '→ 4x'] } },
    { id: 3, icon: '🍀', title: '負の数が でてくる 計算', desc: '答えが マイナスに なる ことも', keys: KEYS, gen: gen3,
      tip: { ex: ex('2x − 7x', { 1: -5 }), steps: ['係数どうしを 計算する', '2 − 7 = −5', '→ −5x'] } },
    { id: 4, icon: '🌼', title: '数の 項が まざった 計算', desc: '文字の 項と 数の 項を わけよう', keys: KEYS, gen: gen4,
      tip: { ex: ex('4x + 3 + 2x', { 1: 6, 0: 3 }), steps: ['x の 項: 4x + 2x = 6x', '数の 項: 3', '→ 6x + 3'] } },
    { id: 5, icon: '🎯', title: '文字式 × 数・÷ 数', desc: '係数に 数を かけたり わったり', keys: KEYS, gen: gen5,
      tip: { ex: ex('3x × 4', { 1: 12 }), steps: ['× 数 → 係数に かける: 3 × 4 = 12', '÷ 数 → 係数を わる', '→ 12x'] } },
    { id: 6, icon: '⚡', title: '分配法則', desc: 'かっこの 中に 数を 配ろう', keys: KEYS, gen: gen6,
      tip: { ex: ex('3(2x + 4)', { 1: 6, 0: 12 }), steps: ['かっこの 中の 両方に かける', '3 × 2x = 6x、 3 × 4 = 12', '→ 6x + 12'] } },
    { id: 7, icon: '🔥', title: 'かっこの ある たし算・ひき算', desc: 'かっこを はずして 整理しよう', keys: KEYS, gen: gen7,
      tip: { ex: ex('(5x + 3) − (2x + 1)', { 1: 3, 0: 2 }), steps: ['−( ) は、中の 符号を ぜんぶ かえて はずす', '5x + 3 − 2x − 1', 'x の 項と 数の 項を まとめる → 3x + 2'] } },
    { id: 8, icon: '🧩', title: '累乗の 表し方', desc: 'x × x は x² と 書こう', keys: KEYS, gen: gen8,
      tip: { ex: ex('2 × x × x', { 2: 2 }), steps: ['x × x は x²(x を 2回 押す)', 'x × x × x は x³', '数は 前に 書く → 2x²'] } },
    { id: 9, icon: '🎓', title: '中2チャレンジ', desc: '単項式の かけ算と 同類項', keys: KEYS, gen: gen9,
      tip: { ex: ex('3x × 2x', { 2: 6 }), steps: ['数どうし: 3 × 2 = 6', '文字どうし: x × x = x²', '→ 6x²'] } },
    { id: 'mix', icon: '👑', title: 'まとめ', desc: 'レベル1〜8から ランダム', keys: KEYS, mix: true, pool: [1, 2, 3, 4, 5, 6, 7, 8] },
  ],
}
