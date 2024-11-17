import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import jsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [preact(), jsx()],
});
