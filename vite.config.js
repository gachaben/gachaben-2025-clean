import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/fbkit': fileURLToPath(new URL('./src/fbkit', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1', // ✅ ローカル固定（localhost ではなく IP 固定）
  },
});
console.log("✅ Vite config loaded. Alias @ = /src");
