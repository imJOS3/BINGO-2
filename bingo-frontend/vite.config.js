import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    host: true, // Permite acceder desde la red local (0.0.0.0)
    port: 5173, // Puedes cambiar el puerto si es necesario
    strictPort: true, // Asegura que siempre use el puerto definido
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
