// Knows — a ledger of what's solid, what's fuzzy, and what's next.
// Vanilla JS, hash-routed, local-first. Content ships in data-*.js; the user's
// verdicts live in this browser and sync (keyless) to the private repo ledger.
(function () {
  "use strict";

  const SKEY = "knows.state.v1";
  const view = document.getElementById("view");
  const tabs = document.getElementById("tabs");
  const syncDot = document.getElementById("syncDot");
  const syncLine = document.getElementById("syncLine");

  // ---------- data assembly ----------
  const collections = [];
  const items = new Map();
  for (const part of (window.KNOWS_PARTS || [])) {
    for (const coll of part) {
      collections.push(coll);
      for (const item of coll.items) {
        item.coll = coll.id;
        if (items.has(item.id)) console.warn("knows: duplicate item id", item.id);
        items.set(item.id, item);
      }
    }
  }
  const downstream = new Map();
  for (const item of items.values()) {
    for (const up of item.up || []) {
      if (!downstream.has(up)) downstream.set(up, []);
      downstream.get(up).push(item.id);
    }
  }

  // ---------- state ----------
  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SKEY) || "{}");
      if (!parsed || typeof parsed !== "object") return { items: {}, settings: {} };
      parsed.items = parsed.items || {};
      parsed.settings = parsed.settings || {};
      return parsed;
    } catch { return { items: {}, settings: {} }; }
  }
  const state = readState();
  const save = () => { try { localStorage.setItem(SKEY, JSON.stringify(state)); } catch {} };

  // Evidence pre-marks: applied once, only to items never touched by hand.
  let seeded = 0;
  for (const item of items.values()) {
    if (item.preVerdict && !state.items[item.id]) {
      state.items[item.id] = { verdict: item.preVerdict, src: "evidence", ts: window.KNOWS_SYNC.nowTs() };
      seeded++;
    }
  }
  if (seeded) save();

  // Remote merge: a verdict recorded on another device wins if newer.
  window.KNOWS_SYNC.pullState().then(remote => {
    if (!remote) return;
    let changed = 0;
    for (const [id, rec] of Object.entries(remote)) {
      if (!items.has(id) || !rec || typeof rec.verdict !== "string") continue;
      const local = state.items[id];
      if (!local || (rec.ts && local.ts && rec.ts > local.ts && local.src !== "self-newer")) {
        if (!local || rec.ts > (local.ts || "")) {
          state.items[id] = { verdict: rec.verdict, src: "remote", ts: rec.ts };
          changed++;
        }
      }
    }
    if (changed) { save(); render(); }
  });

  const verdictOf = (id) => (state.items[id] && state.items[id].verdict) || "unseen";

  function mark(item, verdict, src) {
    state.items[item.id] = {
      verdict,
      src: src || "self",
      ts: window.KNOWS_SYNC.nowTs(),
      quiz: (state.items[item.id] || {}).quiz
    };
    save();
    window.KNOWS_SYNC.enqueue({ kind: "mark", item: item.id, verdict, coll: item.coll });
  }

  function recordQuiz(item, qIndex, correct) {
    const rec = state.items[item.id] || { verdict: "fuzzy", src: "quiz", ts: window.KNOWS_SYNC.nowTs() };
    rec.quiz = rec.quiz || { right: 0, wrong: 0 };
    rec.quiz[correct ? "right" : "wrong"]++;
    rec.quiz.lastTs = window.KNOWS_SYNC.nowTs();
    // Honest ledger: a wrong answer downgrades a "know" claim; a right answer
    // on a "fuzzy" claim promotes it. Verdict changes also emit a mark event so
    // the synced ledger stays self-describing without re-running quiz logic.
    let flipped = null;
    if (!correct && rec.verdict === "know") { rec.verdict = "fuzzy"; flipped = "fuzzy"; }
    if (correct && rec.verdict === "fuzzy" && !flipped) { rec.verdict = "know"; flipped = "know"; }
    if (flipped) { rec.src = "quiz"; rec.ts = rec.quiz.lastTs; }
    state.items[item.id] = rec;
    save();
    window.KNOWS_SYNC.enqueue({ kind: "quiz", item: item.id, q: qIndex, correct, coll: item.coll });
    if (flipped) window.KNOWS_SYNC.enqueue({ kind: "mark", item: item.id, verdict: flipped, coll: item.coll });
  }

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const kindLabel = (k) => k === "person" ? "Person" : "Concept";
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  function counts(coll) {
    const c = { know: 0, fuzzy: 0, new: 0, unseen: 0 };
    for (const item of coll.items) c[verdictOf(item.id)]++;
    return c;
  }
  const domainOf = () => state.settings.domain === "work" ? "work" : "personal";

  // ---------- views ----------
  function homeView() {
    const domain = domainOf();
    const frag = document.createDocumentFragment();
    const domRow = el(`<div class="domainRow" role="tablist"></div>`);
    for (const d of ["personal", "work"]) {
      const b = el(`<button class="domainBtn${d === domain ? " on" : ""}" type="button">${d === "personal" ? "Personal" : "Work"}</button>`);
      b.onclick = () => { state.settings.domain = d; save(); render(); };
      domRow.appendChild(b);
    }
    frag.appendChild(domRow);

    const active = collections.filter(c => c.domain === domain);
    let unseenTotal = 0, claimTotal = 0;
    for (const coll of active) {
      const c = counts(coll);
      unseenTotal += c.unseen;
      claimTotal += coll.items.filter(i => (verdictOf(i.id) === "know" || verdictOf(i.id) === "fuzzy") && i.quiz && i.quiz.length).length;
      const total = coll.items.length;
      const row = el(`<button class="collRow" type="button">
        <span class="collTop"><span class="collName">${esc(coll.title)}</span>
        <span class="collCount">${c.unseen ? c.unseen + " to sort" : c.know + " / " + total + " solid"}</span></span>
        <span class="collBlurb">${esc(coll.blurb)}</span>
        <span class="bar" aria-hidden="true">
          <span class="b-know" style="flex:${c.know}"></span>
          <span class="b-fuzzy" style="flex:${c.fuzzy}"></span>
          <span class="b-new" style="flex:${c.new}"></span>
          <span style="flex:${c.unseen}"></span>
        </span></button>`);
      row.onclick = () => { location.hash = c.unseen ? "#/filter/" + coll.id : "#/coll/" + coll.id; };
      frag.appendChild(row);
    }
    frag.appendChild(el(`<div class="barKey"><span class="k-know">know</span><span class="k-fuzzy">fuzzy</span><span class="k-new">new to me</span><span>unsorted</span></div>`));

    if (unseenTotal) {
      const next = active.find(c => counts(c).unseen);
      const cta = el(`<button class="cta" type="button">Sort what's left — ${unseenTotal} card${unseenTotal === 1 ? "" : "s"}</button>`);
      cta.onclick = () => { location.hash = "#/filter/" + next.id; };
      frag.appendChild(cta);
    }
    if (claimTotal) {
      const cta2 = el(`<button class="cta ghost" type="button">Quiz the claims</button>`);
      cta2.onclick = () => { location.hash = "#/quiz/due"; };
      frag.appendChild(cta2);
    }
    return frag;
  }

  function filterView(collId) {
    const coll = collections.find(c => c.id === collId);
    if (!coll) return el(`<p>Unknown collection.</p>`);
    const deck = coll.items.filter(i => verdictOf(i.id) === "unseen" || (state.items[i.id] || {}).src === "evidence");
    const already = coll.items.length - deck.length;
    let pos = 0;
    const marked = [];
    const frag = el(`<section aria-label="Filter"></section>`);

    function summary() {
      const c = counts(coll);
      frag.innerHTML = "";
      frag.appendChild(el(`<div>
        <p class="deckTitle">${esc(coll.title)} — sorted</p>
        <p class="bigStat">${c.know}<span style="color:var(--faint)"> / ${coll.items.length}</span></p>
        <p class="statLine">solid · ${c.fuzzy} fuzzy · ${c.new} new to you</p>
      </div>`));
      const quizable = coll.items.filter(i => i.quiz && i.quiz.length && ["know", "fuzzy"].includes(verdictOf(i.id)));
      if (quizable.length) {
        const b = el(`<button class="cta" type="button">Quiz these claims — ${quizable.length} item${quizable.length === 1 ? "" : "s"}</button>`);
        b.onclick = () => { location.hash = "#/quiz/" + coll.id; };
        frag.appendChild(b);
      }
      const back = el(`<button class="cta ghost" type="button">Back to ledger</button>`);
      back.onclick = () => { location.hash = "#/"; };
      frag.appendChild(back);
    }

    function draw() {
      if (pos >= deck.length) { summary(); return; }
      const item = deck[pos];
      frag.innerHTML = "";
      frag.appendChild(el(`<div class="deckHead"><span class="deckTitle">${esc(coll.title)}</span>
        <span class="deckPos">${pos + 1 + already} / ${coll.items.length}</span></div>`));
      const card = el(`<div class="card">
        <span class="kindChip">${kindLabel(item.kind)}</span>
        <h2 class="cardName">${esc(item.name)}</h2>
        <p class="cardHook">${esc(item.hook)}</p>
        ${item.evidence && (state.items[item.id] || {}).src === "evidence" ? `<p class="evidenceTag">pre-marked “${esc((state.items[item.id]).verdict)}” — ${esc(item.evidence)}</p>` : ""}
      </div>`);
      frag.appendChild(card);
      const row = el(`<div class="verdictRow"></div>`);
      const defs = [["know", "Know it", "could explain it"], ["fuzzy", "Fuzzy", "heard of it"], ["new", "New to me", "first time"]];
      defs.forEach(([v, label, small]) => {
        const b = el(`<button class="verdictBtn" type="button">${label}<small>${small}</small></button>`);
        b.onclick = () => {
          b.classList.add("picked");
          mark(item, v);
          marked.push(item);
          pos++;
          setTimeout(draw, 120);
        };
        row.appendChild(b);
      });
      frag.appendChild(row);
      const under = el(`<div class="underRow"></div>`);
      const why = el(`<button class="linkBtn" type="button">Why this one?</button>`);
      why.onclick = () => { location.hash = "#/item/" + item.id; };
      under.appendChild(why);
      if (marked.length) {
        const undo = el(`<button class="linkBtn" type="button">Undo</button>`);
        undo.onclick = () => {
          const prev = marked.pop();
          delete state.items[prev.id];
          save();
          pos--;
          draw();
        };
        under.appendChild(undo);
      }
      frag.appendChild(under);
    }
    draw();
    frag.dataset.keys = "filter";
    return frag;
  }

  function buildQuizPool(target) {
    const inScope = target === "due"
      ? collections.filter(c => c.domain === domainOf())
      : collections.filter(c => c.id === target);
    const pool = [];
    for (const coll of inScope) {
      for (const item of coll.items) {
        if (!item.quiz || !item.quiz.length) continue;
        if (!["know", "fuzzy"].includes(verdictOf(item.id))) continue;
        item.quiz.forEach((q, qi) => pool.push({ item, q, qi }));
      }
    }
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 12);
  }

  function quizView(target) {
    const pool = buildQuizPool(target);
    const frag = el(`<section aria-label="Quiz"></section>`);
    if (!pool.length) {
      frag.appendChild(el(`<p class="statLine">Nothing to quiz yet — sort some cards first, then claims get tested here.</p>`));
      const b = el(`<button class="cta ghost" type="button">Back to ledger</button>`);
      b.onclick = () => { location.hash = "#/"; };
      frag.appendChild(b);
      return frag;
    }
    let pos = 0, right = 0;

    function summary() {
      frag.innerHTML = "";
      frag.appendChild(el(`<div>
        <p class="deckTitle">Quiz done</p>
        <p class="bigStat">${right}<span style="color:var(--faint)"> / ${pool.length}</span></p>
        <p class="statLine">Wrong answers downgraded their claims — the ledger stays honest.</p>
      </div>`));
      const again = el(`<button class="cta" type="button">Another round</button>`);
      again.onclick = () => { render(); };
      frag.appendChild(again);
      const back = el(`<button class="cta ghost" type="button">Back to ledger</button>`);
      back.onclick = () => { location.hash = "#/"; };
      frag.appendChild(back);
    }

    function draw() {
      if (pos >= pool.length) { summary(); return; }
      const { item, q, qi } = pool[pos];
      frag.innerHTML = "";
      frag.appendChild(el(`<div class="deckHead"><span class="deckTitle">${esc(item.name)}</span>
        <span class="deckPos">${pos + 1} / ${pool.length}</span></div>`));
      frag.appendChild(el(`<p class="qText">${esc(q.q)}</p>`));
      const list = el(`<div role="group"></div>`);
      let answered = false;
      q.choices.forEach((choice, ci) => {
        const b = el(`<button class="choice" type="button">${esc(choice)}</button>`);
        b.onclick = () => {
          if (answered) return;
          answered = true;
          const correct = ci === q.a;
          if (correct) right++;
          recordQuiz(item, qi, correct);
          [...list.children].forEach((btn, bi) => {
            if (bi === q.a) btn.classList.add("right");
            else if (bi === ci) btn.classList.add("wrong");
            else btn.classList.add("dim");
          });
          const learn = (item.learn && item.learn[0]) || null;
          const reveal = el(`<div class="reveal">
            <span class="verdictWord">${correct ? "Right" : "Not quite"}</span>
            <p>${esc(q.why)}</p>
            ${learn ? `<p>Go deeper: <a href="${esc(learn.url)}" target="_blank" rel="noopener">${esc(learn.label)}</a></p>` : ""}
          </div>`);
          frag.appendChild(reveal);
          const next = el(`<button class="cta" type="button" style="margin-top:14px">${pos + 1 < pool.length ? "Next" : "Finish"}</button>`);
          next.onclick = () => { pos++; draw(); };
          frag.appendChild(next);
        };
        list.appendChild(b);
      });
      frag.appendChild(list);
    }
    draw();
    return frag;
  }

  function mapView() {
    const frag = el(`<section aria-label="Map"></section>`);
    const filters = ["all", "know", "fuzzy", "new", "unseen"];
    const current = state.settings.mapFilter || "all";
    const row = el(`<div class="mapFilterRow"></div>`);
    for (const f of filters) {
      const b = el(`<button class="pill${f === current ? " on" : ""}" type="button">${f === "all" ? "Everything" : f === "unseen" ? "Unsorted" : f === "new" ? "New to me" : f[0].toUpperCase() + f.slice(1)}</button>`);
      b.onclick = () => { state.settings.mapFilter = f; save(); render(); };
      row.appendChild(b);
    }
    frag.appendChild(row);
    for (const domain of ["personal", "work"]) {
      const domColls = collections.filter(c => c.domain === domain);
      const header = el(`<h2 class="mapCollName" style="border:0;margin-top:10px">${domain === "personal" ? "Personal" : "Work"}</h2>`);
      frag.appendChild(header);
      for (const coll of domColls) {
        const list = coll.items.filter(i => current === "all" || verdictOf(i.id) === current);
        if (!list.length) continue;
        const sec = el(`<div class="mapColl"><p class="mapCollName">${esc(coll.title)}</p></div>`);
        for (const item of list) {
          const rowEl = el(`<button class="itemRow" type="button">
            <span class="dot ${verdictOf(item.id)}" aria-hidden="true"></span>
            <span class="itemName">${esc(item.name)}</span>
            <span class="itemKind">${kindLabel(item.kind)}</span></button>`);
          rowEl.onclick = () => { location.hash = "#/item/" + item.id; };
          sec.appendChild(rowEl);
        }
        frag.appendChild(sec);
      }
    }
    return frag;
  }

  function collView(collId) {
    const coll = collections.find(c => c.id === collId);
    if (!coll) return el(`<p>Unknown collection.</p>`);
    const frag = el(`<section></section>`);
    frag.appendChild(el(`<p class="mapCollName">${esc(coll.title)}</p>`));
    frag.appendChild(el(`<p class="collBlurb" style="margin-bottom:12px">${esc(coll.blurb)}</p>`));
    for (const item of coll.items) {
      const rowEl = el(`<button class="itemRow" type="button">
        <span class="dot ${verdictOf(item.id)}" aria-hidden="true"></span>
        <span class="itemName">${esc(item.name)}</span>
        <span class="itemKind">${kindLabel(item.kind)}</span></button>`);
      rowEl.onclick = () => { location.hash = "#/item/" + item.id; };
      frag.appendChild(rowEl);
    }
    const quizable = coll.items.filter(i => i.quiz && i.quiz.length && ["know", "fuzzy"].includes(verdictOf(i.id)));
    if (quizable.length) {
      const b = el(`<button class="cta" type="button" style="margin-top:12px">Quiz this collection</button>`);
      b.onclick = () => { location.hash = "#/quiz/" + coll.id; };
      frag.appendChild(b);
    }
    return frag;
  }

  function itemView(id) {
    const item = items.get(id);
    if (!item) return el(`<p>Unknown item.</p>`);
    const coll = collections.find(c => c.id === item.coll);
    const frag = el(`<section class="itemPage"></section>`);
    frag.appendChild(el(`<h2>${esc(item.name)}</h2>`));
    frag.appendChild(el(`<p class="itemMeta">${kindLabel(item.kind)} · ${esc(coll.title)} · ${esc(coll.domain)}</p>`));
    frag.appendChild(el(`<h3>Why this matters here</h3>`));
    for (const p of Array.isArray(item.why) ? item.why : [item.why]) {
      frag.appendChild(el(`<p>${esc(p)}</p>`));
    }
    const ups = (item.up || []).filter(u => items.has(u));
    const downs = (downstream.get(item.id) || []);
    if (ups.length || downs.length) {
      frag.appendChild(el(`<h3>Lineage</h3>`));
      const rowEl = el(`<div class="lineageRow"></div>`);
      for (const uid of ups) {
        const b = el(`<button class="pill" type="button">↑ ${esc(items.get(uid).name)}</button>`);
        b.onclick = () => { location.hash = "#/item/" + uid; };
        rowEl.appendChild(b);
      }
      for (const did of downs) {
        const b = el(`<button class="pill" type="button">↓ ${esc(items.get(did).name)}</button>`);
        b.onclick = () => { location.hash = "#/item/" + did; };
        rowEl.appendChild(b);
      }
      frag.appendChild(rowEl);
    }
    if (item.learn && item.learn.length) {
      frag.appendChild(el(`<h3>Where to go deeper</h3>`));
      const ul = el(`<ul class="learnList"></ul>`);
      for (const l of item.learn) ul.appendChild(l.url
        ? el(`<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`)
        : el(`<li>${esc(l.label)}</li>`));
      frag.appendChild(ul);
    }
    frag.appendChild(el(`<h3>Your verdict</h3>`));
    const rowEl = el(`<div class="stateRow"></div>`);
    const v = verdictOf(id);
    [["know", "Know it"], ["fuzzy", "Fuzzy"], ["new", "New to me"]].forEach(([verdict, label]) => {
      const b = el(`<button class="verdictBtn${verdict === v ? " picked" : ""}" type="button">${label}</button>`);
      b.onclick = () => { mark(item, verdict); render(); };
      rowEl.appendChild(b);
    });
    frag.appendChild(rowEl);
    const back = el(`<button class="cta ghost" type="button" style="margin-top:16px">Back</button>`);
    back.onclick = () => { history.length > 1 ? history.back() : (location.hash = "#/"); };
    frag.appendChild(back);
    return frag;
  }

  // ---------- router ----------
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    const [head, arg] = h.split("/wisdom/");
    if (head === "filter" && arg) return { tab: "home", node: () => filterView(arg) };
    if (head === "quiz") return { tab: "quiz", node: () => quizView(arg || "due") };
    if (head === "map") return { tab: "map", node: () => mapView() };
    if (head === "item" && arg) return { tab: "map", node: () => itemView(arg) };
    if (head === "coll" && arg) return { tab: "home", node: () => collView(arg) };
    return { tab: "home", node: () => homeView() };
  }

  function render() {
    const r = route();
    view.innerHTML = "";
    view.appendChild(r.node());
    for (const a of tabs.querySelectorAll("a")) a.classList.toggle("on", a.dataset.tab === r.tab);
    view.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", render);

  // ---------- keyboard ----------
  document.addEventListener("keydown", (e) => {
    if (/^[123]$/.test(e.key)) {
      const btns = view.querySelectorAll(".verdictRow .verdictBtn");
      const idx = Number(e.key) - 1;
      if (btns[idx]) { btns[idx].click(); return; }
    }
    if (/^[1234]$/.test(e.key)) {
      const choices = view.querySelectorAll(".choice");
      const idx = Number(e.key) - 1;
      if (choices[idx]) choices[idx].click();
    }
  });

  // ---------- footer ----------
  window.KNOWS_SYNC.onStatus(({ queued, note }) => {
    syncDot.className = "syncDot" + (note === "synced" || note === "empty" ? " ok" : queued ? " queued" : "");
    const label = {
      synced: "Ledger synced.",
      empty: queued ? "" : "Ledger synced.",
      queued: `${queued} queued — will sync.`,
      syncing: "Syncing…",
      offline: `Offline — ${queued} safe on this phone.`,
      "awaiting-service": `${queued} queued — service updating, nothing lost.`,
      "retry-later": `${queued} queued — will retry.`,
      idle: queued ? `${queued} queued — will sync.` : "Local-first. No account."
    }[note] || "";
    syncLine.textContent = label;
  });

  document.getElementById("exportLedger").onclick = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: window.KNOWS_SYNC.nowTs(), state: state.items }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "knows-ledger.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  document.getElementById("resetLocal").onclick = () => {
    if (confirm("Clear local verdicts on this device? The synced repo ledger is not touched.")) {
      localStorage.removeItem(SKEY);
      location.reload();
    }
  };

  render();
})();
