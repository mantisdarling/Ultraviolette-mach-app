/* Service Worker - Offline Caching and PWA Support */

const cacheName = "mach-ev-cache-v21";

const staticAssets = [
  "./",
  "./index.html",
  "./site.webmanifest",
  "./css/critical.css",
  "./css/main.css",
  "./js/main.js",
  "./js/webgl-nebula.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  // Primary webp image variants
  "./assets/images/ss04-desktop.webp",
  "./assets/images/ss04-tablet.webp",
  "./assets/images/ss04-mobile.webp",
  "./assets/images/ss05-desktop.webp",
  "./assets/images/ss05-tablet.webp",
  "./assets/images/ss05-mobile.webp",
  "./assets/images/ss06-desktop.webp",
  "./assets/images/ss06-tablet.webp",
  "./assets/images/ss06-mobile.webp",
  // Color swatch bike webp assets
  "./assets/images/laser-turbo-red.webp",
  "./assets/images/laser-afterburner-yellow.webp",
  "./assets/images/laser-plasma-red.webp",
  "./assets/images/airstrike-stellar-white.webp",
  "./assets/images/airstrike-supersonic-silver.webp",
  "./assets/images/airstrike-lightning-blue.webp",
  "./assets/images/shadow-stealth-grey.webp",
  "./assets/images/shadow-asteroid-grey.webp",
  "./assets/images/shadow-cosmic-black.webp",
  "./assets/images/superstreet-laser-turbo-red.webp"
];

// Cache all static assets during installation
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log("[Service Worker] Pre-caching offline assets");
      return cache.addAll(staticAssets);
    })
  );
  self.skipWaiting();
});

// Clean up old caches during activation
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheKeys => {
      return Promise.all(
        cacheKeys.map(key => {
          if (key !== cacheName) {
            console.log("[Service Worker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept fetch requests and apply caching strategies
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Network-First strategy for HTML and Webmanifest documents to ensure fresh content
  if (event.request.mode === "navigate" || url.pathname.endsWith(".webmanifest") || url.pathname.endsWith("index.html")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Put clone into cache for offline retrieval
          const resClone = response.clone();
          caches.open(cacheName).then(cache => {
            cache.put(event.request, resClone);
          });
          return response;
        })
        .catch(() => {
          // Fall back to cache if network is unavailable
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-First strategy for static assets (images, fonts, stylesheets, scripts)
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== "basic" && !url.href.includes("fonts.gstatic.com") && !url.href.includes("fonts.googleapis.com")) {
            return response;
          }

          // Dynamically cache external fonts and other fetched resources
          const resClone = response.clone();
          caches.open(cacheName).then(cache => {
            cache.put(event.request, resClone);
          });
          return response;
        });
      })
    );
  }
});
