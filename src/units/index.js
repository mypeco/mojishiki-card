// 6つの単元。① → ⑥ の順に、一次方程式までの「みち」になっている。
import { pick } from '../lib/rand.js'
import seisu from './seisu.js'
import shosu from './shosu.js'
import yakubai from './yakubai.js'
import bunsu from './bunsu.js'
import moji from './moji.js'
import houtei from './houtei.js'

export const UNITS = [seisu, shosu, yakubai, bunsu, moji, houtei]

export const QUESTION_COUNT = 10

export const MIX = 'mix'

export const getUnit = (id) => UNITS.find(u => u.id === id)
export const getLevel = (unit, levelId) => unit.levels.find(l => l.id === levelId)

// 画面に出す番号(1, 2, 3…)。まとめは番号なし
export const levelNo = (unit, levelId) =>
  levelId === MIX ? null : unit.levels.filter(l => !l.mix).findIndex(l => l.id === levelId) + 1

export const levelLabel = (unit, levelId) =>
  levelId === MIX ? 'まとめ' : `レベル${levelNo(unit, levelId)}`

// まとめの出題元
const mixPool = (unit) => {
  const mix = getLevel(unit, MIX)
  const ids = mix.pool ?? unit.levels.filter(l => !l.mix).map(l => l.id)
  return ids.map(id => getLevel(unit, id))
}

const genOne = (unit, level) => (level.mix ? pick(mixPool(unit)).gen() : level.gen())

export const generateQuestions = (unitId, levelId, count = QUESTION_COUNT) => {
  const unit = getUnit(unitId)
  const level = getLevel(unit, levelId)
  const qs = []
  const seen = new Set()
  while (qs.length < count) {
    let q = genOne(unit, level)
    // なるべく同じ問題が続かないように(20回ためしてだめなら許す)
    for (let t = 0; t < 20 && seen.has(q.lead + q.text); t++) q = genOne(unit, level)
    seen.add(q.lead + q.text)
    qs.push(q)
  }
  return qs
}
