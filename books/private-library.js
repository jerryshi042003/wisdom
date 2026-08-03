(function (root) {
  "use strict";

  var VERSION = 1;
  var STORAGE_KEY = "wisdom-private-library:v1";
  var ROOT_ID_RE = /^[a-f0-9]{32}$/;
  var MASTER_KEY_RE = /^[A-Za-z0-9_-]{43}$/;
  var WORK_ID_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;
  var encoder = new TextEncoder();
  var KNOWN_WORKS = [
    {
      workId: "kafka-on-the-shore",
      sourceKey: "wisdom-private-source:v1:kafka-on-the-shore",
      progressKey: "wisdom-private-progress:v1:kafka-on-the-shore",
      syncKey: "wisdom-private-sync:v1:kafka-on-the-shore"
    },
    {
      workId: "all-that-is-solid",
      sourceKey: "wisdom-private-source:v1:all-that-is-solid",
      progressKey: "wisdom-private-progress:v1:all-that-is-solid",
      syncKey: "wisdom-private-sync:v1:all-that-is-solid"
    },
    {
      workId: "homer-odyssey",
      sourceKey: "wisdom-private-source:v3:homer-odyssey:books",
      progressKey: "wisdom-private-progress:v1:homer-odyssey",
      syncKey: "wisdom-private-sync:v1:homer-odyssey",
      schemaVersion: 3,
      collectionKey: "books",
      expectedCount: 24
    }
  ];

  function bytesToHex(bytes) {
    return Array.from(bytes).map(function (value) {
      return value.toString(16).padStart(2, "0");
    }).join("");
  }

  function bytesToBase64url(bytes) {
    var binary = "";
    bytes.forEach(function (value) { binary += String.fromCharCode(value); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function base64urlToBytes(value) {
    var padded = String(value).replace(/-/g, "+").replace(/_/g, "/wisdom/");
    while (padded.length % 4) padded += "=";
    var binary = atob(padded);
    return Uint8Array.from(binary, function (character) { return character.charCodeAt(0); });
  }

  function hexToBytes(value) {
    return Uint8Array.from(value.match(/.{2}/g), function (pair) {
      return parseInt(pair, 16);
    });
  }

  function validRoot(value) {
    return !!value && value.schemaVersion === VERSION &&
      ROOT_ID_RE.test(value.rootId || "") &&
      MASTER_KEY_RE.test(value.masterKey || "");
  }

  function createRoot(syncLayer) {
    if (!syncLayer || typeof syncLayer.createIdentity !== "function") {
      throw new Error("Private library cryptography did not load");
    }
    var identity = syncLayer.createIdentity();
    return {
      schemaVersion: VERSION,
      rootId: identity.vaultId,
      masterKey: identity.masterKey
    };
  }

  function load() {
    try {
      var value = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "null");
      return validRoot(value) ? value : null;
    } catch (error) {
      return null;
    }
  }

  function save(value) {
    if (!validRoot(value)) throw new Error("Invalid private library identity");
    root.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return value;
  }

  function loadJson(key) {
    try { return JSON.parse(root.localStorage.getItem(key) || "null"); }
    catch (error) { return null; }
  }

  async function deriveWorkIdentity(libraryRoot, workId) {
    if (!validRoot(libraryRoot) || !WORK_ID_RE.test(String(workId || ""))) {
      throw new Error("Invalid private library derivation");
    }
    var material = await root.crypto.subtle.importKey(
      "raw",
      base64urlToBytes(libraryRoot.masterKey),
      "HKDF",
      false,
      ["deriveBits"]
    );
    var bits = await root.crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: hexToBytes(libraryRoot.rootId),
        info: encoder.encode("wisdom-private-library:" + workId + ":v1")
      },
      material,
      384
    );
    var bytes = new Uint8Array(bits);
    return {
      schemaVersion: VERSION,
      vaultId: bytesToHex(bytes.slice(0, 16)),
      masterKey: bytesToBase64url(bytes.slice(16))
    };
  }

  function pairingFragment(value) {
    if (!validRoot(value)) throw new Error("Invalid private library identity");
    return "#library=" + value.rootId + "." + value.masterKey;
  }

  function parsePairingFragment(fragment) {
    var match = /^#library=([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/.exec(String(fragment || ""));
    if (!match) return null;
    return { schemaVersion: VERSION, rootId: match[1], masterKey: match[2] };
  }

  async function syncKnownBooks(options) {
    options = options || {};
    var libraryRoot = options.libraryRoot;
    var syncClient = options.syncClient;
    var excludeWorkId = options.excludeWorkId || "";
    if (!validRoot(libraryRoot) || !syncClient ||
        typeof syncClient.uploadBookOnce !== "function" ||
        typeof syncClient.pushMarker !== "function") {
      throw new Error("Private library sync is unavailable");
    }
    var result = { uploaded: [], failed: [] };
    for (var index = 0; index < KNOWN_WORKS.length; index += 1) {
      var item = KNOWN_WORKS[index];
      if (item.workId === excludeWorkId) continue;
      var book = loadJson(item.sourceKey);
      var schemaVersion = item.schemaVersion || 1;
      var collectionKey = item.collectionKey || "units";
      if (!book || book.schemaVersion !== schemaVersion || book.workId !== item.workId ||
          !Array.isArray(book[collectionKey]) ||
          (item.expectedCount && book[collectionKey].length !== item.expectedCount)) continue;
      try {
        var identity = await deriveWorkIdentity(libraryRoot, item.workId);
        await syncClient.uploadBookOnce(identity, book);
        var marker = loadJson(item.progressKey);
        if (marker && typeof marker === "object") await syncClient.pushMarker(identity, marker);
        root.localStorage.setItem(item.syncKey, JSON.stringify({
          schemaVersion: identity.schemaVersion,
          vaultId: identity.vaultId,
          masterKey: identity.masterKey,
          uploaded: true
        }));
        result.uploaded.push(item.workId);
      } catch (error) {
        result.failed.push(item.workId);
      }
    }
    return result;
  }

  root.WisdomPrivateLibrary = {
    VERSION: VERSION,
    STORAGE_KEY: STORAGE_KEY,
    validRoot: validRoot,
    createRoot: createRoot,
    load: load,
    save: save,
    deriveWorkIdentity: deriveWorkIdentity,
    pairingFragment: pairingFragment,
    parsePairingFragment: parsePairingFragment,
    syncKnownBooks: syncKnownBooks
  };
})(globalThis);
