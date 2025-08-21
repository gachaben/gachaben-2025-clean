// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // 先に "@/firebase" を正規表現で完全一致マッチ
      { find: /^@\/firebase$/, replacement: fileURLToPath(new URL('./src/fbkit', import.meta.url)) },
      // 次に "@/..." を src に通す（他のパス用）
      { find: /^@\//, replacement: fileURLToPath(new URL('./src/', import.meta.url)) },
    ],
  },
})
