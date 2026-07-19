const CACHE_NAME = "taskivo-shell-v1";

// Only actual static files to pre-cache — NEVER HTML routes
const PRECACHE_ASSETS = [
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/manifest.json",
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

  // 1. Bypass ALL cross-origin Firebase/Google requests — always network, no exceptions
  try {
    const reqUrl = new URL(url);
    if (BYPASS_DOMAINS.some((d) => reqUrl.hostname === d || reqUrl.hostname.endsWith("." + d))) {
      return; // SW does not touch this request at all
    }
  } catch {
    // Malformed URL — skip
    return;
  }

  // 2. Bypass API routes
  if (url.startsWith(self.location.origin + "/api/")) {
    return;
  }

  // 3. Same-origin navigation: network-only, never serve cached HTML
  if (
    event.request.mode === "navigate" &&
    url.startsWith(self.location.origin)
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 4. Cache-first ONLY for _next static assets (immutable hashed files)
  if (url.includes("/_next/")) {
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

  // 5. Everything else: network-only (no cache fallback)
  //    This prevents any auth, font, or image request from being delayed by cache misses
});
