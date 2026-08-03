"use strict";

// Offline-first for a writing app is not a nice-to-have: the drafts live in
// this browser, so the app must open with no network at all or the writer is
// locked out of their own text.

const RELEASE = "20260729a";
const CACHE_PREFIX = "quiet-writer-";
const CACHE_NAME = `${CACHE_PREFIX}${RELEASE}`;
const APP_PATH = new URL("./", self.location.href).pathname;

// Module imports resolve without the cache-busting query, so both forms are
// precached where a file is both linked from HTML and imported by a module.
const SHELL = [
  "./",
  "./index.html",
  `./styles.css?v=${RELEASE}`,
  `./app.js?v=${RELEASE}`,
  "./app.js",
  "./editor.js",
  "./store.js",
  "./prose.js",
  "./syntax.js",
  "./markdown.js",
  `./pwa.js?v=${RELEASE}`,
  `./manifest.webmanifest?v=${RELEASE}`,
  `./icons/icon.svg?v=${RELEASE}`,
  `./icons/icon-180.png?v=${RELEASE}`,
  `./icons/icon-192.png?v=${RELEASE}`,
  `./icons/icon-512.png?v=${RELEASE}`,
  `./icons/icon-maskable-512.png?v=${RELEASE}`
];

self.addEventListener("install", (event) => {
  const requests = SHELL.map((path) => new Request(new URL(path, self.location.href), { cache: "reload" }));
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(requests)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_PATH)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => cache.match("./index.html").then((response) => response || fetch(request)))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((response) => {
        if (response) return response;
        // Ignore the query when a versioned asset is requested bare, and vice
        // versa, rather than failing offline over a cache-busting string.
        return cache.match(request, { ignoreSearch: true }).then((loose) => loose || fetch(request));
      })
    )
  );
});
