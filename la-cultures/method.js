import { COMMUNITIES } from "./communities.js";
import { CREDITS } from "./credits.js";

const BUILT = "29 July 2026";
const REVISED = "2 August 2026";
const el = (id) => document.getElementById(id);
const fmt = (n) => (n == null ? "—" : n.toLocaleString("en-US"));
const pct = (x, d = 0) => (x * 100).toFixed(d) + "%";

const stats = await fetch("stats.json").then((r) => r.json());
const m = stats.meta;

el("rule1").innerHTML = `population &ge; ${fmt(m.MIN_COUNT)}<br>in L.A. County`;
el("rule2").innerHTML =
  `share &ge; ${m.LQ_MIN}&times; the county rate<br>` +
  `or &ge; ${pct(m.MAJORITY)} of the ZIP code<br>` +
  `and &ge; ${fmt(m.MIN_ZCTA_N)} people there`;
el("stamp").innerHTML =
  `${m.vintage} &nbsp;·&nbsp; L.A. County population ${fmt(m.la_total)} ` +
  `&nbsp;·&nbsp; ${Object.keys(stats.cent).length} ZIP code areas mapped<br>` +
  // The July claim ("every business checked") was true on the day and false four
  // weeks later. State what is actually known instead: when it was built, when it
  // was last revised, and that only dated cards carry a fresh check.
  `Compiled ${BUILT}, revised ${REVISED}. Cards showing a <b>checked</b> date were ` +
  `re-verified then; the rest were last checked at compile time.`;

// ------------------------------------------------------------------ ledger

const inAtlas = new Set(COMMUNITIES.map((c) => c.key));
const districtOnly = new Set(COMMUNITIES.filter((c) => c.districtOnly).map((c) => c.key));

const rows = Object.entries(stats.gates)
  .map(([key, g]) => ({ key, ...g }))
  .sort((a, b) => b.la - a.la);

const tbody = document.querySelector("#ledger tbody");
for (const r of rows) {
  const passes = r.gate1 && r.gate2;
  let verdict, cls;
  if (inAtlas.has(r.key) && districtOnly.has(r.key)) { verdict = "in atlas · gate 3"; cls = "in"; }
  else if (inAtlas.has(r.key) && passes) { verdict = "in atlas"; cls = "in"; }
  else if (inAtlas.has(r.key)) { verdict = "in atlas · gate 3"; cls = "in"; }
  else if (passes) { verdict = "passes · no district"; cls = "out"; }
  else if (!r.gate1 && !r.gate2) { verdict = "too small, no place"; cls = "out"; }
  else if (!r.gate1) { verdict = "below scale"; cls = "out"; }
  else { verdict = "no concentration"; cls = "out"; }

  const tr = document.createElement("tr");
  tr.className = passes ? "pass" : "fail";
  tr.innerHTML =
    `<td>${r.label}</td>` +
    `<td class="num">${fmt(r.la)}</td>` +
    `<td class="num">${pct(r.share, 2)}</td>` +
    `<td class="num">${r.gate1 ? "✓" : "·"}</td>` +
    `<td class="num">${r.gate2 ? "✓" : "·"}</td>` +
    `<td class="num">${r.hits.length || "·"}</td>` +
    `<td class="verdict ${cls}">${verdict}</td>`;
  tbody.appendChild(tr);
}

// ----------------------------------------------------------------- credits

const ctb = document.querySelector("#credits tbody");
const entries = Object.entries(CREDITS).sort((a, b) =>
  (a[1].dish || "").localeCompare(b[1].dish || ""));
for (const [slug, c] of entries) {
  const tr = document.createElement("tr");
  const file = c.page
    ? `<a href="${c.page}" target="_blank" rel="noopener">${c.file}</a>`
    : c.file;
  tr.innerHTML =
    `<td>${c.dish || slug}</td><td>${file}</td>` +
    `<td>${c.author || "unknown"}</td><td>${c.licence || ""}</td>`;
  ctb.appendChild(tr);
}
