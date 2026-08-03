// knows sync — same zero-credential pattern as the Health Log (PRODUCT.md 6.x):
// the phone holds no token; events queue in this browser and drain to the
// health-sync service, which validates and append-commits them to the private
// repo ledger (data/knowledge/YYYY-MM.ndjson). If the service or the endpoint
// is unreachable, nothing is lost — the queue simply keeps waiting.
(function () {
  "use strict";

  const SERVICE = "https://health-sync-02qr.onrender.com";
  // Scanner speed bump, public by design — identical role to the Health app's
  // copy of the same constant (see wisdom/health/log PRODUCT.md 6.1).
  const HL_KEY = "19e83c3f0fc5c7adfc3bfe42023b6656";
  const QKEY = "knows.queue.v1";

  let flushTimer = null;
  let inFlight = false;
  let lastNote = "idle";
  let statusCb = null;

  const readQueue = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(QKEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };
  const writeQueue = (q) => { try { localStorage.setItem(QKEY, JSON.stringify(q)); } catch {} };

  function pad(n) { return String(n).padStart(2, "0"); }
  function nowTs() {
    const d = new Date();
    const off = -d.getTimezoneOffset();
    const sign = off >= 0 ? "+" : "-";
    const abs = Math.abs(off);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
      "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) +
      sign + pad(Math.floor(abs / 60)) + ":" + pad(abs % 60);
  }
  function newId() {
    let s = "";
    while (s.length < 12) s += Math.random().toString(36).slice(2);
    return s.slice(0, 12);
  }

  function notify(note) {
    lastNote = note;
    if (statusCb) statusCb({ queued: readQueue().length, note });
  }

  function enqueue(partial) {
    const event = Object.assign({ id: newId(), ts: nowTs(), source: "app" }, partial);
    const q = readQueue();
    q.push(event);
    writeQueue(q);
    notify("queued");
    scheduleFlush(1200);
    return event;
  }

  function scheduleFlush(delay) {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => { flush(); }, delay);
  }

  async function flush() {
    if (inFlight) return;
    let q = readQueue();
    if (!q.length) { notify("empty"); return; }
    inFlight = true;
    notify("syncing");
    try {
      while (q.length) {
        const batch = q.slice(0, 40);
        const res = await fetch(SERVICE + "/wisdom/api/knowledge/events", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-HL-Key": HL_KEY },
          body: JSON.stringify({ events: batch })
        });
        if (res.status === 400) {
          // Schema-rejected batch: dropping it beats poisoning the queue forever.
          console.warn("knows-sync: batch rejected, dropping", await res.text());
          q = q.slice(batch.length);
          writeQueue(q);
          continue;
        }
        if (res.status === 404 || res.status === 401) { notify("awaiting-service"); return; }
        if (!res.ok) { notify("retry-later"); return; }
        const out = await res.json().catch(() => ({}));
        const landed = new Set(Array.isArray(out.landed) ? out.landed : batch.map(e => e.id));
        q = q.filter(e => !landed.has(e.id));
        writeQueue(q);
      }
      notify("synced");
    } catch {
      notify("offline");
    } finally {
      inFlight = false;
    }
  }

  async function pullState() {
    try {
      const res = await fetch(SERVICE + "/wisdom/api/knowledge/state", {
        headers: { "X-HL-Key": HL_KEY }
      });
      if (!res.ok) return null;
      const body = await res.json();
      return body && typeof body === "object" && body.items ? body.items : null;
    } catch { return null; }
  }

  window.KNOWS_SYNC = {
    enqueue,
    flush,
    pullState,
    nowTs,
    queueLength: () => readQueue().length,
    lastNote: () => lastNote,
    onStatus: (cb) => { statusCb = cb; cb({ queued: readQueue().length, note: lastNote }); }
  };

  window.addEventListener("online", () => scheduleFlush(500));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleFlush(800);
  });
  scheduleFlush(2000);
})();
