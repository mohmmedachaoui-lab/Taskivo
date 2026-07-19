const CACHE_NAME = "taskivo-shell-v2";

// Only actual static files to pre-cache — NEVER HTML routes
const PRECACHE_ASSETS = [
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/manifest.json",
  "/offline.html",
];

// Domains that must ALWAYS go to network — never cached, never delayed
const BYPASS_DOMAINS = [
  "firestore.googleapis.com",
  "firebaseio.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "firebaseauth.googleapis.com",
  "www.googleapis.com",
  "accounts.google.com",
  "www.gstatic.com",
  "firebaseapp.com",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => {})
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

  // 1. Bypass ALL cross-origin Firebase/Google requests
  try {
    const reqUrl = new URL(url);
    if (BYPASS_DOMAINS.some((d) => reqUrl.hostname === d || reqUrl.hostname.endsWith("." + d))) {
      return;
    }
  } catch {
    return;
  }

  // 2. Bypass API routes
  if (url.startsWith(self.location.origin + "/api/")) {
    return;
  }

  // 3. Same-origin navigation: network-first with offline fallback
  if (
    event.request.mode === "navigate" &&
    url.startsWith(self.location.origin)
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the page shell for offline fallback
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(
            (cached) => cached || caches.match("/offline.html")
          )
        )
    );
    return;
  }

  // 4. _next/ static assets: network-first, cache in background for offline
  //    This ensures first load has ZERO SW overhead — identical to no-SW performance.
  //    On subsequent loads, the browser gets fresh content AND updates the cache.
  //    Offline: falls back to cached version.
  if (url.includes("/_next/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 5. Everything else: no SW interception — browser handles directly
});
