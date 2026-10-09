/**
 * gakushu-ui-kit の 共通トークン。
 * tailwind.config.js の theme.extend にそのまま マージして使う。
 *
 * ★このファイル自体は動かない部品（スニペット）です。
 *   実際の静的ビルド手順は build/README.md を見てください
 *   （CDN の Tailwind Play CDN は使わない前提のキットです）。
 *
 * ドメイン固有の色（ymark/rmark/sblend/lblend など）が要らないアプリは
 * colors の該当行を削ってよい。新しく色を増やしたら tokens/colors.md の
 * 台帳にも追記すること（アプリをまたいで色相が衝突しないようにするため）。
 */
module.exports = {
  colors: {
    cream: '#FBF3EA',
    card:  '#FFFDF9',
    ink:   '#3A3226',
    cta:       { 50:'#F1F5F9',100:'#DFEAF1',200:'#C2D7E5',300:'#9BBCD4',400:'#699BBF',500:'#4880A8',600:'#3A6788',700:'#2E526B',800:'#254156',900:'#1C3140' },
    success:   { 50:'#F1F9F4',100:'#DEF2E6',200:'#C1E6D1',300:'#9AD6B3',400:'#67C18C',500:'#46AA6F',600:'#388A5A',700:'#2C6D47',800:'#235739',900:'#1B412B' },
    support:   { 50:'#F3F3F7',100:'#E3E5ED',200:'#C7CBDB',300:'#A1A8C4',400:'#727DA6',500:'#4C5578',600:'#3C435F',700:'#2C3246',800:'#1F2230',900:'#11131A' },
    highlight: { 50:'#FBF7EF',100:'#F5EDDB',200:'#EDDEBB',300:'#E1C88E',400:'#D2AD56',500:'#BD9432',600:'#997729',700:'#795E20',800:'#614B1A',900:'#493913' },
    // ↓ ドメイン固有色。要らなければ削ってよい（tokens/colors.md §3-4 参照）
    ymark:     { 50:'#FBF8EE',100:'#F7EFDA',200:'#EEDEB4',300:'#E3C982',400:'#D5AE44',500:'#8A6D1F',600:'#695318',700:'#473810',800:'#2A2109',900:'#211A07' },
    rmark:     { 50:'#F8F5F2',100:'#EEE7E2',200:'#DED0C4',300:'#C8B09D',400:'#AC896D',500:'#8B6A4F',600:'#715640',700:'#574231',800:'#403124',900:'#292018' },
    sblend:    { 50:'#EFFBF8',100:'#DAF6EF',200:'#B6ECDF',300:'#85E0C9',400:'#48D0AE',500:'#1F7A63',600:'#175949',700:'#0E392E',800:'#08211A',900:'#08211A' },
    lblend:    { 50:'#F3F2F8',100:'#E3E1EF',200:'#C8C4DF',300:'#A39CC9',400:'#756AAE',500:'#6B5FA8',600:'#594E90',700:'#494076',800:'#3A335E',900:'#2C2747' },
  },
  // 素の Tailwind の めもり に 無い はば。16（64px）と 20（80px）の あいだ が
  // 無い ため、`w-18` と 書いて も **何も 起きません**でした（phonics-gakuen の
  // タイルが 大きい 画面でも 64px の まま だった）。書いた とおりの 大きさに します。
  spacing: {
    18: '4.5rem',
  },
  // 押しボタンの当たり判定/ゆれ、録音の波形、正誤フィードバックの共通アニメーション。
  // 名前を変えずに使うと patterns/components.md のスニペットがそのまま動く。
  keyframes: {
    wave:  { '0%,100%':{ height:'12px' }, '50%':{ height:'36px' } },
    popIn: { '0%':{ transform:'scale(.96)', opacity:'0' }, '100%':{ transform:'scale(1)', opacity:'1' } },
    nudge: { '0%,100%':{ transform:'translateX(0)' }, '25%':{ transform:'translateX(-5px)' }, '75%':{ transform:'translateX(5px)' } },
    riseIn: { '0%':{ transform:'translateY(1rem)', opacity:'0' }, '100%':{ transform:'translateY(0)', opacity:'1' } },
  },
  animation: {
    'rec-wave':'wave .9s ease-in-out infinite',
    'pop-in':'popIn .2s ease-out both',
    'nudge':'nudge .3s ease-in-out 1',
    // 画面の 下から 出てくる もの（下に 貼りつく 知らせ など）。
    // tailwindcss-animate の slide-in-from-bottom-4 の 代わり です。
    // ★プラグインの class（animate-in / zoom-in / fade-in / slide-in-from-*）は
    //   書かない こと。素の Tailwind には 無く、**書いて あるのに 何も 起きません**
    //   （patterns/semantics.md §4.7）。ここの 名前を つかえば no-motion も 効きます。
    'rise-in':'riseIn .3s cubic-bezier(0.16,1,0.3,1) both',
  },
};
