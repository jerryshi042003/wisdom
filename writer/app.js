// Quiet — wiring. The editor engine lives in editor.js; this file is the room
// around it: drafts, panels, counts, export, and the settings that exist.

import { Editor } from "./editor.js";
import { Store } from "./store.js";
import { renderMarkdown } from "./markdown.js";
import { stats, words, WORDS_PER_MINUTE } from "./prose.js";

const $ = (selector) => document.querySelector(selector);

const store = new Store();
const editor = new Editor({
  textarea: $("#input"),
  mirror: $("#mirror"),
  scroller: $("#page"),
  sheet: $("#sheet")
});

const panels = ["drafts", "lens", "notes", "room"];
let saveTimer = 0;
let idleTimer = 0;

// ── Preferences ─────────────────────────────────────────────────────────────

const PREFS = {
  theme: "system",
  typeface: "serif",
  size: "m",
  measure: "normal",
  grain: "sentence",
  focus: false,
  typewriter: false,
  parts: [],
  style: false,
  authorship: false
};

const prefs = { ...PREFS, ...store.prefs };

function applyPrefs() {
  if (prefs.theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", prefs.theme);

  document.body.dataset.typeface = prefs.typeface;
  document.body.dataset.size = prefs.size;
  document.body.dataset.measure = prefs.measure;

  document.body.classList.toggle("typewriter", prefs.typewriter);
  editor.options.typewriter = prefs.typewriter;
  editor.options.focus = prefs.focus ? prefs.grain : "off";
  editor.options.parts = new Set(prefs.parts);
  editor.options.style = prefs.style;
  editor.options.authorship = prefs.authorship;

  for (const button of document.querySelectorAll("[data-mode]")) {
    button.setAttribute("aria-pressed", String(Boolean(prefs[button.dataset.mode])));
  }
  for (const button of document.querySelectorAll("[data-part]")) {
    button.setAttribute("aria-pressed", String(prefs.parts.includes(button.dataset.part)));
  }
  for (const button of document.querySelectorAll("[data-lens]")) {
    button.setAttribute("aria-pressed", String(Boolean(prefs[button.dataset.lens])));
  }
  for (const name of ["theme", "typeface", "size", "measure", "grain"]) {
    for (const button of document.querySelectorAll(`[data-${name}]`)) {
      button.setAttribute("aria-pressed", String(button.dataset[name] === prefs[name]));
    }
  }

  editor.render({ scroll: prefs.typewriter });
}

function setPref(name, value) {
  prefs[name] = value;
  store.prefs = prefs;
  store.persist();
  applyPrefs();
}

// ── Draft lifecycle ─────────────────────────────────────────────────────────

function openDoc(id) {
  const doc = store.open(id) || store.active;
  if (!doc) return;
  editor.load(doc.text, doc.origins);
  refreshTitle();
  refreshCounts();
  renderDrafts();
  editor.textarea.focus();
  editor.textarea.setSelectionRange(0, 0);
  $("#page").scrollTop = 0;
  editor.render({ scroll: prefs.typewriter });
}

function refreshTitle() {
  const title = Store.titleOf(store.active);
  $("#title").textContent = title;
  document.title = `${title} — Quiet`;
}

function relative(iso) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function renderDrafts() {
  const list = $("#draftList");
  list.textContent = "";
  for (const doc of store.ordered()) {
    const item = document.createElement("li");
    item.className = "draftItem";
    if (doc.id === store.activeId) item.setAttribute("aria-current", "true");

    const open = document.createElement("button");
    open.className = "draftOpen";
    open.type = "button";
    const name = document.createElement("span");
    name.className = "draftName";
    name.textContent = Store.titleOf(doc);
    const meta = document.createElement("span");
    meta.className = "draftMeta";
    const count = words(doc.text).length;
    meta.textContent = `${count.toLocaleString()} words · ${relative(doc.updated)}`;
    open.append(name, meta);
    open.addEventListener("click", () => {
      openDoc(doc.id);
      closePanels();
    });

    const kill = document.createElement("button");
    kill.className = "draftKill";
    kill.type = "button";
    kill.textContent = "delete";
    kill.addEventListener("click", () => {
      const label = Store.titleOf(doc);
      if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;
      store.remove(doc.id);
      openDoc(store.activeId);
    });

    item.append(open, kill);
    list.append(item);
  }
}

// ── Counts and notes ────────────────────────────────────────────────────────

function refreshCounts() {
  const text = editor.text;
  // Same counter the Notes panel uses. Two word counts in one interface that
  // disagree by one is worse than either number being slightly wrong.
  const wordCount = words(text).length;
  $("#count").textContent = `${wordCount.toLocaleString()} ${wordCount === 1 ? "word" : "words"}`;
  $("#savedState").textContent = store.failed ? "not saved — storage blocked" : "saved in this browser";
  $("#savedState").classList.toggle("warn", store.failed);
  if (!$("#notes").hidden) renderNotes();
}

function renderNotes() {
  const text = editor.text;
  const summary = stats(text);
  const minutes = summary.minutes;
  const readTime = minutes < 1 ? "under a minute" : `${Math.round(minutes)} min`;

  const rows = [
    ["Words", summary.words.toLocaleString()],
    ["Characters", summary.characters.toLocaleString()],
    ["Sentences", summary.sentences.toLocaleString()],
    ["Paragraphs", summary.paragraphs.toLocaleString()],
    ["Reading time", readTime],
    ["Average sentence", summary.sentences ? `${summary.averageSentence.toFixed(1)} words` : "—"],
    ["Adjectives", summary.words ? `${Math.round((summary.counts.adj / summary.words) * 100)}%` : "—"],
    ["Adverbs", summary.words ? `${Math.round((summary.counts.adv / summary.words) * 100)}%` : "—"],
    ["Typed, not pasted", `${Math.round(editor.authorshipShare() * 100)}%`]
  ];

  const list = $("#statList");
  list.textContent = "";
  for (const [label, value] of rows) {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    list.append(dt, dd);
  }

  const flags = $("#flagList");
  flags.textContent = "";
  $("#flagCount").textContent = String(summary.flags.length);

  if (summary.longestSentence && summary.longestSentence.words > 28) {
    flags.append(
      flagRow(
        `Longest sentence — ${summary.longestSentence.words} words`,
        "long, but long is not wrong; read it aloud and decide",
        summary.longestSentence.start,
        summary.longestSentence.end
      )
    );
  }

  for (const flag of summary.flags.slice(0, 60)) {
    flags.append(flagRow(flag.phrase, flag.note, flag.start, flag.end));
  }

  if (!flags.children.length) {
    const empty = document.createElement("li");
    empty.className = "note";
    empty.textContent = summary.words ? "Nothing flagged." : "Nothing written yet.";
    flags.append(empty);
  }

  $("#readingNote").textContent =
    `Reading time uses ${WORDS_PER_MINUTE} words a minute — the mean silent-reading rate for English prose in Brysbaert's 2019 review of 190 studies, not the round 200 or 250 that writing apps copy from each other.`;
}

function flagRow(phrase, note, start, end) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.className = "flagButton";
  button.type = "button";
  const label = document.createElement("span");
  label.className = "flagPhrase";
  label.textContent = phrase;
  const explain = document.createElement("span");
  explain.className = "flagNote";
  explain.textContent = note;
  button.append(label, explain);
  button.addEventListener("click", () => {
    closePanels();
    editor.select(start, end);
  });
  item.append(button);
  return item;
}

// ── Panels ──────────────────────────────────────────────────────────────────

function closePanels() {
  for (const name of panels) {
    $(`#${name}`).hidden = true;
    const button = $(`#${name}Button`);
    if (button) button.setAttribute("aria-expanded", "false");
  }
  $("#scrim").hidden = true;
}

function togglePanel(name) {
  const panel = $(`#${name}`);
  const wasOpen = !panel.hidden;
  closePanels();
  if (wasOpen) return;
  panel.hidden = false;
  const button = $(`#${name}Button`);
  if (button) button.setAttribute("aria-expanded", "true");
  $("#scrim").hidden = window.innerWidth > 720;
  if (name === "drafts") renderDrafts();
  if (name === "notes") renderNotes();
}

// ── Reading view and export ─────────────────────────────────────────────────

function openReader() {
  $("#readerTitle").textContent = Store.titleOf(store.active);
  $("#readerBody").innerHTML = renderMarkdown(editor.text);
  $("#reader").hidden = false;
  $("#reader").scrollTop = 0;
}

function fileName() {
  const base = Store.titleOf(store.active)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
  return `${base || "draft"}.md`;
}

function exportDraft() {
  const blob = new Blob([editor.text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName();
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Events ──────────────────────────────────────────────────────────────────

editor.onChange = () => {
  refreshTitle();
  refreshCounts();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    store.update(editor.text, editor.origins);
    refreshCounts();
  }, 400);
};

editor.onCaret = () => {
  if (!$("#notes").hidden) return; // the notes panel is not caret-driven
};

// Chrome recedes while typing, returns on any pointer movement or a pause.
function markTyping() {
  document.body.classList.add("typing");
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => document.body.classList.remove("typing"), 2600);
}

editor.textarea.addEventListener("keydown", (event) => {
  if (!event.metaKey && !event.ctrlKey && event.key.length <= 2) markTyping();
});
for (const type of ["mousemove", "pointerdown", "wheel", "touchstart"]) {
  window.addEventListener(type, () => {
    document.body.classList.remove("typing");
    clearTimeout(idleTimer);
  }, { passive: true });
}

for (const button of document.querySelectorAll("[data-mode]")) {
  button.addEventListener("click", () => setPref(button.dataset.mode, !prefs[button.dataset.mode]));
}

for (const button of document.querySelectorAll("[data-part]")) {
  button.addEventListener("click", () => {
    const part = button.dataset.part;
    const next = new Set(prefs.parts);
    if (next.has(part)) next.delete(part);
    else next.add(part);
    setPref("parts", [...next]);
  });
}

for (const button of document.querySelectorAll("[data-lens]")) {
  button.addEventListener("click", () => setPref(button.dataset.lens, !prefs[button.dataset.lens]));
}

for (const name of ["theme", "typeface", "size", "measure", "grain"]) {
  for (const button of document.querySelectorAll(`[data-${name}]`)) {
    button.addEventListener("click", () => setPref(name, button.dataset[name]));
  }
}

$("#draftsButton").addEventListener("click", () => togglePanel("drafts"));
$("#lensButton").addEventListener("click", () => togglePanel("lens"));
$("#notesButton").addEventListener("click", () => togglePanel("notes"));
$("#roomButton").addEventListener("click", () => togglePanel("room"));
$("#scrim").addEventListener("click", closePanels);

for (const button of document.querySelectorAll("[data-close]")) {
  button.addEventListener("click", () => {
    const target = button.dataset.close;
    if (target === "reader") $("#reader").hidden = true;
    else closePanels();
  });
}

$("#newDraft").addEventListener("click", () => {
  store.create("");
  openDoc(store.activeId);
  closePanels();
});

$("#importFile").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  store.create(text);
  openDoc(store.activeId);
  closePanels();
  event.target.value = "";
});

$("#readButton").addEventListener("click", openReader);
$("#exportButton").addEventListener("click", exportDraft);
$("#printButton").addEventListener("click", () => window.print());

document.addEventListener("keydown", (event) => {
  const meta = event.metaKey || event.ctrlKey;

  if (event.key === "Escape") {
    if (!$("#reader").hidden) {
      $("#reader").hidden = true;
      editor.textarea.focus();
      return;
    }
    closePanels();
    return;
  }

  if (!meta) return;
  const key = event.key.toLowerCase();

  if (event.shiftKey && key === "f") {
    event.preventDefault();
    setPref("focus", !prefs.focus);
  } else if (event.shiftKey && key === "t") {
    event.preventDefault();
    setPref("typewriter", !prefs.typewriter);
  } else if (event.shiftKey && key === "n") {
    event.preventDefault();
    store.create("");
    openDoc(store.activeId);
  } else if (key === "enter") {
    event.preventDefault();
    if ($("#reader").hidden) openReader();
    else $("#reader").hidden = true;
  } else if (key === "s") {
    event.preventDefault();
    exportDraft();
  }
});

// Save on the way out; a debounce that never fires is a lost paragraph.
window.addEventListener("beforeunload", () => store.update(editor.text, editor.origins));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") store.update(editor.text, editor.origins);
});

// ── Start ───────────────────────────────────────────────────────────────────

applyPrefs();
openDoc(store.activeId);
refreshTitle();
refreshCounts();
