// ── レベル定義(小学生・小数の暗算 四則計算)──────────────────
export const LEVELS = [
  { id: 1,  icon: '🌱', title: '0.1のたし算',        desc: '答えが1より小さいたし算',     example: '0.3 + 0.4' },
  { id: 2,  icon: '🌿', title: '0.1のひき算',        desc: '小数第1位どうしのひき算',     example: '0.8 − 0.5' },
  { id: 3,  icon: '🍀', title: '1をまたぐ計算',        desc: 'くり上がり・くり下がり',      example: '0.7 + 0.6' },
  { id: 4,  icon: '🌼', title: '整数のある小数',      desc: '2.4 + 1.3 のような計算',      example: '2.4 + 1.3' },
  { id: 5,  icon: '🎯', title: '100分の1の位',        desc: '小数第2位までのたし算ひき算', example: '0.25 + 0.14' },
  { id: 6,  icon: '⚡', title: '小数 × 整数',         desc: '小数に整数をかける',          example: '0.6 × 4' },
  { id: 7,  icon: '🔥', title: '小数 ÷ 整数',         desc: '小数を整数でわる',            example: '2.4 ÷ 3' },
  { id: 8,  icon: '🚀', title: '10倍・1/10',          desc: '小数点の位置を動かそう',      example: '0.35 × 10' },
  { id: 9,  icon: '🧩', title: '小数 × 小数',         desc: '小数どうしのかけ算',          example: '0.3 × 0.4' },
  { id: 10, icon: '🎓', title: '小数 ÷ 小数',         desc: '小数どうしのわり算',          example: '1.2 ÷ 0.3' },
  { id: 11, icon: '👑', title: 'ミックス',            desc: 'レベル1〜10からランダム出題', example: '？' },
]

export const MIX_LEVEL = 11

export const levelLabel = (id) => (id === MIX_LEVEL ? '総合' : `レベル${id}`)

export const QUESTION_COUNT = 10

// ── 数の表示ユーティリティ ───────────────────────────────────
// 生成はすべて整数どうしの計算 ÷ 10のべき乗 で行い、最後に丸めて誤差を消す。
const round6 = (v) => Math.round(v * 1e6) / 1e6

export const fmtNum = (v) => String(round6(v))

// 10のべき乗で割って小数にする(d1(3) → "0.3"、d2(25) → "0.25")
const d1 = (i) => fmtNum(i / 10)
const d2 = (i) => fmtNum(i / 100)

// ── 問題生成 ─────────────────────────────────────────────────
const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[ri(0, arr.length - 1)]

// 10の倍数を避けて選ぶ(d1() に渡すと整数になってしまうため)
const riDec = (min, max) => {
  let v = ri(min, max)
  while (v % 10 === 0) v = ri(min, max)
  return v
}

// 各問題は { text, ans } — ans は数値
const q = (text, ans) => ({ text, ans: round6(ans) })

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

const GENERATORS = { 1: gen1, 2: gen2, 3: gen3, 4: gen4, 5: gen5, 6: gen6, 7: gen7, 8: gen8, 9: gen9, 10: gen10 }
const MIX_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const genFor = (level) =>
  level === MIX_LEVEL ? GENERATORS[pick(MIX_POOL)]() : GENERATORS[level]()

export const generateQuestions = (level, count = QUESTION_COUNT) => {
  const qs = []
  const seen = new Set()
  while (qs.length < count) {
    let item = genFor(level)
    // なるべく重複を避ける(20回試してだめなら許容)
    for (let t = 0; t < 20 && seen.has(item.text); t++) item = genFor(level)
    seen.add(item.text)
    qs.push(item)
  }
  return qs
}

// ── 答えの判定 ───────────────────────────────────────────────
export const parseAnswer = (str) => {
  if (!str || str === '.') return null
  if (!/^\d*\.?\d*$/.test(str)) return null
  const v = parseFloat(str)
  return Number.isNaN(v) ? null : v
}

// 小数点と前後の0を取り除いた「数字のならび」(0.12 と 1.2 は同じ "12")
const digitsOf = (str) => str.replace('.', '').replace(/^0+/, '').replace(/0+$/, '')

export const checkAnswer = (item, input) => {
  const v = parseAnswer(input)
  if (v == null) return { correct: false, pointMiss: false }
  const correct = Math.abs(v - item.ans) < 1e-9
  // 数字は合っているのに値がちがう = 小数点の位置ミス
  const digits = digitsOf(input)
  const pointMiss = !correct && digits !== '' && digits === digitsOf(fmtNum(item.ans))
  return { correct, pointMiss }
}

// ── サウンド ──────────────────────────────────────────────────
export class SoundService {
  constructor() { this.ctx = null }

  _resume() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) this.ctx = new AC()
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  _note(type, freq, startTime, duration, freqEnd = null) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)
    if (freqEnd) osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration)
    gain.gain.setValueAtTime(0.1, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(startTime); osc.stop(startTime + duration)
  }

  playCorrect() {
    const ctx = this._resume(); if (!ctx) return
    const t = ctx.currentTime
    this._note('triangle', 660, t, 0.3)
    this._note('triangle', 1320, t + 0.1, 0.4)
  }

  playWrong() {
    const ctx = this._resume(); if (!ctx) return
    const t = ctx.currentTime
    this._note('sawtooth', 150, t, 0.3, 100)
  }

  playTap() {
    const ctx = this._resume(); if (!ctx) return
    const t = ctx.currentTime
    this._note('triangle', 400, t, 0.05)
  }

  playFinish() {
    const ctx = this._resume(); if (!ctx) return
    const t = ctx.currentTime
    this._note('triangle', 523, t,        0.15)
    this._note('triangle', 659, t + 0.12, 0.15)
    this._note('triangle', 784, t + 0.24, 0.15)
    this._note('triangle', 1047, t + 0.36, 0.4)
  }
}

export const soundService = new SoundService()
