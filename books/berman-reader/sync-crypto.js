(function (root) {
  "use strict";

  var VERSION = 1;
  var VAULT_ID_RE = /^[a-f0-9]{32}$/;
  var MASTER_KEY_RE = /^[A-Za-z0-9_-]{43}$/;
  var textEncoder = new TextEncoder();
  var textDecoder = new TextDecoder();

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

  function randomBytes(length) {
    var value = new Uint8Array(length);
    root.crypto.getRandomValues(value);
    return value;
  }

  function createIdentity() {
    return {
      schemaVersion: VERSION,
      vaultId: bytesToHex(randomBytes(16)),
      masterKey: bytesToBase64url(randomBytes(32))
    };
  }

  function validIdentity(identity) {
    return !!identity && identity.schemaVersion === VERSION &&
      VAULT_ID_RE.test(identity.vaultId || "") &&
      MASTER_KEY_RE.test(identity.masterKey || "");
  }

  function vaultSalt(identity) {
    return Uint8Array.from(identity.vaultId.match(/.{2}/g), function (pair) {
      return parseInt(pair, 16);
    });
  }

  async function deriveKeys(identity) {
    if (!validIdentity(identity)) throw new Error("Invalid private sync identity");
    var material = await root.crypto.subtle.importKey(
      "raw",
      base64urlToBytes(identity.masterKey),
      "HKDF",
      false,
      ["deriveKey", "deriveBits"]
    );
    var salt = vaultSalt(identity);
    var encryptionKey = await root.crypto.subtle.deriveKey(
      { name: "HKDF", hash: "SHA-256", salt: salt, info: textEncoder.encode("wisdom-kafka-encryption-v1") },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    var authBits = await root.crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: salt, info: textEncoder.encode("wisdom-kafka-auth-v1") },
      material,
      256
    );
    return {
      encryptionKey: encryptionKey,
      authKey: bytesToBase64url(new Uint8Array(authBits))
    };
  }

  function context(kind) {
    if (kind !== "book" && kind !== "marker") throw new Error("Unknown sync payload kind");
    return textEncoder.encode("wisdom-kafka-" + kind + "-v1");
  }

  async function seal(kind, value, encryptionKey) {
    var iv = randomBytes(12);
    var plaintext = textEncoder.encode(JSON.stringify(value));
    var ciphertext = await root.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv, additionalData: context(kind) },
      encryptionKey,
      plaintext
    );
    return {
      v: VERSION,
      iv: bytesToBase64url(iv),
      ct: bytesToBase64url(new Uint8Array(ciphertext))
    };
  }

  async function open(kind, envelope, encryptionKey) {
    if (!envelope || envelope.v !== VERSION ||
        typeof envelope.iv !== "string" || typeof envelope.ct !== "string") {
      throw new Error("Invalid encrypted sync payload");
    }
    var plaintext = await root.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64urlToBytes(envelope.iv),
        additionalData: context(kind)
      },
      encryptionKey,
      base64urlToBytes(envelope.ct)
    );
    return JSON.parse(textDecoder.decode(plaintext));
  }

  async function hashAuthKey(authKey) {
    var digest = await root.crypto.subtle.digest("SHA-256", textEncoder.encode(authKey));
    return bytesToHex(new Uint8Array(digest));
  }

  function pairingFragment(identity) {
    if (!validIdentity(identity)) throw new Error("Invalid private sync identity");
    return "#sync=" + identity.vaultId + "." + identity.masterKey;
  }

  function parsePairingFragment(fragment) {
    var match = /^#sync=([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/.exec(String(fragment || ""));
    if (!match) return null;
    return { schemaVersion: VERSION, vaultId: match[1], masterKey: match[2] };
  }

  function newerMarker(localValue, remoteValue) {
    var localTime = localValue && typeof localValue.updatedAt === "string" ? localValue.updatedAt : "";
    var remoteTime = remoteValue && typeof remoteValue.updatedAt === "string" ? remoteValue.updatedAt : "";
    if (!remoteValue) return localValue || null;
    if (!localValue) return remoteValue;
    return remoteTime > localTime ? remoteValue : localValue;
  }

  root.WisdomPrivateSync = {
    VERSION: VERSION,
    createIdentity: createIdentity,
    validIdentity: validIdentity,
    deriveKeys: deriveKeys,
    seal: seal,
    open: open,
    hashAuthKey: hashAuthKey,
    pairingFragment: pairingFragment,
    parsePairingFragment: parsePairingFragment,
    newerMarker: newerMarker
  };
})(globalThis);
