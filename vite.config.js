import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
// Suporte a ESM
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'CERRADO INTERBØX 2025',
                short_name: 'INTERBØX',
                description: 'O maior evento de times da América Latina',
                start_url: '/',
                display: 'standalone',
                background_color: '#000000',
                theme_color: '#ec4899',
                orientation: 'portrait',
                scope: '/',
                icons: [
                    {
                        src: '/favicon-16x16.png',
                        sizes: '16x16',
                        type: 'image/png'
                    },
                    {
                        src: '/favicon-32x32.png',
                        sizes: '32x32',
                        type: 'image/png'
                    },
                    {
                        src: '/favicon-96x96.png',
                        sizes: '96x96',
                        type: 'image/png'
                    },
                    {
                        src: '/favicon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/favicon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: '/apple-touch-icon.png',
                        sizes: '180x180',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                shortcuts: [
                    {
                        name: 'Home',
                        url: '/',
                        description: 'Página inicial'
                    },
                    {
                        name: 'Audiovisual',
                        url: '/audiovisual',
                        description: 'Candidatura Audiovisual'
                    },
                    {
                        name: 'Patrocinadores',
                        url: '/patrocinadores',
                        description: 'Seja um Patrocinador'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/api\.supabase\.co\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 // 1 dia
                            }
                        }
                    }
                ]
            },
            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
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
});
