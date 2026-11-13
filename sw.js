const CACHE_NAME = 'studyhub-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './src/assets/styles/main.css',
    './src/assets/styles/components.css',
    './src/scripts/app.js',
    './src/components/SubjectCard.js',
    './src/data/subjects.json',
    './src/data/topics/physics-topics.json',
    './src/data/lessons/physics/phys-7-1-1.json'
];

// 1. Quraşdırma (Install Event) - Faylları cache-ə yazır
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching app assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Aktivləşmə (Activate Event) - Köhnə cache-ləri təmizləyir
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// 3. Şəbəkə Sorğuları (Fetch Event) - Şəbəkə yoxdursa Cache-dən verir
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    // Dinamik olaraq yüklənən JSON dərsləri də cache-ə əlavə edirik
                    if (e.request.url.includes('/src/data/')) {
                        cache.put(e.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        }).catch(() => {
            console.log('[Service Worker] Offline and asset not cached');
        })
    );
});