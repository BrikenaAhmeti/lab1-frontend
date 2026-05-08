import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/hms/test/setup.ts'],
    include: ['./src/hms/**/*.test.ts', './src/hms/**/*.test.tsx'],
  },
  server: {
    port: 3001
  }
});
