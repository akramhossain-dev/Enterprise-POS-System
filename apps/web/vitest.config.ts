import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/utils/cn.ts',
        'src/utils/error.ts',
        'src/utils/format.ts',
        'src/utils/storage.ts',
        'src/utils/validators.ts',
        'src/components/common/**',
        'src/services/auth.service.ts',
        'src/stores/auth.store.ts',
        'src/hooks/use-debounce.ts',
        'src/hooks/use-permissions.ts',
        'src/hooks/use-caps-lock.ts',
        'src/hooks/use-session-timeout.ts',
      ],
      exclude: ['src/tests/**', 'src/**/*.d.ts', 'src/**/index.ts'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
