import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/getdata': {
        target: 'https://5000-01k2wc4qdjsxmy0567fc8s9c2k.cloudspaces.litng.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/getdata/, '/getdata')
      }
    }
  }
});
