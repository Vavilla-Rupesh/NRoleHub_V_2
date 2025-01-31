import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {

    port: 80,
    
    host: true,
    
    proxy: {
    
    '/api': {
    
    target: 'http://localhost:8080',
    
    changeOrigin: true,
    
    }, '/uploads': {
    
    target: 'http://localhost:8080',
    
    changeOrigin: true,
    
    rewrite: (path) => path
    
    }
    
    }, hmr: {
    
    overlay: false
    
    }
    
    }
});