// ヒント(やりかた)。押した ときだけ 出す シート。
// ★答えは 出さない。同じ レベルの「れい」で やり方を 見せる。
//   ② 小数だけは、いま 解いて いる 問題の ひっ算の 図を 出す(答えの 数字は 出さない)。
// ★足場を 抜く ところ: まとめ(mix)には ヒントボタンを 置かない
//   (ヒントなしで できるかを 確かめる 回。patterns/semantics.md §5)。
import { MathText, QuestionWithAnswer } from './MathText.jsx'
import { Sheet, PrimaryButton } from './ui.jsx'
import { LightbulbIcon } from './Icons.jsx'
import { DecimalHintBody, DECIMAL_TITLES } from './DecimalHint.jsx'
import { hintFor } from '../units/shosu.js'

const Step = ({ n, children }) => (
  <li className="flex items-start gap-3">
    <span className="shrink-0 w-7 h-7 rounded-full bg-cta-600 text-white text-sm font-bold grid place-items-center mt-0.5">{n}</span>
    <span className="text-base font-bold text-ink leading-relaxed">{children}</span>
  </li>
)

export const HintSheet = ({ unit, level, item, onClose }) => {
  const isDecimal = unit.hintKind === 'decimal'
  const title = isDecimal ? (DECIMAL_TITLES[hintFor(item)?.kind] ?? 'やりかた') : 'やりかた'
  const ex = level.tip?.ex

  return (
    <Sheet title={title} titleIcon={<LightbulbIcon className="w-6 h-6 text-highlight-700" />} onClose={onClose}
      footer={<PrimaryButton className="w-full" onClick={onClose}>とじる</PrimaryButton>}>
      {isDecimal ? (
        <div className="py-2">
          <p className="text-center text-xl font-bold text-ink mb-3">{item.text}</p>
          <DecimalHintBody item={item} />
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-cream border-2 border-ink/10 p-4 mb-4 text-center">
            <div className="text-xs font-bold text-ink/70 mb-1">れい{ex.lead ? `(${ex.lead})` : ''}</div>
            <div className="text-2xl font-bold text-ink leading-relaxed">
              <QuestionWithAnswer q={ex} />
            </div>
          </div>
          <ol className="flex flex-col gap-3">
            {level.tip.steps.map((s, i) => <Step key={i} n={i + 1}><MathText text={s} /></Step>)}
          </ol>
        </>
      )}
      <p className="text-xs font-bold text-ink/70 text-center mt-4">答えは 自分で 計算して みよう</p>
    </Sheet>
  )
}
