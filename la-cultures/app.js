import { COMMUNITIES, CRAVINGS, NEIGHBORHOOD } from "./communities.js";

// Sentinel key for the non-census section. Not a community, never in COMMUNITIES,
// never looked up in stats.gates.
const CRAVING_KEY = "__cravings";
import { REGIONS, NICKNAMES } from "./places.js";

const SVGNS = "http://www.w3.org/2000/svg";
const el = (id) => document.getElementById(id);
const fmt = (n) => (n == null ? "—" : n.toLocaleString("en-US"));
const pct = (x, d = 0) => (x * 100).toFixed(d) + "%";

const W = 1000, H = 660;
const state = { active: null, place: null, vb: [0, 0, W, H], home: [0, 0, W, H] };

// ------------------------------------------------------------- projection

const mercator = (lon, lat) => [
  lon, Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2)) * (180 / Math.PI)
];
const ringsOf = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);

function makeProjector(features, w, h, pad) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const f of features)
    for (const poly of ringsOf(f.geometry))
      for (const pt of poly[0]) {
        const [x, y] = mercator(pt[0], pt[1]);
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
  const s = Math.min((w - pad * 2) / (x1 - x0), (h - pad * 2) / (y1 - y0));
  const ox = pad + ((w - pad * 2) - (x1 - x0) * s) / 2;
  const oy = pad + ((h - pad * 2) - (y1 - y0) * s) / 2;
  return (pt) => {
    const [x, y] = mercator(pt[0], pt[1]);
    return [ox + (x - x0) * s, oy + (y1 - y) * s];
  };
}

// ----------------------------------------------------------------- colour

function mix(hex, t) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const k = 0.18 + 0.82 * t;
  return `rgb(${Math.round(255 - (255 - r) * k)},${Math.round(255 - (255 - g) * k)},${Math.round(255 - (255 - b) * k)})`;
}
const intensity = (share, max) => (max ? Math.sqrt(Math.min(1, share / max)) : 0);

// ---------------------------------------------------------------- helpers

const byKey = (k) => COMMUNITIES.find((c) => c.key === k);

function setMapHidden(hidden) {
  const card = document.querySelector(".mapcard");
  if (card) card.hidden = hidden;
}

function hitsFor(key) {
  const c = byKey(key);
  if (c && c.districtOnly) return [];
  const g = state.stats.gates[key];
  return g ? [...g.hits, ...g.oc_hits] : [];
}
const maxShare = (key) => hitsFor(key).reduce((m, h) => Math.max(m, h.share), 0);

// Share of the county a ZIP actually sits in — "06059" is Orange, anything else
// is treated as Los Angeles.
function baseRate(key, county) {
  const g = state.stats.gates[key];
  if (!g) return 0;
  const m = state.stats.meta;
  return county === "06059"
    ? (g.oc || 0) / m.oc_total
    : (g.la || 0) / m.la_total;
}
const placeName = (z) => NEIGHBORHOOD[z] || state.stats.names[z] || z;

// Rank order: measured share of L.A. County, descending. Communities with no
// census measure (Jewish) cannot be ranked and go last, labelled.
function ranked() {
  const withNum = [], without = [];
  for (const c of COMMUNITIES) {
    const g = state.stats.gates[c.key];
    (c.noCensus || !g ? without : withNum).push({ c, share: g ? g.share : 0, g });
  }
  withNum.sort((a, b) => b.share - a.share);
  return [...withNum, ...without];
}

// ------------------------------------------------------------------- map

function buildMap() {
  const svg = el("mapsvg");
  const project = makeProjector(state.geo.features, W, H, 10);
  state.project = project;

  const gShapes = document.createElementNS(SVGNS, "g");
  const gLabels = document.createElementNS(SVGNS, "g");
  svg.append(gShapes, gLabels);
  state.gLabels = gLabels;
  state.paths = {};
  state.box = {};

  for (const f of state.geo.features) {
    const z = f.properties.z;
    let d = "";
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const poly of ringsOf(f.geometry))
      for (const ring of poly) {
        ring.forEach((pt, i) => {
          const [x, y] = project(pt);
          d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
          if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
          if (y < by0) by0 = y; if (y > by1) by1 = y;
        });
        d += "Z";
      }
    const p = document.createElementNS(SVGNS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", "z");
    p.setAttribute("vector-effect", "non-scaling-stroke");
    p.dataset.z = z;
    gShapes.appendChild(p);
    state.paths[z] = p;
    state.box[z] = [bx0, by0, bx1, by1];
  }

  wireMapInteraction(svg);
}

function setVB(vb, remember) {
  const svg = el("mapsvg");
  const minW = 26, maxW = W * 1.6;   // clamp so the map can't be lost off-screen
  let [x, y, w, h] = vb;
  const ar = w / h;
  w = Math.max(minW, Math.min(maxW, w));
  h = w / ar;
  x = Math.max(-W * 0.4, Math.min(W * 1.4 - w, x));
  y = Math.max(-H * 0.4, Math.min(H * 1.4 - h, y));
  state.vb = [x, y, w, h];
  if (remember) state.home = [x, y, w, h];
  svg.setAttribute("viewBox", state.vb.map((v) => v.toFixed(1)).join(" "));
  state.zoom = w / W;
  drawLabels();
}

function aspect() {
  const r = el("mapsvg").getBoundingClientRect();
  return r.width && r.height ? r.width / r.height : 16 / 9;
}

function fitTo(zctas, padFrac = 0.12, remember = true) {
  const boxes = zctas.map((z) => state.box[z]).filter(Boolean);
  if (!boxes.length) return setVB([0, 0, W, W / aspect()], remember);

  // With many ZIPs, frame where the mass is rather than the extremes. Los
  // Angeles County reaches deep into the Antelope Valley, and letting two
  // far-north ZIPs set the bounds zooms the whole basin into a smear.
  let x0, y0, x1, y1;
  if (boxes.length > 12) {
    const q = (arr, t) => arr.slice().sort((a, b) => a - b)[Math.floor((arr.length - 1) * t)];
    const lo = 0.06, hi = 0.94;
    x0 = q(boxes.map((b) => b[0]), lo); y0 = q(boxes.map((b) => b[1]), lo);
    x1 = q(boxes.map((b) => b[2]), hi); y1 = q(boxes.map((b) => b[3]), hi);
  } else {
    x0 = Infinity; y0 = Infinity; x1 = -Infinity; y1 = -Infinity;
    for (const b of boxes) {
      x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]);
      x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]);
    }
  }
  let w = x1 - x0, h = y1 - y0;
  const px = Math.max(w * padFrac, 12), py = Math.max(h * padFrac, 12);
  x0 -= px; x1 += px; y0 -= py; y1 += py;
  w = x1 - x0; h = y1 - y0;
  const a = aspect();
  if (w / h < a) { const nw = h * a; x0 -= (nw - w) / 2; w = nw; }
  else { const nh = w / a; y0 -= (nh - h) / 2; h = nh; }
  setVB([x0, y0, w, h], remember);
}

function zoomBy(factor, cx, cy) {
  const [x, y, w, h] = state.vb;
  const px = cx == null ? x + w / 2 : cx;
  const py = cy == null ? y + h / 2 : cy;
  setVB([px - (px - x) * factor, py - (py - y) * factor, w * factor, h * factor], false);
}

function svgPoint(e) {
  const r = el("mapsvg").getBoundingClientRect();
  const [x, y, w, h] = state.vb;
  return [x + ((e.clientX - r.left) / r.width) * w, y + ((e.clientY - r.top) / r.height) * h];
}

function wireMapInteraction(svg) {
  svg.addEventListener("wheel", (e) => {
    e.preventDefault();
    const [px, py] = svgPoint(e);
    zoomBy(Math.exp(e.deltaY * 0.0016), px, py);
  }, { passive: false });

  const pts = new Map();
  let drag = null, pinch = null;

  const dist = () => {
    const [a, b] = [...pts.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  svg.addEventListener("pointerdown", (e) => {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    svg.setPointerCapture(e.pointerId);
    if (pts.size === 2) {
      drag = null;
      pinch = { d: dist(), vb: [...state.vb] };
    } else if (pts.size === 1) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { id: e.pointerId, from: svgPoint(e), vb: [...state.vb], moved: 0 };
      svg.classList.add("dragging");
    }
  });

  svg.addEventListener("pointermove", (e) => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch && pts.size === 2) {
      const d = dist();
      if (pinch.d > 4) {
        const f = pinch.d / d;
        const [x, y, w, h] = pinch.vb;
        const cx = x + w / 2, cy = y + h / 2;
        setVB([cx - (w * f) / 2, cy - (h * f) / 2, w * f, h * f], false);
      }
      return;
    }
    if (!drag || e.pointerId !== drag.id) {
      if (e.target.dataset && e.target.dataset.z) hint(e.target.dataset.z);
      return;
    }
    const [cx, cy] = svgPoint(e);
    const dx = drag.from[0] - cx, dy = drag.from[1] - cy;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    setVB([drag.vb[0] + dx, drag.vb[1] + dy, drag.vb[2], drag.vb[3]], false);
  });

  const end = (e) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (!drag) return;
    const wasTap = drag.moved < 4;
    drag = null;
    svg.classList.remove("dragging");
    if (wasTap && e.target.dataset && e.target.dataset.z) hint(e.target.dataset.z, true);
  };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
  svg.addEventListener("dblclick", (e) => {
    const [px, py] = svgPoint(e);
    zoomBy(0.55, px, py);
  });

  document.querySelector(".mapctl").addEventListener("click", (e) => {
    const b = e.target.closest("[data-zoom]");
    if (!b) return;
    if (b.dataset.zoom === "in") zoomBy(0.66);
    else if (b.dataset.zoom === "out") zoomBy(1.5);
    else setVB([...state.home], false);
  });
}

function drawLabels() {
  const g = state.gLabels;
  if (!g) return;
  g.replaceChildren();
  const k = state.zoom || 1;
  const list = state.labels || [];
  const size = (list.length > 8 ? 6.4 : 8.2) * k;
  const placed = [];
  const [vx, vy, vw, vh] = state.vb;
  for (const d of list) {
    const cen = state.stats.cent[d.z];
    if (!cen) continue;
    const [x, y] = state.project(cen);
    if (x < vx || x > vx + vw || y < vy || y > vy + vh) continue;
    const w = d.name.length * size * 0.5, h = size * 1.25;
    const b = [x - w / 2, y - h / 2, x + w / 2, y + h / 2];
    if (placed.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) continue;
    placed.push(b);
    const t = document.createElementNS(SVGNS, "text");
    t.setAttribute("x", x.toFixed(1));
    t.setAttribute("y", y.toFixed(1));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("class", d.small ? "lbl sm" : "lbl");
    t.style.fontSize = size.toFixed(2) + "px";
    t.style.strokeWidth = (2.6 * k).toFixed(2) + "px";
    t.textContent = d.name;
    g.appendChild(t);
  }
}

function hint(z, lock) {
  const rows = [];
  for (const c of COMMUNITIES) {
    const h = hitsFor(c.key).find((x) => x.zcta === z);
    if (h) rows.push({ c, h });
  }
  rows.sort((a, b) => b.h.lq - a.h.lq);
  const head = `${z} · ${placeName(z)}`;
  el("maphint").textContent = rows.length
    ? `${head} — ` + rows.slice(0, 2).map((r) => `${r.c.name} ${pct(r.h.share)}`).join(", ")
    : `${head} — no community concentrates here`;
  if (lock) showPlace({ label: placeName(z), zctas: [z], kind: "ZIP " + z });
}

function clearPaint() {
  for (const p of Object.values(state.paths)) {
    p.setAttribute("class", "z");
    p.style.fill = ""; p.style.stroke = ""; p.style.strokeWidth = ""; p.style.strokeDasharray = "";
  }
}

function paintMap() {
  clearPaint();
  const key = state.active;

  if (!key) {
    const own = {};
    for (const c of COMMUNITIES)
      for (const h of hitsFor(c.key))
        if (!own[h.zcta] || h.lq > own[h.zcta].lq) own[h.zcta] = { key: c.key, ...h };
    const maxes = {};
    for (const c of COMMUNITIES) maxes[c.key] = maxShare(c.key);
    for (const [z, o] of Object.entries(own)) {
      const p = state.paths[z];
      if (!p) continue;
      p.style.fill = mix(byKey(o.key).tone, intensity(o.share, maxes[o.key]));
      p.setAttribute("class", "z on");
    }
    for (const c of COMMUNITIES) if (c.districtOnly) outline(c);
    state.labels = COMMUNITIES.map((c) => ({ ...c.districts[0], small: true }));
    return Object.keys(own);
  }

  const c = byKey(key);
  const hits = hitsFor(key);
  const mx = maxShare(key);
  for (const h of hits) {
    const p = state.paths[h.zcta];
    if (!p) continue;
    p.style.fill = mix(c.tone, intensity(h.share, mx));
    p.setAttribute("class", "z on");
  }
  if (c.districtOnly) outline(c);
  state.labels = c.districts;
  return hits.length
    ? [...hits.map((h) => h.zcta), ...c.districts.map((d) => d.z)]
    : c.districts.map((d) => d.z);
}

function outline(c) {
  for (const d of c.districts) {
    const p = state.paths[d.z];
    if (!p) continue;
    p.style.fill = mix(c.tone, 0.07);
    p.style.stroke = c.tone;
    p.style.strokeWidth = "1.6";
    p.style.strokeDasharray = "3 2";
    p.setAttribute("class", "z on");
  }
}

// ------------------------------------------------------------------- rail

function buildRail() {
  const host = el("rail-list");
  host.replaceChildren();
  const rows = ranked();
  const top = rows[0].share || 1;
  state.rows = {};

  for (const { c, share, g } of rows) {
    const b = document.createElement("button");
    b.className = "crow";
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    const label = g && !c.noCensus ? pct(share, share < 0.01 ? 2 : 1) : "n/a";
    b.innerHTML =
      `<span class="crow-tone" style="background:${c.tone}"></span>` +
      `<span class="crow-main"><span class="crow-name">${c.name}</span>` +
      `<span class="crow-pct">${label}</span>` +
      `<span class="crow-bar"><i style="width:${Math.max(2, (share / top) * 100)}%"></i></span></span>` +
      `<span class="crow-pct">${label}</span>`;
    b.onclick = () => select(c.key);
    host.appendChild(b);
    state.rows[c.key] = b;
  }

  // Below the seventeen, and visibly separated from them: the places the census
  // method cannot reach. Same rail so it is findable, different styling so it is
  // never mistaken for a measured community.
  const sep = document.createElement("div");
  sep.className = "rail-sep";
  sep.textContent = "not census-backed";
  host.appendChild(sep);

  const cb = document.createElement("button");
  cb.className = "crow crow-craving";
  cb.type = "button";
  cb.setAttribute("aria-pressed", "false");
  cb.innerHTML =
    `<span class="crow-tone" style="background:var(--ink-4)"></span>` +
    `<span class="crow-main"><span class="crow-name">If you're craving…</span>` +
    `<span class="crow-bar"><i style="width:2%"></i></span></span>` +
    `<span class="crow-pct">${CRAVINGS.length}</span>`;
  cb.onclick = () => select(CRAVING_KEY);
  host.appendChild(cb);
  state.rows[CRAVING_KEY] = cb;
}

// ------------------------------------------------------------------ picks

function pickCard(s, c, away) {
  const d = document.createElement("article");
  d.className = "pick";
  // name + street + the city/neighbourhood, because "318 E Broadway" alone
  // resolves to the wrong Broadway in half a dozen cities.
  const parts = (s.place || "").split("·").map((x) => x.replace(/\(.*?\)/g, "").trim());
  const q = encodeURIComponent([s.name, parts.slice(1).join(" "), parts[0], "CA"]
    .filter(Boolean).join(", "));
  const tags = [];
  // Provenance is stated on every card, both ways round. An absent badge would
  // mean "found by the method", which nobody can be expected to infer — and the
  // whole point of the distinction is that the reader should never have to.
  tags.push(
    s.source === "jerry" ? '<span class="tag jerry">Jerry’s pick</span>'
    : s.source === "friend" ? `<span class="tag friend">${s.who} told him</span>`
    : s.source === "curator" ? `<span class="tag curator">via ${s.via.who}</span>`
    : '<span class="tag found">found by method</span>');
  if (s.new) tags.push('<span class="tag new">new</span>');
  if (s.since) tags.push(`<span class="tag">since ${s.since}</span>`);
  // A verification date, because a one-off check decays from the day it ships.
  if (s.checked) tags.push(`<span class="tag ok">checked ${s.checked}</span>`);
  if (away != null && isFinite(away) && away > 0.6) {
    tags.push(`<span class="tag">${away < 10 ? away.toFixed(1) : Math.round(away)} mi away</span>`);
  }
  d.innerHTML =
    `<div class="pick-img">` +
      `<img src="img/${s.img}.jpg" alt="${s.dish}" loading="lazy" decoding="async" width="660" height="440" ` +
      `onerror="this.closest('.pick-img').classList.add('noimg');this.remove()">` +
      `<span class="pick-dish">${s.dish}</span>` +
    `</div>` +
    `<div class="pick-body">` +
      `<div class="pick-top"><h3>${s.name}</h3>${tags.join("")}</div>` +
      `<div class="pick-where">${s.place}</div>` +
      (s.jerryOrder ? `<p class="pick-order"><b>What he gets:</b> ${s.jerryOrder}</p>` : "") +
      `<p class="pick-why">${s.why}</p>` +
      (s.cosign ? `<p class="pick-cosign">${s.cosign}</p>` : "") +
      // A curator's authority is only useful if it is stated. "via David R. Chan"
      // means nothing without the spreadsheet behind it.
      (s.via
        ? `<p class="pick-via"><b>${s.via.who}</b>${s.via.handle ? ` · ${s.via.handle}` : ""}` +
          ` — ${s.via.cred}.${s.via.when ? ` Posted ${s.via.when}.` : ""}</p>`
        : "") +
      (s.note ? `<p class="pick-note">${s.note}</p>` : "") +
      `<p class="pick-test"><b>Check it yourself:</b> ${s.proof}</p>` +
      `<div class="pick-foot">` +
        (c
          ? `<span class="tag" style="border-color:${c.tone};color:${c.tone}">${c.name}</span>`
          : `<span class="tag">outside the census method</span>`) +
        `<a class="maplink" href="https://maps.apple.com/?q=${q}" target="_blank" rel="noopener">Open in Maps →</a>` +
      `</div>` +
    `</div>`;
  return d;
}

function renderPicks(spots, note) {
  const host = el("picks");
  host.replaceChildren();
  el("picks-note").textContent = note || "";

  const bySlot = new Map();
  for (const item of spots) {
    const k = item.s.slot || "everyday";
    if (!bySlot.has(k)) bySlot.set(k, []);
    bySlot.get(k).push(item);
  }

  for (const [key, title, hint] of SLOTS) {
    const group = bySlot.get(key);
    if (!group || !group.length) continue;
    const head = document.createElement("div");
    head.className = "slot-head";
    head.innerHTML = `<h3>${title}</h3><span>${hint}</span>`;
    host.appendChild(head);
    const grid = document.createElement("div");
    grid.className = "slot-grid";
    for (const { s, c, d } of group) grid.appendChild(pickCard(s, c, d));
    host.appendChild(grid);
    bySlot.delete(key);
  }
  // anything with an unrecognised slot still gets shown
  for (const group of bySlot.values()) {
    const grid = document.createElement("div");
    grid.className = "slot-grid";
    for (const { s, c, d } of group) grid.appendChild(pickCard(s, c, d));
    host.appendChild(grid);
  }
}

// Cravings group by the thing you want, not by use-case slot — the question
// here is "where is the best X", which is a different question from the one the
// community pages answer.
function renderCravings() {
  const host = el("picks");
  host.replaceChildren();
  el("picks-note").textContent =
    `${CRAVINGS.length} places, by what you're after`;

  for (const s of CRAVINGS) {
    const head = document.createElement("div");
    head.className = "slot-head";
    head.innerHTML = `<h3>${s.craving}</h3><span>best in L.A. at this one thing</span>`;
    host.appendChild(head);
    const grid = document.createElement("div");
    grid.className = "slot-grid";
    grid.appendChild(pickCard(s, null, null));
    host.appendChild(grid);
  }
}

const everySpot = () => COMMUNITIES.flatMap((c) => c.spots.map((s) => ({ s, c })));

// Use-case slots, in the order people actually ask. A community shows only the
// slots it has a real answer for — an empty slot stays empty rather than being
// padded with a fourth pretty-good restaurant.
const SLOTS = [
  ["market",   "Where the community shops",      "the grocery, not the restaurant"],
  ["value",    "Best for the money",             "cheap and not a compromise"],
  ["everyday", "Where people actually eat",      "the regular, not the destination"],
  ["dish",     "Worth the drive for one thing",  "a specialist"],
  ["occasion", "For an occasion",                "when you're spending"],
  ["late",     "Late",                           "after most kitchens close"],
  ["sweet",    "Bread, sweets, coffee",          "the part restaurants skip"],
  ["civic",    "Not food — the institution",     "why the district exists"],
  ["new",      "New, and it earned it",          "recent, already clears the bar"]
];

// ---------------------------------------------------------------- selection

function select(key, opts = {}) {
  state.active = key;
  state.place = null;
  el("place-result").hidden = true;
  for (const [k, b] of Object.entries(state.rows)) {
    b.setAttribute("aria-pressed", String(k === key));
    if (k === key && b.scrollIntoView) {
      b.scrollIntoView({ block: "nearest", inline: "center" });
    }
  }

  // The cravings section has no geography to paint — these places are here
  // precisely because no measured concentration explains them. Reset the map
  // rather than leaving the previous community's fill under a mismatched list.
  if (key === CRAVING_KEY) {
    state.active = CRAVING_KEY;
    clearPaint();
    state.labels = [];
    fitTo([], 0.04);
    // An empty map on this view is a screenful of nothing that also implies a
    // geographic claim the section explicitly does not make. Hide it.
    setMapHidden(true);
    el("stage-title").textContent = "If you're craving…";
    el("stage-sub").textContent =
      "Best in Los Angeles at one nameable thing, with no census concentration behind it. " +
      "These did not come through the three gates and are not claimed to have.";
    el("stage-stats").replaceChildren();
    el("picks-title").textContent = "Where to go";
    renderCravings();
    renderDetail(null);
    if (opts.scroll) el("stage-title").scrollIntoView({ block: "start", behavior: "smooth" });
    return;
  }

  setMapHidden(false);
  const focus = paintMap();
  fitTo(focus, key ? 0.14 : 0.04);

  const c = key ? byKey(key) : null;
  if (!c) {
    el("stage-title").textContent = "Pick a community";
    el("stage-sub").textContent = "Or type a neighbourhood, city or ZIP code above.";
    el("stage-stats").replaceChildren();
    el("picks-title").textContent = "Where to go";
    renderPicks(everySpot().filter((x) => x.s.slot === "market").slice(0, 4),
    "markets, as a sample — pick a community or search a place for the rest");
    renderDetail(null);
    return;
  }

  const g = state.stats.gates[key] || {};
  const hits = hitsFor(key);
  el("stage-title").textContent = c.name;
  el("stage-sub").textContent = c.region;

  const stats = [];
  if (!c.noCensus) {
    stats.push([fmt(g.la), "in L.A. County"]);
    stats.push([pct(g.share, 2), "of the county"]);
    if (g.oc >= 20000) stats.push([fmt(g.oc), "in Orange County"]);
  }
  if (hits.length) {
    stats.push([pct(Math.max(...hits.map((h) => h.share))), "densest ZIP"]);
    stats.push([Math.max(...hits.map((h) => h.lq)) + "×", "county rate"]);
  } else {
    stats.push(["district", "not concentrated"]);
  }
  el("stage-stats").innerHTML = stats
    .map(([v, l]) => `<div class="sstat"><b>${v}</b><span>${l}</span></div>`).join("");

  el("picks-title").textContent = "Where to go";
  renderPicks(c.spots.map((s) => ({ s, c })), `${c.spots.length} places, by what you need`);
  renderDetail(c);
  if (opts.scroll) el("stage-title").scrollIntoView({ block: "start", behavior: "smooth" });
}

function renderDetail(c) {
  let host = el("detail");
  if (!host) {
    host = document.createElement("div");
    host.id = "detail";
    host.className = "detail";
    el("picks").after(host);
  }
  if (!c) { host.replaceChildren(); return; }
  const hits = hitsFor(c.key);
  host.innerHTML =
    `<p>${c.regionNote}</p>` +
    (c.subnote ? `<p class="sub">${c.subnote}</p>` : "") +
    (hits.length
      ? `<h3>Where it concentrates</h3><div class="zchips">` +
        hits.slice(0, 14).map((h) =>
          `<button class="zchip" data-z="${h.zcta}">${h.zcta} ${placeName(h.zcta)} · ${pct(h.share)}</button>`
        ).join("") + `</div>`
      : "") +
    `<p style="font-size:13px;color:var(--ink-4)">Qualifies on: ${c.gate}. ` +
    `<a href="method.html">What that means, and who didn't qualify</a></p>`;
  host.querySelectorAll(".zchip").forEach((b) => {
    b.onclick = () => { fitTo([b.dataset.z], 1.1, false); hint(b.dataset.z); };
  });
}

// ------------------------------------------------------------------ search

const ACRONYM = { sgv: "SGV", dtla: "DTLA", hifi: "HiFi", ktown: "K-Town", noho: "NoHo" };
const title = (s) =>
  ACRONYM[s] ||
  s.replace(/\b[a-z]/g, (m) => m.toUpperCase())
   .replace(/\bLa\b/g, "L.A.")
   .replace(/\bSgv\b/g, "SGV");

function buildSearchIndex() {
  const idx = [];
  const add = (label, zctas, kind, weight) =>
    idx.push({ label, key: label.toLowerCase(), zctas, kind, weight });

  for (const [name, z] of Object.entries(REGIONS)) add(title(name), z, "region", 3);
  for (const [name, z] of Object.entries(NICKNAMES)) add(title(name), z, "neighbourhood", 2);

  const known = new Set(Object.keys(NICKNAMES));
  const byPlace = {};
  for (const [z, nm] of Object.entries(state.stats.names)) (byPlace[nm] = byPlace[nm] || []).push(z);
  for (const [nm, zs] of Object.entries(byPlace)) {
    if (nm === "Los Angeles" || known.has(nm.toLowerCase())) continue;
    add(nm, zs, "city", 1);
  }
  for (const z of Object.keys(state.stats.cent)) add(z, [z], "ZIP", 4);
  state.index = idx;
}

function searchPlaces(qRaw) {
  const q = qRaw.trim().toLowerCase();
  if (q.length < 2) return [];
  const scored = [];
  for (const it of state.index) {
    let sc = 0;
    if (it.key === q) sc = 100;
    else if (it.key.startsWith(q)) sc = 60;
    else if (it.key.includes(q)) sc = 30;
    if (sc) scored.push({ ...it, score: sc + it.weight });
  }
  scored.sort((a, b) => b.score - a.score || a.label.length - b.label.length);
  return scored.slice(0, 8);
}

function showPlace(p) {
  state.place = p;
  state.active = null;
  for (const b of Object.values(state.rows)) b.setAttribute("aria-pressed", "false");

  const zset = new Set(p.zctas);
  const found = [];
  for (const c of COMMUNITIES) {
    const hs = hitsFor(c.key).filter((h) => zset.has(h.zcta));
    if (hs.length) {
      const n = hs.reduce((t, h) => t + h.n, 0);
      const tot = hs.reduce((t, h) => t + h.tot, 0);
      const share = tot ? n / tot : 0;
      // Expected count uses each ZIP's OWN county base rate. Comparing an Orange
      // County share against the L.A. County rate is what briefly reported
      // Vietnamese in Little Saigon at 40x instead of ~6x.
      const expected = hs.reduce((t, h) => t + h.tot * baseRate(c.key, h.county), 0);
      found.push({ c, agg: { n, share, zips: hs.length,
                             lq: expected ? +(n / expected).toFixed(2) : 0 } });
    } else if (c.districtOnly && c.districts.some((d) => zset.has(d.z))) {
      found.push({ c, agg: null });
    }
  }
  found.sort((a, b) => (b.agg ? b.agg.share : 0) - (a.agg ? a.agg.share : 0));

  clearPaint();
  for (const z of p.zctas) {
    const pth = state.paths[z];
    if (!pth) continue;
    let best = null;
    for (const c of COMMUNITIES) {
      const h = hitsFor(c.key).find((x) => x.zcta === z);
      if (h && (!best || h.lq > best.h.lq)) best = { c, h };
    }
    pth.style.fill = best
      ? mix(best.c.tone, intensity(best.h.share, maxShare(best.c.key)))
      : mix("#6e6e73", 0.2);
    pth.style.stroke = "var(--ink)";
    pth.style.strokeWidth = "1.5";
    pth.setAttribute("class", "z on");
  }
  state.labels = p.zctas.slice(0, 12).map((z) => ({ z, name: placeName(z), small: p.zctas.length > 4 }));
  fitTo(p.zctas, p.zctas.length > 6 ? 0.1 : 0.35);

  const box = el("place-result");
  box.hidden = false;
  box.innerHTML =
    `<p class="pr-sub" style="margin-bottom:10px">${p.kind} · ${p.zctas.length} ZIP code${p.zctas.length === 1 ? "" : "s"} · who lives here, by share of residents</p>` +
    (found.length
      ? `<div class="pr-rows">` + found.map(({ c, agg }) =>
          `<button class="pr-row" data-key="${c.key}">` +
          `<span><span class="pr-dot" style="background:${c.tone}"></span>${c.name}` +
          (agg && agg.zips < p.zctas.length
            ? `<span class="pr-in"> in ${agg.zips} of ${p.zctas.length} ZIPs</span>` : "") +
          `</span>` +
          `<span class="pr-pct">${agg ? pct(agg.share) : "district"}</span>` +
          `<span class="pr-lq">${agg ? agg.lq + "× county" : "designated"}</span>` +
          `</button>`).join("") + `</div>`
      : `<p class="pr-none">No community in this atlas concentrates here — which is the ordinary case in Los Angeles. The places below are the nearest anyway.</p>`);
  box.querySelectorAll(".pr-row").forEach((b) => {
    b.onclick = () => select(b.dataset.key, { scroll: true });
  });

  el("stage-title").textContent = p.label;
  el("stage-sub").textContent = found.length
    ? `${found.length} of the 17 communities ${found.length === 1 ? "has" : "have"} a documented presence here.`
    : "No documented concentration here — showing the closest places instead.";
  el("stage-stats").replaceChildren();

  // centre of the searched area, for "how far away is this place"
  const cs = p.zctas.map((z) => state.stats.cent[z]).filter(Boolean);
  const mid = cs.length
    ? [cs.reduce((t, c) => t + c[0], 0) / cs.length, cs.reduce((t, c) => t + c[1], 0) / cs.length]
    : null;
  const away = (z) => {
    const c = state.stats.cent[z];
    if (!c || !mid) return Infinity;
    return Math.hypot((c[0] - mid[0]) * Math.cos((mid[1] * Math.PI) / 180), c[1] - mid[1]) * 69;
  };

  const here = [], near = [];
  const keys = new Set(found.map((f) => f.c.key));
  for (const { s, c } of everySpot()) {
    if (zset.has(s.z)) here.push({ s, c });
    else if (keys.has(c.key)) near.push({ s, c, d: away(s.z) });
  }
  near.sort((a, b) => a.d - b.d);

  el("picks-title").textContent = here.length ? "Right here" : "Nearest matches";
  renderPicks(
    [...here, ...near.slice(0, Math.max(3, 9 - here.length))],
    here.length
      ? `${here.length} inside these ZIP codes, then the nearest from the same communities`
      : "nothing inside these ZIP codes — nearest first, from the communities that live here"
  );
  renderDetail(null);
}

function wireSearch() {
  const input = el("q"), sug = el("suggest"), clear = el("clear");
  let items = [], cursor = -1;
  const close = () => { sug.hidden = true; cursor = -1; };

  const paint = () => {
    if (!items.length) return close();
    sug.hidden = false;
    sug.innerHTML = items.map((it, i) =>
      `<button type="button" data-i="${i}" aria-selected="${i === cursor}">` +
      `<span>${it.label}</span><span class="s-kind">${it.kind}</span></button>`).join("");
    sug.querySelectorAll("button").forEach((b) => { b.onclick = () => choose(items[+b.dataset.i]); });
  };

  const choose = (it) => {
    if (!it) return;
    input.value = it.label;
    close();
    input.blur();
    showPlace({ label: it.label, zctas: it.zctas, kind: it.kind === "ZIP" ? "ZIP code" : it.kind });
  };

  input.addEventListener("input", () => {
    clear.hidden = !input.value;
    items = searchPlaces(input.value);
    cursor = -1;
    paint();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); cursor = Math.min(cursor + 1, items.length - 1); paint(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); cursor = Math.max(cursor - 1, 0); paint(); }
    else if (e.key === "Enter") { e.preventDefault(); choose(items[cursor >= 0 ? cursor : 0]); }
    else if (e.key === "Escape") close();
  });
  input.addEventListener("focus", () => { if (items.length) paint(); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".search")) close(); });
  el("search-form").addEventListener("submit", (e) => { e.preventDefault(); choose(items[0]); });
  clear.onclick = () => { input.value = ""; clear.hidden = true; items = []; close(); select(null); };
}

// -------------------------------------------------------------------- boot

async function boot() {
  const [stats, geo] = await Promise.all([
    fetch("stats.json").then((r) => r.json()),
    fetch("geo.json").then((r) => r.json())
  ]);
  state.stats = stats;
  state.geo = geo;

  buildMap();
  buildRail();
  buildSearchIndex();
  wireSearch();
  select(null);

  const touch = matchMedia("(hover: none)").matches;
  const sub = document.querySelector(".brand-sub");
  if (sub) {
    sub.textContent = `${COMMUNITIES.length} communities · ${everySpot().length} places · by what you need`;
  }

  el("maphint").textContent = touch
    ? "pinch to zoom · drag to pan · tap a ZIP"
    : "scroll to zoom · drag to pan · tap a ZIP for its numbers";
  addEventListener("resize", () => drawLabels());
}

boot();
