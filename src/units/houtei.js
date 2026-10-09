// ⑥ 一次方程式 ── x + 5 = 12 から、係数が小数・分数の方程式まで
// 答えは「x = 」のあとに入れる。答えが分数になる問題もある(レベル9)。
import { ri, pick, rnz } from '../lib/rand.js'
import { ansFrac, formatPoly, sn } from '../lib/answer.js'
import { frac, gcd, lcm, toDecimal } from '../lib/frac.js'

// 方程式の片側(ax + b)を文字列にする
const side = (a, b) => formatPoly({ 1: a, 0: b })
const q = (text, n, d = 1) => ({ text, prefix: 'x =', ans: ansFrac(n, d) })

// レベル1: x + a = b
const gen1 = () => {
  const x = ri(1, 15), a = ri(1, 12)
  const v = ri(1, 3)
  if (v === 1) return q(`x + ${a} = ${x + a}`, x)
  if (v === 2) return q(`${a} + x = ${x + a}`, x)
  const b = ri(1, 12), xx = a + b
  return q(`x − ${a} = ${b}`, xx)
}

// レベル2: ax = b
const gen2 = () => {
  const a = ri(2, 9)
  const x = Math.random() < 0.7 ? ri(1, 9) : -ri(1, 9)
  const ca = Math.random() < 0.7 ? a : -a
  return q(`${side(ca, 0)} = ${sn(ca * x)}`, x)
}

// レベル3: x/a = b
const gen3 = () => {
  const a = ri(2, 6), b = Math.random() < 0.75 ? ri(1, 9) : -ri(1, 9)
  return q(`{x/${a}} = ${sn(b)}`, a * b)
}

// レベル4: ax + b = c
const gen4 = () => {
  const a = ri(2, 9), b = rnz(1, 15)
  const x = pick([ri(1, 9), ri(1, 9), -ri(1, 5)])
  return q(`${side(a, b)} = ${sn(a * x + b)}`, x)
}

// レベル5: 両辺に x がある
const gen5 = () => {
  for (;;) {
    const a = ri(1, 9), c = ri(1, 9)
    if (a === c) continue
    const x = pick([ri(1, 9), ri(1, 9), -ri(1, 5)])
    const b = ri(-12, 12)
    const d = a * x + b - c * x
    if (b === 0 && d === 0) continue
    return q(`${side(a, b)} = ${side(c, d)}`, x)
  }
}

// レベル6: かっこのある方程式
const gen6 = () => {
  const a = ri(2, 5), b = ri(1, 9)
  const x = pick([ri(1, 9), ri(1, 9), -ri(1, 5)])
  const s = pick([1, -1])
  const inner = `x ${s > 0 ? '+' : '−'} ${b}`
  if (Math.random() < 0.5) return q(`${a}(${inner}) = ${sn(a * (x + s * b))}`, x)
  for (;;) {
    const c = ri(1, 5)
    if (c === a) continue
    const d = a * (x + s * b) - c * x
    return q(`${a}(${inner}) = ${side(c, d)}`, x)
  }
}

// 1/10 の位の小数(整数ならそのまま)
const dec = (n) => toDecimal(frac(n, 10))
// 小数の係数の片側(0.3x + 0.5)
const decSide = (a, b) => {
  const xs = a === 10 ? 'x' : a === -10 ? '−x' : `${dec(a)}x`
  if (b === 0) return xs
  return `${xs} ${b < 0 ? '−' : '+'} ${dec(Math.abs(b))}`
}

// レベル7: 係数が小数(両辺を10倍して整数にする)
const gen7 = () => {
  for (;;) {
    const x = pick([ri(1, 9), ri(1, 9), -ri(1, 5)])
    if (Math.random() < 0.6) {
      const a = ri(1, 9), b = rnz(1, 20)
      if (b % 10 === 0) continue
      return q(`${decSide(a, b)} = ${dec(a * x + b)}`, x)
    }
    const a = ri(1, 9), c = ri(1, 9), b = rnz(1, 20)
    if (a === c || b % 10 === 0) continue
    const d = a * x + b - c * x
    if (d === 0 || d % 10 === 0) continue
    return q(`${decSide(a, b)} = ${decSide(c, d)}`, x)
  }
}

// レベル8: 係数が分数
const gen8 = () => {
  const v = ri(1, 3)
  if (v === 1) {
    // x/p + a = b
    const p = ri(2, 5), k = pick([ri(1, 9), -ri(1, 5)]), a = ri(1, 9)
    return q(`{x/${p}} + ${a} = ${sn(k + a)}`, p * k)
  }
  if (v === 2) {
    // x/p − x/q = a
    for (;;) {
      const p = ri(2, 6), qq = ri(2, 6)
      if (p === qq) continue
      const L = lcm(p, qq)
      if (L > 30) continue
      const x = L * pick([1, 2, -1])
      return q(`{x/${p}} − {x/${qq}} = ${sn(x / p - x / qq)}`, x)
    }
  }
  // cx/p = b(c と p はたがいに素)
  for (;;) {
    const c = ri(2, 5), p = ri(2, 7)
    if (gcd(c, p) !== 1) continue
    const k = pick([ri(1, 5), -ri(1, 3)])
    return q(`{${c}x/${p}} = ${sn(c * k)}`, p * k)
  }
}

// レベル9: 答えが分数
const gen9 = () => {
  for (;;) {
    const a = ri(2, 9) * (Math.random() < 0.8 ? 1 : -1)
    const rhs = rnz(1, 20)
    if (Math.random() < 0.5) {
      if (rhs % a === 0) continue
      return q(`${side(a, 0)} = ${sn(rhs)}`, rhs, a)
    }
    const b = rnz(1, 12)
    const c = rhs
    if ((c - b) % a === 0 || c === b) continue
    return q(`${side(a, b)} = ${sn(c)}`, c - b, a)
  }
}

const ex = (text, n, d = 1) => q(text, n, d)
const KEYS = ['/', '−']

export default {
  id: 'houtei',
  no: 6,
  icon: '⚖️',
  title: '一次方程式',
  sub: 'x の 値を もとめよう',
  levels: [
    { id: 1, icon: '🌱', title: '移項して とく', desc: 'x + 5 = 12 の 形', keys: KEYS, gen: gen1,
      tip: { ex: ex('x + 5 = 12', 7), steps: ['+5 を 右に うつすと −5(移項)', 'x = 12 − 5', 'x = 7'] } },
    { id: 2, icon: '🌿', title: '係数で わる', desc: '3x = 12 の 形', keys: KEYS, gen: gen2,
      tip: { ex: ex('3x = 12', 4), steps: ['両辺を x の 係数(3)で わる', 'x = 12 ÷ 3', 'x = 4'] } },
    { id: 3, icon: '🍀', title: '分母を かける', desc: '{x/3} = 4 の 形', keys: KEYS, gen: gen3,
      tip: { ex: ex('{x/3} = 4', 12), steps: ['両辺に 3 を かける', 'x = 4 × 3', 'x = 12'] } },
    { id: 4, icon: '🌼', title: '移項してから わる', desc: '3x + 5 = 20 の 形', keys: KEYS, gen: gen4,
      tip: { ex: ex('3x + 5 = 20', 5), steps: ['+5 を 移項: 3x = 20 − 5', '3x = 15', '両辺を 3 で わる → x = 5'] } },
    { id: 5, icon: '🎯', title: '両辺に x が ある', desc: '5x − 3 = 2x + 9 の 形', keys: KEYS, gen: gen5,
      tip: { ex: ex('5x − 3 = 2x + 9', 4), steps: ['x の 項を 左、数の 項を 右に 移項', '5x − 2x = 9 + 3', '3x = 12 → x = 4'] } },
    { id: 6, icon: '⚡', title: 'かっこの ある 方程式', desc: '2(x + 3) = 14 の 形', keys: KEYS, gen: gen6,
      tip: { ex: ex('2(x + 3) = 14', 4), steps: ['かっこを はずす: 2x + 6 = 14', '2x = 8', 'x = 4'] } },
    { id: 7, icon: '🔥', title: '係数が 小数', desc: '0.3x + 0.5 = 2 の 形', keys: KEYS, gen: gen7,
      tip: { ex: ex('0.3x + 0.5 = 2', 5), steps: ['両辺を 10倍 して 整数に する', '3x + 5 = 20', '3x = 15 → x = 5'] } },
    { id: 8, icon: '🚀', title: '係数が 分数', desc: '{x/2} + 1 = 4 の 形', keys: KEYS, gen: gen8,
      tip: { ex: ex('{x/2} + 1 = 4', 6), steps: ['両辺に 分母(2)を かける', 'x + 2 = 8', 'x = 6'] } },
    { id: 9, icon: '🎓', title: '答えが 分数', desc: '3x = 2 → x = {2/3}', keys: KEYS, gen: gen9,
      tip: { ex: ex('3x = 2', 2, 3), steps: ['両辺を 3 で わる', 'x = {2/3}', 'わりきれない ときは 分数で 答える'] } },
    { id: 'mix', icon: '👑', title: 'まとめ', desc: 'レベル1〜9から ランダム', keys: KEYS, mix: true },
  ],
}
