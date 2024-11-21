import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import jsx from '@vitejs/plugin-vue-jsx';
import dotenv from 'dotenv';

// Carga las variables de entorno
dotenv.config();

export default defineConfig({
  plugins: [preact(), jsx()],
  server: {
    proxy: {
      '/socket.io': {
        target: process.env.VITE_API_URL, 
        ws: true,
      },
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
  },
});
