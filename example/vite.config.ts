import { defineConfig } from 'vite-plus';

export default defineConfig({
  base: '/maplibre-gl-compare/',
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
