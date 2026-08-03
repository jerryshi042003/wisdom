(function () {
  "use strict";

  var STORAGE_KEY = "wisdom-essay-reader-state-v1";
  var BACKUP_KEY = STORAGE_KEY + "-backup";
  var CORRUPT_KEY = STORAGE_KEY + "-corrupt";
  var MAX_TEXT = 5000;
  var STATUS = ["unread", "reading", "finished", "dropped"];

  function emptyRoot() {
    return { schemaVersion: 1, essays: {} };
  }

  function rootShape(value) {
    return value && value.schemaVersion === 1 && value.essays && typeof value.essays === "object" && !Array.isArray(value.essays);
  }

  function parseRoot(raw) {
    if (!raw) return { root: emptyRoot(), recovered: false };
    try {
      var parsed = JSON.parse(raw);
      if (!rootShape(parsed)) {
        throw new Error("Unsupported essay state");
      }
      return { root: parsed, recovered: false };
    } catch (error) {
      try {
        localStorage.setItem(CORRUPT_KEY, raw);
        localStorage.removeItem(STORAGE_KEY);
      } catch (storageError) {
        // The clean in-memory fallback still lets the reader work.
      }
      return { root: emptyRoot(), recovered: true };
    }
  }

  function readRoot() {
    var raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (error) { raw = null; }
    return parseRoot(raw);
  }

  function validText(value) {
    return typeof value === "string" ? value.slice(0, MAX_TEXT) : "";
  }

  function sanitizeEssay(value, unitIds, seed) {
    var source = value && typeof value === "object" ? value : {};
    var allowed = new Set(unitIds || []);
    var completed = Array.isArray(source.completedUnitIds)
      ? source.completedUnitIds.filter(function (id, index, values) {
          return allowed.has(id) && values.indexOf(id) === index;
        })
      : [];
    var seededStatus = seed && STATUS.indexOf(seed.status) !== -1 ? seed.status : "unread";
    var status = STATUS.indexOf(source.status) !== -1 ? source.status : seededStatus;
    var startedAt = typeof source.startedAt === "string" ? source.startedAt : null;
    if (!startedAt && seed && seed.startedOn && seededStatus !== "unread") startedAt = seed.startedOn;
    return {
      status: status,
      startedAt: status === "unread" ? null : startedAt,
      completedUnitIds: completed,
      note: validText(source.note),
      teachBack: validText(source.teachBack),
      output: validText(source.output),
      updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null,
      evidence: validText(typeof source.evidence === "string" ? source.evidence : (seed && seed.evidence) || "")
    };
  }

  function getEssay(id, unitIds, seed) {
    var loaded = readRoot();
    return {
      state: sanitizeEssay(loaded.root.essays[id], unitIds, seed),
      recovered: loaded.recovered
    };
  }

  function writeRoot(root) {
    var next = JSON.stringify(root);
    try {
      var previous = localStorage.getItem(STORAGE_KEY);
      if (previous) localStorage.setItem(BACKUP_KEY, previous);
      localStorage.setItem(STORAGE_KEY, next);
      return true;
    } catch (error) {
      return false;
    }
  }

  function saveEssay(id, value, unitIds, seed) {
    var loaded = readRoot();
    var persisted = sanitizeEssay(loaded.root.essays[id], unitIds, seed);
    var next = sanitizeEssay(value, unitIds, seed);
    next.updatedAt = new Date().toISOString();
    if (next.status !== "unread" && !next.startedAt) next.startedAt = next.updatedAt;
    loaded.root.essays[id] = next;
    var ok = writeRoot(loaded.root);
    return { ok: ok, state: ok ? next : persisted, recovered: loaded.recovered };
  }

  function resetEssay(id) {
    var loaded = readRoot();
    delete loaded.root.essays[id];
    return writeRoot(loaded.root);
  }

  function exportJson() {
    return JSON.stringify(readRoot().root, null, 2);
  }

  function sanitizeImportedEssay(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("An imported essay state is invalid.");
    if (STATUS.indexOf(value.status) === -1) throw new Error("An imported essay has an invalid decision.");
    if (!Array.isArray(value.completedUnitIds)) throw new Error("An imported essay has invalid section progress.");
    var completed = value.completedUnitIds.filter(function (id, index, values) {
      return typeof id === "string" && /^[a-z0-9-]+$/.test(id) && values.indexOf(id) === index;
    });
    if (completed.length !== value.completedUnitIds.length || completed.length > 100) {
      throw new Error("An imported essay has unsafe section identifiers.");
    }
    return {
      status: value.status,
      startedAt: typeof value.startedAt === "string" ? value.startedAt.slice(0, 64) : null,
      completedUnitIds: completed,
      note: validText(value.note),
      teachBack: validText(value.teachBack),
      output: validText(value.output),
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt.slice(0, 64) : null,
      evidence: validText(value.evidence)
    };
  }

  function importJson(raw) {
    var parsed = JSON.parse(raw);
    if (!rootShape(parsed)) {
      throw new Error("This is not a Wisdom Essay Reader V1 export.");
    }
    var ids = Object.keys(parsed.essays);
    if (ids.length > 500 || ids.some(function (id) { return !/^[a-z0-9-]+$/.test(id); })) {
      throw new Error("The import contains invalid essay identifiers.");
    }
    var sanitized = emptyRoot();
    ids.forEach(function (id) { sanitized.essays[id] = sanitizeImportedEssay(parsed.essays[id]); });
    if (!writeRoot(sanitized)) throw new Error("The browser could not save the imported state.");
    return true;
  }

  function storedStatus(id) {
    // Library badges must not consume the reader's one visible corruption
    // recovery notice. Invalid storage is left in place for getEssay().
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!rootShape(parsed)) return null;
      var value = parsed.essays[id];
      return value && STATUS.indexOf(value.status) !== -1 ? value.status : null;
    } catch (error) {
      return null;
    }
  }

  function backupAvailable() {
    try { return rootShape(JSON.parse(localStorage.getItem(BACKUP_KEY) || "null")); }
    catch (error) { return false; }
  }

  function restoreBackup() {
    var backup = localStorage.getItem(BACKUP_KEY);
    var parsed;
    try { parsed = JSON.parse(backup || "null"); } catch (error) { parsed = null; }
    if (!rootShape(parsed)) throw new Error("No valid backup is available.");
    var current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      try {
        if (rootShape(JSON.parse(current))) localStorage.setItem(BACKUP_KEY, current);
        else localStorage.setItem(CORRUPT_KEY, current);
      } catch (error) {
        localStorage.setItem(CORRUPT_KEY, current);
      }
    }
    localStorage.setItem(STORAGE_KEY, backup);
    return true;
  }

  window.WisdomEssayState = {
    STORAGE_KEY: STORAGE_KEY,
    BACKUP_KEY: BACKUP_KEY,
    CORRUPT_KEY: CORRUPT_KEY,
    getEssay: getEssay,
    saveEssay: saveEssay,
    resetEssay: resetEssay,
    exportJson: exportJson,
    importJson: importJson,
    storedStatus: storedStatus,
    backupAvailable: backupAvailable,
    restoreBackup: restoreBackup
  };
})();
