import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: [
      { find: /^copperplate\/react$/, replacement: resolve(__dirname, '../src/react.tsx') },
      { find: /^copperplate$/, replacement: resolve(__dirname, '../src/index.ts') },
    ],
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: { input: { main: resolve(__dirname, 'index.html'), perf: resolve(__dirname, 'perf.html'), react: resolve(__dirname, 'react.html'), 'og-card': resolve(__dirname, 'og-card.html') } },
  },
  server: { port: 5178, strictPort: true },
  preview: { port: 5178, strictPort: true },
});
