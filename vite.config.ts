import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        // 🔥 Barcha dependencylarni bundle'dan chiqarib tashlash
        external: [
          'react',
          'react-dom',
          'react-router-dom',
          'express',
          'dotenv',
          'canvas-confetti',
          'html2canvas',
          'jspdf',
          'lucide-react',
          'motion',
          '@google/genai',
          '@tailwindcss/vite',
          '@vitejs/plugin-react',
          'tailwindcss',
          'autoprefixer',
          'esbuild',
          'tsx',
          'typescript'
        ],
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('express') || id.includes('dotenv')) {
                return 'vendor-server';
              }
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
