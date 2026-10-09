#!/usr/bin/env node
// 書体(BIZ UDPGothic)を、アプリで 使う 文字の ぶんだけ 作りなおす。
//
//   npm run build:fonts
//
// ★新しい 漢字・文字を 足したら 走らせる(抜けて いても こわれないが、
//   その 文字だけ 端末の 書体に なる)。となりに gakushu-ui-kit が 要る。
// Windows でも 動く ように、ファイルの 一覧は ここで 集めて わたす。
import { readdirSync, statSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pick = join(root, '..', 'gakushu-ui-kit', 'build', 'pick-fonts.mjs')
if (!existsSync(pick)) {
  console.error('../gakushu-ui-kit が ありません。キットを となりに 置いて ください。')
  process.exit(1)
}
const walk = (dir) => readdirSync(dir).flatMap(f => {
  const p = join(dir, f)
  return statSync(p).isDirectory() ? walk(p) : [p]
})
const scan = [join(root, 'index.html'), ...walk(join(root, 'src')).filter(p => ['.js', '.jsx'].includes(extname(p)))]
const r = spawnSync(process.execPath, [pick, '--family', 'BIZ UDPGothic', '--weights', '400,700', '--scan', ...scan, '--out', join(root, 'src', 'assets')], { stdio: 'inherit' })
process.exit(r.status ?? 1)
