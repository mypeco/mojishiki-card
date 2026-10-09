// ── 答えの形・入力・判定 ─────────────────────────────────────
// 答えの形(kind)は4つ。どの単元も、この4つのどれかで答える。
//   num  … 整数・小数(−12, 0.25)
//   frac … 分数・整数(3/4, −2)。方程式の x の値もこれ
//   list … 数のならび(約数をぜんぶ: 1,2,3,6)
//   poly … 文字式(3x + 2, 2x²)
// 表示のマイナスは U+2212(−)。判定のときに '-' にそろえる。

import { frac, eq, gcd, fromDecimal, toDecimal } from './frac.js'

// ── 答えを作る(問題データの側で使う)─────────────────────────
export const ansNum = (n, d = 1) => ({ kind: 'num', v: frac(n, d) })
export const ansFrac = (n, d = 1) => ({ kind: 'frac', v: frac(n, d) })
export const ansList = (arr) => ({ kind: 'list', v: [...new Set(arr)].sort((a, b) => a - b) })
export const ansPoly = (p) => ({ kind: 'poly', p })

// ── 表示用の小さな道具 ────────────────────────────────────────
// マイナスの数(項のはじめ用): −3
export const sn = (n) => (n < 0 ? `−${-n}` : `${n}`)
// マイナスの数(2つめ以降の項用): (−3)
export const pn = (n) => (n < 0 ? `(−${-n})` : `${n}`)

const SUP = { 2: '²', 3: '³' }

// 係数 c・次数 e の項を文字列にする(e=0 は定数項)
export const powStr = (c, e) => {
  if (e === 0) return sn(c)
  const x = e === 1 ? 'x' : `x${SUP[e]}`
  if (c === 1) return x
  if (c === -1) return `−${x}`
  return `${sn(c)}${x}`
}

// 多項式 { 次数: 係数 } を正規形の文字列にする
export const formatPoly = (p) => {
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

// 分数を表示用のしるし({3/4})にする。分母が1なら整数
export const fracText = ({ n, d }) =>
  d === 1 ? sn(n) : `${n < 0 ? '−' : ''}{${Math.abs(n)}/${d}}`

// 答えを表示用の文字列にする(フラッシュカードの答え・ヒントの「れい」)
export const formatAnswer = (ans) => {
  if (ans.kind === 'num') return toDecimal(ans.v) ?? fracText(ans.v)
  if (ans.kind === 'frac') return fracText(ans.v)
  if (ans.kind === 'list') return ans.v.join(', ')
  return formatPoly(ans.p)
}

// 入力中の文字列を、表示用のしるしにする
export const inputText = (kind, input) => {
  if (kind === 'list') return input.replace(/,/g, ', ').trimEnd()
  if (kind === 'frac' && input.includes('/')) {
    const neg = input.startsWith('−')
    const [a, b] = input.replace('−', '').split('/')
    return `${neg ? '−' : ''}{${a}/${b}}`
  }
  return input
}

// ── キーを押したときの入力の変わり方 ─────────────────────────
const MAX_LEN = { num: 9, frac: 9, list: 24, poly: 9 }

export const applyKey = (kind, prev, k) => {
  const max = MAX_LEN[kind]
  if (k === 'C') return ''
  if (k === 'BS') {
    // x³ は1段ずつ戻す(x³ → x² → x)
    if (prev.endsWith('³')) return prev.slice(0, -1) + '²'
    return prev.slice(0, -1)
  }
  if (/^\d$/.test(k)) return prev.length >= max ? prev : prev + k
  if (k === '.') {
    if (prev.includes('.')) return prev
    if (prev === '' || prev === '−') return prev + '0.'
    return prev + '.'
  }
  if (k === '/') {
    if (prev.includes('/') || !/\d$/.test(prev)) return prev
    return prev + '/'
  }
  if (k === ',') {
    if (!/\d$/.test(prev) || prev.length >= max) return prev
    return prev + ','
  }
  if (k === '−') {
    // 文字式では「ひく」。それ以外では、はじめの符号を付けはずしする
    if (kind === 'poly') return prev.length >= max ? prev : prev + '−'
    return prev.startsWith('−') ? prev.slice(1) : '−' + prev
  }
  if (k === '+') return prev.length >= max ? prev : prev + '+'
  if (k === 'x') {
    // x を続けて押すと累乗になる(x → x² → x³)
    if (prev.endsWith('x')) return prev.slice(0, -1) + 'x²'
    if (prev.endsWith('²')) return prev.slice(0, -1) + '³'
    if (prev.endsWith('³')) return prev
    return prev.length >= max ? prev : prev + 'x'
  }
  return prev
}

// ── 入力の読みとり ────────────────────────────────────────────
const ascii = (s) => s.replace(/−/g, '-').replace(/\s/g, '')

// 整数・小数。読めなければ null
export const parseNum = (str) => {
  const s = ascii(str)
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null
  return fromDecimal(s.endsWith('.') ? s.slice(0, -1) : s)
}

// 分数・整数。{ v, a, b }(a/b は入力どおりの分子・分母)。読めなければ null
export const parseFrac = (str) => {
  const s = ascii(str)
  let m
  if ((m = s.match(/^(-?)(\d+)$/))) {
    const a = parseInt(m[2], 10) * (m[1] ? -1 : 1)
    return { v: frac(a, 1), a, b: 1, isInt: true }
  }
  if ((m = s.match(/^(-?)(\d+)\/(\d+)$/))) {
    const a = parseInt(m[2], 10) * (m[1] ? -1 : 1)
    const b = parseInt(m[3], 10)
    if (b === 0) return null
    return { v: frac(a, b), a, b, isInt: false }
  }
  return null
}

// 数のならび
export const parseList = (str) => {
  const parts = ascii(str).split(',').filter(t => t !== '')
  if (parts.length === 0 || parts.some(t => !/^\d+$/.test(t))) return null
  return parts.map(t => parseInt(t, 10))
}

// 文字式を多項式として読む。{ p, unsimplified }
export const parsePoly = (str) => {
  const s = ascii(str)
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
  return { p, unsimplified: Object.values(counts).some(n => n > 1) }
}

// ── 判定 ───────────────────────────────────────────────────────
// status: correct(せいかい) / almost(値はあっている・もうひといき) /
//         wrong(ちがう) / incomplete(まだ書きおわっていない。まちがいに数えない)
// msg は子どもに見せる理由(「なぜちがうか」)。観察を言い、感じ方は言わない。

const absEq = (a, b) => Math.abs(a.n) === Math.abs(b.n) && a.d === b.d

// 小数点と前後の0を取り除いた「数字のならび」(0.12 と 1.2 は同じ "12")
const digitsOf = (str) => ascii(str).replace('-', '').replace('.', '').replace(/^0+/, '').replace(/0+$/, '')

export const checkAnswer = (q, input) => {
  const ans = q.ans
  if (!input || input === '−') return { status: 'incomplete', msg: '' }

  if (ans.kind === 'num') {
    const v = parseNum(input)
    if (!v) return { status: 'incomplete', msg: '' }
    if (eq(v, ans.v)) return { status: 'correct' }
    if (absEq(v, ans.v)) return { status: 'wrong', msg: '＋と −を たしかめよう' }
    const want = toDecimal(ans.v) ?? ''
    if (want.includes('.') || input.includes('.')) {
      if (digitsOf(input) !== '' && digitsOf(input) === digitsOf(want)) {
        return { status: 'wrong', msg: '小数点の 位置を たしかめよう' }
      }
    }
    return { status: 'wrong', msg: '' }
  }

  if (ans.kind === 'frac') {
    if (input.endsWith('/')) return { status: 'incomplete', msg: '分母も いれよう' }
    const r = parseFrac(input)
    if (!r) return { status: 'incomplete', msg: '' }
    if (eq(r.v, ans.v)) {
      if (!r.isInt && r.b === 1) return { status: 'almost', msg: '分母が 1 の ときは 整数で かこう' }
      if (!r.isInt && gcd(r.a, r.b) > 1) {
        if (r.v.d === 1) return { status: 'almost', msg: '約分すると 整数に なるよ' }
        return { status: 'almost', msg: 'まだ 約分 できるよ' }
      }
      return { status: 'correct' }
    }
    if (absEq(r.v, ans.v)) return { status: 'wrong', msg: '＋と −を たしかめよう' }
    return { status: 'wrong', msg: '' }
  }

  if (ans.kind === 'list') {
    const got = parseList(input)
    if (!got) return { status: 'incomplete', msg: '' }
    const want = new Set(ans.v)
    const extra = [...new Set(got)].filter(n => !want.has(n))
    if (extra.length > 0) return { status: 'wrong', msg: `${extra.join('、')} は 入らないよ` }
    const missing = ans.v.filter(n => !got.includes(n)).length
    if (missing > 0) return { status: 'almost', msg: `あと ${missing}こ あるよ` }
    return { status: 'correct' }
  }

  // poly
  const r = parsePoly(input)
  if (!r) return { status: 'incomplete', msg: '' }
  const keys = new Set([...Object.keys(r.p), ...Object.keys(ans.p)])
  const same = [...keys].every(k => (r.p[k] ?? 0) === (ans.p[k] ?? 0))
  if (same && r.unsimplified) return { status: 'almost', msg: 'もっと かんたんに まとめられるよ' }
  if (same) return { status: 'correct' }
  return { status: 'wrong', msg: '' }
}
