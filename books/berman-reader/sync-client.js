(function (root) {
  "use strict";

  function cleanBase(value) {
    var base = String(value || "").replace(/\/+$/, "");
    if (!/^https:\/\/[A-Za-z0-9.-]+(?::\d+)?$/.test(base) &&
        !/^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(base)) {
      throw new Error("Private sync requires HTTPS");
    }
    return base;
  }

  function create(options) {
    options = options || {};
    var cryptoLayer = options.cryptoLayer;
    var fetchImpl = options.fetchImpl;
    var baseUrl = cleanBase(options.baseUrl);
    if (!cryptoLayer || typeof cryptoLayer.deriveKeys !== "function") throw new Error("Missing sync cryptography");
    if (typeof fetchImpl !== "function") throw new Error("Missing sync transport");

    async function context(identity) {
      var keys = await cryptoLayer.deriveKeys(identity);
      return {
        identity: identity,
        keys: keys,
        url: baseUrl + "/wisdom/api/wisdom-vaults/" + identity.vaultId
      };
    }

    function headers(authKey) {
      var value = {
        "Content-Type": "application/json",
        "X-Wisdom-Vault-Key": authKey
      };
      return value;
    }

    async function request(url, init, accepted) {
      var response = await fetchImpl(url, init);
      if (!accepted.includes(response.status)) {
        var error = new Error("Private sync returned " + response.status);
        error.status = response.status;
        throw error;
      }
      return response;
    }

    async function uploadBookOnce(identity, book) {
      var current = await context(identity);
      var payload = await cryptoLayer.seal("book", book, current.keys.encryptionKey);
      var response = await request(current.url + "/wisdom/book", {
        method: "POST",
        headers: headers(current.keys.authKey),
        body: JSON.stringify({
          authHash: await cryptoLayer.hashAuthKey(current.keys.authKey),
          payload: payload
        })
      }, [201, 409]);
      return { created: response.status === 201 };
    }

    async function download(identity) {
      var current = await context(identity);
      var response = await request(current.url, {
        method: "GET",
        headers: headers(current.keys.authKey),
        cache: "no-store"
      }, [200]);
      var value = await response.json();
      return {
        book: await cryptoLayer.open("book", value.book, current.keys.encryptionKey),
        marker: value.marker ?
          await cryptoLayer.open("marker", value.marker, current.keys.encryptionKey) :
          null
      };
    }

    async function pushMarker(identity, marker) {
      var current = await context(identity);
      var payload = await cryptoLayer.seal("marker", marker, current.keys.encryptionKey);
      await request(current.url + "/wisdom/marker", {
        method: "PUT",
        headers: headers(current.keys.authKey),
        body: JSON.stringify({ payload: payload })
      }, [200]);
      return { saved: true };
    }

    async function downloadMarker(identity) {
      var current = await context(identity);
      var response = await request(current.url + "/wisdom/marker", {
        method: "GET",
        headers: headers(current.keys.authKey),
        cache: "no-store"
      }, [200]);
      var value = await response.json();
      return value.marker ?
        await cryptoLayer.open("marker", value.marker, current.keys.encryptionKey) :
        null;
    }

    return {
      uploadBookOnce: uploadBookOnce,
      download: download,
      pushMarker: pushMarker,
      downloadMarker: downloadMarker
    };
  }

  root.WisdomPrivateSyncClient = { create: create };
})(globalThis);
