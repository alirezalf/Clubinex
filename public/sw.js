const CACHE_NAME = 'clubinex-v2';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/offline.html'
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // فایل‌های استاتیک: ابتدا کش، سپس شبکه
    if (url.pathname.startsWith('/build/') || url.pathname.match(/\.(png|jpg|jpeg|svg|gif|css|js|woff2?|eot|ttf|otf)$/)) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // صفحات داینامیک و درخواست‌های API (مثل Inertia): ابتدا شبکه، سپس کش (یا صفحه آفلاین)
    event.respondWith(
        fetch(event.request).catch((error) => {
            return caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                // اگر کاربر آفلاین بود و درخواست صفحه بود
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
                throw error;
            });
        })
    );
});
