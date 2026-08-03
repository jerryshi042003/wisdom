(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WISDOM_CONTINUITY_MODEL = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const safeText = value => typeof value === "string" ? value.trim() : "";
  const normalizedStatus = value => ["unread", "reading", "finished", "dropped"].includes(value) ? value : "unread";

  function normalizeItemState(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      status: normalizedStatus(source.status),
      completedUnitIds: Array.isArray(source.completedUnitIds) ? [...new Set(source.completedUnitIds.filter(id => typeof id === "string"))] : [],
      note: safeText(source.note),
      teachBack: safeText(source.teachBack),
      output: safeText(source.output),
      updatedAt: safeText(source.updatedAt)
    };
  }

  function advances(state) {
    const item = normalizeItemState(state);
    return item.status === "dropped" || item.status === "finished";
  }

  function resolveThread(thread, stateFor) {
    const states = thread.items.map(item => normalizeItemState(stateFor(item)));
    for (let index = 0; index < thread.items.length; index += 1) {
      const state = states[index];
      if (state.status === "reading") return {mode: "reading", index, item: thread.items[index], state, states};
      if (state.status === "unread") {
        const unlocked = index === 0 || advances(states[index - 1]);
        if (unlocked) return {mode: "ready", index, item: thread.items[index], state, states};
        return {mode: "locked", index, item: thread.items[index], state, states};
      }
    }
    return {mode: "complete", index: thread.items.length, item: null, state: null, states};
  }

  function visibleThreadItems(thread, resolution, maximum) {
    if (!resolution.item) return [];
    const cap = Math.max(1, Math.min(3, Number(maximum) || 3));
    return thread.items.slice(resolution.index, resolution.index + Math.min(2, cap));
  }

  function statusLabel(state) {
    const item = normalizeItemState(state);
    if (item.status === "reading") return "In progress";
    if (item.status === "finished") return "Finished";
    if (item.status === "dropped") return "Dropped";
    return "Not started";
  }

  function capChoices(items, maximum) {
    return items.slice(0, Math.max(0, Math.min(3, Number(maximum) || 3)));
  }

  function completedThreadItems(thread, stateFor) {
    return thread.items.flatMap(item => {
      const state = normalizeItemState(stateFor(item));
      return state.status === "finished" ? [{item, state}] : [];
    });
  }

  function validEssayImportRoot(value) {
    if (!value || value.schemaVersion !== 1 || !value.essays || typeof value.essays !== "object" || Array.isArray(value.essays)) return false;
    const ids = Object.keys(value.essays);
    if (ids.length > 500 || ids.some(id => !/^[a-z0-9-]+$/.test(id))) return false;
    return ids.every(id => {
      const item = value.essays[id];
      if (!item || !["unread", "reading", "finished", "dropped"].includes(item.status) || !Array.isArray(item.completedUnitIds)) return false;
      const units = item.completedUnitIds;
      if (units.length > 100 || units.some(unitId => typeof unitId !== "string" || !/^[a-z0-9-]+$/.test(unitId))) return false;
      if (new Set(units).size !== units.length) return false;
      return ["note", "teachBack", "output", "evidence", "startedAt", "updatedAt"].every(field =>
        item[field] == null || typeof item[field] === "string"
      );
    });
  }

  function importBundleTransaction(bundle, adapter) {
    if (!bundle || bundle.schemaVersion !== 1 || bundle.kind !== "wisdom-continuity-state") {
      throw new Error("This is not a Wisdom continuity export");
    }
    if (!validEssayImportRoot(bundle.essays)) throw new Error("Essay state is invalid");
    const normalizedLong = adapter.normalizeLong(bundle.longWorks);
    const snapshot = adapter.snapshot();
    try {
      adapter.writeEssay(bundle.essays);
      adapter.writeLong(normalizedLong);
    } catch (error) {
      try {
        adapter.restore(snapshot);
      } catch (rollbackError) {
        throw new Error(`Import failed and local rollback also failed: ${rollbackError.message}`);
      }
      throw error;
    }
    return true;
  }

  return {normalizeItemState, advances, resolveThread, visibleThreadItems, statusLabel, capChoices, completedThreadItems, validEssayImportRoot, importBundleTransaction};
});
