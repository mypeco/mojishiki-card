/** @type {import('tailwindcss').Config} */
// 色・うごき・はばの めもりは gakushu-ui-kit の tokens/tailwind.config.snippet.js が正。
// kit/tailwind.config.snippet.cjs はその バイト同一の コピー（拡張子だけ .cjs）。
// ここに 色の 値を 書かない（数字を 2か所に 書かない）。
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: require('./kit/tailwind.config.snippet.cjs'),
  },
  plugins: [],
}
