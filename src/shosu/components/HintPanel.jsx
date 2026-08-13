import { hintFor } from '../data.js'

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

const Digit = ({ children, tone = 'text-slate-700' }) => (
  <div className={`flex items-center justify-center text-2xl font-black ${tone}`} style={{ width: W, height: H }}>
    {children}
  </div>
)

const Dot = ({ tone = 'text-slate-700', big }) => (
  <div className={`flex items-end justify-center font-black ${big ? 'text-5xl' : 'text-2xl'} ${tone}`}
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
      <div className="flex items-center justify-center text-2xl font-black text-slate-400" style={{ width: SIGN_W }}>
        {sign ?? ''}
      </div>
      {Array.from({ length: intLen - i.length }).map((_, k) => <div key={`p${k}`} style={{ width: W }} />)}
      <NumCells s={i} />
      {decLen > 0 && <Dot />}
      <NumCells s={d} />
      {/* けたが足りないところは 0 をおぎなって見せる */}
      {Array.from({ length: decLen - d.length }).map((_, k) => (
        <Digit key={`z${k}`} tone="text-rose-300">0</Digit>
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
      <div className="absolute rounded bg-amber-100" style={{ left: dotX, width: DW, top: 0, bottom: 0 }} />
      <div className="relative">
        <ColumnRow s={a} intLen={intLen} decLen={decLen} />
        <ColumnRow sign={op} s={b} intLen={intLen} decLen={decLen} />
        <div className="border-t-[3px] border-slate-400" />
        {/* 答えの小数点はまっすぐ下におろす */}
        <div className="relative" style={{ height: H }}>
          <div className="absolute" style={{ left: dotX }}>
            <Dot tone="text-amber-500" big />
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
      <div className="flex items-center justify-center text-2xl font-black text-slate-400" style={{ width: SIGN_W }}>
        {sign ?? ''}
      </div>
      <div className="flex flex-1 justify-end"><NumCells s={s} /></div>
    </div>
  )
  return (
    <div className="mx-auto" style={{ width }}>
      {row(null, a)}
      {row('×', b)}
      <div className="border-t-[3px] border-slate-400" />
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
          ? <Dot key={k} tone="text-amber-500" big />
          : <div key={k} style={{ width: W, height: H }} />))}
      </div>
      <div className="flex items-stretch">
        <div className="flex items-center justify-end" style={{ width: leftW }}>
          <NumCells s={b} />
          <div className="text-4xl font-black text-slate-400 leading-none pl-1 pr-1">)</div>
        </div>
        <div className="flex border-t-[3px] border-slate-500"><NumCells s={a} /></div>
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
      <div className="text-[11px] font-black text-slate-400 mb-1">たとえば</div>
      <div style={{ width: Math.max(numWidth(from), svgW) }}>
        <div className="flex"><NumCells s={from} /></div>
        <svg width={svgW} height={30} className="overflow-visible">
          <path d={`M ${x1} 2 Q ${(x1 + x2) / 2} 26 ${x2} 6`} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M ${x2} 0 l -5 8 l 10 0 z`} fill="#f59e0b" />
        </svg>
      </div>
      <div className="mt-1 text-xl font-black text-slate-600">
        {from} {op} {b} = <span className="text-teal-600">{ex.to}</span>
      </div>
    </div>
  )
}

// ── ヒント本体 ───────────────────────────────────────────────
const Step = ({ n, children }) => (
  <div className="flex items-start gap-2">
    <span className="shrink-0 w-5 h-5 rounded-full bg-teal-500 text-white text-[11px] font-black flex items-center justify-center mt-0.5">{n}</span>
    <span className="text-sm font-bold text-slate-600 leading-snug">{children}</span>
  </div>
)

const HintBody = ({ hint }) => {
  if (hint.kind === 'column') {
    const pad = split(hint.a).d.length !== split(hint.b).d.length
    return (
      <>
        <ColumnDiagram a={hint.a} b={hint.b} op={hint.op} />
        <div className="flex flex-col gap-2 mt-3">
          <Step n="1">小数点が<span className="text-amber-500">たてにそろう</span>ようにかく</Step>
          {pad && <Step n="2">けたが足りないところは <span className="text-rose-400">0</span> をかいてそろえる</Step>}
          <Step n={pad ? '3' : '2'}>答えの小数点は、そのまま<span className="text-amber-500">下におろす</span></Step>
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
          <Step n="2">小数点をとって <span className="text-teal-600">{hint.ia} × {hint.ib}</span> を計算する</Step>
          <Step n="3">小数点より下のけた数をたす → {hint.da} + {hint.db} = <span className="text-amber-500">{total}けた</span></Step>
          <Step n="4">答えの<span className="text-amber-500">右から{total}けた</span>のところに小数点をうつ</Step>
        </div>
      </>
    )
  }

  if (hint.kind === 'div') {
    return (
      <>
        <DivDiagram a={hint.a} b={hint.b} />
        <div className="flex flex-col gap-2 mt-3">
          <Step n="1">商の小数点は、わられる数の小数点の<span className="text-amber-500">真上</span>にうつ</Step>
          <Step n="2">あとは整数のわり算と同じように計算する</Step>
        </div>
      </>
    )
  }

  if (hint.kind === 'divDecimal') {
    return (
      <>
        <div className="flex flex-col items-center gap-1 mb-3">
          <div className="text-xl font-black text-slate-500">{hint.a} ÷ {hint.b}</div>
          <div className="text-amber-500 text-xs font-black">↓ 両方を {hint.k}倍</div>
          <div className="text-2xl font-black text-teal-600">{hint.a2} ÷ {hint.b2}</div>
        </div>
        <DivDiagram a={hint.a2} b={hint.b2} />
        <div className="flex flex-col gap-2 mt-3">
          <Step n="1">わる数が整数になるよう<span className="text-amber-500">両方に同じ数</span>をかける</Step>
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
          <span className="text-amber-500">{hint.dir === 'right' ? '右' : '左'}に{hint.n}つ</span>
          動かす
        </Step>
        <Step n="2">けたが足りないときは <span className="text-rose-400">0</span> をおぎなう</Step>
      </div>
    </>
  )
}

const TITLES = {
  column:     'ひっ算で考えよう',
  mul:        'ひっ算で考えよう',
  div:        'ひっ算で考えよう',
  divDecimal: 'ひっ算で考えよう',
  shift:      '小数点をうごかそう',
}

export const HintPanel = ({ item, onClose }) => {
  const hint = hintFor(item)

  return (
    <div className="absolute inset-0 z-30 bg-slate-900/40 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-md p-5 pb-7 animate-fade-in max-h-[92%] overflow-y-auto scroll-y"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-black text-amber-500">💡 {TITLES[hint?.kind] ?? 'ヒント'}</h2>
          <span className="text-lg font-black text-slate-400">{item.text}</span>
        </div>

        {hint ? (
          <div className="py-3">
            <HintBody hint={hint} />
          </div>
        ) : (
          <p className="py-6 text-center text-sm font-bold text-slate-400">この問題のヒントはまだありません</p>
        )}

        <p className="text-[10px] font-bold text-slate-300 text-center mb-3">答えは自分で計算してみよう！</p>
        <button onClick={onClose}
          className="w-full py-3 bg-teal-500 text-white rounded-2xl font-black shadow-md border-b-4 border-teal-700 active:border-b-0 active:translate-y-1 transition-all">
          とじる
        </button>
      </div>
    </div>
  )
}
