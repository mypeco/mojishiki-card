#!/usr/bin/env node
// 見た目の 決めごとを、機械で 見る 道具(このアプリ用。React の className を 読む)。
//
//   node tools/check-style.mjs
//
// gakushu-ui-kit の build/check-classes・build/check-motion は index.html 1枚の
// アプリ用で、JSX の className は 読めない。同じ ねらいを この アプリの 形で 見る。
//
//   1. CDN を 読んで いないか(Tailwind・書体・アイコンは ぜんぶ 自前)
//   2. 12px より 小さい 字が ないか(templates/CLAUDE.md §2)
//   3. 止まらない うごき・プラグインの class が ないか(patterns/semantics.md §4.2・§4.7)
//   4. class 名を 実行時に 組み立てて いないか(build/README.md の ★)
//   5. 色が キットの トークン だけか(素の Tailwind 色 slate・rose などを 使わない)
//   6. うごきを 止める しくみ(.no-motion)が index.css に あるか
//
// ★タップ領域(48px)と 字の 色の 濃さは、画面を 出さないと 測れないので ここでは 見ない。
//   CLAUDE.md の「見た目を 直した ときの たしかめ かた」で Playwright で 測る。

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, extname } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const walk = (dir) => readdirSync(dir).flatMap(f => {
  const p = join(dir, f)
  return statSync(p).isDirectory() ? walk(p) : [p]
})
const files = [join(root, 'index.html'), ...walk(join(root, 'src')).filter(p => ['.js', '.jsx', '.css'].includes(extname(p)))]

// キットの 色トークン(tokens/tailwind.config.snippet.js)と、色でない もの
const TOKENS = new Set(['cream', 'card', 'ink', 'cta', 'success', 'support', 'highlight', 'ymark', 'rmark', 'sblend', 'lblend', 'white', 'black', 'transparent', 'current', 'inherit'])
const COLOR_PREFIX = /^(?:[a-z-]+:)*(?:bg|text|border(?:-[trblxy])?|ring|ring-offset|from|to|via|fill|stroke|outline|decoration|divide|placeholder|shadow|accent|caret)-([a-z]+)(?:-(\d{2,3}))?(?:\/\d+)?$/
// 色でない 同じ 形の class(text-lg・border-2 など)
const NOT_COLOR = new Set(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', 'left', 'center', 'right', 'justify', 'none', 'solid', 'dashed', 'dotted', 'double', 'opacity', 'offset', 'md', 'inner', 'collapse', 'separate', 'auto', 'clip', 'ellipsis', 'wrap', 'nowrap', 'balance', 'pretty', 'start', 'end', 'b', 't', 'l', 'r', 'x', 'y', 'cover', 'contain', 'no', 'repeat', 'fixed', 'local', 'scroll', 'origin', 'bottom', 'top'])

const problems = []
const add = (f, line, msg) => problems.push(`${relative(root, f)}:${line}  ${msg}`)

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  const lines = src.split('\n')
  lines.forEach((l, i) => {
    const n = i + 1
    if (/^\s*(\/\/|\*|\/\*)/.test(l)) return // コメント
    // 1. CDN
    if (/cdn\.tailwindcss\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com|cdn\.jsdelivr\.net|cdnjs\./.test(l)) add(f, n, 'CDN を 読んで いる')
    // 2. 小さい 字
    for (const m of l.matchAll(/text-\[(\d+(?:\.\d+)?)(px|rem|em)\]/g)) {
      const px = m[2] === 'px' ? Number(m[1]) : Number(m[1]) * 16
      if (px < 12) add(f, n, `${m[0]} は 12px より 小さい`)
    }
    // 3. うごき
    for (const m of l.matchAll(/\b(animate-(?:bounce|pulse|ping|spin|in|out)|(?:fade|zoom|spin)-(?:in|out)(?:-\d+)?|slide-(?:in|out)-from-[a-z]+)\b/g)) {
      add(f, n, `${m[1]}(止まらない うごき・プラグインの class)`)
    }
    // 4. class 名の 組み立て
    if (/\.replace\(\s*['"`](?:bg|border|text|from|to|ring|fill|stroke)-/.test(l)) add(f, n, 'class 名を 実行時に 組み立てて いる')
    if (/(?:bg|text|border|ring)-\$\{/.test(l)) add(f, n, 'class 名を 実行時に 組み立てて いる(`bg-${…}`)')
  })
  // 5. 色トークン(className の 文字列と、class を ならべた 文字列)
  if (extname(f) !== '.css') {
    for (const m of src.matchAll(/(['"`])((?:(?!\1).)*)\1/g)) {
      const str = m[2]
      if (!/(?:^|\s)(?:[a-z-]+:)*(?:bg|text|border|ring|from|to|divide|decoration)-/.test(str)) continue
      for (const tok of str.split(/[\s${}]+/)) {
        const c = tok.match(COLOR_PREFIX)
        if (!c || NOT_COLOR.has(c[1]) || TOKENS.has(c[1])) continue
        if (/^\d/.test(c[1])) continue
        const line = src.slice(0, m.index).split('\n').length
        add(f, line, `${tok} … キットの 色トークン では ない 色`)
      }
    }
  }
}

// 6. うごきを 止める しくみ
const css = readFileSync(join(root, 'src', 'index.css'), 'utf8')
if (!/\.no-motion \*/.test(css) || !/animation-duration/.test(css)) problems.push('src/index.css に .no-motion で うごきを 止める きまりが ない')

if (problems.length) {
  console.log(`見た目の 点検: ✕ ${problems.length}件`)
  for (const p of problems) console.log('  ' + p)
  process.exit(1)
}
console.log(`見た目の 点検: ✕ 0件(${files.length}ファイル)`)
