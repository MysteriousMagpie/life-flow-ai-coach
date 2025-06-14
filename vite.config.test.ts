
import { defineConfig, configDefaults } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 8080,
    strictPort: true, // force it to crash if 8080 is unavailable
  },
  test: {
    globals: true,
    environment: 'node',
    exclude: [...configDefaults.exclude, 'client/e2e/**', 'client/tests/**', 'tests/e2e/**']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
