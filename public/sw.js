// Empty service worker for PWA installability requirements
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // Do nothing, just pass through
});
