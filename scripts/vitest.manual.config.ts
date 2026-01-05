import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ["src/**/*.manual.test.ts"],
    coverage: {
      enabled: true,
      exclude: [
        "src/r2/utils.ts",
        "src/utils/**",
        "src/__tests__/**"
      ]
    },
    // Tests hit an actual R2 bucket, so need to be run serially or they can interfere
    fileParallelism: false,
  },
});