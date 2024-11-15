// vite.config.js

import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/, // Aplicar loader jsx a todos los archivos .js en src
  },
});
