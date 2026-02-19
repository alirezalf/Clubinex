import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { route as routeFn } from 'ziggy-js';

const appName = (import.meta as any).env.VITE_APP_NAME || 'Clubinex';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // دریافت تمام صفحات موجود
        const pages = (import.meta as any).glob('./Pages/**/*.tsx');
        const path = `./Pages/${name}.tsx`;

        // 1. تلاش برای پیدا کردن تطابق دقیق (استاندارد)
        if (pages[path]) {
            return resolvePageComponent(path, pages);
        }

        // 2. تلاش برای پیدا کردن تطابق بدون حساسیت به حروف بزرگ/کوچک
        // این بخش مشکل "Index.tsx" vs "index.tsx" را حل می‌کند
        const lowerPath = path.toLowerCase();
        const matchingKey = Object.keys(pages).find(key => key.toLowerCase() === lowerPath);

        if (matchingKey) {
            // تغییر به debug برای جلوگیری از نمایش هشدار زرد رنگ در کنسول
            console.debug(`Inertia Page Resolved (Case-Insensitive): "${path}" -> "${matchingKey}"`);
            return resolvePageComponent(matchingKey, pages);
        }

        throw new Error(`Page not found: ${path}`);
    },
    setup({ el, App, props }) {
        // راه‌اندازی تابع route سراسری با استفاده از کانفیگ دریافتی از بک‌اند
        // @ts-ignore
        window.route = (name, params, absolute, config = props.initialPage.props.ziggy) => {
            return routeFn(name, params, absolute, config);
        };

        const root = createRoot(el);
        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>
        );
    },
    progress: {
        color: '#4B5563',
    },
});