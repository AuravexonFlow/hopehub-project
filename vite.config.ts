import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@vortex': resolve(__dirname, 'src/vortex'),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vortex: ['./src/vortex/index.ts'],
          supabase: ['./src/lib/supabase.ts'],
        },
      },
    },
  },
  define: {
    __VORTEX_VERSION__: JSON.stringify('1.0.0'),
  },
});
