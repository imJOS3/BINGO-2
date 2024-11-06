// vite.config.js
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/, // Aplicar loader jsx a todos los archivos .js en src
  },
});
