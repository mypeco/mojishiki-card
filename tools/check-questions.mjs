#!/usr/bin/env node
// 問題と答えが あって いるかを、機械で 見る 道具。
//
//   node tools/check-questions.mjs
//
// 単元・レベルごとに 問題を たくさん 作り、次の ことを 見ます。
//   1. 答えが 正しいか ── 問題文を この道具の 中の 計算機(誤差の 出ない 分数)で
//      計算しなおして、答えと くらべる。方程式は 答えを 代入して 両辺を くらべる。
//      約数・倍数は 1から 数えなおす。
//      ★問題を 作る がわの 計算は 使わない(同じ まちがいを 2回 しない ため)。
//   2. 答えが 打てるか ── 答えに 要る キー(− ／ . , x +)が、
//      その レベルの テンキーに あるか。
//   3. 答えを 打つと せいかいに なるか ── 判定(checkAnswer)を 通す。
//   4. 小学校の レベルで 答えが マイナスに なって いないか。
//   5. ヒントの「れい」も 同じ ように 正しいか。
//
// Windows でも 動く ように node だけで 書いて あります。

import { UNITS, MIX } from '../src/units/index.js'
import { checkAnswer, formatAnswer } from '../src/lib/answer.js'

const N = Number(process.env.N ?? 300)

// ── 誤差の 出ない 分数(この 道具 専用。src/lib/frac.js は 使わない)──
const g = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a }
const R = (n, d = 1n) => {
  n = BigInt(n); d = BigInt(d)
  if (d === 0n) throw new Error('0 で わった')
  if (d < 0n) { n = -n; d = -d }
  const k = g(n, d) || 1n
  return { n: n / k, d: d / k }
}
const rAdd = (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d)
const rSub = (a, b) => R(a.n * b.d - b.n * a.d, a.d * b.d)
const rMul = (a, b) => R(a.n * b.n, a.d * b.d)
const rDiv = (a, b) => R(a.n * b.d, a.d * b.n)
const rEq = (a, b) => a.n === b.n && a.d === b.d
const rStr = (a) => (a.d === 1n ? `${a.n}` : `${a.n}/${a.d}`)

// ── 問題文の 計算機 ──────────────────────────────────────
// 文法: 式 = 項 (＋|− 項)* / 項 = 単項 (×|÷ 単項)* / 単項 = −単項 | 並び
//       並び = 累乗 累乗*(3x・2(x + 1) の ような かけ算の 省略)
//       累乗 = もと (²|³)? / もと = 数 | x | ( 式 ) | {式/式}
// −3² は −(3²)、(−3)² は 9 に なる(教科書の 約束)。
function evaluate(text, x) {
  const s = text.replace(/\s+/g, '')
  let i = 0
  const peek = () => s[i]
  const eat = (c) => { if (s[i] !== c) throw new Error(`「${c}」が ない: ${text}`); i++ }
  const startsPrimary = (c) => c !== undefined && /[0-9x({]/.test(c)

  function expr(stop) {
    let v = term(stop)
    while (peek() === '+' || peek() === '−') {
      const op = s[i++]
      const w = term(stop)
      v = op === '+' ? rAdd(v, w) : rSub(v, w)
    }
    return v
  }
  function term(stop) {
    let v = unary(stop)
    while (peek() === '×' || peek() === '÷') {
      const op = s[i++]
      const w = unary(stop)
      v = op === '×' ? rMul(v, w) : rDiv(v, w)
    }
    return v
  }
  function unary(stop) {
    if (peek() === '−') { i++; return rSub(R(0), unary(stop)) }
    let v = power(stop)
    while (startsPrimary(peek())) v = rMul(v, power(stop))
    return v
  }
  function power(stop) {
    let v = primary(stop)
    if (peek() === '²') { i++; v = rMul(v, v) }
    else if (peek() === '³') { i++; v = rMul(rMul(v, v), v) }
    return v
  }
  function primary(stop) {
    const c = peek()
    if (c === '(') { i++; const v = expr(')'); eat(')'); return v }
    if (c === '{') {
      i++
      const num = expr('/'); eat('/')
      const den = expr('}'); eat('}')
      return rDiv(num, den)
    }
    if (c === 'x') {
      if (x === undefined) throw new Error(`x が ある: ${text}`)
      i++; return x
    }
    const m = s.slice(i).match(/^\d+(\.\d+)?/)
    if (!m) throw new Error(`読めない「${c}」: ${text}`)
    i += m[0].length
    const [a, b = ''] = m[0].split('.')
    return R(BigInt(a + b), 10n ** BigInt(b.length))
  }
  const v = expr()
  if (i !== s.length) throw new Error(`のこり「${s.slice(i)}」: ${text}`)
  return v
}

// ── 約数・倍数(1から 数えなおす)──
const nums = (text) => text.match(/\d+/g).map(Number)
const divs = (n) => { const o = []; for (let k = 1; k <= n; k++) if (n % k === 0) o.push(k); return o }
const common = (ns) => divs(Math.min(...ns)).filter(k => ns.every(n => n % k === 0))
const lcmAll = (ns) => { for (let m = Math.max(...ns); ; m++) if (ns.every(n => m % n === 0)) return m }

// ── 答えの 値(分数)──
const ansR = (ans) => R(ans.v.n, ans.v.d)
const polyAt = (p, x) => Object.entries(p).reduce((acc, [e, c]) => {
  let t = R(c)
  for (let k = 0; k < Number(e); k++) t = rMul(t, x)
  return rAdd(acc, t)
}, R(0))

// 答えを、子どもが 打つ ときの 文字に する(表示の しるし → キーの ならび)
const typed = (ans) => formatAnswer(ans)
  .replace(/\{(\d+)\/(\d+)\}/g, '$1/$2')
  .replace(/\s/g, '')

// その 答えを 打つのに 要る キー
const keysNeeded = (s) => {
  const need = new Set()
  if (s.includes('−')) need.add('−')
  if (s.includes('/')) need.add('/')
  if (s.includes('.')) need.add('.')
  if (s.includes(',')) need.add(',')
  if (/[x²³]/.test(s)) need.add('x')
  if (s.includes('+')) need.add('+')
  return need
}

// レベルごとに 3件まで 出す(1つの レベルで 画面が うまらない ように)
const errors = []
const perLevel = new Map()
let errorCount = 0
const fail = (where, msg) => {
  errorCount++
  const key = where.split(' ')[0]
  const n = perLevel.get(key) ?? 0
  perLevel.set(key, n + 1)
  if (n < 3) errors.push(`${where}: ${msg}`)
}

function verify(unit, level, q, where) {
  const ans = q.ans
  const label = `${where} 「${q.lead ? q.lead + ' ' : ''}${q.text}」`
  if (/[{}]/.test(q.text) && (q.text.match(/\{/g) ?? []).length !== (q.text.match(/\}/g) ?? []).length) {
    fail(label, 'かっこ { } の 数が あわない')
  }

  // 1. 答えが 正しいか
  try {
    if (unit.id === 'yakubai') {
      const ns = nums(q.text)
      let want
      if (q.lead === '約数を ぜんぶ') want = divs(ns[0])
      else if (q.lead === '公約数を ぜんぶ') want = common(ns)
      else if (q.lead === '最大公約数') want = Math.max(...common(ns))
      else if (q.lead === '最小公倍数') want = lcmAll(ns)
      else if (/の 倍数$/.test(q.lead)) {
        const k = Number(q.lead.match(/^(\d+)/)[1])
        const seq = q.text.split(',').map(t => t.trim())
        const hole = seq.indexOf('□')
        const known = seq.map((t, idx) => [t, idx]).filter(([t]) => t !== '□')
        const [t0, i0] = known[0]
        want = Number(t0) + (hole - i0) * k
        if (!known.every(([t, idx]) => Number(t) === Number(t0) + (idx - i0) * k && Number(t) % k === 0)) {
          fail(label, '倍数の ならびに なって いない')
        }
        if (want % k !== 0) fail(label, '□ が 倍数に ならない')
      } else fail(label, `知らない 問い「${q.lead}」`)
      const got = ans.kind === 'list' ? ans.v.join(',') : rStr(ansR(ans))
      const exp = Array.isArray(want) ? want.join(',') : `${want}`
      if (got !== exp) fail(label, `答え ${got} / 正しくは ${exp}`)
    } else if (ans.kind === 'poly') {
      for (const xv of [2, 3, -1, 5, 7]) {
        const x = R(xv)
        const a = evaluate(q.text, x), b = polyAt(ans.p, x)
        if (!rEq(a, b)) { fail(label, `x=${xv} で ${rStr(a)} / 答えの 式は ${rStr(b)}`); break }
      }
    } else if (q.prefix === 'x =') {
      const [l, r] = q.text.split('=')
      const x = ansR(ans)
      const a = evaluate(l, x), b = evaluate(r, x)
      if (!rEq(a, b)) fail(label, `x=${rStr(x)} を 入れると ${rStr(a)} と ${rStr(b)}`)
      const x2 = rAdd(x, R(1))
      if (rEq(evaluate(l, x2), evaluate(r, x2))) fail(label, '答えが 1つに きまらない')
    } else {
      const v = evaluate(q.text)
      if (!rEq(v, ansR(ans))) fail(label, `計算しなおすと ${rStr(v)} / 答えは ${rStr(ansR(ans))}`)
    }
  } catch (e) {
    fail(label, e.message)
  }

  // 2. 答えが 打てるか
  const s = typed(ans)
  const have = new Set(level.keys)
  for (const k of keysNeeded(s)) {
    if (!have.has(k)) fail(label, `答え ${s} に 要る キー「${k}」が ない`)
  }
  if (s.replace(/[x²³+−,]/g, '').length > (ans.kind === 'list' ? 24 : 9)) fail(label, `答え ${s} が 長すぎて 打てない`)

  // 3. 打つと せいかいに なるか
  const r = checkAnswer(q, s)
  if (r.status !== 'correct') fail(label, `答え ${s} を 打っても ${r.status}(${r.msg})`)

  // 4. 小学校の レベルで マイナスの 答え
  const elementary = ['shosu', 'yakubai', 'bunsu'].includes(unit.id) || (unit.id === 'seisu' && !level.keys.includes('−'))
  if (elementary && ans.v && ans.v.n < 0) fail(label, 'マイナスの 答え')
  if (elementary && ans.v && ans.v.n === 0) fail(label, '答えが 0')
}

let total = 0
for (const unit of UNITS) {
  const ids = new Set()
  for (const level of unit.levels) {
    if (ids.has(level.id)) fail(unit.id, `レベルの id ${level.id} が 2つ`)
    ids.add(level.id)
    if (level.mix) {
      if (level.id !== MIX) fail(unit.id, 'まとめの id は mix')
      // まとめの キーは、出題元の キーを ぜんぶ ふくむ
      const pool = level.pool ?? unit.levels.filter(l => !l.mix).map(l => l.id)
      for (const id of pool) {
        const src = unit.levels.find(l => l.id === id)
        for (const k of src.keys) if (!level.keys.includes(k)) fail(`${unit.id}/まとめ`, `キー「${k}」が ない`)
      }
      continue
    }
    const where = `${unit.id}/${level.id}`
    for (let k = 0; k < N; k++) { verify(unit, level, level.gen(), where); total++ }
    if (level.tip) verify(unit, level, level.tip.ex, `${where} ヒントの れい`)
    else if (unit.hintKind !== 'decimal') fail(where, 'ヒントが ない')
  }
}

// ── 判定の ふるまい(まちがいの 理由が 出るか)──
const cases = [
  [{ ans: { kind: 'frac', v: { n: 3, d: 4 } } }, '6/8', 'almost'],
  [{ ans: { kind: 'frac', v: { n: 3, d: 4 } } }, '3/4', 'correct'],
  [{ ans: { kind: 'frac', v: { n: 3, d: 4 } } }, '−3/4', 'wrong'],
  [{ ans: { kind: 'frac', v: { n: 2, d: 1 } } }, '4/2', 'almost'],
  [{ ans: { kind: 'frac', v: { n: 2, d: 1 } } }, '2/1', 'almost'],
  [{ ans: { kind: 'frac', v: { n: 2, d: 1 } } }, '2', 'correct'],
  [{ ans: { kind: 'frac', v: { n: 2, d: 1 } } }, '2/', 'incomplete'],
  [{ ans: { kind: 'num', v: { n: 3, d: 25 } } }, '0.12', 'correct'],
  [{ ans: { kind: 'num', v: { n: 3, d: 25 } } }, '1.2', 'wrong'],
  [{ ans: { kind: 'num', v: { n: 3, d: 10 } } }, '0.30', 'correct'],
  [{ ans: { kind: 'num', v: { n: 1, d: 2 } } }, '.5', 'correct'],
  [{ ans: { kind: 'num', v: { n: -8, d: 1 } } }, '8', 'wrong'],
  [{ ans: { kind: 'list', v: [1, 2, 3, 6] } }, '1,2,3', 'almost'],
  [{ ans: { kind: 'list', v: [1, 2, 3, 6] } }, '6,3,2,1', 'correct'],
  [{ ans: { kind: 'list', v: [1, 2, 3, 6] } }, '1,2,3,4,6', 'wrong'],
  [{ ans: { kind: 'poly', p: { 1: 8 } } }, '3x+5x', 'almost'],
  [{ ans: { kind: 'poly', p: { 1: 8 } } }, '8x', 'correct'],
  [{ ans: { kind: 'poly', p: { 2: 2 } } }, '2x²', 'correct'],
]
for (const [q, input, want] of cases) {
  const r = checkAnswer(q, input)
  if (r.status !== want) fail('判定', `${JSON.stringify(q.ans)} に ${input} → ${r.status}(ほしいのは ${want})`)
}

console.log(`問題 ${total}問(1レベル ${N}問)と 判定 ${cases.length}とおりを 見ました`)
if (errorCount) {
  console.log(`\n✕ ${errorCount}件(レベルごとに 3件まで 表示)`)
  for (const e of errors) console.log('  ' + e)
  process.exit(1)
}
console.log('問題の 点検: ✕ 0件')
