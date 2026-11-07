import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

import { fileURLToPath } from 'url';

// Plugin to resolve .js imports to .tsx / .ts files
const resolveJsToTsPlugin = (): Plugin => ({
  name: 'resolve-js-to-ts',
  enforce: 'pre',
  resolveId(source, importer) {
    if (importer && source.endsWith('.js') && (source.startsWith('.') || source.startsWith('/'))) {
      const importerDir = path.dirname(importer);
      const targetPath = path.resolve(importerDir, source);
      if (!fs.existsSync(targetPath)) {
        const basePath = targetPath.slice(0, -3); // remove .js
        const tsxCandidate = `${basePath}.tsx`;
        if (fs.existsSync(tsxCandidate)) {
          return tsxCandidate;
        }
        const tsCandidate = `${basePath}.ts`;
        if (fs.existsSync(tsCandidate)) {
          return tsCandidate;
        }
        const jsxCandidate = `${basePath}.jsx`;
        if (fs.existsSync(jsxCandidate)) {
          return jsxCandidate;
        }
      }
    }
    return null;
  },
});

export default defineConfig(() => {
  return {
    plugins: [resolveJsToTsPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
