// 乱数の小さな道具
export const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
export const pick = (arr) => arr[ri(0, arr.length - 1)]
// 0 をのぞく ±min〜max
export const rnz = (min, max) => ri(min, max) * (Math.random() < 0.5 ? -1 : 1)
