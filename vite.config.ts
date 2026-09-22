import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    // نام برنامه را مستقیماً از APP_NAME می‌گیریم
    const appName = env.APP_NAME || 'Clubinex';
    const appEnv = env.APP_ENV || 'production';

    return {
        plugins: [
            laravel({
                input: [
                    'resources/css/app.css',
                    'resources/js/app.tsx',
                ],
                refresh: true,
            }),

            react({
                babel: {
                    plugins: [],
                },
            }),

            tailwindcss(),
        ],

        define: {
            // متغیر سفارشی
            __APP_NAME__: JSON.stringify(appName),
            __APP_ENV__: JSON.stringify(appEnv),

            // مهم:
            // مقدار import.meta.env.VITE_APP_NAME را مستقیماً از APP_NAME تعیین می‌کنیم
            'import.meta.env.VITE_APP_NAME': JSON.stringify(appName),
        },

        server: {
            host: '127.0.0.1',
            port: 5173,
            cors: true,
        },

        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'resources', 'js'),
            },
        },

        optimizeDeps: {
            include: [],
        },

        build: {
            chunkSizeWarningLimit: 1000,

            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('@inertiajs')) {
                                return 'inertia';
                            }

                            if (
                                id.includes('react-dom') ||
                                id.includes('react/')
                            ) {
                                return 'vendor';
                            }
                        }
                    },
                },
            },
        },

        esbuild: {
            jsx: 'automatic',
        },
    };
});