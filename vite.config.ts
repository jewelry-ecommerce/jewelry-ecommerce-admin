import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const DEFAULT_DEV_PORT = 6100;

/**
 * Vendor chunking is driven only by packages this app actually depends on. The internal
 * design-system / SSO packages used by the reference admin app are not dependencies here, so no
 * chunk rule references them.
 */
const resolveVendorChunk = (moduleId: string): string | undefined => {
  if (!moduleId.includes('node_modules')) return undefined;

  if (moduleId.includes('@mui/icons-material')) return 'vendor-mui-icons';
  if (moduleId.includes('@mui/x-')) return 'vendor-mui-x';
  if (moduleId.includes('@mui/material') || moduleId.includes('@mui/system') || moduleId.includes('@emotion')) return 'vendor-mui';
  if (moduleId.includes('@reduxjs') || moduleId.includes('react-redux') || moduleId.includes('redux-persist')) return 'vendor-redux';
  if (moduleId.includes('dayjs') || moduleId.includes('axios') || moduleId.includes('swr') || moduleId.includes('yup'))
    return 'vendor-utils';
  if (moduleId.includes('react-dom') || moduleId.includes('react-router') || moduleId.includes(`${path.sep}react${path.sep}`))
    return 'vendor-react';

  return undefined;
};

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
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id: string) => resolveVendorChunk(id),
        },
      },
    },
  };
});
