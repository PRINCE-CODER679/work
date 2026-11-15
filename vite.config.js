import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { preserveSymlinks: true },
  server: { port: 5173, strictPort: false, host: '127.0.0.1' },
  preview: { port: 4173, strictPort: false, host: '127.0.0.1' },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap', 'lenis'],
        },
      },
    },
  },
});

