// Word Scramble service worker — network-first with cache fallback.
// Gives instant repeat loads and lets the game shell open offline,
// while always preferring fresh files when the network is available.
const CACHE_NAME = 'word-scramble-v2';

const PRECACHE = [
    './',
    'index.html',
    'style.css',
    'script.js',
    'stellar.js',
    'daily-words.js',
    'feedback.js',
    'manifest.json',
    'icons/icon-192.png',
    'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Same-origin GET requests only — RPC calls, wallets, fonts, analytics
    // and the dictionary APIs go straight to the network untouched.
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Keep the cache fresh with whatever the network returned
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return response;
            })
            .catch(() =>
                caches.match(event.request).then(cached =>
                    cached || caches.match('index.html')
                )
            )
    );
});
