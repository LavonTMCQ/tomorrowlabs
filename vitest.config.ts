import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: './globalSetup.ts',
    setupFiles: ['./testSetup.ts'],
    testTimeout: 60000, // 60 seconds for AI evaluations
    hookTimeout: 30000, // 30 seconds for setup hooks
    environment: 'node',
  },
});
