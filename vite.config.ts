import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    // Use default input (index.html) so it gets copied to dist/client
    rollupOptions: {
      input: 'index.html'
    }
  },
  server: {
    port: 5173
  }
});
