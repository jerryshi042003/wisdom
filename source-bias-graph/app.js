"use strict";

const APP_REVISION = "20260717-8570d1f4ec90";
const DATA_URL = `data/study-guide.json?v=${APP_REVISION}`;
const STATE_KEY = "jerry.techTwitter.study.v4";
const BACKUP_KEY = "jerry.techTwitter.study.backup.v4";
const LEGACY_STATE_KEY = "jerry.techTwitter.review.v3";
const LEGACY_BACKUP_KEY = "jerry.techTwitter.review.backup.v3";
const QUARANTINE_PREFIX = "jerry.techTwitter.study.corrupt.";
const ROUTES = new Set(["start", "study", "x-map", "dossiers", "method"]);
const LESSON_STATUSES = new Set(["todo", "doing", "done"]);
const PERSON_CHOICES = new Set(["core", "study", "radar", "hidden"]);

const LEGACY_PERSON_IDS = {
  "b2-mitchell-hashimoto": "mitchell-hashimoto",
  "b2-armin-ronacher": "armin-ronacher",
  "b2-simon-willison": "simon-willison",
  "b2-sebastian-raschka": "sebastian-raschka",
  "b2-shreya-shankar": "shreya-shankar",
  "b2-francois-chollet": "francois-chollet",
  "b2-ethan-mollick": "ethan-mollick",
  "b2-hamel-husain": "hamel-husain",
  "b2-amelia-wattenberger": "amelia-wattenberger",
  "b2-peter-steinberger": "peter-steinberger",
  "b2-cindy-sridharan": "cindy-sridharan",
  "b2-swyx": "swyx"
};

const dom = {
  skip: document.querySelector(".skipLink"),
  content: document.querySelector("#content"),
  connection: document.querySelector("#connection"),
  statusBanner: document.querySelector("#statusBanner"),
  dialog: document.querySelector("#personDialog"),
  dialogBody: document.querySelector("#personDialogBody"),
  importInput: document.querySelector("#importInput")
};

let guide = null;
let state = null;
let currentRoute = "start";
let currentSubroute = "";
let widgetPromise = null;
let activeTweetMount = null;
let activeTweetToken = 0;
let statusTimer = 0;

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value) {
  try {
    const url = new URL(value, location.href);
    return url.protocol === "https:" ? url.href : "#";
  } catch {
    return "#";
  }
}

function validateGuide(payload) {
  if (!isPlainObject(payload) || payload.schemaVersion !== 4) throw new Error("Unsupported field-manual data");
  if (!isPlainObject(payload.release) || typeof payload.release.id !== "string") throw new Error("Missing release identity");
  if (!isPlainObject(payload.diagnosis) || !Array.isArray(payload.diagnosis.gaps) || payload.diagnosis.gaps.length < 5) throw new Error("Missing diagnosis");
  if (!Array.isArray(payload.studyPlan) || payload.studyPlan.length < 5) throw new Error("Missing practice plan");
  if (!Array.isArray(payload.people) || payload.people.length < 15) throw new Error("Missing people roster");
  if (!Array.isArray(payload.deepDives) || payload.deepDives.length < 6) throw new Error("Missing deep dives");
  if (!Array.isArray(payload.cuts) || payload.cuts.length < 12) throw new Error("Missing cut ledger");
  if (!Array.isArray(payload.cultureClusters) || payload.cultureClusters.length < 8) throw new Error("Missing culture map");
  const ids = new Set();
  for (const person of payload.people) {
    if (!isPlainObject(person) || typeof person.id !== "string" || ids.has(person.id)) throw new Error("Invalid person roster");
    ids.add(person.id);
    if (!PERSON_CHOICES.has(person.bucket) || !/^https:\/\/x\.com\//.test(person.profileUrl || "")) throw new Error("Invalid person bucket");
  }
  return payload;
}

function validState(value) {
  if (!isPlainObject(value) || value.version !== 4) return false;
  if (!isPlainObject(value.lessons) || !isPlainObject(value.personChoices) || !isPlainObject(value.ui) || !isPlainObject(value.orphans)) return false;
  for (const record of Object.values(value.lessons)) {
    if (!isPlainObject(record) || !LESSON_STATUSES.has(record.status) || typeof record.updatedAt !== "string") return false;
  }
  for (const record of Object.values(value.personChoices)) {
    if (!isPlainObject(record) || !PERSON_CHOICES.has(record.bucket) || typeof record.updatedAt !== "string") return false;
  }
  return typeof value.updatedAt === "string" && typeof value.datasetRevisionSeen === "string";
}

function validLessonRecord(record) {
  return isPlainObject(record) && LESSON_STATUSES.has(record.status) && typeof record.updatedAt === "string";
}

function validPersonChoiceRecord(record) {
  return isPlainObject(record) && PERSON_CHOICES.has(record.bucket) && typeof record.updatedAt === "string";
}

function defaultState() {
  const now = new Date().toISOString();
  return {
    version: 4,
    datasetRevisionSeen: guide.release.id,
    updatedAt: now,
    lessons: Object.fromEntries(guide.studyPlan.map(lesson => [lesson.id, { status: "todo", updatedAt: now, completedAt: null }])),
    personChoices: {},
    ui: { lastRoute: "start", lastDossier: guide.deepDives[0].id },
    orphans: { lessons: {}, people: {}, legacyAnswers: {} }
  };
}

function readRaw(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseRaw(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function quarantine(raw) {
  if (!raw) return;
  try {
    localStorage.setItem(`${QUARANTINE_PREFIX}${Date.now()}`, raw.slice(0, 200000));
  } catch {
    // The visible recovery message is more important than quarantine success.
  }
}

function migrateLegacy() {
  const legacy = parseRaw(readRaw(LEGACY_STATE_KEY)) || parseRaw(readRaw(LEGACY_BACKUP_KEY));
  if (!isPlainObject(legacy) || legacy.version !== 3 || !isPlainObject(legacy.answers)) return null;
  const migrated = defaultState();
  const choiceMap = { follow: "core", useful: "study", skip: "hidden" };
  for (const [legacyId, answer] of Object.entries(legacy.answers)) {
    if (!isPlainObject(answer) || !choiceMap[answer.verdict]) continue;
    const personId = LEGACY_PERSON_IDS[legacyId];
    const record = { bucket: choiceMap[answer.verdict], updatedAt: answer.updatedAt || new Date().toISOString() };
    if (personId) migrated.personChoices[personId] = record;
    else migrated.orphans.legacyAnswers[legacyId] = answer;
  }
  return migrated;
}

function normalizeState(candidate) {
  const knownLessons = new Set(guide.studyPlan.map(item => item.id));
  const knownPeople = new Set(guide.people.map(item => item.id));
  candidate.orphans = isPlainObject(candidate.orphans) ? candidate.orphans : {};
  candidate.orphans.lessons = isPlainObject(candidate.orphans.lessons) ? candidate.orphans.lessons : {};
  candidate.orphans.people = isPlainObject(candidate.orphans.people) ? candidate.orphans.people : {};
  candidate.orphans.legacyAnswers = isPlainObject(candidate.orphans.legacyAnswers) ? candidate.orphans.legacyAnswers : {};

  for (const [id, record] of Object.entries(candidate.lessons)) {
    if (!knownLessons.has(id)) {
      candidate.orphans.lessons[id] = record;
      delete candidate.lessons[id];
    }
  }
  for (const lesson of guide.studyPlan) {
    if (!candidate.lessons[lesson.id] && validLessonRecord(candidate.orphans.lessons[lesson.id])) {
      candidate.lessons[lesson.id] = candidate.orphans.lessons[lesson.id];
    }
    if (candidate.lessons[lesson.id]) delete candidate.orphans.lessons[lesson.id];
    else candidate.lessons[lesson.id] = { status: "todo", updatedAt: new Date().toISOString(), completedAt: null };
  }
  for (const [id, record] of Object.entries(candidate.personChoices)) {
    if (!knownPeople.has(id)) {
      candidate.orphans.people[id] = record;
      delete candidate.personChoices[id];
    }
  }
  for (const person of guide.people) {
    if (!candidate.personChoices[person.id] && validPersonChoiceRecord(candidate.orphans.people[person.id])) {
      candidate.personChoices[person.id] = candidate.orphans.people[person.id];
    }
    if (candidate.personChoices[person.id]) delete candidate.orphans.people[person.id];
  }
  candidate.datasetRevisionSeen = guide.release.id;
  candidate.ui.lastDossier = guide.deepDives.some(item => item.id === candidate.ui.lastDossier) ? candidate.ui.lastDossier : guide.deepDives[0].id;
  return candidate;
}

function loadState() {
  const primaryRaw = readRaw(STATE_KEY);
  const primary = parseRaw(primaryRaw);
  if (validState(primary)) return normalizeState(primary);

  if (primaryRaw) quarantine(primaryRaw);
  const backup = parseRaw(readRaw(BACKUP_KEY));
  if (validState(backup)) {
    showStatus("Saved progress was damaged. The last good backup was restored.", 9000);
    return normalizeState(backup);
  }

  const migrated = migrateLegacy();
  if (migrated) {
    showStatus("Your earlier Follow / Useful / Skip decisions were migrated into the new manual.", 9000);
    return migrated;
  }

  if (primaryRaw) showStatus("Saved progress could not be recovered. A clean local record was started.", 9000);
  return defaultState();
}

function persistState({ backup = true } = {}) {
  state.updatedAt = new Date().toISOString();
  state.datasetRevisionSeen = guide.release.id;
  try {
    if (backup) {
      const priorRaw = localStorage.getItem(STATE_KEY);
      const prior = parseRaw(priorRaw);
      if (validState(prior)) localStorage.setItem(BACKUP_KEY, priorRaw);
    }
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    return true;
  } catch {
    showStatus("Progress could not be saved on this device. The current page still works.", 9000);
    return false;
  }
}

function showStatus(message, duration = 4500) {
  window.clearTimeout(statusTimer);
  dom.statusBanner.textContent = message;
  dom.statusBanner.hidden = false;
  statusTimer = window.setTimeout(() => {
    dom.statusBanner.hidden = true;
  }, duration);
}

function parseRoute() {
  let hash = location.hash.slice(1);
  try {
    hash = decodeURIComponent(hash);
  } catch {
    hash = "start";
  }
  const [candidate, ...parts] = hash.split("/wisdom/").filter(Boolean);
  return { route: ROUTES.has(candidate) ? candidate : "start", subroute: parts.join("/wisdom/") };
}

function setNavigation(route) {
  for (const link of document.querySelectorAll(".chapterNav a[data-route]")) {
    if (link.dataset.route === route) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

function personById(id) {
  return guide.people.find(person => person.id === id);
}

function taskEvidenceById(id) {
  return guide.taskEvidence.find(item => item.id === id);
}

function bucketCopy(bucket) {
  return {
    core: { title: "Core · 90-day home trial", detail: "Repeated current value, exact-lane proof, and a Jerry action. Still sample selectively." },
    study: { title: "Study · search deliberately", detail: "Highly credible, but low cadence, advanced, affiliated, noisy, or project-gated." },
    radar: { title: "Radar · intentionally noisy", detail: "Outages, limits, memes, vocabulary, and discovery. Never final authority." }
  }[bucket];
}

function completedLessons() {
  return guide.studyPlan.filter(item => state.lessons[item.id]?.status === "done").length;
}

function nextLesson() {
  return guide.studyPlan.find(item => state.lessons[item.id]?.status === "doing")
    || guide.studyPlan.find(item => state.lessons[item.id]?.status !== "done")
    || guide.studyPlan[0];
}

function pageIntro(eyebrow, title, lede) {
  return `<header class="pageIntro">
    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
    <h1>${escapeHtml(title)}</h1>
    <p class="lede">${escapeHtml(lede)}</p>
    <div class="releaseLine"><span>Researched through ${escapeHtml(guide.release.asOf)}</span><span>·</span><span>${escapeHtml(guide.release.researchWindow)}</span><span>·</span><span>Editorial snapshot, not a live feed</span></div>
  </header>`;
}

function renderStart() {
  const next = nextLesson();
  const done = completedLessons();
  const evidenceNames = gap => gap.evidenceIds.map(id => taskEvidenceById(id)?.title).filter(Boolean);
  return `${pageIntro("Your diagnosis", "Stop collecting AI posts. Build judgment.", "This is a study plan built from recurring patterns in your recent personal Codex work, then matched to people whose exact lane, evidence habits, incentives, and current feed were audited.")}
    <section class="verdictCard" aria-labelledby="verdictTitle">
      <h2 id="verdictTitle">${escapeHtml(guide.release.headline)}</h2>
      <p>${escapeHtml(guide.release.summary)}</p>
    </section>
    <div class="nextRep">
      <div>
        <small>${done === guide.studyPlan.length ? "Practice loop complete" : "Next substantial rep"}</small>
        <h3>${escapeHtml(next.title)}</h3>
        <p>${escapeHtml(next.output)}</p>
      </div>
      <a class="primaryButton" href="#study/${encodeURIComponent(next.id)}">Open the rep</a>
    </div>
    <section class="sectionBlock" aria-labelledby="strengthsTitle">
      <div class="sectionHead"><h2 id="strengthsTitle">Keep these strengths</h2><p>The curriculum should preserve your curiosity and taste, not train you into a generic engineer.</p></div>
      <div class="strengthGrid">${guide.diagnosis.strengths.map(item => `<article class="strengthCard"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.detail)}</p></article>`).join("")}</div>
    </section>
    <section class="sectionBlock" aria-labelledby="gapsTitle">
      <div class="sectionHead"><h2 id="gapsTitle">The control-layer gaps</h2><p>Hypotheses, not diagnoses of ability. Each includes counterevidence and a transfer test.</p></div>
      <div class="gapList">${guide.diagnosis.gaps.map(gap => `<article class="gapCard">
        <div class="gapTop"><div class="gapLead"><span class="rank">${gap.rank}</span><h3>${escapeHtml(gap.title)}</h3></div><span class="confidence">evidence-backed hypothesis</span></div>
        <p class="gapVerdict">${escapeHtml(gap.verdict)}</p>
        <div class="detailGrid"><div><strong>What recurred</strong><p>${escapeHtml(gap.observed)}</p></div><div><strong>Strength / counterevidence</strong><p>${escapeHtml(gap.counterevidence)}</p></div></div>
        <div class="outputBox"><strong>Transfer test</strong>${escapeHtml(gap.transferTest)}</div>
        <details><summary>Public-safe task evidence</summary><ul class="evidenceList">${evidenceNames(gap).map(name => `<li>${escapeHtml(name)}</li>`).join("")}</ul></details>
        <div class="linkedPeople">${gap.people.map(id => { const person = personById(id); return person ? `<button type="button" class="personChip" data-person-id="${escapeHtml(id)}">${escapeHtml(person.name)}</button>` : ""; }).join("")}</div>
      </article>`).join("")}</div>
    </section>`;
}

function lessonStatusCopy(status) {
  if (status === "doing") return { label: "In progress", action: "Mark practiced", next: "done" };
  if (status === "done") return { label: "Practiced", action: "Reopen rep", next: "doing" };
  return { label: "Not started", action: "Start this rep", next: "doing" };
}

function renderStudy() {
  const done = completedLessons();
  const percentage = Math.round((done / guide.studyPlan.length) * 100);
  return `${pageIntro("Practice, not content", "Five artifacts that build ownership", "Do these in order on real personal work. A tweet never completes a lesson; only the named output and pass condition do.")}
    <div class="progressSummary" aria-label="Practice progress: ${done} of ${guide.studyPlan.length} practiced">
      <span class="progressNumber">${done}/${guide.studyPlan.length}</span>
      <div class="progressTrack"><span style="width:${percentage}%"></span></div>
    </div>
    <section class="sectionBlock lessonList" aria-label="Practice reps">
      ${guide.studyPlan.map(lesson => {
        const record = state.lessons[lesson.id] || { status: "todo" };
        const copy = lessonStatusCopy(record.status);
        return `<article class="lessonCard" id="${escapeHtml(lesson.id)}" data-status="${escapeHtml(record.status)}">
          <div class="lessonTop"><div class="lessonLead"><span class="rank">${lesson.order}</span><h2>${escapeHtml(lesson.title)}</h2></div><span class="statusPill" data-status="${escapeHtml(record.status)}">${copy.label}</span></div>
          <p class="lessonWhy">${escapeHtml(lesson.why)}</p>
          <div class="outputBox"><strong>Ship this</strong>${escapeHtml(lesson.output)}</div>
          <ol class="stepList">${lesson.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
          <div class="doneBox"><strong>Pass condition</strong>${escapeHtml(lesson.doneWhen)}</div>
          <div class="lessonActions">
            <button class="stateButton" type="button" data-progress-id="${escapeHtml(lesson.id)}" data-next="${copy.next}">${copy.action}</button>
            <button class="copyButton" type="button" data-copy-prompt="${escapeHtml(lesson.id)}">Copy the Codex brief</button>
          </div>
        </article>`;
      }).join("")}
    </section>
    <section class="sectionBlock" aria-labelledby="foundationsTitle">
      <div class="sectionHead"><h2 id="foundationsTitle">Use a source when a real gap appears</h2><p>These are better than forcing every software fundamental through Tech Twitter.</p></div>
      <div class="resourceGrid">${guide.foundationsShelf.map(item => `<article class="resourceCard"><h3><a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.why)}</p><a href="#study/${encodeURIComponent(item.practiceId)}">Use in this rep →</a></article>`).join("")}</div>
    </section>`;
}

function renderPersonCard(person) {
  const choice = state.personChoices[person.id]?.bucket;
  return `<article class="personCard">
    <div class="personTop"><div><h3>${escapeHtml(person.name)}</h3><a href="${safeUrl(person.profileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(person.handle)}</a></div>${choice ? `<span class="tag">your ${escapeHtml(choice)}</span>` : ""}</div>
    <p>${escapeHtml(person.whyJerry)}</p>
    <div class="personMeta">${escapeHtml(person.role)} · ${escapeHtml(person.lane)}</div>
    <button class="personOpen" type="button" data-person-id="${escapeHtml(person.id)}">Why admitted, scores, and trust history</button>
  </article>`;
}

function renderXMap() {
  const buckets = ["core", "study", "radar"];
  return `${pageIntro("How Tech Twitter works", "A source graph, not a prestige feed", "Original work moves through replies, reposts, curators, and memes. Attention travels across that graph. Trust does not.")}
    <section class="signalFlow" aria-label="How a Tech Twitter claim spreads">
      <div class="flowNode"><strong>Original work</strong><p>Code, paper, benchmark, incident, or firsthand workflow.</p></div>
      <div class="flowNode"><strong>Conversation</strong><p>Replies, corrections, counterexamples, and quote-post context.</p></div>
      <div class="flowNode"><strong>Curator</strong><p>A connected person compresses or amplifies the edge.</p></div>
      <div class="flowNode"><strong>Viral demo / meme</strong><p>Maximum reach, minimum context. Go back upstream.</p></div>
    </section>
    <section class="sectionBlock" aria-labelledby="listsTitle">
      <div class="sectionHead"><h2 id="listsTitle">Jerry's three-list portfolio</h2><p>Best for Jerry within this July 2026 coverage—not “best of all Twitter.” No X List or follow action was taken.</p></div>
      <div class="bucketStack">${buckets.map(bucket => {
        const people = guide.people.filter(person => person.bucket === bucket);
        const copy = bucketCopy(bucket);
        return `<section class="bucketSection"><header class="bucketHeader" data-bucket="${bucket}"><span class="bucketLabel">${people.length}</span><div><h3>${escapeHtml(copy.title)}</h3><p>${escapeHtml(copy.detail)}</p></div><button class="smallButton" type="button" data-copy-handles="${bucket}">Copy handles</button></header><div class="personGrid">${people.map(renderPersonCard).join("")}</div></section>`;
      }).join("")}</div>
    </section>
    <section class="sectionBlock" aria-labelledby="cultureTitle">
      <div class="sectionHead"><h2 id="cultureTitle">Eight roles in the culture</h2><p>Jerry does not need to use Tech Twitter to understand what each layer produces and how it can mislead.</p></div>
      <div class="clusterGrid">${guide.cultureClusters.map(cluster => `<article class="clusterCard"><span class="tag">${escapeHtml(cluster.examples)}</span><h3>${escapeHtml(cluster.name)}</h3><p>${escapeHtml(cluster.postType)}</p><strong class="gain">Useful for</strong><p>${escapeHtml(cluster.gain)}</p><strong class="risk">Never confuse with</strong><p>${escapeHtml(cluster.risk)}</p><strong>Jerry's read rule</strong><p>${escapeHtml(cluster.readRule)}</p></article>`).join("")}</div>
    </section>`;
}

function renderDossiers(selectedId) {
  const selected = guide.deepDives.find(item => item.id === selectedId) || guide.deepDives.find(item => item.id === state.ui.lastDossier) || guide.deepDives[0];
  const person = personById(selected.personId);
  if (state.ui.lastDossier !== selected.id) {
    state.ui.lastDossier = selected.id;
  }
  return `${pageIntro("Five layers, every time", "Six cases worth remembering", "Each case moves from the exact claim through recent recurrence, owned work, counterevidence and incentive, then ends with what Jerry can honestly do.")}
    <nav class="dossierTabs" aria-label="Deep-dive cases">${guide.deepDives.map(item => `<a class="dossierTab" href="#dossiers/${encodeURIComponent(item.id)}" ${item.id === selected.id ? 'aria-current="page"' : ""} data-dossier-id="${escapeHtml(item.id)}">${escapeHtml(item.title)}</a>`).join("")}</nav>
    <article aria-labelledby="dossierTitle">
      <header class="dossierHero"><p class="eyebrow">${escapeHtml(person?.name || "Case study")} · ${escapeHtml(person?.role || "")}</p><h1 id="dossierTitle">${escapeHtml(selected.title)}</h1><p>${escapeHtml(selected.source.paraphrase)}</p></header>
      <section class="sourceCard" aria-labelledby="sourceTitle">
        <div class="sourceTop"><div><span class="sourceDate">X source · ${escapeHtml(selected.source.date)}</span><h3 id="sourceTitle">Saved context first, live conversation second</h3></div><a href="${safeUrl(selected.source.url)}" target="_blank" rel="noopener noreferrer">Open on X ↗</a></div>
        <p>${escapeHtml(selected.source.paraphrase)}</p>
        <div class="tweetActions"><button class="tweetButton" type="button" data-load-tweet="${safeUrl(selected.source.url)}" ${navigator.onLine ? "" : "disabled"}>${navigator.onLine ? "Load live X post + conversation" : "Offline · saved context is ready"}</button><button class="smallButton" type="button" data-person-id="${escapeHtml(selected.personId)}">Open person judgment</button></div>
        <div class="tweetStatus" role="status"></div><div class="tweetMount" aria-live="polite"></div>
      </section>
      <section class="sectionBlock layerList" aria-label="Five evidence layers">${selected.layers.map(layer => `<article class="layerCard"><h3>${escapeHtml(layer.label)}</h3><p>${escapeHtml(layer.text)}</p></article>`).join("")}</section>
      <section class="sectionBlock" aria-labelledby="caseSources"><div class="sectionHead"><h2 id="caseSources">Open the underlying evidence</h2><p>These links are the reason this is more than a tweet summary.</p></div><ul class="linkList">${selected.links.map(link => `<li><a href="${safeUrl(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a></li>`).join("")}</ul></section>
    </article>`;
}

function refreshPrompt() {
  return `Run a substantial read-only refresh of Jerry's AI Field Manual. Do not search only the keywords I mention. Start from the current Core, Study, Radar, and cut ledger; traverse home feed, profiles, replies, quote-posts, repost targets, owned artifacts, peers, counterevidence, and deliberately different culture lanes. For every candidate, prove five layers: (1) exact claim and conversation, (2) current-feed recurrence and noise, (3) owned/official/primary proof in the exact lane, (4) network provenance, counterevidence, affiliations and incentives, and (5) Jerry activation—no-build lesson, prerequisites, smallest real action, and transfer test. A repost transfers zero trust. Popularity is culture context, not authority. Keep a dated trust-event history and account for every cut. Review recent personal Codex work only for public-safe recurring patterns; store no raw transcripts or work data. Update the bounded study-guide data, run deterministic validation and mobile/offline/PWA tests, deploy the exact revision through main, verify production, and email Jerry only after proof. Make no X account writes.`;
}

function renderMethod() {
  return `${pageIntro("Accountable curation", "Why someone enters—and why someone is cut", "Reputation, one-post usefulness, feed usefulness, independence, and Jerry readiness stay separate. There is no composite prestige score.")}
    <section class="sectionBlock" aria-labelledby="coverageTitle"><div class="sectionHead"><h2 id="coverageTitle">Coverage, not false exhaustiveness</h2><p>${escapeHtml(guide.methodology.selectionQuestion)}</p></div><div class="coverageGrid">${guide.release.coverage.map(item => `<article class="coverageCard"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span><p>${escapeHtml(item.detail)}</p></article>`).join("")}</div></section>
    <section class="sectionBlock" aria-labelledby="layersTitle"><div class="sectionHead"><h2 id="layersTitle">The five admission layers</h2><p>Every deep dive must survive all five; a famous repost can satisfy none of them by itself.</p></div><div class="methodGrid">${guide.methodology.fiveLayers.map((layer, index) => `<article class="methodCard"><span class="rank">${index + 1}</span><h3>${escapeHtml(layer.name)}</h3><p>${escapeHtml(layer.test)}</p></article>`).join("")}</div></section>
    <section class="sectionBlock" aria-labelledby="rulesTitle"><div class="sectionHead"><h2 id="rulesTitle">Trust rules</h2><p>Ratings move through dated evidence events, not follower count or accumulated tweet volume.</p></div><div class="methodGrid">${guide.methodology.scoreRules.map(rule => `<article class="ruleCard"><p>${escapeHtml(rule)}</p></article>`).join("")}</div></section>
    <section class="sectionBlock" aria-labelledby="taskTitle"><div class="sectionHead"><h2 id="taskTitle">Recent Codex coverage</h2><p>Only privacy-safe patterns are retained. No thread UUIDs, transcripts, corporate context, or private invention details are in this public app.</p></div><div class="methodGrid">${guide.taskEvidence.map(item => `<article class="methodCard"><span class="sourceDate">${escapeHtml(item.date)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p></article>`).join("")}</div></section>
    <section class="sectionBlock" aria-labelledby="cutsTitle"><div class="sectionHead"><h2 id="cutsTitle">The complete cut ledger</h2><p>Every person removed from the July 14 active roster, plus the two earlier non-AI admission errors. Cut means “does not earn recurring Jerry attention,” not “bad person.”</p></div><div class="cutList">${guide.cuts.map(item => `<article class="cutCard"><h3>${escapeHtml(item.name)} <span>${escapeHtml(item.handle)}</span></h3><p class="cutCategory">${escapeHtml(item.category)}</p><div class="cutGrid"><div><strong>Why considered</strong><p>${escapeHtml(item.whyConsidered)}</p></div><div><strong>Why cut</strong><p>${escapeHtml(item.whyCut)}</p></div><div><strong>What survives</strong><p>${escapeHtml(item.retain)}</p></div></div></article>`).join("")}</div></section>
    <section class="sectionBlock" aria-labelledby="refreshTitle"><div class="sectionHead"><h2 id="refreshTitle">Who updates this</h2><p>The static app does not scrape X in the background.</p></div><article class="statePanel"><h3>${escapeHtml(guide.methodology.refresh.owner)}</h3><p><strong>Cadence:</strong> ${escapeHtml(guide.methodology.refresh.cadence)}</p><p><strong>Privacy:</strong> ${escapeHtml(guide.methodology.refresh.privacy)}</p><p><strong>Read-only boundary:</strong> ${escapeHtml(guide.methodology.refresh.noWrites)}</p><div class="stateActions"><button class="copyButton" type="button" data-copy-refresh>Copy the full Codex refresh brief</button></div></article></section>
    <section class="sectionBlock" aria-labelledby="deviceTitle"><div class="sectionHead"><h2 id="deviceTitle">This device's private progress</h2><p>Your practice status and personal people choices stay in this browser. Editorial ratings remain separate.</p></div><article class="statePanel"><h3>${completedLessons()} of ${guide.studyPlan.length} reps practiced</h3><p>Last local update: ${escapeHtml(new Date(state.updatedAt).toLocaleString())}. Export before clearing browser data or moving devices.</p><div class="stateActions"><button class="smallButton" type="button" data-export-state>Export JSON</button><button class="smallButton" type="button" data-import-state>Import JSON</button><button class="smallButton dangerButton" type="button" data-reset-state>Reset private progress</button></div></article></section>
    <section class="sectionBlock" aria-labelledby="limitsTitle"><div class="sectionHead"><h2 id="limitsTitle">What this release does not claim</h2></div><ul class="evidenceList">${guide.release.limits.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`;
}

function renderScores(scores) {
  const labels = { laneCredibility: "Lane credibility", evidenceDiscipline: "Evidence practice", independence: "Independence", jerryFit: "Jerry fit" };
  return Object.entries(labels).map(([key, label]) => {
    const value = Number(scores[key]) || 0;
    return `<div class="scoreItem"><span>${label} · ${value}/5</span><div class="scoreTicks" aria-label="${escapeHtml(label)} ${value} out of 5">${[1, 2, 3, 4, 5].map(tick => `<i class="${tick <= value ? "on" : ""}"></i>`).join("")}</div></div>`;
  }).join("");
}

function openPerson(personId) {
  const person = personById(personId);
  if (!person) return;
  clearActiveTweet();
  const editorial = bucketCopy(person.bucket);
  const choice = state.personChoices[person.id]?.bucket || "";
  const proofs = person.proofs || [person.proof].filter(Boolean);
  dom.dialogBody.innerHTML = `<div class="dialogBody">
    <span class="bucketLabel">Editorial: ${escapeHtml(person.bucket)}</span>
    <h2 id="personDialogTitle">${escapeHtml(person.name)}</h2>
    <a class="dialogHandle" href="${safeUrl(person.profileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(person.handle)} ↗</a>
    <p class="lede">${escapeHtml(person.lane)}</p>
    <section class="dialogSection"><h3>Why this person is legitimate here</h3><p>${escapeHtml(person.whyLegit)}</p><ul class="linkList">${proofs.map(proof => `<li><a href="${safeUrl(proof.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(proof.label)}</a></li>`).join("")}</ul></section>
    <section class="dialogSection"><h3>Why useful to Jerry</h3><p>${escapeHtml(person.whyJerry)}</p><div class="outputBox"><strong>Read rule</strong>${escapeHtml(person.readRule)}</div></section>
    <section class="dialogSection"><h3>Scope and incentive discount</h3><p><strong>Do not infer:</strong> ${escapeHtml(person.doNotInfer)}</p><p><strong>Incentive / noise:</strong> ${escapeHtml(person.incentive)}</p><p><strong>Current feed:</strong> ${escapeHtml(person.feed)}</p>${person.feedAudit ? `<p><strong>Logged sample:</strong> ${person.feedAudit.postsSampled} posts, ${person.feedAudit.usefulOriginals} useful originals · ${escapeHtml(person.feedAudit.window)}. ${escapeHtml(person.feedAudit.note)}</p>` : ""}</section>
    <section class="dialogSection"><h3>Four separate ratings</h3><p>No composite trust score. Popularity contributes zero.</p><div class="scoreGrid">${renderScores(person.scores)}</div></section>
    <section class="dialogSection sourceCard"><div class="sourceTop"><div><span class="sourceDate">Representative · ${escapeHtml(person.representative.date)}</span><h3>${escapeHtml(person.representative.label)}</h3></div><a href="${safeUrl(person.representative.url)}" target="_blank" rel="noopener noreferrer">Open source ↗</a></div><p>${escapeHtml(person.representative.paraphrase)}</p>${/\/status\/\d+/.test(person.representative.url) ? `<div class="tweetActions"><button class="tweetButton" type="button" data-load-tweet="${safeUrl(person.representative.url)}" ${navigator.onLine ? "" : "disabled"}>${navigator.onLine ? "Load live X post + conversation" : "Offline · saved context is ready"}</button></div><div class="tweetStatus" role="status"></div><div class="tweetMount" aria-live="polite"></div>` : ""}</section>
    <section class="dialogSection"><h3>Dated trust history</h3><div class="trustTimeline">${person.trustEvents.map(event => `<div class="trustEvent"><strong>${escapeHtml(event.date)} · ${escapeHtml(event.bucket)}</strong><p>${escapeHtml(event.reason)}</p></div>`).join("")}</div></section>
    <section class="dialogSection"><h3>Your private placement</h3><p>Editorial call: <strong>${escapeHtml(editorial.title)}</strong>. Your choice does not change the public rating.</p><div class="choiceRow">${["core", "study", "radar", "hidden"].map(bucket => `<button class="choiceButton" type="button" data-person-choice="${bucket}" data-choice="${bucket}" data-person="${escapeHtml(person.id)}" aria-pressed="${String(choice === bucket)}">${bucket === "hidden" ? "Hide" : bucket[0].toUpperCase() + bucket.slice(1)}</button>`).join("")}</div></section>
  </div>`;
  if (typeof dom.dialog.showModal === "function") dom.dialog.showModal();
  else dom.dialog.setAttribute("open", "");
}

function closePerson() {
  clearActiveTweet();
  if (dom.dialog.open && typeof dom.dialog.close === "function") dom.dialog.close();
  else dom.dialog.removeAttribute("open");
}

function clearActiveTweet() {
  activeTweetToken += 1;
  if (activeTweetMount) activeTweetMount.replaceChildren();
  activeTweetMount = null;
}

function beforeDeadline(promise, deadline) {
  const remaining = Math.max(0, deadline - Date.now());
  return Promise.race([
    promise,
    new Promise((_, reject) => window.setTimeout(() => reject(new Error("X embed timed out")), remaining))
  ]);
}

function twitterStatusId(url) {
  return String(url).match(/\/status\/(\d+)/)?.[1] || "";
}

function loadTwitterWidgets() {
  if (!navigator.onLine) return Promise.reject(new Error("Offline"));
  if (widgetPromise) return widgetPromise;
  widgetPromise = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("X widgets did not respond")), 5000);
    const finish = api => {
      window.clearTimeout(timeout);
      resolve(api);
    };
    if (window.twttr?.widgets) {
      window.twttr.ready(finish);
      return;
    }
    if (!window.twttr) window.twttr = { _e: [], ready(callback) { this._e.push(callback); } };
    window.twttr.ready(finish);
    if (document.querySelector("script[data-x-widgets]")) return;
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.dataset.xWidgets = "true";
    script.onerror = () => reject(new Error("X widgets unavailable"));
    document.head.append(script);
  }).catch(error => {
    widgetPromise = null;
    throw error;
  });
  return widgetPromise;
}

async function loadTweet(button) {
  const source = button.closest(".sourceCard") || button.closest(".dialogSection");
  const mount = source?.querySelector(".tweetMount");
  const status = source?.querySelector(".tweetStatus");
  const url = button.dataset.loadTweet;
  if (!mount || !status || !twitterStatusId(url)) return;
  if (!navigator.onLine) {
    status.textContent = "Offline. The saved context above remains available.";
    return;
  }
  clearActiveTweet();
  const token = activeTweetToken;
  activeTweetMount = mount;
  const deadline = Date.now() + 5000;
  button.disabled = true;
  status.textContent = "Loading one live X post and its conversation…";
  const staging = document.createElement("div");
  mount.replaceChildren(staging);
  try {
    const widgets = await beforeDeadline(loadTwitterWidgets(), deadline);
    if (activeTweetToken !== token || activeTweetMount !== mount || !navigator.onLine) return;
    const rendered = await beforeDeadline(widgets.widgets.createTweet(twitterStatusId(url), staging, {
      align: "center",
      conversation: "all",
      dnt: true,
      theme: "light"
    }), deadline);
    if (activeTweetToken !== token || activeTweetMount !== mount || !navigator.onLine) {
      staging.replaceChildren();
      return;
    }
    if (!rendered) throw new Error("Post unavailable");
    status.textContent = "Live X context loaded. The saved explanation remains the editorial record.";
  } catch {
    if (activeTweetToken !== token || activeTweetMount !== mount) return;
    mount.replaceChildren();
    status.textContent = navigator.onLine
      ? "X could not load within five seconds. Use the direct link; the saved context above is complete offline."
      : "Offline. The saved context above remains available.";
    button.disabled = !navigator.onLine;
  }
}

function updateConnectivity() {
  const online = navigator.onLine;
  dom.connection.dataset.online = String(online);
  dom.connection.textContent = online ? "Online" : "Offline manual";
  for (const button of document.querySelectorAll("button[data-load-tweet]")) {
    button.disabled = !online;
    button.textContent = online ? "Load live X post + conversation" : "Offline · saved context is ready";
  }
}

function copyText(text, success) {
  const fallback = () => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    if (!copied) throw new Error("Copy failed");
  };
  const operation = navigator.clipboard?.writeText ? navigator.clipboard.writeText(text) : Promise.resolve().then(fallback);
  operation.then(() => showStatus(success)).catch(() => showStatus("Copy was blocked. Select the text from the exported guide instead.", 7000));
}

function setLessonStatus(id, status) {
  if (!LESSON_STATUSES.has(status) || !state.lessons[id]) return;
  const now = new Date().toISOString();
  state.lessons[id] = { status, updatedAt: now, completedAt: status === "done" ? now : null };
  persistState();
  renderRoute({ preserveScroll: true, persist: false });
  showStatus(status === "done" ? "Practice rep marked complete." : "Practice status updated.");
}

function setPersonChoice(personId, bucket) {
  if (!personById(personId) || !PERSON_CHOICES.has(bucket)) return;
  state.personChoices[personId] = { bucket, updatedAt: new Date().toISOString() };
  persistState();
  openPerson(personId);
  showStatus("Your private placement was saved on this device.");
}

function exportState() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `jerry-ai-field-manual-${guide.release.asOf}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showStatus("Private progress exported as JSON.");
}

async function importState(file) {
  if (!file || file.size > 200000) {
    showStatus("Import rejected. Choose a field-manual JSON export under 200 KB.", 8000);
    return;
  }
  try {
    const candidate = JSON.parse(await file.text());
    if (!validState(candidate)) throw new Error("Invalid state");
    const previous = state;
    state = normalizeState(candidate);
    if (!persistState()) {
      state = previous;
      throw new Error("Storage unavailable");
    }
    renderRoute({ preserveScroll: true, persist: false });
    showStatus("Private progress imported and validated.");
  } catch {
    showStatus("Import rejected. Your current progress was not changed.", 8000);
  } finally {
    dom.importInput.value = "";
  }
}

function resetState() {
  const confirmed = window.confirm("Reset practice progress and your private people placements on this device? Editorial research will remain unchanged.");
  if (!confirmed) return;
  const prior = state;
  state = defaultState();
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(prior));
  } catch {
    // Reset can still proceed in memory.
  }
  persistState({ backup: false });
  renderRoute({ preserveScroll: true, persist: false });
  showStatus("Private progress reset. The previous valid state remains in backup.");
}

function renderRoute({ preserveScroll = false, persist = true, focusContent = false } = {}) {
  if (!guide || !state) return;
  const before = window.scrollY;
  const { route, subroute } = parseRoute();
  currentRoute = route;
  currentSubroute = subroute;
  clearActiveTweet();
  closePerson();
  setNavigation(route);
  state.ui.lastRoute = route;
  if (route === "study") dom.content.innerHTML = renderStudy();
  else if (route === "x-map") dom.content.innerHTML = renderXMap();
  else if (route === "dossiers") dom.content.innerHTML = renderDossiers(subroute);
  else if (route === "method") dom.content.innerHTML = renderMethod();
  else dom.content.innerHTML = renderStart();
  if (persist) persistState();
  document.title = `${route === "start" ? "Jerry's AI Field Manual" : `${document.querySelector('.chapterNav a[aria-current="page"]')?.textContent.trim() || "Field Manual"} · AI Field Manual`}`;
  updateConnectivity();
  requestAnimationFrame(() => {
    if (focusContent) dom.content.focus({ preventScroll: true });
    if (preserveScroll) window.scrollTo({ top: before, behavior: "auto" });
    else if (route === "study" && subroute) document.getElementById(subroute)?.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: 0, behavior: "auto" });
  });
}

document.addEventListener("click", event => {
  const personButton = event.target.closest("[data-person-id]");
  if (personButton) {
    openPerson(personButton.dataset.personId);
    return;
  }
  if (event.target.closest("[data-close-dialog]")) {
    closePerson();
    return;
  }
  const progress = event.target.closest("[data-progress-id]");
  if (progress) {
    setLessonStatus(progress.dataset.progressId, progress.dataset.next);
    return;
  }
  const lessonPrompt = event.target.closest("[data-copy-prompt]");
  if (lessonPrompt) {
    const lesson = guide.studyPlan.find(item => item.id === lessonPrompt.dataset.copyPrompt);
    if (lesson) copyText(lesson.codexPrompt, "Codex brief copied.");
    return;
  }
  const handles = event.target.closest("[data-copy-handles]");
  if (handles) {
    const text = guide.people.filter(person => person.bucket === handles.dataset.copyHandles).map(person => person.handle).join(" ");
    copyText(text, `${bucketCopy(handles.dataset.copyHandles).title} handles copied. No X action was taken.`);
    return;
  }
  const dossier = event.target.closest("[data-dossier-id]");
  if (dossier) {
    event.preventDefault();
    location.hash = `#dossiers/${encodeURIComponent(dossier.dataset.dossierId)}`;
    return;
  }
  const tweet = event.target.closest("[data-load-tweet]");
  if (tweet) {
    loadTweet(tweet);
    return;
  }
  const choice = event.target.closest("[data-person-choice]");
  if (choice) {
    setPersonChoice(choice.dataset.person, choice.dataset.personChoice);
    return;
  }
  if (event.target.closest("[data-copy-refresh]")) {
    copyText(refreshPrompt(), "Full read-only refresh brief copied.");
    return;
  }
  if (event.target.closest("[data-export-state]")) {
    exportState();
    return;
  }
  if (event.target.closest("[data-import-state]")) {
    dom.importInput.click();
    return;
  }
  if (event.target.closest("[data-reset-state]")) resetState();
});

dom.dialog.addEventListener("click", event => {
  if (event.target === dom.dialog) closePerson();
});

dom.skip.addEventListener("click", event => {
  event.preventDefault();
  requestAnimationFrame(() => {
    dom.content.focus({ preventScroll: true });
    dom.content.scrollIntoView({ block: "start" });
  });
});

dom.dialog.addEventListener("cancel", () => clearActiveTweet());
dom.importInput.addEventListener("change", () => importState(dom.importInput.files?.[0]));
window.addEventListener("hashchange", () => renderRoute({ focusContent: true }));
window.addEventListener("online", updateConnectivity);
window.addEventListener("offline", () => {
  clearActiveTweet();
  updateConnectivity();
  showStatus("Offline mode: every chapter and saved explanation still works; live X is paused.");
});

async function start() {
  updateConnectivity();
  try {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Data returned ${response.status}`);
    guide = validateGuide(await response.json());
    state = loadState();
    persistState({ backup: false });
    renderRoute({ persist: false });
  } catch (error) {
    dom.content.innerHTML = `<section class="errorCard"><div><h1>Field manual unavailable</h1><p>The first load needs the versioned study data. If this device has opened the app before, confirm the service worker is active and reload.</p><button class="primaryButton" type="button" onclick="location.reload()">Try again</button><p><small>${escapeHtml(error.message)}</small></p></div></section>`;
  }
}

start();
