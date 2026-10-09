// ④ 分数の計算 ── 約分から、かけ算・わり算のまじった計算まで
// 問題文の {a/b} は、たてに 重ねた 分数として 表示される(components/MathText.jsx)。
import { ri } from '../lib/rand.js'
import { ansFrac } from '../lib/answer.js'
import { gcd, frac, add, sub, mul, div } from '../lib/frac.js'

const F = (n, d) => `{${n}/${d}}`

// たがいに素な 真分数 p/q(分母は minD〜maxD)
const properFrac = (minD, maxD) => {
  for (;;) {
    const d = ri(minD, maxD), n = ri(1, d - 1)
    if (gcd(n, d) === 1) return { n, d }
  }
}

// 分母が d の 真分数(約分ずみ)
const withD = (d) => {
  for (;;) {
    const n = ri(1, d - 1)
    if (gcd(n, d) === 1) return { n, d }
  }
}

const q = (text, f, lead) => ({ ...(lead ? { lead } : {}), text, ans: ansFrac(f.n, f.d) })

// レベル1: 約分
const gen1 = () => {
  const { n, d } = properFrac(2, 9)
  const k = ri(2, 6)
  return q(F(n * k, d * k), frac(n, d), '約分しよう')
}

// レベル2: 分母が同じたし算・ひき算
const gen2 = () => {
  const d = ri(3, 12)
  const a = withD(d), b = withD(d)
  if (Math.random() < 0.5) return q(`${F(a.n, d)} + ${F(b.n, d)}`, frac(a.n + b.n, d))
  if (a.n === b.n) return gen2()
  const [hi, lo] = a.n > b.n ? [a.n, b.n] : [b.n, a.n]
  return q(`${F(hi, d)} − ${F(lo, d)}`, frac(hi - lo, d))
}

// 2つの分数のたし算・ひき算(ひき算は答えが正になるように並べる)
const addSub = (x, y) => {
  if (Math.random() < 0.5) return q(`${F(x.n, x.d)} + ${F(y.n, y.d)}`, add(x, y))
  const [big, small] = x.n * y.d >= y.n * x.d ? [x, y] : [y, x]
  if (big.n * small.d === small.n * big.d) return q(`${F(x.n, x.d)} + ${F(y.n, y.d)}`, add(x, y))
  return q(`${F(big.n, big.d)} − ${F(small.n, small.d)}`, sub(big, small))
}

// レベル3: 分母がちがう(一方の分母が、もう一方の倍数)
const gen3 = () => {
  for (;;) {
    const d1 = ri(2, 6), d2 = d1 * ri(2, 3)
    if (d2 > 12) continue
    const x = withD(d1), y = withD(d2)
    return Math.random() < 0.5 ? addSub(x, y) : addSub(y, x)
  }
}

// レベル4: 通分(分母の最小公倍数にそろえる)
const gen4 = () => {
  for (;;) {
    const d1 = ri(2, 10), d2 = ri(2, 10)
    if (d1 === d2 || d1 % d2 === 0 || d2 % d1 === 0) continue
    if ((d1 * d2) / gcd(d1, d2) > 36) continue
    return addSub(withD(d1), withD(d2))
  }
}

// レベル5: 分数 × 整数・分数 ÷ 整数
const gen5 = () => {
  const x = properFrac(2, 9)
  const m = ri(2, 6)
  const v = ri(1, 3)
  if (v === 1) return q(`${F(x.n, x.d)} × ${m}`, mul(x, frac(m)))
  if (v === 2) return q(`${m} × ${F(x.n, x.d)}`, mul(x, frac(m)))
  return q(`${F(x.n, x.d)} ÷ ${m}`, div(x, frac(m)))
}

const small = (f, maxN, maxD) => Math.abs(f.n) <= maxN && f.d <= maxD

// レベル6: 分数 × 分数
const gen6 = () => {
  for (;;) {
    const x = properFrac(2, 9), y = properFrac(2, 9)
    const r = mul(x, y)
    // 約分のある問題を多めにする
    if (gcd(x.n, y.d) === 1 && gcd(y.n, x.d) === 1 && Math.random() < 0.6) continue
    if (!small(r, 30, 40)) continue
    return q(`${F(x.n, x.d)} × ${F(y.n, y.d)}`, r)
  }
}

// レベル7: 分数 ÷ 分数
const gen7 = () => {
  for (;;) {
    const x = properFrac(2, 9), y = properFrac(2, 9)
    const r = div(x, y)
    if (gcd(x.n, y.n) === 1 && gcd(x.d, y.d) === 1 && Math.random() < 0.6) continue
    if (!small(r, 30, 30)) continue
    return q(`${F(x.n, x.d)} ÷ ${F(y.n, y.d)}`, r)
  }
}

// レベル8: かけ算・わり算のまじった計算
const gen8 = () => {
  for (;;) {
    const x = properFrac(2, 9), y = properFrac(2, 9), z = properFrac(2, 9)
    if (Math.random() < 0.6) {
      const r = div(mul(x, y), z)
      if (!small(r, 12, 12)) continue
      return q(`${F(x.n, x.d)} × ${F(y.n, y.d)} ÷ ${F(z.n, z.d)}`, r)
    }
    const m = ri(2, 6)
    const r = mul(div(x, y), frac(m))
    if (!small(r, 12, 12)) continue
    return q(`${F(x.n, x.d)} ÷ ${F(y.n, y.d)} × ${m}`, r)
  }
}

const ex = (text, n, d, lead) => q(text, frac(n, d), lead)

export default {
  id: 'bunsu',
  no: 4,
  icon: '🍰',
  title: '分数の 計算',
  sub: '約分から かけ算・わり算まで',
  levels: [
    { id: 1, icon: '🌱', title: '約分', desc: '分子と 分母を 同じ 数で わろう', keys: ['/'], gen: gen1,
      tip: { ex: { ...ex('{6/8}', 3, 4, '約分しよう') },
        steps: ['分子と 分母を 同じ 数で わる', '6 と 8 は どちらも 2 で われる', '{6/8} = {3/4}'] } },
    { id: 2, icon: '🌿', title: '分母が 同じ たし算・ひき算', desc: '分子どうしを 計算しよう', keys: ['/'], gen: gen2,
      tip: { ex: ex('{2/7} + {3/7}', 5, 7),
        steps: ['分母は そのまま', '分子どうしを 計算する: 2 + 3 = 5', 'さいごに 約分 できるか たしかめる'] } },
    { id: 3, icon: '🍀', title: '分母が ちがう(かんたん)', desc: '大きい ほうの 分母に そろえよう', keys: ['/'], gen: gen3,
      tip: { ex: ex('{1/2} + {1/4}', 3, 4),
        steps: ['分母を 大きい ほう(4)に そろえる', '{1/2} = {2/4}', '{2/4} + {1/4} = {3/4}'] } },
    { id: 4, icon: '🌼', title: '分母が ちがう(通分)', desc: '分母の 最小公倍数に そろえよう', keys: ['/'], gen: gen4,
      tip: { ex: ex('{1/4} + {1/6}', 5, 12),
        steps: ['分母を 最小公倍数(12)に そろえる', '{1/4} = {3/12}、 {1/6} = {2/12}', '{3/12} + {2/12} = {5/12}'] } },
    { id: 5, icon: '🎯', title: '分数 × 整数・÷ 整数', desc: 'かける 数は 分子? 分母?', keys: ['/'], gen: gen5,
      tip: { ex: ex('{2/9} × 3', 2, 3),
        steps: ['× 整数 → 分子に かける', '÷ 整数 → 分母に かける', '{2/9} × 3 = {6/9} = {2/3}'] } },
    { id: 6, icon: '⚡', title: '分数 × 分数', desc: 'かける まえに 約分しよう', keys: ['/'], gen: gen6,
      tip: { ex: ex('{2/3} × {3/4}', 1, 2),
        steps: ['分子どうし、分母どうしを かける', 'かける まえに 約分 すると 楽', '{2/3} × {3/4} = {6/12} = {1/2}'] } },
    { id: 7, icon: '🔥', title: '分数 ÷ 分数', desc: 'わる 数を ひっくり返して かけよう', keys: ['/'], gen: gen7,
      tip: { ex: ex('{3/4} ÷ {3/8}', 2, 1),
        steps: ['わる 数の 分子と 分母を 入れかえて かける', '{3/4} × {8/3}', '= {24/12} = 2'] } },
    { id: 8, icon: '🎓', title: 'かけ算・わり算の まじった 計算', desc: '÷ を × に なおして まとめよう', keys: ['/'], gen: gen8,
      tip: { ex: ex('{2/3} × {3/4} ÷ {1/2}', 1, 1),
        steps: ['÷ は、入れかえて × に なおす', '{2/3} × {3/4} × {2/1}', 'まとめて 約分 → 1'] } },
    { id: 'mix', icon: '👑', title: 'まとめ', desc: 'レベル1〜8から ランダム', keys: ['/'], mix: true },
  ],
}
