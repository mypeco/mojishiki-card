// ① 整数の計算 ── くり上がりのたし算から、正負の数の四則まで
import { ri, pick } from '../lib/rand.js'
import { ansNum } from '../lib/answer.js'

const q = (text, v) => ({ text, ans: ansNum(v) })

// レベル1: たし算(くり上がり)
const gen1 = () => {
  if (Math.random() < 0.4) {
    const a = ri(2, 9)
    const b = ri(Math.max(2, 10 - a), 9)
    return q(`${a} + ${b}`, a + b)
  }
  const o = ri(2, 9)
  const a = ri(1, 8) * 10 + o
  const b = ri(10 - o, 9)
  return q(`${a} + ${b}`, a + b)
}

// レベル2: ひき算(くり下がり)
const gen2 = () => {
  if (Math.random() < 0.4) {
    const a = ri(11, 18)
    const b = ri(a % 10 + 1, 9)
    return q(`${a} − ${b}`, a - b)
  }
  const o = ri(0, 8)
  const a = ri(2, 9) * 10 + o
  const b = ri(o + 1, 9)
  return q(`${a} − ${b}`, a - b)
}

// レベル3: 2けたのたし算・ひき算
const gen3 = () => {
  if (Math.random() < 0.5) {
    const a = ri(11, 78)
    const b = ri(11, 99 - a)
    return q(`${a} + ${b}`, a + b)
  }
  const a = ri(30, 99)
  const b = ri(11, a - 10)
  return q(`${a} − ${b}`, a - b)
}

// レベル4: かけ算(九九と 2けた × 1けた)
const gen4 = () => {
  if (Math.random() < 0.4) {
    const a = ri(2, 9), b = ri(2, 9)
    return q(`${a} × ${b}`, a * b)
  }
  const a = ri(11, 39), b = ri(2, 6)
  return Math.random() < 0.7 ? q(`${a} × ${b}`, a * b) : q(`${b} × ${a}`, a * b)
}

// レベル5: わり算(わりきれる)
const gen5 = () => {
  if (Math.random() < 0.4) {
    const b = ri(2, 9), ans = ri(2, 9)
    return q(`${b * ans} ÷ ${b}`, ans)
  }
  const b = ri(2, 5)
  const ans = ri(11, Math.floor(99 / b))
  return q(`${b * ans} ÷ ${b}`, ans)
}

// レベル6: 計算のじゅんじょ(× ÷ をさきに)
const gen6 = () => {
  const v = ri(1, 6)
  if (v === 1) {
    const a = ri(1, 20), b = ri(2, 9), c = ri(2, 9)
    return q(`${a} + ${b} × ${c}`, a + b * c)
  }
  if (v === 2) {
    const b = ri(2, 6), c = ri(2, 6), a = b * c + ri(1, 20)
    return q(`${a} − ${b} × ${c}`, a - b * c)
  }
  if (v === 3) {
    const a = ri(2, 9), b = ri(2, 9), c = ri(1, 20)
    return q(`${a} × ${b} + ${c}`, a * b + c)
  }
  if (v === 4) {
    const a = ri(2, 9), b = ri(2, 9), c = ri(1, a * b - 1)
    return q(`${a} × ${b} − ${c}`, a * b - c)
  }
  if (v === 5) {
    const c = ri(2, 9), b = c * ri(2, 9), a = ri(1, 20)
    return q(`${a} + ${b} ÷ ${c}`, a + b / c)
  }
  const a = ri(2, 6), b = ri(2, 6), c = ri(2, 6), d = ri(2, 6)
  return q(`${a} × ${b} + ${c} × ${d}`, a * b + c * d)
}

// レベル7: かっこのある計算
const gen7 = () => {
  const v = ri(1, 6)
  if (v === 1) {
    const a = ri(1, 9), b = ri(1, 9), c = ri(2, 6)
    return q(`(${a} + ${b}) × ${c}`, (a + b) * c)
  }
  if (v === 2) {
    const a = ri(2, 9), b = ri(5, 15), c = ri(1, b - 1)
    return q(`${a} × (${b} − ${c})`, a * (b - c))
  }
  if (v === 3) {
    const c = ri(2, 9), sum = c * ri(2, 9), a = ri(1, sum - 1)
    return q(`(${a} + ${sum - a}) ÷ ${c}`, sum / c)
  }
  if (v === 4) {
    const b = ri(1, 9), c = ri(1, 9), a = b + c + ri(1, 20)
    return q(`${a} − (${b} + ${c})`, a - (b + c))
  }
  if (v === 5) {
    const b = ri(1, 9), a = b + ri(1, 9), c = ri(2, 5)
    return q(`(${a} − ${b}) × ${c}`, (a - b) * c)
  }
  const d = ri(2, 6), c = ri(1, 9), a = d * ri(2, 9)
  return q(`${a} ÷ (${d + c} − ${c})`, a / d)
}

// レベル8: 正負の数のたし算・ひき算
const gen8 = () => {
  const a = ri(1, 12), b = ri(1, 12)
  const v = ri(1, 7)
  if (v === 1) return q(`−${a} + ${b}`, -a + b)
  if (v === 2) {
    const big = a + ri(1, 9)
    return q(`${a} − ${big}`, a - big)
  }
  if (v === 3) return q(`−${a} − ${b}`, -a - b)
  if (v === 4) return q(`${a} + (−${b})`, a - b)
  if (v === 5) return q(`${a} − (−${b})`, a + b)
  if (v === 6) return q(`−${a} + (−${b})`, -a - b)
  return q(`−${a} − (−${b})`, -a + b)
}

// レベル9: 正負の数のかけ算・わり算
const gen9 = () => {
  const a = ri(2, 9), b = ri(2, 9)
  const v = ri(1, 6)
  if (v === 1) return q(`−${a} × ${b}`, -a * b)
  if (v === 2) return q(`${a} × (−${b})`, -a * b)
  if (v === 3) return q(`−${a} × (−${b})`, a * b)
  if (v === 4) return q(`−${a * b} ÷ ${b}`, -a)
  if (v === 5) return q(`${a * b} ÷ (−${b})`, -a)
  return q(`−${a * b} ÷ (−${b})`, a)
}

// レベル10: 正負の数の四則と累乗
const gen10 = () => {
  const v = ri(1, 7)
  if (v === 1) {
    const a = ri(2, 9)
    return q(`(−${a})²`, a * a)
  }
  if (v === 2) {
    const a = ri(2, 9)
    return q(`−${a}²`, -a * a)
  }
  if (v === 3) {
    const a = ri(2, 3)
    return pick([q(`(−${a})³`, -(a ** 3)), q(`−${a}³`, -(a ** 3))])
  }
  if (v === 4) {
    const a = ri(1, 20), b = ri(2, 6), c = ri(2, 6)
    return q(`${a} + ${b} × (−${c})`, a - b * c)
  }
  if (v === 5) {
    const a = ri(2, 6), b = ri(2, 6), c = ri(1, 20)
    return q(`−${a} × ${b} + ${c}`, -a * b + c)
  }
  if (v === 6) {
    const a = ri(1, 10), b = ri(2, 5), c = ri(2, 5)
    return q(`${a} − (−${b}) × ${c}`, a + b * c)
  }
  const a = ri(1, 9), b = ri(1, 9), c = ri(2, 5)
  return q(`(−${a} + ${b}) × ${c}`, (b - a) * c)
}

const ex = (text, v) => q(text, v)

export default {
  id: 'seisu',
  no: 1,
  icon: '🔢',
  title: '整数の 計算',
  sub: 'くり上がりから 正負の数まで',
  levels: [
    { id: 1, icon: '🌱', title: 'たし算(くり上がり)', desc: '10の まとまりを つくろう', keys: [], gen: gen1,
      tip: { ex: ex('8 + 7', 15), steps: ['7 を 2 と 5 に わける', '8 + 2 = 10', '10 + 5 = 15'] } },
    { id: 2, icon: '🌿', title: 'ひき算(くり下がり)', desc: '10から ひいて みよう', keys: [], gen: gen2,
      tip: { ex: ex('13 − 7', 6), steps: ['13 を 10 と 3 に わける', '10 − 7 = 3', '3 + 3 = 6'] } },
    { id: 3, icon: '🍀', title: '2けたの たし算・ひき算', desc: '十の位と 一の位に わけよう', keys: [], gen: gen3,
      tip: { ex: ex('36 + 47', 83), steps: ['十の位: 30 + 40 = 70', '一の位: 6 + 7 = 13', '70 + 13 = 83'] } },
    { id: 4, icon: '🌼', title: 'かけ算', desc: '九九と 2けた × 1けた', keys: [], gen: gen4,
      tip: { ex: ex('23 × 4', 92), steps: ['23 を 20 と 3 に わける', '20 × 4 = 80、 3 × 4 = 12', '80 + 12 = 92'] } },
    { id: 5, icon: '🎯', title: 'わり算', desc: 'わりきれる わり算', keys: [], gen: gen5,
      tip: { ex: ex('84 ÷ 4', 21), steps: ['84 を 80 と 4 に わける', '80 ÷ 4 = 20、 4 ÷ 4 = 1', '20 + 1 = 21'] } },
    { id: 6, icon: '⚡', title: '計算の じゅんじょ', desc: '× ÷ を さきに 計算しよう', keys: [], gen: gen6,
      tip: { ex: ex('3 + 4 × 5', 23), steps: ['× と ÷ を さきに 計算する', '4 × 5 = 20', '3 + 20 = 23'] } },
    { id: 7, icon: '🔥', title: 'かっこの ある 計算', desc: 'かっこの 中を さきに', keys: [], gen: gen7,
      tip: { ex: ex('(8 − 3) × 4', 20), steps: ['かっこの 中を さきに 計算する', '8 − 3 = 5', '5 × 4 = 20'] } },
    { id: 8, icon: '🚀', title: '正負の数の たし算・ひき算', desc: '符号に 気を つけよう', keys: ['−'], gen: gen8,
      tip: { ex: ex('5 − (−3)', 8), steps: ['ひく (−3) は たす 3 に なおす: 5 + 3', '符号が おなじ → たして、その 符号', '符号が ちがう → 大きい ほうから ひいて、大きい ほうの 符号'] } },
    { id: 9, icon: '🧩', title: '正負の数の かけ算・わり算', desc: 'さきに 符号を きめよう', keys: ['−'], gen: gen9,
      tip: { ex: ex('−6 × 3', -18), steps: ['さきに 符号を きめる', '− が 1こ → −、 − が 2こ → ＋', '数どうしを 計算する: 6 × 3 = 18'] } },
    { id: 10, icon: '🎓', title: '正負の数の 四則と 累乗', desc: '(−3)² と −3² の ちがい', keys: ['−'], gen: gen10,
      tip: { ex: ex('(−3)²', 9), steps: ['(−3)² は (−3) × (−3) = 9', '−3² は −(3 × 3) = −9', '累乗 → × ÷ → ＋ − の じゅんに 計算する'] } },
    { id: 'mix', icon: '👑', title: 'まとめ', desc: 'レベル1〜10から ランダム', keys: ['−'], mix: true },
  ],
}

