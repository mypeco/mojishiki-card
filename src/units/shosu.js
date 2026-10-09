// ② 小数の計算 ── 0.1のたし算から、小数 ÷ 小数まで
// もとは「小数カード」(/shosu/)。問題の作り方はそのまま引きついでいる。
import { ri, pick } from '../lib/rand.js'
import { ansNum } from '../lib/answer.js'
import { fromDecimal } from '../lib/frac.js'

// 生成はすべて整数どうしの計算 ÷ 10のべき乗 で行い、最後に丸めて誤差を消す。
const round6 = (v) => Math.round(v * 1e6) / 1e6
export const fmtNum = (v) => String(round6(v))
const ansNumFromFloat = (v) => {
  const f = fromDecimal(fmtNum(v))
  return ansNum(f.n, f.d)
}

// 10のべき乗で割って小数にする(d1(3) → "0.3"、d2(25) → "0.25")
const d1 = (i) => fmtNum(i / 10)
const d2 = (i) => fmtNum(i / 100)

// 10の倍数を避けて選ぶ(d1() に渡すと整数になってしまうため)
const riDec = (min, max) => {
  let v = ri(min, max)
  while (v % 10 === 0) v = ri(min, max)
  return v
}

// 各問題は { text, ans }。生成は浮動小数で計算し、丸めてから誤差のない分数にする
const q = (text, v) => ({ text, ans: ansNumFromFloat(v) })

// レベル1: 0.1のたし算(答えは0.9まで)
const gen1 = () => {
  const a = ri(1, 8)
  const b = ri(1, 9 - a)
  return q(`${d1(a)} + ${d1(b)}`, (a + b) / 10)
}

// レベル2: 0.1のひき算
const gen2 = () => {
  const a = ri(2, 9)
  const b = ri(1, a - 1)
  return q(`${d1(a)} − ${d1(b)}`, (a - b) / 10)
}

// レベル3: くり上がり・くり下がり
const gen3 = () => {
  const v = ri(1, 4)
  if (v === 1) {
    // 0.7 + 0.6 = 1.3(答えが1以上になる)
    const a = ri(2, 9)
    const b = ri(11 - a, 9)
    return q(`${d1(a)} + ${d1(b)}`, (a + b) / 10)
  }
  if (v === 2) {
    // 1.4 − 0.8 = 0.6(1をくずす)
    const a = ri(11, 18)
    const b = ri(a - 9, 9)
    return q(`${d1(a)} − ${d1(b)}`, (a - b) / 10)
  }
  if (v === 3) {
    // 1 − 0.4 = 0.6
    const b = ri(1, 9)
    return q(`1 − ${d1(b)}`, (10 - b) / 10)
  }
  // 0.6 + 0.4 = 1(ちょうど1になる)
  const a = ri(1, 9)
  return q(`${d1(a)} + ${d1(10 - a)}`, 1)
}

// レベル4: 整数部のある小数のたし算・ひき算(小数第1位)
const gen4 = () => {
  const v = ri(1, 4)
  if (v === 1) {
    const a = riDec(11, 79)
    const b = riDec(11, Math.min(39, 99 - a))
    return q(`${d1(a)} + ${d1(b)}`, (a + b) / 10)
  }
  if (v === 2) {
    const a = riDec(21, 89)
    const b = riDec(11, a - 10)
    return q(`${d1(a)} − ${d1(b)}`, (a - b) / 10)
  }
  if (v === 3) {
    // 5 − 1.8 = 3.2
    const n = ri(2, 9)
    const b = riDec(11, n * 10 - 1)
    return q(`${n} − ${d1(b)}`, (n * 10 - b) / 10)
  }
  // 2.6 + 3 = 5.6
  const a = riDec(11, 69)
  const n = ri(1, 4)
  return q(`${d1(a)} + ${n}`, (a + n * 10) / 10)
}

// レベル5: 100分の1の位
const gen5 = () => {
  const v = ri(1, 4)
  if (v === 1) {
    const a = ri(11, 78)
    const b = ri(11, 99 - a)
    return q(`${d2(a)} + ${d2(b)}`, (a + b) / 100)
  }
  if (v === 2) {
    const a = ri(25, 99)
    const b = ri(11, a - 10)
    return q(`${d2(a)} − ${d2(b)}`, (a - b) / 100)
  }
  if (v === 3) {
    // 0.3 + 0.45 のように位のちがう小数
    const a = ri(1, 5) * 10
    const b = ri(11, 49)
    return pick([
      q(`${d2(a)} + ${d2(b)}`, (a + b) / 100),
      q(`${d2(b)} + ${d2(a)}`, (a + b) / 100),
    ])
  }
  // 1 − 0.35 = 0.65
  const b = ri(11, 95)
  return q(`1 − ${d2(b)}`, (100 - b) / 100)
}

// レベル6: 小数 × 整数
const gen6 = () => {
  const v = ri(1, 4)
  if (v === 1) {
    const a = ri(2, 9)
    const m = ri(2, 9)
    return q(`${d1(a)} × ${m}`, (a * m) / 10)
  }
  if (v === 2) {
    const a = riDec(11, 39)
    const m = ri(2, 5)
    return q(`${d1(a)} × ${m}`, (a * m) / 10)
  }
  if (v === 3) {
    const m = ri(2, 9)
    const a = ri(2, 9)
    return q(`${m} × ${d1(a)}`, (a * m) / 10)
  }
  // 0.25 × 4 のようなキリのよい計算
  const [a, m] = pick([[25, 4], [25, 8], [75, 4], [5, 6], [5, 8], [15, 4], [125, 8], [12, 5], [24, 5]])
  return q(`${d2(a)} × ${m}`, (a * m) / 100)
}

// レベル7: 小数 ÷ 整数(わりきれるものだけ)
const gen7 = () => {
  const v = ri(1, 3)
  if (v === 1) {
    // 0.3 × 7 = 2.1 → 2.1 ÷ 7 = 0.3
    const ans = ri(2, 9)
    const m = ri(2, 9)
    return q(`${d1(ans * m)} ÷ ${m}`, ans / 10)
  }
  if (v === 2) {
    const ans = riDec(11, 29)
    const m = ri(2, 4)
    return q(`${d1(ans * m)} ÷ ${m}`, ans / 10)
  }
  // 0.3 ÷ 6 = 0.05(答えが100分の1の位)
  const ans = ri(2, 9) * 5
  const m = ri(2, 9)
  return q(`${d2(ans * m)} ÷ ${m}`, ans / 100)
}

// レベル8: 10倍・100倍・1/10・1/100
const gen8 = () => {
  const v = ri(1, 4)
  if (v === 1) {
    // 0.35 × 10 = 3.5
    const a = ri(11, 99)
    return q(`${d2(a)} × 10`, a / 10)
  }
  if (v === 2) {
    // 0.35 × 100 = 35
    const a = pick([ri(2, 9) * 10, ri(11, 99)])
    return q(`${d2(a)} × 100`, a)
  }
  if (v === 3) {
    // 4.7 ÷ 10 = 0.47
    const a = pick([ri(2, 99) * 10, ri(11, 99)])
    return q(`${d1(a)} ÷ 10`, a / 100)
  }
  // 4.2 ÷ 100 = 0.042
  const a = pick([ri(2, 99) * 10, ri(11, 99)])
  return q(`${d1(a)} ÷ 100`, a / 1000)
}

// レベル9: 小数 × 小数
const gen9 = () => {
  const v = ri(1, 3)
  if (v === 1) {
    // 0.3 × 0.4 = 0.12
    const a = ri(2, 9)
    const b = ri(2, 9)
    return q(`${d1(a)} × ${d1(b)}`, (a * b) / 100)
  }
  if (v === 2) {
    // 1.2 × 0.4 = 0.48
    const a = riDec(11, 25)
    const b = ri(2, 6)
    return q(`${d1(a)} × ${d1(b)}`, (a * b) / 100)
  }
  // 0.5 × 0.8 のようにキリのよい計算
  const a = pick([5, 2, 4, 25])
  if (a === 25) {
    const b = pick([2, 4, 6, 8])
    return q(`${d2(a)} × ${d1(b)}`, (a * b) / 1000)
  }
  const b = ri(2, 9)
  return q(`${d1(a)} × ${d1(b)}`, (a * b) / 100)
}

// レベル10: 小数 ÷ 小数(わりきれるものだけ)
const gen10 = () => {
  const v = ri(1, 3)
  if (v === 1) {
    // 2.1 ÷ 0.3 = 7(答えが整数)
    const d = ri(2, 9)
    const ans = ri(2, 9)
    return q(`${d1(d * ans)} ÷ ${d1(d)}`, ans)
  }
  if (v === 2) {
    // 0.24 ÷ 0.4 = 0.6(答えが小数第1位)
    const d = ri(2, 9)
    const ans = ri(2, 9)
    return q(`${d2(d * ans)} ÷ ${d1(d)}`, ans / 10)
  }
  // 3.6 ÷ 1.2 = 3
  const d = riDec(11, 25)
  const ans = ri(2, 5)
  return q(`${d1(d * ans)} ÷ ${d1(d)}`, ans)
}

// ── ヒント(筆算の図解)────────────────────────────────────────
// 問題文から筆算の組み立て方を求める。答えの数字は出さず「やり方」だけを示す。
const dp = (s) => (s.includes('.') ? s.split('.')[1].length : 0)

// 小数点をとった数字のならび(0.05 → "5")
const stripDot = (s) => s.replace('.', '').replace(/^0+/, '') || '0'

export const hintFor = (item) => {
  const m = item.text.match(/^([\d.]+) ([+−×÷]) ([\d.]+)$/)
  if (!m) return null
  const [, a, op, b] = m

  // たし算・ひき算 → 位をそろえる筆算
  if (op === '+' || op === '−') return { kind: 'column', a, b, op }

  // ×10 / ×100 / ÷10 / ÷100 → 小数点を動かす
  if ((b === '10' || b === '100') && (op === '×' || op === '÷')) {
    return { kind: 'shift', a, b, op, dir: op === '×' ? 'right' : 'left', n: b.length - 1 }
  }

  // かけ算 → 右にそろえて計算し、小数点以下のけた数だけ小数点を動かす
  if (op === '×') {
    return { kind: 'mul', a, b, da: dp(a), db: dp(b), ia: stripDot(a), ib: stripDot(b) }
  }

  // わる数が整数のわり算 → 商の小数点はわられる数の小数点の真上
  if (dp(b) === 0) return { kind: 'div', a, b }

  // わる数が小数のわり算 → 両方を10倍・100倍して、わる数を整数にする
  const k = Math.pow(10, dp(b))
  return {
    kind: 'divDecimal', a, b, k,
    a2: fmtNum(parseFloat(a) * k),
    b2: fmtNum(parseFloat(b) * k),
  }
}

const ex = (text, v) => ({ text, ans: ansNumFromFloat(v) })

export default {
  id: 'shosu',
  no: 2,
  icon: '🔟',
  title: '小数の 計算',
  sub: '0.1の たし算から 小数 ÷ 小数まで',
  // ヒントは、問題ごとに ひっ算の 図を 出す(components/DecimalHint.jsx)
  hintKind: 'decimal',
  levels: [
    { id: 1,  icon: '🌱', title: '0.1の たし算',     desc: '答えが 1より 小さい たし算', keys: ['.'], gen: gen1 },
    { id: 2,  icon: '🌿', title: '0.1の ひき算',     desc: '小数第1位どうしの ひき算',   keys: ['.'], gen: gen2 },
    { id: 3,  icon: '🍀', title: '1を またぐ 計算',  desc: 'くり上がり・くり下がり',     keys: ['.'], gen: gen3 },
    { id: 4,  icon: '🌼', title: '整数の ある 小数', desc: '2.4 + 1.3 の ような 計算',   keys: ['.'], gen: gen4 },
    { id: 5,  icon: '🎯', title: '100分の1の 位',    desc: '小数第2位までの たし算・ひき算', keys: ['.'], gen: gen5 },
    { id: 6,  icon: '⚡', title: '小数 × 整数',      desc: '小数に 整数を かける',       keys: ['.'], gen: gen6 },
    { id: 7,  icon: '🔥', title: '小数 ÷ 整数',      desc: '小数を 整数で わる',         keys: ['.'], gen: gen7 },
    { id: 8,  icon: '🚀', title: '10倍・{1/10}',     desc: '小数点の 位置を うごかそう', keys: ['.'], gen: gen8 },
    { id: 9,  icon: '🧩', title: '小数 × 小数',      desc: '小数どうしの かけ算',        keys: ['.'], gen: gen9 },
    { id: 10, icon: '🎓', title: '小数 ÷ 小数',      desc: '小数どうしの わり算',        keys: ['.'], gen: gen10 },
    { id: 'mix', icon: '👑', title: 'まとめ', desc: 'レベル1〜10から ランダム', keys: ['.'], mix: true },
  ],
}
