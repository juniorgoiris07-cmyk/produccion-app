// Service Worker de "Informes de Producción"
// Objetivo: que la app ABRA instantáneamente aunque no haya señal.
// Importante: las llamadas a la app web de Google Apps Script NUNCA se
// interceptan acá (deben ir siempre a la red real) — la lógica de caché de
// datos y cola de ediciones sin conexión vive en index.html, no en el
// service worker.

const CACHE_NAME = 'informes-produccion-v19';
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

  // Nunca tocar la app web de Apps Script: siempre a la red, sin caché.
  if (url.hostname.includes('script.google.com')) return;
  if (url.hostname.includes('script.googleusercontent.com')) return;
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
