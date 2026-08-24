// Service Worker de "Carga de Producción"
// Objetivo: que la app ABRA instantáneamente aunque no haya señal.
// Importante: las llamadas a la API de Airtable NUNCA se interceptan acá
// (deben ir siempre a la red real) — la lógica de "guardar y reintentar
// sin conexión" vive en index.html, no en el service worker.

const CACHE_NAME = 'carga-produccion-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Nunca tocar la API de Airtable: siempre a la red, sin caché.
  if (url.hostname.includes('airtable.com')) return;
  if (req.method !== 'GET') return;

  // Estrategia "stale-while-revalidate": responde al toque con lo que ya
  // está guardado (si existe) y de paso actualiza el caché en segundo plano.
  event.respondWith(
    caches.match(req).then((cached) => {
      const enRed = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
        }
        return res;
      }).catch(() => cached);
      return cached || enRed;
    })
  );
});
