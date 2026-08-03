const CACHE = "wisdom-people-library-demo-v2026-07-19-1";
const SHELL = [
  "/wisdom/demo/people-library/",
  "/wisdom/demo/people-library/index.html",
  "/wisdom/demo/people-library/styles.css?v=20260719-1",
  "/wisdom/demo/people-library/data.js?v=20260719-1",
  "/wisdom/demo/people-library/app.js?v=20260719-1",
  "/wisdom/demo/people-library/pwa.js?v=20260719-1",
  "/wisdom/demo/people-library/manifest.webmanifest",
  "/wisdom/icons/wisdom-icon.svg",
  "/wisdom/icons/wisdom-icon-180.png",
  "/wisdom/icons/wisdom-icon-192.png",
  "/wisdom/icons/wisdom-icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key.startsWith("wisdom-people-library-demo-") && key !== CACHE;
    }).map(function (key) { return caches.delete(key); }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/wisdom/demo/people-library/")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(function () {
      return caches.match("/wisdom/demo/people-library/index.html");
    }));
    return;
  }
  event.respondWith(caches.match(event.request).then(function (cached) {
    return cached || fetch(event.request).then(function (response) {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
      }
      return response;
    });
  }));
});
