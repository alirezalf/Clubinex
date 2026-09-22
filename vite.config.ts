import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

// شبیه‌سازی __dirname برای محیط ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // همه متغیرهای .env را لود می‌کنیم (نه فقط VITE_)
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
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
            // در دسترس قرار دادن APP_NAME در فرانت‌اند
            __APP_NAME__: JSON.stringify(env.APP_NAME || 'Clubinex'),
            __APP_ENV__: JSON.stringify(env.APP_ENV || 'production'),
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
                    // فرم تابعی جایگزین فرم object
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('@inertiajs')) return 'inertia';
                            if (id.includes('react-dom') || id.includes('react/')) return 'vendor';
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