#!/usr/bin/env node
// gakushu-ui-kit から もらった ファイルが、もらった ときの まま かを 見る 道具。
//
//   node tools/check-kit.mjs
//
// ★キットが 無くても 走る(くらべる 相手は kit.lock)。だから GitHub でも 走る。
// ★となりに キット(../gakushu-ui-kit)が ある ときは、キットの 最新と ちがうかも 言う
//   (ちがっても 失敗には しない。追いつくか どうかは 人が きめる)。
//
// アプリ側で 直さない こと。直す ときは キットで 直して、ここに 上書きし、kit.lock を 書きなおす。

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const md5 = (p) => createHash('md5').update(readFileSync(p)).digest('hex')
const lock = JSON.parse(readFileSync(join(root, 'kit.lock'), 'utf8'))
const kitDir = join(root, '..', 'gakushu-ui-kit')

console.log(`キット ${lock.kit_version}(${lock.synced})の ときの 姿と くらべます`)
let ng = 0
for (const [file, { from, md5: want }] of Object.entries(lock.files)) {
  const p = join(root, file)
  if (!existsSync(p)) { console.log(`  ${file}  ★ありません`); ng++; continue }
  const same = md5(p) === want
  if (!same) ng++
  console.log(`  ${file}  ${same ? '同じ' : '★kit.lock の ときから 変わって います'}`)
  const kitFile = join(kitDir, from)
  if (existsSync(kitFile) && md5(kitFile) !== md5(p)) console.log(`    ※ キットの 最新(${from})とは ちがいます。追いつく ときは コピーして kit.lock を 書きなおす`)
}
console.log(ng ? `キットの 点検: ✕ ${ng}件` : 'キットの 点検: ✕ 0件')
process.exit(ng ? 1 : 0)
