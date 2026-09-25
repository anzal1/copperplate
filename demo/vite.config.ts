import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { defineConfig } from 'vite';

// Every page of the site: the home page, the plates page, the lamp, the
// components index and one generated page per component (scripts/pages.mjs),
// plus the old standalone pages. The design lab pages are left out.
const LAB = /^(dir-|piece|kit|component\.template)/;
function pages(dir: string, out: Record<string, string> = {}) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'dist' || name === 'public' || name === 'node_modules') continue;
    if (statSync(p).isDirectory()) pages(p, out);
    else if (name.endsWith('.html') && !LAB.test(name)) out[relative(import.meta.dirname, p).replace(/\.html$/, '')] = p;
  }
  return out;
}

export default defineConfig({
  root: import.meta.dirname,
  resolve: {
    alias: [
      { find: /^copperplate\/react$/, replacement: resolve(import.meta.dirname, '../src/react.tsx') },
      { find: /^copperplate$/, replacement: resolve(import.meta.dirname, '../src/index.ts') },
    ],
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: { input: pages(import.meta.dirname) },
  },
  server: { port: 5178, strictPort: true },
  preview: { port: 5178, strictPort: true },
});
