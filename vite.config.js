// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // フォルダを指す（index.ts を自動解決）
      '@/firebase': fileURLToPath(new URL('./src/fbkit', import.meta.url)),
    },
  },
})
