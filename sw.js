const CACHE_NAME = 'kandang-bumkal-v2.7.6';
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/custom.css',
    './js/store.js',
    './js/app.js',
    './js/utils/qrcode.min.js',
    './js/utils/barcode.js',
    './js/utils/export_import.js',
    './js/modules/portal_publik.js',
    './js/modules/laporan.js',
    './js/modules/dashboard.js',
    './js/modules/domba.js',
    './js/modules/penimbang_cepat.js',
    './js/modules/penggemukan.js',
    './js/modules/pakan_kesehatan.js',
    './js/modules/keuangan_bumdes.js',
    './js/modules/pengaturan.js',
    './js/modules/pertanian.js',
    './js/modules/limbah.js',
    './js/modules/kanban.js',
    './js/modules/breeding.js',
    './js/modules/sdm_agenda.js',
    './js/modules/keuangan.js',
    './manifest.json',
    './assets/icon-192.svg',
    './assets/icon-512.svg'
];

// Install: Cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: Network-first for core app code, cache-first for static assets
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    // Jangan intercept request ke Firebase Cloud
    if (event.request.url.includes('firebase') || event.request.url.includes('googleapis.com') || event.request.url.includes('gstatic.com')) {
        return;
    }

    const url = new URL(event.request.url);
    const isCoreApp = url.pathname.endsWith('.html') || 
                      url.pathname.endsWith('.js') || 
                      url.pathname === '/' || 
                      url.pathname.endsWith('manifest.json');

    if (isCoreApp) {
        // Network-First untuk kode aplikasi agar update di Netlify langsung terpakai di HP
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // Cache-First untuk aset statis (gambar, font, css)
        event.respondWith(
            caches.match(event.request)
                .then(cached => {
                    if (cached) return cached;
                    return fetch(event.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                        }
                        return networkResponse;
                    });
                })
        );
    }
});

