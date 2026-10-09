// ── 分数(有理数)の小さな道具 ──────────────────────────────────
// 分数・小数・方程式の答えは、誤差の出ない「分子 / 分母」で持つ。
// 分母はいつも正、いつも約分ずみ(n/d は既約)。

export const gcd = (a, b) => {
  a = Math.abs(a); b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}

export const lcm = (a, b) => Math.abs(a * b) / gcd(a, b)

export const frac = (n, d = 1) => {
  if (d === 0) throw new Error('分母が 0')
  if (d < 0) { n = -n; d = -d }
  const g = gcd(n, d) || 1
  return { n: n / g, d: d / g }
}

export const add = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d)
export const sub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d)
export const mul = (a, b) => frac(a.n * b.n, a.d * b.d)
export const div = (a, b) => frac(a.n * b.d, a.d * b.n)
export const eq = (a, b) => a.n === b.n && a.d === b.d

// 小数の文字列("0.25")を分数にする
export const fromDecimal = (s) => {
  const neg = s.startsWith('-')
  const t = neg ? s.slice(1) : s
  const [i, f = ''] = t.split('.')
  const d = 10 ** f.length
  const n = parseInt((i || '0') + f, 10)
  return frac(neg ? -n : n, d)
}

// 小数で書ききれる分数を小数の文字列にする(書ききれなければ null)
export const toDecimal = ({ n, d }) => {
  let k = 0
  let dd = d
  while (dd % 2 === 0) { dd /= 2; k++ }
  let k5 = 0
  while (dd % 5 === 0) { dd /= 5; k5++ }
  if (dd !== 1) return null
  const places = Math.max(k, k5)
  const scaled = Math.abs(n) * (10 ** places / d)
  const s = String(Math.round(scaled)).padStart(places + 1, '0')
  const body = places ? `${s.slice(0, -places)}.${s.slice(-places)}` : s
  return (n < 0 ? '−' : '') + body
}
