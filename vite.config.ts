
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

// Suporte a ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['react/jsx-dev-runtime', 'react', 'react-dom/client'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    cssTarget: 'chrome61'
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('2.0.0-migration'),
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(Date.now().toString()),
  }
})
