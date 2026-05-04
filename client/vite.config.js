import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    },
    hmr: {
      port: 3000,
      host: 'localhost'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  base: process.env.NODE_ENV === 'production' ? '/' : '/'
});
