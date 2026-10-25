import { defineConfig } from 'vite-plus';

export default defineConfig({
  build: {
    // maplibre-gl is one prebuilt ~1 MB module (dist/maplibre-gl.js) that
    // cannot be split further; the demo code itself is a few kB.
    chunkSizeWarningLimit: 1100,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
