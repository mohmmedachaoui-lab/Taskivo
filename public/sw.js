const CACHE_NAME = "taskivo-shell-v1";
const STATIC_ASSETS = [
  "/dashboard",
  "/tasks",
  "/friends",
  "/duels",
  "/guilds",
  "/achievements",
  "/stats",
  "/focus",
  "/alarm",
  "/settings",
  "/ai-agent",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { url } = event.request;

  // Never cache Firestore, Firebase Auth, or API calls
  if (
    url.includes("firestore.googleapis.com") ||
    url.includes("firebaseio.com") ||
    url.includes("identitytoolkit.googleapis.com") ||
    url.includes("securetoken.googleapis.com") ||
    url.startsWith(self.location.origin + "/api/")
  ) {
    return;
  }

  // Network-first for same-origin navigation
  if (
    event.request.mode === "navigate" &&
    url.startsWith(self.location.origin)
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets (JS/CSS/fonts/images from _next)
  if (url.includes("/_next/") || url.match(/\.(css|js|woff2?|png|jpg|svg|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
