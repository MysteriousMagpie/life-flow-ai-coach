
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
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
