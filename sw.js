const CACHE_NAME = "wisdom-reader-v2026-08-02-knows1-core-atomic";
const LEGACY_AUTO_ACTIVATE_CACHE = "wisdom-reader-v2026-07-15-people-3-atomic";

// These applications install narrower workers. The root Wisdom worker must
// reject their routes before considering any of its own broader shelves.
const EXCLUDED_PREFIXES = ["/wisdom/health/", "/wisdom/chess-openings/", "/wisdom/londonsacrifice/", "/wisdom/source-bias-graph/"];

const READER_PREFIXES = [
  "/wisdom/seneca-shortness-of-life/",
  "/wisdom/don-quixote/",
  "/wisdom/the-death-of-ivan-ilyich/",
  "/wisdom/nietzsche-schopenhauer-educator/",
  "/wisdom/arabian-nights/"
];

const READER_FALLBACKS = {
  "/wisdom/seneca-shortness-of-life/": "/wisdom/seneca-shortness-of-life/reader/index.html",
  "/wisdom/don-quixote/": "/wisdom/don-quixote/reader/index.html",
  "/wisdom/the-death-of-ivan-ilyich/": "/wisdom/the-death-of-ivan-ilyich/reader/index.html",
  "/wisdom/nietzsche-schopenhauer-educator/": "/wisdom/nietzsche-schopenhauer-educator/reader/index.html",
  "/wisdom/arabian-nights/": "/wisdom/arabian-nights/reader/index.html"
};

// This former standalone reader is now one section of the complete book.
// Keep every old navigation URL usable—even offline under an active worker—
// without maintaining or caching a second reader application and text payload.
const READER_ALIASES = {
  "/wisdom/arabian-nights-fisherman-genie/": "/wisdom/arabian-nights/reader/#chapter-iii"
};

const SHELF_FALLBACKS = {
  "/wisdom/essays/": "/wisdom/essays/index.html",
  "/wisdom/knows/": "/wisdom/knows/index.html",
  "/wisdom/books/berman-reader/": "/wisdom/books/berman-reader/index.html",
  "/wisdom/books/kafka-reader/": "/wisdom/books/kafka-reader/index.html",
  "/wisdom/books/kafka-audio/": "/wisdom/books/kafka-audio/index.html",
  "/wisdom/books/kafka/": "/wisdom/books/kafka/index.html",
  "/wisdom/books/": "/wisdom/books/index.html",
  "/wisdom/homer/": "/wisdom/homer/index.html",
  "/wisdom/short-stories/": "/wisdom/short-stories/index.html"
};

// The continuity home and its one current Tao encounter are the cold-offline
// install requirement. Other shelves and long readers cache after a real visit
// so inactive books cannot make a new release fail atomically.
const CORE_ASSETS = [
  "/wisdom/",
  "/wisdom/index.html",
  "/wisdom/app-shell.css",
  "/wisdom/site.css",
  "/wisdom/v1-data.js",
  "/wisdom/v1-model.js",
  "/wisdom/essays/state.js",
  "/wisdom/continuity-data.js",
  "/wisdom/continuity-model.js",
  "/wisdom/continuity.js",
  "/wisdom/manifest.webmanifest",
  "/wisdom/pwa.js",
  "/wisdom/icons/wisdom-icon.svg",
  "/wisdom/icons/wisdom-icon-180.png",
  "/wisdom/icons/wisdom-icon-192.png",
  "/wisdom/icons/wisdom-icon-512.png",
  "/wisdom/books/index.html",
  "/wisdom/books/books.css",
  "/wisdom/books/books.js",
  "/wisdom/essays/index.html",
  "/wisdom/essays/library.css",
  "/wisdom/essays/library.js",
  "/wisdom/essays/reader/index.html",
  "/wisdom/essays/essays-source-v3.css",
  "/wisdom/essays/catalog-source-v3.js",
  "/wisdom/essays/reader/app-source-v3.js",
  "/wisdom/essays/texts/tao-genius/data-source-v2.js"
];

// Exact root-level dependencies used only by the collapsed legacy shelf.
// They remain Wisdom-owned, but are runtime cached rather than install gates.
const RUNTIME_ROOT_ASSETS = new Set([
  "/wisdom/v1-data.json",
  "/wisdom/v1.js",
  "/wisdom/reader-resume.js",
  "/wisdom/reader-shell.css"
]);

// Optional shelf helpers are cached after their first real visit, like the
// long readers, so the root install stays atomic and bounded. The Odyssey
// helpers contain parser/encryption/storage code only; private text is never
// part of the public cache.
const RUNTIME_SHELF_ASSETS = new Set([
  "/wisdom/essays/reader/private-source.js",
  "/wisdom/essays/reader/odyssey-sync.js",
  "/wisdom/essays/reader/v5-reader.css",
  "/wisdom/books/private-library.js",
  "/wisdom/books/kafka/index.html",
  "/wisdom/books/kafka/kafka.css",
  "/wisdom/books/kafka/app.js",
  "/wisdom/books/kafka/references.js",
  "/wisdom/books/kafka-audio/index.html",
  "/wisdom/books/kafka-audio/styles.css",
  "/wisdom/books/kafka-audio/data.js",
  "/wisdom/books/kafka-audio/app.js",
  "/wisdom/books/kafka-reader/index.html",
  "/wisdom/books/kafka-reader/styles.css",
  "/wisdom/books/kafka-reader/sync-crypto.js",
  "/wisdom/books/kafka-reader/sync-client.js",
  "/wisdom/books/kafka-reader/app.js",
  "/wisdom/books/berman-reader/index.html",
  "/wisdom/books/berman-reader/styles.css",
  "/wisdom/books/berman-reader/sync-crypto.js",
  "/wisdom/books/berman-reader/sync-client.js",
  "/wisdom/books/berman-reader/parser.js",
  "/wisdom/books/berman-reader/app.js"
]);

const ROOT_ROUTES = new Set(["/wisdom/", "/wisdom/index.html"]);
const corePaths = new Set(CORE_ASSETS.map(asset => new URL(asset, self.location.origin).pathname));
const readerPrefix = pathname => READER_PREFIXES.find(prefix => pathname.startsWith(prefix));
const readerAlias = pathname => Object.entries(READER_ALIASES).find(([prefix]) => pathname.startsWith(prefix))?.[1];
const shelfPrefix = pathname => Object.keys(SHELF_FALLBACKS)
  .sort((left, right) => right.length - left.length)
  .find(prefix => pathname.startsWith(prefix));
const excludedFromWisdom = pathname => EXCLUDED_PREFIXES.some(prefix =>
  pathname === prefix.slice(0, -1) || pathname.startsWith(prefix)
);
const inWisdom = pathname => {
  if (excludedFromWisdom(pathname)) return false;
  return ROOT_ROUTES.has(pathname) ||
    corePaths.has(pathname) ||
    RUNTIME_ROOT_ASSETS.has(pathname) ||
    RUNTIME_SHELF_ASSETS.has(pathname) ||
    Boolean(readerAlias(pathname)) ||
    Boolean(readerPrefix(pathname)) ||
    Boolean(shelfPrefix(pathname));
};

const openCurrentCache = () => caches.open(CACHE_NAME);
const remember = async (request, response) => {
  if (response.ok) {
    const cache = await openCurrentCache();
    await cache.put(request, response.clone());
  }
  return response;
};

// Fetch each atomic shell asset through a release-unique URL, then store it
// under the clean path. This avoids seeding a new cache from stale HTTP cache.
const fetchReleaseAsset = async asset => {
  const separator = asset.includes("?") ? "&" : "?";
  const versioned = `${asset}${separator}sw=${encodeURIComponent(CACHE_NAME)}`;
  const response = await fetch(new Request(versioned, {cache: "reload"}));
  if (!response.ok) throw new Error(`Release fetch failed (${response.status}): ${asset}`);
  return response;
};
const precache = async () => {
  const cache = await openCurrentCache();
  await Promise.all(CORE_ASSETS.map(async asset => {
    const response = await fetchReleaseAsset(asset);
    await cache.put(asset, response);
  }));
};

// The currently deployed worker auto-activated updates and cannot render the
// new visible update prompt. Detect that exact one-time predecessor so this
// release can take control after its atomic cache succeeds. Once activated,
// cleanup removes the legacy cache; every later release waits for the visible
// APPLY_WISDOM_UPDATE action below.
const needsLegacyHandoff = async () =>
  Boolean(self.registration.active) &&
  (await caches.keys()).includes(LEGACY_AUTO_ACTIVATE_CACHE);

self.addEventListener("install", event => {
  event.waitUntil(precache().then(async () => {
    if (await needsLegacyHandoff()) await self.skipWaiting();
  }));
});

self.addEventListener("message", event => {
  if (event.data?.type === "APPLY_WISDOM_UPDATE") self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys
      .filter(key => key.startsWith("wisdom-reader-") && key !== CACHE_NAME)
      .map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !inWisdom(url.pathname)) return;

  const alias = readerAlias(url.pathname);
  if (request.mode === "navigate" && alias) {
    event.respondWith(Promise.resolve(Response.redirect(new URL(alias, self.location.origin), 302)));
    return;
  }

  // Atomic shell hits never launch an unversioned refresh that could mix
  // releases. A missing core response is refetched with the cache version.
  if (corePaths.has(url.pathname)) {
    event.respondWith(openCurrentCache().then(async cache => {
      const cached = await cache.match(url.pathname, {ignoreSearch: true});
      if (cached) return cached;
      const response = await fetchReleaseAsset(url.pathname);
      await cache.put(url.pathname, response.clone());
      return response;
    }));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => remember(request, response)).catch(async () => {
      const cache = await openCurrentCache();
      const exact = await cache.match(request, {ignoreSearch: true});
      if (exact) return exact;

      const reader = readerPrefix(url.pathname);
      if (reader) {
        const fallback = await cache.match(READER_FALLBACKS[reader]);
        if (fallback) return fallback;
      }

      const shelf = shelfPrefix(url.pathname);
      if (shelf) {
        const fallback = await cache.match(SHELF_FALLBACKS[shelf]);
        if (fallback) return fallback;
      }

      // Never claim an unrelated or unvisited route with the Wisdom root.
      return Response.error();
    }));
    return;
  }

  event.respondWith(openCurrentCache().then(async cache => {
    const cached = await cache.match(request, {ignoreSearch: true});
    if (cached) {
      fetch(request).then(response => remember(request, response)).catch(() => {});
      return cached;
    }
    return fetch(request).then(response => remember(request, response));
  }));
});
