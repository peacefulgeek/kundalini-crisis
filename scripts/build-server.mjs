import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Build main server
await build({
  entryPoints: [resolve(projectRoot, 'server/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: resolve(projectRoot, 'dist/index.js'),
  external: [
    // Node built-ins
    'node:*',
    // Vite is dev-only, never bundle it
    'vite',
    '@vitejs/plugin-react',
    // Heavy native modules
    'pg-native',
    'bufferutil',
    'utf-8-validate',
    // All node_modules (server runs with them installed)
    '@anthropic-ai/sdk',
    'compression',
    'express',
    'node-cron',
    'pg',
    'react',
    'react-dom',
    'react-dom/server',
    'react-router-dom',
    'react-router-dom/server',
    'serve-static',
  ],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
  },
});

console.log('[build-server] Main server built: dist/index.js');

// Build SSR entry
await build({
  entryPoints: [resolve(projectRoot, 'src/client/entry-server.tsx')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: resolve(projectRoot, 'dist/server/entry-server.js'),
  external: [
    'node:*',
    'vite',
    'react',
    'react-dom',
    'react-dom/server',
    'react-router-dom',
    'react-router-dom/server',
    'react-router-dom/server.js',
  ],
  jsx: 'automatic',
});

console.log('[build-server] SSR entry built: dist/server/entry-server.js');
