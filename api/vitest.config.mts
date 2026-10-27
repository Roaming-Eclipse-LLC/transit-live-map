import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types/**',
        'src/server.ts',
        'src/poller/gtfsPoller.ts',
      ],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 65,
        branches: 100,
        functions: 55,
        lines: 65,
      },
    },
  },
});
