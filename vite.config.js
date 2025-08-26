// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // 先に「より具体的な」@/firebase を置く！
      { find: '@/firebase', replacement: fileURLToPath(new URL('./src/fbkit', import.meta.url)) },
      { find: '@',           replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
})
