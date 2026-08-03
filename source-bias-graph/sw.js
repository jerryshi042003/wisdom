"use strict";

const RELEASE = "20260717-8570d1f4ec90";
const CACHE_PREFIX = "source-bias-study-";
const CACHE_NAME = `${CACHE_PREFIX}${RELEASE}`;
const APP_PATH = new URL("./", self.location.href).pathname;
const PRECACHE = [
  "./",
  "./index.html",
  `./styles.css?v=${RELEASE}`,
  `./app.js?v=${RELEASE}`,
  `./pwa.js?v=${RELEASE}`,
  `./manifest.json?v=${RELEASE}`,
  `./data/study-guide.json?v=${RELEASE}`,
  `./icons/icon-180.png?v=${RELEASE}`,
  `./icons/icon-192.png?v=${RELEASE}`,
  `./icons/icon-512.png?v=${RELEASE}`,
  `./icons/icon-maskable-512.png?v=${RELEASE}`,
  `./social-card.png?v=${RELEASE}`
];

self.addEventListener("install", event => {
  const requests = PRECACHE.map(path => new Request(new URL(path, self.location.href), { cache: "reload" }));
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(requests)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_PATH)) return;

  if (request.mode === "navigate") {
    event.respondWith(caches.open(CACHE_NAME).then(cache => cache.match("./index.html").then(response => response || fetch(request))));
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => cache.match(request).then(response => response || fetch(request)))
  );
});
