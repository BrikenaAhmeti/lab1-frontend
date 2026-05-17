import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import type { OutputBundle, OutputChunk } from 'rollup';

const shouldAnalyze = process.env.ANALYZE === 'true';

function createChunkReportPlugin() {
  return {
    name: 'chunk-report',
    generateBundle(_: unknown, bundle: OutputBundle) {
      if (!shouldAnalyze) {
        return;
      }

      const chunks = Object.values(bundle)
        .filter((asset): asset is OutputChunk => asset.type === 'chunk')
        .map((chunk) => ({
          fileName: chunk.fileName,
          name: chunk.name,
          isEntry: chunk.isEntry,
          size: Buffer.byteLength(chunk.code, 'utf8'),
          imports: chunk.imports,
          dynamicImports: chunk.dynamicImports,
          routeModules: Object.keys(chunk.modules)
            .filter((moduleId) => moduleId.includes('/src/pages/app/routes/'))
            .map((moduleId) => path.basename(moduleId)),
        }));

      this.emitFile({
        type: 'asset',
        fileName: 'chunk-report.json',
        source: JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            chunks,
          },
          null,
          2
        ),
      });

      const routeChunks = chunks.filter((chunk) => chunk.routeModules.length > 0);

      if (routeChunks.length > 0) {
        console.log('[chunk-report] Route chunks');
        routeChunks.forEach((chunk) => {
          console.log(`[chunk-report] ${chunk.fileName} <- ${chunk.routeModules.join(', ')}`);
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), createChunkReportPlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/app/test/setup.ts'],
    include: [
      './src/app/**/*.test.ts',
      './src/app/**/*.test.tsx',
      './src/libs/app/**/*.test.ts',
      './src/pages/app/**/*.test.tsx',
      './src/ui/**/*.test.tsx',
    ],
  },
  server: {
    port: 3001
  }
});
