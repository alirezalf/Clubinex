import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

// شبیه‌سازی __dirname برای محیط ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
    ],
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
    esbuild: {
        jsx: 'automatic',
    },
});