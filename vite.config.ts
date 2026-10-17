import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const DEFAULT_DEV_PORT = 6100;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const devServerPort = Number(env.VITE_PORT ?? process.env.VITE_PORT) || DEFAULT_DEV_PORT;

  return {
    plugins: [react()],
    server: {
      port: devServerPort,
      proxy: {
        '/api/demo-cms': {
          target: env.VITE_CMS_DEMO_CLIENT_URL || 'http://127.0.0.1:3100',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: devServerPort,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Keep Rollup's dependency-aware splitting. Separate React/MUI vendor buckets
    // created circular initialization and a blank production page on Windows.
  };
});
