import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    historyApiFallback: true, // Asegura el fallback de rutas en modo desarrollo
  },
  build: {
    outDir: 'dist', // Directorio de salida para la build de producción
  },
  base: '/', // Cambia este valor si sirves la app desde un subdirectorio, ejemplo: '/mi-app/'
  optimizeDeps: {
    include: ['@fortawesome/fontawesome-free'], // Asegura que fontawesome se incluya correctamente
  },
});
