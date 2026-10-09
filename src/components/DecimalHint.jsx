// ② 小数の ヒント: 問題ごとに ひっ算の 図を 出す(もとの 小数カードの HintPanel)。
// 答えの 数字は 出さない(小数点の 位置と、やり方 だけを 示す)。
// 色: 小数点に 注目させる 帯と しるしは highlight(琥珀)、おぎなった 0 は 点線の 下線。
import { hintFor } from '../units/shosu.js'

// ── 筆算の図解 ───────────────────────────────────────────────
// 数字は1けた=W、小数点=DW の固定幅マスに並べて、位をそろえて見せる。
// 答えの数字は出さない(小数点の位置と、やり方だけを示す)。
const W = 30
const DW = 14
const H = 40
const SIGN_W = 26

const split = (s) => {
  const [i, d = ''] = s.split('.')
  return { i, d }
}

const numWidth = (s) => {
  const { i, d } = split(s)
  return i.length * W + (s.includes('.') ? DW + d.length * W : 0)
}

const Digit = ({ children, tone = 'text-ink' }) => (
  <div className={`flex items-center justify-center text-2xl font-bold ${tone}`} style={{ width: W, height: H }}>
    {children}
  </div>
)

const Dot = ({ tone = 'text-ink', big }) => (
  <div className={`flex items-end justify-center font-bold ${big ? 'text-5xl' : 'text-2xl'} ${tone}`}
    style={{ width: DW, height: H, paddingBottom: big ? 2 : 7 }}>
    .
  </div>
)

// 数を1けたずつマスに並べる
const NumCells = ({ s, tone }) => (
  <>
    {[...s].map((c, k) => (c === '.' ? <Dot key={k} tone={tone} /> : <Digit key={k} tone={tone}>{c}</Digit>))}
  </>
)

// ── たし算・ひき算: 位をそろえる筆算 ─────────────────────────
const ColumnRow = ({ sign, s, intLen, decLen }) => {
  const { i, d } = split(s)
  return (
    <div className="flex items-center relative" style={{ height: H }}>
      <div className="flex items-center justify-center text-2xl font-bold text-ink/60" style={{ width: SIGN_W }}>
        {sign ?? ''}
      </div>
      {Array.from({ length: intLen - i.length }).map((_, k) => <div key={`p${k}`} style={{ width: W }} />)}
      <NumCells s={i} />
      {decLen > 0 && <Dot />}
      <NumCells s={d} />
      {/* けたが足りないところは 0 をおぎなって見せる */}
      {Array.from({ length: decLen - d.length }).map((_, k) => (
        <Digit key={`z${k}`} tone="text-cta-600 underline decoration-dotted decoration-2 underline-offset-4">0</Digit>
      ))}
    </div>
  )
}

const ColumnDiagram = ({ a, b, op }) => {
  const sa = split(a), sb = split(b)
  const intLen = Math.max(sa.i.length, sb.i.length)
  const decLen = Math.max(sa.d.length, sb.d.length)
  const dotX = SIGN_W + intLen * W
  const width = dotX + DW + decLen * W

  return (
    <div className="relative mx-auto" style={{ width }}>
      {/* 小数点がたてにそろっていることを見せる帯 */}
      <div className="absolute rounded bg-highlight-100" style={{ left: dotX, width: DW, top: 0, bottom: 0 }} />
      <div className="relative">
        <ColumnRow s={a} intLen={intLen} decLen={decLen} />
        <ColumnRow sign={op} s={b} intLen={intLen} decLen={decLen} />
        <div className="border-t-[3px] border-ink/50" />
        {/* 答えの小数点はまっすぐ下におろす */}
        <div className="relative" style={{ height: H }}>
          <div className="absolute" style={{ left: dotX }}>
            <Dot tone="text-highlight-700" big />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── かけ算: 右にそろえて計算し、あとから小数点をうつ ──────────
const MulDiagram = ({ a, b }) => {
  const width = SIGN_W + Math.max(numWidth(a), numWidth(b))
  const row = (sign, s) => (
    <div className="flex" style={{ height: H }}>
      <div className="flex items-center justify-center text-2xl font-bold text-ink/60" style={{ width: SIGN_W }}>
        {sign ?? ''}
      </div>
      <div className="flex flex-1 justify-end"><NumCells s={s} /></div>
    </div>
  )
  return (
    <div className="mx-auto" style={{ width }}>
      {row(null, a)}
      {row('×', b)}
      <div className="border-t-[3px] border-ink/50" />
    </div>
  )
}

// ── わり算: 商の小数点はわられる数の小数点の真上 ──────────────
const DivDiagram = ({ a, b }) => {
  const leftW = numWidth(b) + 24
  return (
    <div className="mx-auto" style={{ width: leftW + numWidth(a) }}>
      {/* 商の行: 数字は出さず、小数点の位置だけ示す */}
      <div className="flex" style={{ height: H }}>
        <div style={{ width: leftW }} />
        {[...a].map((c, k) => (c === '.'
          ? <Dot key={k} tone="text-highlight-700" big />
          : <div key={k} style={{ width: W, height: H }} />))}
      </div>
      <div className="flex items-stretch">
        <div className="flex items-center justify-end" style={{ width: leftW }}>
          <NumCells s={b} />
          <div className="text-4xl font-bold text-ink/60 leading-none pl-1 pr-1">)</div>
        </div>
        <div className="flex border-t-[3px] border-ink/60"><NumCells s={a} /></div>
      </div>
    </div>
  )
}

// ── 10倍・1/10: 小数点が動くようすを矢印で見せる ──────────────
const SHIFT_EXAMPLES = {
  '×10':  { from: '0.53', to: '5.3' },
  '×100': { from: '0.53', to: '53' },
  '÷10':  { from: '5.3',  to: '0.53' },
  '÷100': { from: '53',   to: '0.53' },
}

const ShiftDiagram = ({ op, b, dir, n }) => {
  const ex = SHIFT_EXAMPLES[`${op}${b}`] ?? SHIFT_EXAMPLES['×10']
  const from = ex.from
  // 小数点のいまの位置(小数点がなければ右はし)
  const dotX = from.includes('.') ? split(from).i.length * W : numWidth(from)
  const x1 = dotX + DW / 2
  const x2 = x1 + (dir === 'right' ? n * W : -n * W)
  const svgW = Math.max(x1, x2) + 12

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-bold text-ink/70 mb-1">たとえば</div>
      <div style={{ width: Math.max(numWidth(from), svgW) }}>
        <div className="flex"><NumCells s={from} /></div>
        <svg width={svgW} height={30} className="overflow-visible">
          <path d={`M ${x1} 2 Q ${(x1 + x2) / 2} 26 ${x2} 6`} fill="none" stroke="#997729" strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M ${x2} 0 l -5 8 l 10 0 z`} fill="#997729" />
        </svg>
      </div>
      <div className="mt-1 text-xl font-bold text-ink">
        {from} {op} {b} = <span className="text-cta-700">{ex.to}</span>
      </div>
    </div>
  )
}

// ── ヒント本体 ───────────────────────────────────────────────
const Step = ({ n, children }) => (
  <div className="flex items-start gap-2">
    <span className="shrink-0 w-5 h-5 rounded-full bg-cta-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{n}</span>
    <span className="text-sm font-bold text-ink leading-snug">{children}</span>
  </div>
)

export const DecimalHintBody = ({ item }) => {
  const hint = hintFor(item)
  if (!hint) return <p className="py-6 text-center text-sm font-bold text-ink/70">この 問題の ヒントは まだ ありません</p>
  if (hint.kind === 'column') {
    const pad = split(hint.a).d.length !== split(hint.b).d.length
    return (
      <>
        <ColumnDiagram a={hint.a} b={hint.b} op={hint.op} />
        <div className="flex flex-col gap-2 mt-3">
          <Step n="1">小数点が<span className="text-highlight-700">たてにそろう</span>ようにかく</Step>
          {pad && <Step n="2">けたが足りないところは <span className="text-cta-600 underline decoration-dotted decoration-2 underline-offset-4">0</span> をかいてそろえる</Step>}
          <Step n={pad ? '3' : '2'}>答えの小数点は、そのまま<span className="text-highlight-700">下におろす</span></Step>
        </div>
      </>
    )
  }

  if (hint.kind === 'mul') {
    const total = hint.da + hint.db
    return (
      <>
        <MulDiagram a={hint.a} b={hint.b} />
        <div className="flex flex-col gap-2 mt-3">
          <Step n="1">右にそろえてかく(小数点はそろえなくてよい)</Step>
          <Step n="2">小数点をとって <span className="text-cta-700">{hint.ia} × {hint.ib}</span> を計算する</Step>
          <Step n="3">小数点より下のけた数をたす → {hint.da} + {hint.db} = <span className="text-highlight-700">{total}けた</span></Step>
          <Step n="4">答えの<span className="text-highlight-700">右から{total}けた</span>のところに小数点をうつ</Step>
        </div>
      </>
    )
  }

  if (hint.kind === 'div') {
    return (
      <>
        <DivDiagram a={hint.a} b={hint.b} />
        <div className="flex flex-col gap-2 mt-3">
          <Step n="1">商の小数点は、わられる数の小数点の<span className="text-highlight-700">真上</span>にうつ</Step>
          <Step n="2">あとは整数のわり算と同じように計算する</Step>
        </div>
      </>
    )
  }

  if (hint.kind === 'divDecimal') {
    return (
      <>
        <div className="flex flex-col items-center gap-1 mb-3">
          <div className="text-xl font-bold text-ink/70">{hint.a} ÷ {hint.b}</div>
          <div className="text-highlight-700 text-sm font-bold">↓ 両方を {hint.k}倍</div>
          <div className="text-2xl font-bold text-cta-700">{hint.a2} ÷ {hint.b2}</div>
        </div>
        <DivDiagram a={hint.a2} b={hint.b2} />
        <div className="flex flex-col gap-2 mt-3">
          <Step n="1">わる数が整数になるよう<span className="text-highlight-700">両方に同じ数</span>をかける</Step>
          <Step n="2">商の小数点は、わられる数の小数点の真上にうつ</Step>
          <Step n="3">答えはもとの式の答えと同じになる</Step>
        </div>
      </>
    )
  }

  // shift
  return (
    <>
      <ShiftDiagram op={hint.op} b={hint.b} dir={hint.dir} n={hint.n} />
      <div className="flex flex-col gap-2 mt-3">
        <Step n="1">
          {hint.op}{hint.b} は、小数点を
          <span className="text-highlight-700">{hint.dir === 'right' ? '右' : '左'}に{hint.n}つ</span>
          動かす
        </Step>
        <Step n="2">けたが足りないときは <span className="text-cta-600 underline decoration-dotted decoration-2 underline-offset-4">0</span> をおぎなう</Step>
      </div>
    </>
  )
}

export const DECIMAL_TITLES = {
  column:     'ひっ算で考えよう',
  mul:        'ひっ算で考えよう',
  div:        'ひっ算で考えよう',
  divDecimal: 'ひっ算で考えよう',
  shift:      '小数点をうごかそう',
}

