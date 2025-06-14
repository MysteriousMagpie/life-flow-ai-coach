
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 8080,
    strictPort: true, // force it to crash if 8080 is unavailable
  },
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      'client/e2e/**',
      'client/tests/**',
      'tests/e2e/**'
    ],
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
