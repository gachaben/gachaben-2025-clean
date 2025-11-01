import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// ✅ 追加：.env.local を手動でロード
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  console.log('✅ env.local loaded:', env.VITE_FIRESTORE_PORT, env.VITE_AUTH_PORT);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@/fbkit': fileURLToPath(new URL('./src/fbkit', import.meta.url)),
      },
    },
    server: {
      host: '127.0.0.1',
    },
  };
});
