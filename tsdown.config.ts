import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node24',
  dts: true,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  external: ['maplibre-gl'],
  onSuccess: async () => {
    const { copyFile } = await import('node:fs/promises');
    await copyFile('src/style.css', 'dist/style.css');
  },
});
