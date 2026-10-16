// ならう 学年(学習指導要領 2017年告示 の めやす。教科書で 前後する ことが ある)。
// 単元ファイルの 各レベルに grade を もつ。1〜6 は 小学1〜6年、7〜9 は 中学1〜3年。
//   grade: 3       … 小3
//   grade: [2, 3]  … 小2〜3(1つの レベルに 2つの 学年の 問題が まざる とき)
// まとめ(mix)は もたない。出題元の レベルから 出す(levelGrade)。
// ★子どもの 学年は 持たない・くらべない(gakushu-ui-kit patterns/accounts.md §1・semantics.md §6)。
//   これは「この 計算を どこで ならうか」の しるし。せっていで 出さない ことも できる。

export const MAX_GRADE = 9

export const gradeRange = (g) => (Array.isArray(g) ? g : [g, g])

const school = (n) => (n <= 6 ? '小' : '中')
const year = (n) => (n <= 6 ? n : n - 6)

// 小3 / 小2〜3 / 小1〜中1
export const gradeLabel = (g) => {
  const [a, b] = gradeRange(g)
  if (a === b) return `${school(a)}${year(a)}`
  if (school(a) === school(b)) return `${school(a)}${year(a)}〜${year(b)}`
  return `${school(a)}${year(a)}〜${school(b)}${year(b)}`
}

// 読み上げ用: 小学3年で ならう / 小学1年〜中学1年で ならう
export const gradeAria = (g) => {
  const [a, b] = gradeRange(g)
  const full = (n) => `${n <= 6 ? '小学' : '中学'}${year(n)}年`
  if (a === b) return `${full(a)}で ならう`
  if (school(a) === school(b)) return `${a <= 6 ? '小学' : '中学'}${year(a)}〜${year(b)}年で ならう`
  return `${full(a)}〜${full(b)}で ならう`
}

// いくつかの レベルの 学年を まとめる(まとめ用)
export const mergeGrades = (list) => {
  const all = list.flatMap(gradeRange)
  const a = Math.min(...all), b = Math.max(...all)
  return a === b ? a : [a, b]
}
