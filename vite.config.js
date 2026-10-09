import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base は './'（gakushu-ui-kit の 共通方針。GitHub Pages でも Vercel でも 動く）。
// 旧 小数カード の URL（/shosu/）は public/shosu/index.html が トップへ 案内する。
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  },
})
