import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      GTFS_RT_URL: 'https://feed.test/VehiclePositions.pb',
      MBTA_API_KEY: 'test-key',
      POLL_INTERVAL_MS: '10000',
    },
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types/**',
        'src/test/**',
        'src/server.ts',
      ],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
