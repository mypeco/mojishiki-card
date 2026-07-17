// ── レベル定義(中1 文字式の計算・段階別)──────────────────────
export const LEVELS = [
  { id: 1, icon: '🌱', title: '文字の項のたし算', desc: '同じ文字の項をまとめよう', example: '3x + 5x' },
  { id: 2, icon: '🌿', title: '文字の項のひき算', desc: '係数どうしをひき算しよう', example: '7x − 3x' },
  { id: 3, icon: '🍀', title: '負の数がでてくる計算', desc: '答えがマイナスになることも', example: '2x − 7x' },
  { id: 4, icon: '🌼', title: '数の項がまざった計算', desc: '文字の項と数の項を整理しよう', example: '4x + 3 + 2x' },
  { id: 5, icon: '⚡', title: '文字式 × 数・÷ 数', desc: '係数に数をかけたりわったり', example: '3x × 4' },
  { id: 6, icon: '🔥', title: '分配法則', desc: 'かっこの中に数を配ろう', example: '3(2x + 4)' },
  { id: 7, icon: '🚀', title: 'かっこのあるたし算・ひき算', desc: 'かっこをはずして整理しよう', example: '(5x + 3) − (2x + 1)' },
  { id: 8, icon: '👑', title: 'ミックス', desc: 'レベル1〜7からランダム出題', example: '？' },
]

export const QUESTION_COUNT = 10

// ── 表示ユーティリティ ───────────────────────────────────────
// マイナスは表示用に U+2212(−)を使う。判定時に正規化する。
const coefStr = (c) => {
  if (c === 1) return 'x'
  if (c === -1) return '−x'
  if (c < 0) return `−${Math.abs(c)}x`
  return `${c}x`
}

// 答え ax + b を正規形の文字列にする(表示用)
export const formatAnswer = (a, b) => {
  if (a === 0) return b < 0 ? `−${Math.abs(b)}` : String(b)
  let s = coefStr(a)
  if (b > 0) s += ` + ${b}`
  else if (b < 0) s += ` − ${Math.abs(b)}`
  return s
}

// ── 問題生成 ─────────────────────────────────────────────────
const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[ri(0, arr.length - 1)]

// 各問題は { text, a, b } — 答えは ax + b
const gen1 = () => {
  const a = ri(1, 8), b = ri(1, 8)
  return { text: `${coefStr(a)} + ${coefStr(b)}`, a: a + b, b: 0 }
}

const gen2 = () => {
  const a = ri(2, 9), b = ri(1, a)
  return { text: `${coefStr(a)} − ${coefStr(b)}`, a: a - b, b: 0 }
}

const gen3 = () => {
  if (Math.random() < 0.5) {
    const a = ri(1, 8), b = ri(a + 1, 9)
    return { text: `${coefStr(a)} − ${coefStr(b)}`, a: a - b, b: 0 }
  }
  const a = ri(1, 9), b = ri(1, 9)
  return { text: `${coefStr(-a)} + ${coefStr(b)}`, a: b - a, b: 0 }
}

const gen4 = () => {
  const a = ri(1, 6), c = ri(1, 9)
  const v = ri(1, 4)
  if (v === 1) {
    const b = ri(1, 6)
    return { text: `${coefStr(a)} + ${c} + ${coefStr(b)}`, a: a + b, b: c }
  }
  if (v === 2) {
    const b = ri(1, 6)
    return { text: `${coefStr(a)} + ${coefStr(b)} + ${c}`, a: a + b, b: c }
  }
  if (v === 3) {
    let b = ri(1, 6)
    while (b === a) b = ri(1, 6)
    return { text: `${coefStr(a)} + ${c} − ${coefStr(b)}`, a: a - b, b: c }
  }
  const b = ri(1, 6)
  return { text: `${coefStr(a)} − ${c} + ${coefStr(b)}`, a: a + b, b: -c }
}

const gen5 = () => {
  const v = ri(1, 4)
  if (v === 1) {
    const a = ri(2, 9), m = ri(2, 6)
    return { text: `${coefStr(a)} × ${m}`, a: a * m, b: 0 }
  }
  if (v === 2) {
    const a = ri(2, 9), m = ri(2, 6)
    return { text: `${m} × ${coefStr(a)}`, a: a * m, b: 0 }
  }
  if (v === 3) {
    const a = ri(2, 9), m = ri(2, 6)
    return { text: `${coefStr(a * m)} ÷ ${m}`, a, b: 0 }
  }
  const a = ri(2, 6), m = ri(2, 5)
  return { text: `${coefStr(-a)} × ${m}`, a: -a * m, b: 0 }
}

const gen6 = () => {
  const m = pick([2, 3, 4, 5, -2, -3])
  const a = ri(1, 5)
  const b = ri(1, 5) * pick([1, -1])
  const inner = `${coefStr(a)} ${b > 0 ? '+' : '−'} ${Math.abs(b)}`
  const mStr = m < 0 ? `−${Math.abs(m)}` : `${m}`
  return { text: `${mStr}(${inner})`, a: m * a, b: m * b }
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
  return { text: `${left} ${op} ${right}`, a: ra, b: rb }
}

const GENERATORS = { 1: gen1, 2: gen2, 3: gen3, 4: gen4, 5: gen5, 6: gen6, 7: gen7 }

const genFor = (level) =>
  level === 8 ? GENERATORS[ri(1, 7)]() : GENERATORS[level]()

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
// 入力文字列を ax + b として解釈する。
// 返り値: null(式として不正) | { a, b, unsimplified }
export const parseAnswer = (str) => {
  const s = str.replace(/−/g, '-').replace(/\s/g, '')
  if (!s || !/^[0-9x+\-]+$/.test(s)) return null
  const terms = s.match(/[+-]?[^+-]+/g)
  if (!terms || terms.join('') !== s) return null
  let a = 0, b = 0, nx = 0, nc = 0
  for (const t of terms) {
    let m
    if ((m = t.match(/^([+-]?)(\d*)x$/))) {
      const c = m[2] === '' ? 1 : parseInt(m[2], 10)
      a += (m[1] === '-' ? -1 : 1) * c
      nx++
    } else if ((m = t.match(/^([+-]?)(\d+)$/))) {
      b += (m[1] === '-' ? -1 : 1) * parseInt(m[2], 10)
      nc++
    } else {
      return null
    }
  }
  return { a, b, unsimplified: nx > 1 || nc > 1 }
}

export const checkAnswer = (q, input) => {
  const p = parseAnswer(input)
  if (!p) return { correct: false, unsimplified: false }
  const same = p.a === q.a && p.b === q.b
  // 値は合っているがまとめきれていない(例: 3x+5x)は不正解扱いでヒントを出す
  return { correct: same && !p.unsimplified, unsimplified: same && p.unsimplified }
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
