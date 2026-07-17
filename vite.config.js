import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mojishiki-card/',
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  },
})
