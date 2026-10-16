// メモ(手書き)。問題画面の 下に、ボタンで 開け閉め する。
// ★ひっ算や 途中の 式を 書いて、頭の 中に とどめて おかなくて いい ように する(ワーキングメモリ)。
//   答えの 判定には 使わない。まとめ(mix)にも 置く(答えを 教える 足場では なく、紙と えんぴつの 代わり)。
// ★書いて いる とちゅうに 青い 選択・長押しメニュー・拡大・スクロールが 出ない ように
//   (templates/CLAUDE.md §4「手書き・ドラッグ操作の 共通ルール」)。
//   Pointer Events + setPointerCapture。touch-action・user-select・callout は index.css の .memo-canvas。
// ★ペンで 書いて いる あいだは 指(手のひら)を 無視する。
// ★つぎの 問題に すすむと 白紙に もどる(前の 問題の メモと まざらない ように)。
// ★大きさは「ふつう」と「ひろい」を えらべる(どちらも 端末が 覚える)。ならべ方は GameScreen が もつ。
// ★「ひっさん」を 押すと、いまの 問題を ひっ算の 形で 下に しく(lib/hissan.js)。
//   答え・くり上がり・商は 出さない。ヒントと 同じ 足場 なので、まとめ(mix)では 出さない。
//   下に しく だけ なので、けしゴム・ぜんぶ けす では 消えない(もう一度 押すと 消える)。
import { useEffect, useRef, useState } from 'react'
import { PencilIcon, EraserIcon, UndoIcon, TrashIcon, XIcon, MaximizeIcon, HissanIcon } from './Icons.jsx'

// 縦縞ノートの 1マス(px)。index.css の .memo-grid は この 値を --memo-cell で うけとる
const CELL = 44

const PEN_WIDTH = 3
const ERASER_WIDTH = 28

// 線を 1本 かく。けしゴムは 下の ます目(CSS)を 消さない ように、canvas の 中だけ 消す
const strokeStyle = (ctx, tool, color) => {
  ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = tool === 'eraser' ? ERASER_WIDTH : PEN_WIDTH
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}
const dot = (ctx, tool, [x, y]) => {
  ctx.beginPath()
  ctx.arc(x, y, (tool === 'eraser' ? ERASER_WIDTH : PEN_WIDTH) / 2, 0, Math.PI * 2)
  ctx.fill()
}

// aria は 読み上げ用の なまえ(テンキーの C「ぜんぶ けす」と まぎれない ように 分ける)
const ToolButton = ({ on, onClick, icon, label, aria = label, disabled, role, checked, pressed }) => (
  <button type="button" onClick={onClick} disabled={disabled} aria-label={aria} title={aria}
    role={role} aria-checked={checked} aria-pressed={pressed}
    className={`min-h-[48px] min-w-[48px] px-3 rounded-2xl border-2 border-b-4 font-bold text-sm flex items-center justify-center gap-1.5 active:border-b-2 active:translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none
      ${on ? 'bg-cta-600 border-cta-700 border-b-cta-800 text-white' : 'bg-card border-ink/15 border-b-ink/25 text-ink/80'}`}>
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
)

// ひっ算の 形(下に しく。読み上げは 問題文が する ので aria-hidden)
const HissanLayer = ({ layout }) => (
  <div className="absolute inset-0 pointer-events-none text-ink" aria-hidden="true">
    {layout.cells.map((c, i) => (
      <span key={`c${i}`} className="absolute grid place-items-center font-bold"
        style={{ left: c.col * CELL, top: c.row * CELL, width: CELL, height: CELL, fontSize: CELL * 0.64 }}>
        {c.ch}
      </span>
    ))}
    {layout.dots.map((d, i) => (
      <span key={`d${i}`} className="absolute rounded-full bg-ink"
        style={{ left: (d.col + 1) * CELL - 4, top: d.row * CELL + CELL * 0.74, width: 7, height: 7 }} />
    ))}
    {layout.rules.map((r, i) => (
      <span key={`r${i}`} className="absolute bg-ink rounded-full"
        style={{ left: r.col * CELL + 4, top: (r.row + 1) * CELL - 1.5, width: r.len * CELL - 8, height: 3 }} />
    ))}
    {layout.bracket && (
      // わり算の「厂」: わられる数の 左に まがった 線、上に 横線
      <svg className="absolute overflow-visible" style={{ left: 0, top: 0 }} width="1" height="1">
        <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
          d={`M ${layout.bracket.col * CELL - 6} ${(layout.bracket.row + 1) * CELL - 2}
              Q ${layout.bracket.col * CELL + 8} ${(layout.bracket.row + 0.5) * CELL} ${layout.bracket.col * CELL} ${layout.bracket.row * CELL + 2}
              L ${(layout.bracket.col + layout.bracket.len) * CELL - 2} ${layout.bracket.row * CELL + 2}`} />
      </svg>
    )}
  </div>
)

// wide: ひろい とき。hissan: いまの 問題の ひっ算の 形(できない 問題・まとめ では null)
export const MemoPad = ({ resetKey, onClose, wide, onToggleWide, hissan, hissanOn, onToggleHissan }) => {
  const canvasRef = useRef(null)
  const strokes = useRef([]) // [{ tool, points }] と、ぜんぶ けした しるし { tool: 'clear' }
  const current = useRef(null) // いま 書いて いる 線 { id, tool, points }
  const penSeen = useRef(false)
  const [tool, setTool] = useState('pen')
  const [count, setCount] = useState(0) // もどす・ぜんぶ けす を 押せるか

  const ctxOf = () => canvasRef.current?.getContext('2d')
  const inkColor = () => getComputedStyle(canvasRef.current).color // text-ink(色を 2か所に 書かない)

  const redraw = () => {
    const c = canvasRef.current
    const ctx = ctxOf()
    if (!c || !ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    const color = inkColor()
    for (const s of strokes.current) {
      if (s.tool === 'clear') { ctx.clearRect(0, 0, c.width, c.height); continue }
      strokeStyle(ctx, s.tool, color)
      if (s.points.length === 1) { dot(ctx, s.tool, s.points[0]); continue }
      ctx.beginPath()
      s.points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.stroke()
    }
  }

  // 大きさが かわったら(画面の 向き など)、canvas を 合わせて 書きなおす
  useEffect(() => {
    const c = canvasRef.current
    const fit = () => {
      const dpr = window.devicePixelRatio || 1
      const { width, height } = c.getBoundingClientRect()
      c.width = Math.round(width * dpr)
      c.height = Math.round(height * dpr)
      ctxOf().setTransform(dpr, 0, 0, dpr, 0, 0)
      redraw()
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  // つぎの 問題で 白紙に もどす
  useEffect(() => {
    strokes.current = []
    current.current = null
    setCount(0)
    redraw()
  }, [resetKey])

  const pointOf = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }

  const onDown = (e) => {
    if (e.pointerType === 'pen') penSeen.current = true
    if (current.current) return // 2本目の 指は 無視
    if (e.pointerType === 'touch' && penSeen.current) return // ペンで 書く 人の 手のひら
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    canvasRef.current.setPointerCapture(e.pointerId)
    const p = pointOf(e)
    current.current = { id: e.pointerId, tool, points: [p] }
    const ctx = ctxOf()
    strokeStyle(ctx, tool, inkColor())
    dot(ctx, tool, p)
  }

  const onMove = (e) => {
    const s = current.current
    if (!s || s.id !== e.pointerId) return
    e.preventDefault()
    const evs = e.nativeEvent.getCoalescedEvents?.() ?? []
    const pts = (evs.length ? evs : [e.nativeEvent]).map(pointOf)
    const ctx = ctxOf()
    strokeStyle(ctx, s.tool, inkColor())
    ctx.beginPath()
    ctx.moveTo(...s.points[s.points.length - 1])
    for (const p of pts) { ctx.lineTo(...p); s.points.push(p) }
    ctx.stroke()
  }

  const onUp = (e) => {
    const s = current.current
    if (!s || s.id !== e.pointerId) return
    current.current = null
    strokes.current.push({ tool: s.tool, points: s.points })
    setCount(strokes.current.length)
  }

  const undo = () => {
    strokes.current.pop()
    setCount(strokes.current.length)
    redraw()
  }
  // ぜんぶ けす も「もどす」で もどせる(まちがえて 押しても こまらない)
  const clearAll = () => {
    strokes.current.push({ tool: 'clear' })
    setCount(strokes.current.length)
    redraw()
  }
  const last = strokes.current[strokes.current.length - 1]
  const blank = count === 0 || last?.tool === 'clear'

  const showHissan = hissanOn && hissan

  const toolbar = (
    <div className="shrink-0 flex flex-wrap items-center gap-2">
      <div className="flex gap-2" role="radiogroup" aria-label="かく どうぐ">
        <ToolButton role="radio" checked={tool === 'pen'} on={tool === 'pen'} onClick={() => setTool('pen')}
          icon={<PencilIcon className="w-5 h-5" />} label="えんぴつ" />
        <ToolButton role="radio" checked={tool === 'eraser'} on={tool === 'eraser'} onClick={() => setTool('eraser')}
          icon={<EraserIcon className="w-5 h-5" />} label="けしゴム" />
      </div>
      {hissan && (
        <ToolButton pressed={!!hissanOn} on={!!hissanOn} onClick={onToggleHissan}
          icon={<HissanIcon className="w-5 h-5" />} label="ひっさん" aria="ひっさんの 形を 出す" />
      )}
      <div className="flex-1" />
      <ToolButton onClick={undo} disabled={count === 0} icon={<UndoIcon className="w-5 h-5" />} label="もどす" />
      <ToolButton onClick={clearAll} disabled={blank} icon={<TrashIcon className="w-5 h-5" />} label="ぜんぶ けす" aria="メモを ぜんぶ けす" />
      <ToolButton pressed={!!wide} on={!!wide} onClick={onToggleWide}
        icon={<MaximizeIcon className="w-5 h-5" />} label="ひろい" aria="メモを ひろく する" />
      <button type="button" onClick={onClose} aria-label="メモを とじる" title="メモを とじる"
        className="w-12 h-12 shrink-0 rounded-full bg-ink/5 text-ink/70 grid place-items-center active:translate-y-0.5 transition-all">
        <XIcon className="w-6 h-6" />
      </button>
    </div>
  )

  const paper = (
    <div className="relative flex-1 min-h-0 rounded-2xl border-2 border-ink/15 bg-card memo-grid overflow-hidden"
      style={{ '--memo-cell': `${CELL}px` }}>
      {showHissan && <HissanLayer layout={hissan} />}
      <canvas ref={canvasRef} aria-label="メモを かく ところ" role="img"
        className={`memo-canvas absolute inset-0 w-full h-full text-ink ${tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        onContextMenu={e => e.preventDefault()} />
      {blank && !showHissan && (
        <span className="absolute left-3 top-2 text-sm font-bold text-ink/70 pointer-events-none" aria-hidden="true">
          ここに ゆびや ペンで かけるよ
        </span>
      )}
    </div>
  )

  // ★ふつう: 問題と テンキーの 下の、あいて いる 高さ ぜんぶを 使う(GameScreen の main が 中身の 高さに ちぢむ)。
  //   はばは 問題画面(max-w-2xl)より 広く とる。書く ところで、目で 探す ところでは ない ので
  //   patterns/layout.md の「広げすぎない」は 当てはまらない。
  // ★ひろい: 横長では 左に 高さ いっぱい(右の 列に 問題と テンキー)。ならべ方は GameScreen。
  // ★ふつう/ひろい で 木の 形を かえない(かえると canvas が 作りなおされ、書いた ものが 消える)
  return (
    <section aria-label="メモ" className={wide
      ? 'flex-1 min-w-0 min-h-[240px] flex flex-col lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:min-h-0'
      : 'flex-1 min-h-[320px] flex flex-col px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t-2 border-ink/10 bg-cream animate-rise-in'}>
      <div className={wide ? 'w-full flex-1 min-h-0 flex flex-col gap-2' : 'w-full max-w-5xl mx-auto flex-1 min-h-0 flex flex-col gap-2'}>
        {toolbar}
        {paper}
      </div>
    </section>
  )
}
