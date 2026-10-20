// ═══════════════════════════════════════════════════════════════════
// REMAL GUEST APP — SERVICE WORKER (PWA)
// ═══════════════════════════════════════════════════════════════════

const CACHE_NAME = 'remal-guest-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './logo.png',
    './manifest.json'
];

// Installation : on met en cache les éléments essentiels
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activation : on nettoie les anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Interception des requêtes : Network First (on va sur internet, sinon on prend le cache)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
