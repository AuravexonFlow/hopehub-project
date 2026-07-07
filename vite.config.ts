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
    port: 5173,
    open: true,
    host: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  preview: {
    port: 4173,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://api.richmondhopehub.lk data: blob:; connect-src 'self' https://ecpyryxierymdqgqsomi.supabase.co wss://ecpyryxierymdqgqsomi.supabase.co; frame-src https://www.youtube.com;",
    },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: false, // No sourcemaps in production for security
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vortex: ['./src/vortex/index.ts'],
          supabase: ['./src/lib/supabase.ts'],
        },
        // Cache-friendly filenames
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Warn on large chunks
    chunkSizeWarningLimit: 500,
  },
  define: {
    __VORTEX_VERSION__: JSON.stringify('1.0.0'),
  },
});
