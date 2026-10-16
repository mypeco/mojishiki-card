// ひっ算の ならび(メモの「ひっさん」で 下に しく 形)。
// ★問題文だけを 縦に ならべる。答えの 数字・くり上がり・商は 出さない(書くのは 子ども)。
// ★「A + B」「A − B」「A × B」「A ÷ B」(A・B は 0 いじょうの 整数か 小数)だけ。
//   かっこ・負の数・3つ いじょうの 数・分数・文字式は null(ひっ算に しない)。
//
// 1マス = 1けた。小数点は マスを 使わず、その 前の けたの マスの 右下に うつ(ノートと 同じ)。
// 返す 形: { cols, rows, cells: [{ col, row, ch }], dots: [{ col, row }], rules: [{ col, row, len }], bracket }
//   rules は row の マスの 下に ひく 線、bracket は わり算の「厂」。

const NUM = String.raw`(\d+(?:\.\d+)?)`
const RE = new RegExp(`^${NUM}\\s*([+−×÷])\\s*${NUM}$`)

export const parseHissan = (text) => {
  const m = RE.exec(text.trim())
  return m ? { a: m[1], op: m[2], b: m[3] } : null
}

const split = (s) => {
  const [i, f = ''] = s.split('.')
  return { i, f, digits: i + f }
}

// 数を 1けたずつ マスに おく。endCol は 整数部の さいごの けたの 列
const placeNum = (s, row, intEndCol, out) => {
  const { i, f } = split(s)
  ;[...i].forEach((ch, k) => out.cells.push({ col: intEndCol - (i.length - 1) + k, row, ch }))
  if (s.includes('.')) out.dots.push({ col: intEndCol, row })
  ;[...f].forEach((ch, k) => out.cells.push({ col: intEndCol + 1 + k, row, ch }))
}

// 左に 1列・上に 1行 あけて おく(上の 行は くり上がりを 書く ところ)
export const layoutHissan = (text) => {
  const p = parseHissan(text)
  if (!p) return null
  const out = { cells: [], dots: [], rules: [], bracket: null }
  const A = split(p.a)
  const B = split(p.b)

  if (p.op === '÷') {
    // わる数 ) わられる数。商は その 上の 行に 書く
    const bLen = B.digits.length
    const aLen = A.digits.length
    const start = 1 + bLen // わられる数の はじめの 列
    placeNum(p.b, 2, 1 + B.i.length - 1, out)
    placeNum(p.a, 2, start + A.i.length - 1, out)
    out.bracket = { col: start, row: 2, len: aLen }
    return { ...out, cols: start + aLen + 1, rows: 6 }
  }

  if (p.op === '×') {
    // かけ算は 小数点では なく、さいごの けたで そろえる
    const L = Math.max(A.digits.length, B.digits.length)
    const end = 2 + L - 1
    placeNum(p.a, 1, end - A.f.length, out)
    placeNum(p.b, 2, end - B.f.length, out)
    out.cells.push({ col: 1, row: 2, ch: '×' })
    out.rules.push({ col: 1, row: 2, len: L + 1 })
    return { ...out, cols: end + 2, rows: 4 }
  }

  // たし算・ひき算は 小数点(位)で そろえる
  const I = Math.max(A.i.length, B.i.length)
  const F = Math.max(A.f.length, B.f.length)
  const intEnd = 2 + I - 1
  placeNum(p.a, 1, intEnd, out)
  placeNum(p.b, 2, intEnd, out)
  out.cells.push({ col: 1, row: 2, ch: p.op })
  out.rules.push({ col: 1, row: 2, len: I + F + 1 })
  return { ...out, cols: intEnd + F + 2, rows: 4 }
}
