import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mojishiki-card/',
  build: {
    rollupOptions: {
      input: {
        // 文字式カード(/)と小数カード(/shosu/)の2アプリを同時にビルドする
        main:  fileURLToPath(new URL('./index.html', import.meta.url)),
        shosu: fileURLToPath(new URL('./shosu/index.html', import.meta.url)),
      },
    },
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  },
})
