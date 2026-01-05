import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.manual.test.ts"],
    coverage: {
      enabled: true,
      exclude: [
        "src/__tests__/**"
      ]
    },
  },
});