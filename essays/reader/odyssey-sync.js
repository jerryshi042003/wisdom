(function (root) {
  "use strict";

  var WORK_ID = "homer-odyssey";
  var PROGRESS_KEY = "wisdom-private-progress:v1:homer-odyssey";
  var SYNC_KEY = "wisdom-private-sync:v1:homer-odyssey";
  var MARKER_SYNC_DELAY = 8000;

  function loadJson(key) {
    try { return JSON.parse(root.localStorage.getItem(key) || "null"); }
    catch (error) { return null; }
  }

  function saveJson(key, value) {
    root.localStorage.setItem(key, JSON.stringify(value));
  }

  function validMarker(value) {
    return !!value && value.schemaVersion === 1 && value.workId === WORK_ID &&
      /^book-(?:[1-9]|1[0-9]|2[0-4])$/.test(value.activeUnitId || "") &&
      value.state && typeof value.state === "object" && !Array.isArray(value.state) &&
      typeof value.updatedAt === "string";
  }

  function normalizeMarker(value) {
    if (!validMarker(value)) return null;
    return {
      schemaVersion: 1,
      workId: WORK_ID,
      activeUnitId: value.activeUnitId,
      state: value.state,
      updatedAt: value.updatedAt
    };
  }

  function create(options) {
    options = options || {};
    var sourceApi = options.sourceApi;
    var syncLayer = root.WisdomPrivateSync;
    var libraryLayer = root.WisdomPrivateLibrary;
    var syncConfig = root.document && root.document.querySelector('meta[name="wisdom-sync-base"]');
    var syncClient = syncConfig && root.WisdomPrivateSyncClient && syncLayer ?
      root.WisdomPrivateSyncClient.create({
        cryptoLayer: syncLayer,
        fetchImpl: root.fetch.bind(root),
        baseUrl: syncConfig.content
      }) : null;
    var libraryRoot = libraryLayer ? libraryLayer.load() : null;
    var syncIdentity = loadJson(SYNC_KEY);
    var marker = normalizeMarker(loadJson(PROGRESS_KEY));
    var source = sourceApi ? sourceApi.loadOdysseyBooks() : null;
    var markerTimer = null;
    var busy = false;
    var queued = false;

    function notify(message, state) {
      if (typeof options.onStatus === "function") {
        options.onStatus({
          message: message || "",
          state: state || "",
          canShare: Boolean(syncIdentity && syncIdentity.uploaded && libraryLayer &&
            libraryLayer.validRoot(libraryRoot))
        });
      }
    }

    function validIdentity(value) {
      return !!syncLayer && syncLayer.validIdentity(value);
    }

    function saveIdentity() {
      saveJson(SYNC_KEY, syncIdentity);
    }

    function sameIdentity(left, right) {
      return validIdentity(left) && validIdentity(right) &&
        left.vaultId === right.vaultId && left.masterKey === right.masterKey;
    }

    async function ensureIdentity() {
      if (!syncClient || !libraryLayer) return false;
      if (!libraryLayer.validRoot(libraryRoot)) {
        libraryRoot = libraryLayer.save(libraryLayer.createRoot(syncLayer));
      }
      var derived = await libraryLayer.deriveWorkIdentity(libraryRoot, WORK_ID);
      if (!sameIdentity(syncIdentity, derived)) {
        syncIdentity = derived;
        syncIdentity.uploaded = false;
        saveIdentity();
      }
      return true;
    }

    function pairingUrl() {
      if (!libraryLayer || !libraryLayer.validRoot(libraryRoot)) return "";
      return root.location.origin + root.location.pathname + root.location.search +
        libraryLayer.pairingFragment(libraryRoot);
    }

    function saveMarker(value, touch) {
      var next = normalizeMarker(Object.assign({}, value, {
        schemaVersion: 1,
        workId: WORK_ID,
        updatedAt: touch === false && value.updatedAt ? value.updatedAt : new Date().toISOString()
      }));
      if (!next) return false;
      marker = next;
      saveJson(PROGRESS_KEY, marker);
      if (touch !== false) scheduleMarker();
      return true;
    }

    function scheduleMarker() {
      if (!marker || !syncIdentity || !syncIdentity.uploaded || !syncClient) return;
      root.clearTimeout(markerTimer);
      markerTimer = root.setTimeout(pushMarker, MARKER_SYNC_DELAY);
    }

    async function pushMarker() {
      if (!marker || !syncIdentity || !syncIdentity.uploaded || !syncClient) return;
      if (busy) {
        queued = true;
        return;
      }
      busy = true;
      try {
        await syncClient.pushMarker(syncIdentity, marker);
        notify("24 books and reading marker synced", "synced");
      } catch (error) {
        queued = true;
        notify("Saved here · encrypted sync will retry", "retry");
      } finally {
        busy = false;
        if (queued && root.navigator.onLine) {
          queued = false;
          scheduleMarker();
        }
      }
    }

    async function pullMarker() {
      if (!syncClient || !syncIdentity || !syncIdentity.uploaded || busy) return;
      busy = true;
      var missingVault = false;
      try {
        var remote = normalizeMarker(await syncClient.downloadMarker(syncIdentity));
        var selected = syncLayer.newerMarker(marker, remote);
        if (selected === remote && remote) {
          marker = remote;
          saveJson(PROGRESS_KEY, marker);
          if (typeof options.onMarker === "function") options.onMarker(marker);
        } else if (marker && (!remote || marker.updatedAt > remote.updatedAt)) {
          queued = true;
        }
        notify("24 books and reading marker synced", "synced");
      } catch (error) {
        missingVault = error && error.status === 404;
        notify("Saved here · encrypted sync resumes online", "retry");
      } finally {
        busy = false;
        if (missingVault && source) {
          syncIdentity.uploaded = false;
          saveIdentity();
          hostSource(source);
          return;
        }
        if (queued && root.navigator.onLine) {
          queued = false;
          scheduleMarker();
        }
      }
    }

    async function hostSource(nextSource) {
      source = nextSource || source;
      if (!source || !syncClient || !await ensureIdentity()) return false;
      if (syncIdentity.uploaded) {
        await pullMarker();
        return true;
      }
      busy = true;
      notify("Encrypting one private hosted copy…", "working");
      try {
        await syncClient.uploadBookOnce(syncIdentity, source);
        syncIdentity.uploaded = true;
        saveIdentity();
        if (marker) await syncClient.pushMarker(syncIdentity, marker);
        if (libraryLayer && libraryLayer.validRoot(libraryRoot)) {
          await libraryLayer.syncKnownBooks({
            libraryRoot: libraryRoot,
            syncClient: syncClient,
            excludeWorkId: WORK_ID
          });
        }
        notify("24 books and reading marker synced", "synced");
        return true;
      } catch (error) {
        notify("Saved here · encrypted upload will retry", "retry");
        return false;
      } finally {
        busy = false;
      }
    }

    async function restoreHostedSource() {
      if (!syncClient || !validIdentity(syncIdentity)) return false;
      busy = true;
      notify("Opening your encrypted Odyssey copy…", "working");
      try {
        var remote = await syncClient.download(syncIdentity);
        source = sourceApi.saveOdysseyBooks(remote.book);
        syncIdentity.uploaded = true;
        saveIdentity();
        var remoteMarker = normalizeMarker(remote.marker);
        if (remoteMarker) {
          marker = remoteMarker;
          saveJson(PROGRESS_KEY, marker);
        }
        if (typeof options.onSource === "function") options.onSource(source);
        if (marker && typeof options.onMarker === "function") options.onMarker(marker);
        notify("24 books and reading marker synced", "synced");
        return true;
      } catch (error) {
        root.localStorage.removeItem(SYNC_KEY);
        syncIdentity = null;
        notify(error && error.status === 404 ?
          "This copy has not finished uploading from your computer yet." :
          "Could not open the encrypted Odyssey copy.", "missing");
        return false;
      } finally {
        busy = false;
      }
    }

    async function start() {
      if (!syncClient || !libraryLayer || !sourceApi) {
        notify(source ? "Saved on this device" : "", "local");
        return;
      }
      var pairedLibrary = libraryLayer.parsePairingFragment(root.location.hash);
      if (pairedLibrary) {
        libraryRoot = libraryLayer.save(pairedLibrary);
        root.history.replaceState(null, "", root.location.pathname + root.location.search);
      }
      if (libraryLayer.validRoot(libraryRoot)) {
        await ensureIdentity();
        if (source) await hostSource(source);
        else await restoreHostedSource();
        return;
      }
      if (source) await hostSource(source);
    }

    async function copyDeviceLink() {
      var url = pairingUrl();
      if (!url) throw new Error("Private library is not ready yet");
      if (root.navigator.clipboard) {
        await root.navigator.clipboard.writeText(url);
        return true;
      }
      root.prompt("Copy this private device link:", url);
      return true;
    }

    function removeLocal() {
      root.localStorage.removeItem(PROGRESS_KEY);
      root.localStorage.removeItem(SYNC_KEY);
      source = null;
      marker = null;
      syncIdentity = null;
    }

    root.addEventListener("online", function () {
      if (source) hostSource(source);
      else start();
    });
    root.document.addEventListener("visibilitychange", function () {
      if (root.document.visibilityState === "visible" && syncIdentity && syncIdentity.uploaded) pullMarker();
    });

    return {
      PROGRESS_KEY: PROGRESS_KEY,
      SYNC_KEY: SYNC_KEY,
      enabled: Boolean(syncClient && libraryLayer),
      start: start,
      sourceChanged: hostSource,
      saveMarker: saveMarker,
      copyDeviceLink: copyDeviceLink,
      removeLocal: removeLocal,
      pairingUrl: pairingUrl
    };
  }

  root.WisdomOdysseySync = {
    WORK_ID: WORK_ID,
    PROGRESS_KEY: PROGRESS_KEY,
    SYNC_KEY: SYNC_KEY,
    validMarker: validMarker,
    create: create
  };
})(globalThis);
