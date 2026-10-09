// ③ 約数と倍数 ── 倍数のならびから、最大公約数・最小公倍数まで
// 分数の 約分(最大公約数)と 通分(最小公倍数)の 下じゅんび。
import { ri, pick } from '../lib/rand.js'
import { ansNum, ansList } from '../lib/answer.js'
import { gcd, lcm } from '../lib/frac.js'

export const divisors = (n) => {
  const out = []
  for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i)
  return out
}

// 最大公約数が g の 2つの数(g×p と g×q。p と q はたがいに素)
const pairWithGcd = (gs, maxPQ, maxN) => {
  for (;;) {
    const g = pick(gs)
    const p = ri(1, maxPQ), qq = ri(1, maxPQ)
    if (p === qq || gcd(p, qq) !== 1) continue
    const a = g * Math.min(p, qq), b = g * Math.max(p, qq)
    if (b > maxN) continue
    return { a, b, g }
  }
}

// レベル1: 倍数のならび
const gen1 = () => {
  const k = ri(2, 12)
  const s = ri(1, 3)
  const hole = pick([2, 3, 3, 3])
  const seq = [0, 1, 2, 3].map(i => k * (s + i))
  const text = seq.map((n, i) => (i === hole ? '□' : `${n}`)).join(', ')
  return { lead: `${k} の 倍数`, text, prefix: '□ =', ans: ansNum(seq[hole]) }
}

// レベル2: 約数をぜんぶ
const DIV_POOL = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 36, 7, 11, 13]
const gen2 = () => {
  const n = pick(DIV_POOL)
  return { lead: '約数を ぜんぶ', text: `${n}`, prefix: '→', ans: ansList(divisors(n)) }
}

// レベル3: 最小公倍数(かんたん)
const LCM_EASY = [[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [2, 7], [3, 7], [2, 9], [5, 6],
  [2, 4], [3, 6], [4, 8], [3, 9], [5, 10], [2, 8], [4, 12], [6, 12], [2, 6], [7, 14]]
const gen3 = () => {
  const [a, b] = pick(LCM_EASY)
  return { lead: '最小公倍数', text: `${a} と ${b}`, prefix: '→', ans: ansNum(lcm(a, b)) }
}

// レベル4: 公約数をぜんぶ
const gen4 = () => {
  const { a, b, g } = pairWithGcd([2, 3, 4, 6, 8, 9, 12], 5, 48)
  return { lead: '公約数を ぜんぶ', text: `${a} と ${b}`, prefix: '→', ans: ansList(divisors(g)) }
}

// レベル5: 最大公約数
const gen5 = () => {
  const { a, b, g } = pairWithGcd([2, 3, 4, 5, 6, 7, 8, 9, 12, 14, 15, 18], 5, 72)
  return { lead: '最大公約数', text: `${a} と ${b}`, prefix: '→', ans: ansNum(g) }
}

// レベル6: 最小公倍数(わりきれない2つ)
const gen6 = () => {
  for (;;) {
    const { a, b } = pairWithGcd([2, 3, 4, 5, 6], 5, 30)
    if (a === b || b % a === 0) continue
    const L = lcm(a, b)
    if (L > 120) continue
    return { lead: '最小公倍数', text: `${a} と ${b}`, prefix: '→', ans: ansNum(L) }
  }
}

// レベル7: 3つの数
const LCM3 = [[2, 3, 4], [3, 4, 6], [4, 6, 8], [2, 5, 6], [3, 4, 5], [6, 8, 12], [4, 5, 10],
  [2, 3, 5], [6, 9, 12], [4, 6, 9], [2, 4, 6], [3, 6, 8], [4, 6, 10], [5, 6, 10]]
const gen7 = () => {
  if (Math.random() < 0.5) {
    const [a, b, c] = pick(LCM3)
    return { lead: '最小公倍数', text: `${a}, ${b}, ${c}`, prefix: '→', ans: ansNum(lcm(lcm(a, b), c)) }
  }
  for (;;) {
    const g = pick([2, 3, 4, 6])
    const ps = [ri(1, 6), ri(1, 6), ri(1, 6)].sort((x, y) => x - y)
    if (new Set(ps).size < 3 || gcd(gcd(ps[0], ps[1]), ps[2]) !== 1) continue
    const ns = ps.map(p => g * p)
    if (ns[2] > 60) continue
    return { lead: '最大公約数', text: ns.join(', '), prefix: '→', ans: ansNum(g) }
  }
}

const ex = (lead, text, ans) => ({ lead, text, prefix: '→', ans })

export default {
  id: 'yakubai',
  no: 3,
  icon: '🔗',
  title: '約数と 倍数',
  sub: '約分・通分の 下じゅんび',
  levels: [
    { id: 1, icon: '🌱', title: '倍数の ならび', desc: '□に 入る 数を 見つけよう', keys: [], gen: gen1,
      tip: { ex: { ...ex('4 の 倍数', '4, 8, 12, □', ansNum(16)), prefix: '□ =' },
        steps: ['倍数は 4 × 1、 4 × 2、 4 × 3 …', 'つぎは 4 × 4 = 16'] } },
    { id: 2, icon: '🌿', title: '約数を ぜんぶ', desc: '「,」で 区切って ならべよう', keys: [','], gen: gen2,
      tip: { ex: ex('約数を ぜんぶ', '12', ansList([1, 2, 3, 4, 6, 12])),
        steps: ['かけて 12 に なる 2つの 数を さがす', '1 × 12、 2 × 6、 3 × 4', '小さい じゅんに ならべる'] } },
    { id: 3, icon: '🍀', title: '最小公倍数(かんたん)', desc: '両方の 倍数の うち いちばん 小さい 数', keys: [], gen: gen3,
      tip: { ex: ex('最小公倍数', '3 と 4', ansNum(12)),
        steps: ['大きい ほう(4)の 倍数を じゅんに かく: 4, 8, 12', '3 で わりきれる 最初の 数が 答え'] } },
    { id: 4, icon: '🌼', title: '公約数を ぜんぶ', desc: '両方を わりきれる 数', keys: [','], gen: gen4,
      tip: { ex: ex('公約数を ぜんぶ', '12 と 18', ansList([1, 2, 3, 6])),
        steps: ['12 の 約数: 1, 2, 3, 4, 6, 12', 'その 中で 18 も わりきれる 数を えらぶ'] } },
    { id: 5, icon: '🎯', title: '最大公約数', desc: '公約数の うち いちばん 大きい 数', keys: [], gen: gen5,
      tip: { ex: ex('最大公約数', '24 と 36', ansNum(12)),
        steps: ['小さい ほう(24)の 約数を 大きい じゅんに: 24, 12, 8 …', '36 も わりきれる 最初の 数が 答え'] } },
    { id: 6, icon: '⚡', title: '最小公倍数', desc: 'わりきれない 2つの 数', keys: [], gen: gen6,
      tip: { ex: ex('最小公倍数', '6 と 8', ansNum(24)),
        steps: ['8 の 倍数を じゅんに: 8, 16, 24 …', '6 で わりきれる 最初の 数が 答え'] } },
    { id: 7, icon: '🎓', title: '3つの 数', desc: '最大公約数・最小公倍数', keys: [], gen: gen7,
      tip: { ex: ex('最小公倍数', '4, 6, 8', ansNum(24)),
        steps: ['いちばん 大きい 8 の 倍数を じゅんに: 8, 16, 24', '4 でも 6 でも わりきれる 最初の 数が 答え', '最大公約数は、いちばん 小さい 数の 約数から さがす'] } },
    { id: 'mix', icon: '👑', title: 'まとめ', desc: 'レベル1〜7から ランダム', keys: [','], mix: true },
  ],
}
