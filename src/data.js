// ── レベル定義(中1 文字式の計算・段階別)──────────────────────
export const LEVELS = [
  { id: 1, icon: '🌱', title: '文字の項のたし算', desc: '同じ文字の項をまとめよう', example: '3x + 5x' },
  { id: 2, icon: '🌿', title: '文字の項のひき算', desc: '係数どうしをひき算しよう', example: '7x − 3x' },
  { id: 3, icon: '🍀', title: '負の数がでてくる計算', desc: '答えがマイナスになることも', example: '2x − 7x' },
  { id: 4, icon: '🌼', title: '数の項がまざった計算', desc: '文字の項と数の項を整理しよう', example: '4x + 3 + 2x' },
  { id: 5, icon: '⚡', title: '文字式 × 数・÷ 数', desc: '係数に数をかけたりわったり', example: '3x × 4' },
  { id: 6, icon: '🔥', title: '分配法則', desc: 'かっこの中に数を配ろう', example: '3(2x + 4)' },
  { id: 7, icon: '🚀', title: 'かっこのあるたし算・ひき算', desc: 'かっこをはずして整理しよう', example: '(5x + 3) − (2x + 1)' },
  { id: 9, icon: '🧩', title: '累乗の表し方', desc: 'x × x は x² と書こう', example: '2 × x × x' },
  { id: 10, icon: '🎓', title: '中2チャレンジ', desc: '単項式のかけ算と同類項', example: '3x × 2x' },
  { id: 8, icon: '👑', title: 'ミックス', desc: 'レベル1〜9からランダム出題', example: '？' },
]

export const levelLabel = (id) => (id === 8 ? '総合' : `レベル${id}`)

export const QUESTION_COUNT = 10

// ── 表示ユーティリティ ───────────────────────────────────────
// マイナスは表示用に U+2212(−)、累乗は上付き文字(² ³)を使う。判定時に正規化する。
const SUP = { 2: '²', 3: '³' }

// 係数 c・次数 e の項を文字列にする(e=0 は定数項)
const powStr = (c, e) => {
  if (e === 0) return c < 0 ? `−${Math.abs(c)}` : String(c)
  const x = e === 1 ? 'x' : `x${SUP[e]}`
  if (c === 1) return x
  if (c === -1) return `−${x}`
  if (c < 0) return `−${Math.abs(c)}${x}`
  return `${c}${x}`
}

const coefStr = (c) => powStr(c, 1)

// 旧形式の問題({a, b})も多項式 {次数: 係数} に揃える
export const qPoly = (q) => q.p ?? { 1: q.a ?? 0, 0: q.b ?? 0 }

// 多項式を正規形の文字列にする(表示用)
export const formatAnswer = (p) => {
  const exps = Object.keys(p).map(Number).filter(e => p[e] !== 0).sort((x, y) => y - x)
  if (exps.length === 0) return '0'
  let s = ''
  exps.forEach((e, i) => {
    const c = p[e]
    if (i === 0) s += powStr(c, e)
    else s += (c < 0 ? ' − ' : ' + ') + powStr(Math.abs(c), e)
  })
  return s
}

// ── 問題生成 ─────────────────────────────────────────────────
const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[ri(0, arr.length - 1)]

// 各問題は { text, p } — 答えは多項式 p = { 次数: 係数 }
const gen1 = () => {
  const a = ri(1, 8), b = ri(1, 8)
  return { text: `${coefStr(a)} + ${coefStr(b)}`, p: { 1: a + b } }
}

const gen2 = () => {
  const a = ri(2, 9), b = ri(1, a)
  return { text: `${coefStr(a)} − ${coefStr(b)}`, p: { 1: a - b } }
}

const gen3 = () => {
  if (Math.random() < 0.5) {
    const a = ri(1, 8), b = ri(a + 1, 9)
    return { text: `${coefStr(a)} − ${coefStr(b)}`, p: { 1: a - b } }
  }
  const a = ri(1, 9), b = ri(1, 9)
  return { text: `${coefStr(-a)} + ${coefStr(b)}`, p: { 1: b - a } }
}

const gen4 = () => {
  const a = ri(1, 6), c = ri(1, 9)
  const v = ri(1, 4)
  if (v === 1) {
    const b = ri(1, 6)
    return { text: `${coefStr(a)} + ${c} + ${coefStr(b)}`, p: { 1: a + b, 0: c } }
  }
  if (v === 2) {
    const b = ri(1, 6)
    return { text: `${coefStr(a)} + ${coefStr(b)} + ${c}`, p: { 1: a + b, 0: c } }
  }
  if (v === 3) {
    let b = ri(1, 6)
    while (b === a) b = ri(1, 6)
    return { text: `${coefStr(a)} + ${c} − ${coefStr(b)}`, p: { 1: a - b, 0: c } }
  }
  const b = ri(1, 6)
  return { text: `${coefStr(a)} − ${c} + ${coefStr(b)}`, p: { 1: a + b, 0: -c } }
}

const gen5 = () => {
  const v = ri(1, 4)
  if (v === 1) {
    const a = ri(2, 9), m = ri(2, 6)
    return { text: `${coefStr(a)} × ${m}`, p: { 1: a * m } }
  }
  if (v === 2) {
    const a = ri(2, 9), m = ri(2, 6)
    return { text: `${m} × ${coefStr(a)}`, p: { 1: a * m } }
  }
  if (v === 3) {
    const a = ri(2, 9), m = ri(2, 6)
    return { text: `${coefStr(a * m)} ÷ ${m}`, p: { 1: a } }
  }
  const a = ri(2, 6), m = ri(2, 5)
  return { text: `${coefStr(-a)} × ${m}`, p: { 1: -a * m } }
}

const gen6 = () => {
  const m = pick([2, 3, 4, 5, -2, -3])
  const a = ri(1, 5)
  const b = ri(1, 5) * pick([1, -1])
  const inner = `${coefStr(a)} ${b > 0 ? '+' : '−'} ${Math.abs(b)}`
  const mStr = m < 0 ? `−${Math.abs(m)}` : `${m}`
  return { text: `${mStr}(${inner})`, p: { 1: m * a, 0: m * b } }
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
  return { text: `${left} ${op} ${right}`, p: { 1: ra, 0: rb } }
}

// レベル9: 累乗の表し方(中1「積の表し方」)
const gen9 = () => {
  const v = ri(1, 6)
  if (v === 1) return { text: 'x × x', p: { 2: 1 } }
  if (v === 2) return { text: 'x × x × x', p: { 3: 1 } }
  const a = ri(2, 9)
  if (v === 3) return { text: `${a} × x × x`, p: { 2: a } }
  if (v === 4) return { text: `x × x × ${a}`, p: { 2: a } }
  if (v === 5) return { text: `x × ${a} × x`, p: { 2: a } }
  return { text: `${a} × x × x × x`, p: { 3: a } }
}

// レベル10: 中2チャレンジ(単項式の乗法・除法・同類項)
const gen10 = () => {
  const v = ri(1, 6)
  if (v === 1) {
    const a = ri(2, 5), b = ri(2, 5)
    return { text: `${coefStr(a)} × ${coefStr(b)}`, p: { 2: a * b } }
  }
  if (v === 2) {
    const a = ri(2, 9)
    return { text: `x × ${coefStr(a)}`, p: { 2: a } }
  }
  if (v === 3) {
    const a = ri(1, 8), b = ri(1, 8)
    return { text: `${powStr(a, 2)} + ${powStr(b, 2)}`, p: { 2: a + b } }
  }
  if (v === 4) {
    let a = ri(1, 9), b = ri(1, 9)
    while (b === a) b = ri(1, 9)
    return { text: `${powStr(a, 2)} − ${powStr(b, 2)}`, p: { 2: a - b } }
  }
  if (v === 5) {
    const a = ri(2, 5), b = ri(2, 5)
    return { text: `${powStr(a * b, 2)} ÷ ${coefStr(b)}`, p: { 1: a } }
  }
  const a = ri(1, 5), b = ri(1, 6), c = ri(1, 5)
  return { text: `${powStr(a, 2)} + ${coefStr(b)} + ${powStr(c, 2)}`, p: { 2: a + c, 1: b } }
}

const GENERATORS = { 1: gen1, 2: gen2, 3: gen3, 4: gen4, 5: gen5, 6: gen6, 7: gen7, 9: gen9, 10: gen10 }
const MIX_POOL = [1, 2, 3, 4, 5, 6, 7, 9]

const genFor = (level) =>
  level === 8 ? GENERATORS[pick(MIX_POOL)]() : GENERATORS[level]()

export const generateQuestions = (level, count = QUESTION_COUNT) => {
  const qs = []
  const seen = new Set()
  while (qs.length < count) {
    let q = genFor(level)
    // なるべく重複を避ける(20回試してだめなら許容)
    for (let t = 0; t < 20 && seen.has(q.text); t++) q = genFor(level)
    seen.add(q.text)
    qs.push(q)
  }
  return qs
}

// ── 答えの判定 ───────────────────────────────────────────────
// 入力文字列を多項式として解釈する。
// 返り値: null(式として不正) | { p, unsimplified }
export const parseAnswer = (str) => {
  const s = str.replace(/−/g, '-').replace(/\s/g, '')
  if (!s || !/^[0-9x+\-²³]+$/.test(s)) return null
  const terms = s.match(/[+-]?[^+-]+/g)
  if (!terms || terms.join('') !== s) return null
  const p = {}
  const counts = {}
  for (const t of terms) {
    let m
    if ((m = t.match(/^([+-]?)(\d*)x([²³]?)$/))) {
      const c = m[2] === '' ? 1 : parseInt(m[2], 10)
      const e = m[3] === '' ? 1 : m[3] === '²' ? 2 : 3
      p[e] = (p[e] ?? 0) + (m[1] === '-' ? -1 : 1) * c
      counts[e] = (counts[e] ?? 0) + 1
    } else if ((m = t.match(/^([+-]?)(\d+)$/))) {
      p[0] = (p[0] ?? 0) + (m[1] === '-' ? -1 : 1) * parseInt(m[2], 10)
      counts[0] = (counts[0] ?? 0) + 1
    } else {
      return null
    }
  }
  const unsimplified = Object.values(counts).some(n => n > 1)
  return { p, unsimplified }
}

export const checkAnswer = (q, input) => {
  const r = parseAnswer(input)
  if (!r) return { correct: false, unsimplified: false }
  const target = qPoly(q)
  const keys = new Set([...Object.keys(r.p), ...Object.keys(target)])
  let same = true
  for (const k of keys) {
    if ((r.p[k] ?? 0) !== (target[k] ?? 0)) same = false
  }
  // 値は合っているがまとめきれていない(例: 3x+5x)は不正解扱いでヒントを出す
  return { correct: same && !r.unsimplified, unsimplified: same && r.unsimplified }
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
