// PinarConnect — Service Worker
// Versión: incrementa este número cada vez que actualices la app
const CACHE_VERSION = 'pinarconnect-v1';

// Archivos que se guardan en caché para que la app cargue aunque no haya internet
const ARCHIVOS_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './apple-touch-icon.png',
    './favicon.ico'
];

// Instalación: guarda los archivos en caché
self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            return cache.addAll(ARCHIVOS_CACHE);
        })
    );
    self.skipWaiting();
});

// Activación: elimina cachés antiguas
self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys().then((claves) => {
            return Promise.all(
                claves
                    .filter(clave => clave !== CACHE_VERSION)
                    .map(clave => caches.delete(clave))
            );
        })
    );
    self.clients.claim();
});

// Estrategia: Network First para Firebase (datos siempre frescos),
// Cache First para los archivos estáticos de la app
self.addEventListener('fetch', (evento) => {
    const url = new URL(evento.request.url);

    // Firebase y APIs externas: siempre desde la red (datos en tiempo real)
    if (url.hostname.includes('firebase') ||
        url.hostname.includes('googleapis') ||
        url.hostname.includes('unpkg.com')) {
        evento.respondWith(fetch(evento.request));
        return;
    }

    // Archivos propios: primero caché, si falla la red
    evento.respondWith(
        caches.match(evento.request).then((respuestaCache) => {
            return respuestaCache || fetch(evento.request).then((respuestaRed) => {
                return caches.open(CACHE_VERSION).then((cache) => {
                    cache.put(evento.request, respuestaRed.clone());
                    return respuestaRed;
                });
            });
        }).catch(() => {
            // Sin internet y sin caché: devuelve la página principal
            if (evento.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});
