(function () {
  "use strict";

  const DATA = window.WISDOM_LIBRARY_DEMO;
  const APP = document.getElementById("app");
  const ROUTES = ["home", "people", "listen", "read", "library"];
  const PREFS_KEY = "wisdom-people-library-demo-v1";
  const ESSAY_STATE_KEY = "wisdom-essay-reader-state-v1";
  const LONG_STATE_KEY = "wisdom-reader-v1-state";
  const routeNames = { home: "Home", people: "People", listen: "Listen", read: "Read", library: "Library" };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value && typeof value === "object" ? value : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function loadPrefs() {
    const root = safeJson(PREFS_KEY, { version: 1, sources: {} });
    if (root.version !== 1 || !root.sources || typeof root.sources !== "object") return { version: 1, sources: {} };
    return root;
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function validExternalUrl(raw) {
    try {
      const url = new URL(raw);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch (_error) {
      return null;
    }
  }

  function currentRoute() {
    const route = location.hash.replace(/^#/, "").split("?")[0];
    return ROUTES.includes(route) ? route : "home";
  }

  function linkMarkup(href, label, className) {
    const external = /^https?:\/\//.test(href);
    return `<a class="${escapeHtml(className || "textLink")}" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener"' : ""}>${escapeHtml(label)}</a>`;
  }

  function pageHeader(kicker, title, intro) {
    return `<header class="pageHeader">
      <p class="eyebrow">${escapeHtml(kicker)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(intro)}</p>
    </header>`;
  }

  function artifactCard(item, options) {
    const opts = options || {};
    return `<article class="artifactCard ${opts.compact ? "compactCard" : ""}" data-artifact-id="${escapeHtml(item.id)}">
      <div class="artifactTop">
        <p class="pill">${escapeHtml(item.domain || item.type)}</p>
        <p class="meta">${escapeHtml(item.meta)}</p>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="creator">${escapeHtml(item.creator)}</p>
      <div class="whyBlock">
        <span>Why this is here</span>
        <p>${escapeHtml(item.why)}</p>
      </div>
      <p class="risk"><strong>Possible miss:</strong> ${escapeHtml(item.risk)}</p>
      ${linkMarkup(item.href, item.action, "primaryButton")}
    </article>`;
  }

  function readerCatalog() {
    const entries = [];
    DATA.reads.forEach(function (item) {
      const match = item.href.match(/[?&]essay=([^&]+)/);
      const stateId = match ? decodeURIComponent(match[1]) : item.id.replace(/^essay-/, "");
      entries.push({ id: stateId, stateId: stateId, title: item.title, creator: item.creator, href: item.href, stateType: "essay" });
    });
    DATA.longWorks.forEach(function (group) {
      group.items.forEach(function (item) {
        if (item.stateId) entries.push(item);
      });
    });
    entries.push({ id: "tao-genius", stateId: "tao-genius", title: "Does One Have to Be a Genius to Do Maths?", creator: "Terence Tao", href: "/wisdom/essays/reader/index.html?essay=tao-genius", stateType: "essay" });
    return entries;
  }

  function savedReaderCards() {
    const catalog = readerCatalog();
    const essayRoot = safeJson(ESSAY_STATE_KEY, { schemaVersion: 1, essays: {} });
    const longRoot = safeJson(LONG_STATE_KEY, { schemaVersion: 1, works: {} });
    const cards = [];

    if (essayRoot.schemaVersion === 1 && essayRoot.essays && typeof essayRoot.essays === "object") {
      Object.entries(essayRoot.essays).forEach(function (entry) {
        const id = entry[0];
        const state = entry[1];
        if (!state || state.status !== "reading") return;
        const item = catalog.find(function (candidate) { return candidate.stateId === id && candidate.stateType === "essay"; });
        if (!item) return;
        const completed = Array.isArray(state.completedUnitIds) ? state.completedUnitIds.length : 0;
        cards.push({
          id: "saved-essay-" + id,
          title: item.title,
          creator: item.creator,
          state: "Reading here",
          detail: completed ? `${completed} section${completed === 1 ? "" : "s"} marked complete` : "No sections marked complete yet",
          why: "This status comes from the Wisdom reader on this browser.",
          href: item.href
        });
      });
    }

    if (longRoot.schemaVersion === 1 && longRoot.works && typeof longRoot.works === "object") {
      Object.entries(longRoot.works).forEach(function (entry) {
        const id = entry[0];
        const state = entry[1];
        if (!state || state.status !== "reading") return;
        const item = catalog.find(function (candidate) { return candidate.stateId === id && candidate.stateType === "long"; });
        if (!item) return;
        const lastPlace = state.unitId ? `Last saved place: ${String(state.unitId).replaceAll("-", " ")}` : "Reader opened; no last chapter saved";
        const hash = state.unitId ? `#chapter-${encodeURIComponent(state.unitId)}` : "";
        cards.push({
          id: "saved-long-" + id,
          title: item.title,
          creator: item.creator,
          state: "Reading here",
          detail: lastPlace,
          why: "This is the last chapter or paragraph the reader actually observed on this browser—not a guessed percent.",
          href: item.href + hash
        });
      });
    }
    return cards.sort(function (a, b) { return a.title.localeCompare(b.title); });
  }

  function continuationCards() {
    const prefs = loadPrefs();
    const kafka = DATA.knownContinuations[0];
    const kafkaHref = validExternalUrl(prefs.sources[kafka.sourceKey]);
    const first = Object.assign({}, kafka, {
      href: kafkaHref,
      detail: kafkaHref ? "Exact player linked on this browser" : kafka.detail
    });
    const saved = savedReaderCards();
    const result = [first].concat(saved.slice(0, 2));
    if (result.length === 1) result.push(DATA.knownContinuations[1]);
    return result.slice(0, 3);
  }

  function continuationMarkup(item) {
    const action = item.href
      ? linkMarkup(item.href, "Continue", "primaryButton")
      : `<button class="primaryButton" type="button" data-action="link-kafka">Link current player</button>`;
    return `<article class="continueCard">
      <p class="pill">${escapeHtml(item.state)}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="creator">${escapeHtml(item.creator)}</p>
      <p class="progressTruth">${escapeHtml(item.detail)}</p>
      <p>${escapeHtml(item.why)}</p>
      ${action}
    </article>`;
  }

  function renderHome() {
    const continuations = continuationCards();
    const recs = DATA.home.recommendationIds.map(function (id) { return DATA.artifacts[id]; });
    const discovery = DATA.artifacts[DATA.home.discoveryId];
    const previewNotice = ["localhost", "127.0.0.1"].includes(location.hostname)
      ? `<p class="previewNotice"><strong>Local preview:</strong> this origin cannot see progress saved on the production site. The same code would read it after a same-origin release.</p>`
      : "";
    return `${pageHeader("Today", "Continue something, or choose one earned next step.", "Home stays small. Progress appears only when Wisdom can prove it; discovery is one explicit choice, not the whole archive.")}
      ${previewNotice}
      <section class="sectionBlock" aria-labelledby="continueTitle">
        <div class="sectionHeading">
          <div><p class="eyebrow">Repeated library</p><h2 id="continueTitle">Continue</h2></div>
          <p>Maximum three · same browser only</p>
        </div>
        <div class="continueGrid">${continuations.map(continuationMarkup).join("")}</div>
      </section>
      <section class="sectionBlock" aria-labelledby="recommendTitle">
        <div class="sectionHeading">
          <div><p class="eyebrow">Grounded in what already landed</p><h2 id="recommendTitle">Three reasons to click</h2></div>
          <a href="#people">See the people map →</a>
        </div>
        <div class="artifactGrid">${recs.map(function (item) { return artifactCard(item); }).join("")}</div>
      </section>
      <section class="sectionBlock discoveryBlock" aria-labelledby="discoveryTitle">
        <div class="sectionHeading">
          <div><p class="eyebrow">One step outside the map</p><h2 id="discoveryTitle">New, but worth the risk</h2></div>
          <p>One item only</p>
        </div>
        ${artifactCard(discovery, { compact: true })}
      </section>`;
  }

  function personItemMarkup(item) {
    let action = "";
    if (item.sourceAction === "link-kafka") action = `<button type="button" class="textButton" data-action="link-kafka">${escapeHtml(item.action)} →</button>`;
    else if (item.href) action = linkMarkup(item.href, "Open →", "textLink");
    return `<li>
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
      ${action}
    </li>`;
  }

  function renderPeople() {
    return `${pageHeader("Source map", "Follow people, not a random topic pile.", "Each person keeps three things together: what already landed, the best exact next source, and the rule that prevents over-recommending them.")}
      <div class="peopleGrid">${DATA.people.map(function (person) {
        return `<article class="personCard" id="person-${escapeHtml(person.id)}">
          <p class="pill">${escapeHtml(person.relation)}</p>
          <h2>${escapeHtml(person.name)}</h2>
          <p class="signal">${escapeHtml(person.signal)}</p>
          <ul>${person.items.map(personItemMarkup).join("")}</ul>
          <div class="personRule"><strong>Editorial rule</strong><p>${escapeHtml(person.rule)}</p></div>
        </article>`;
      }).join("")}</div>`;
  }

  function videoCard(item) {
    return `<article class="videoCard" data-video-id="${escapeHtml(item.id)}">
      <a class="videoImage" href="${escapeHtml(item.href)}" target="_blank" rel="noopener" aria-label="Play ${escapeHtml(item.title)} on YouTube">
        <img src="${escapeHtml(item.thumbnail)}" alt="Thumbnail for ${escapeHtml(item.title)}" loading="lazy" />
        <span>${escapeHtml(item.duration)}</span>
      </a>
      <div class="videoBody">
        <p class="connection">${escapeHtml(item.connection)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="creator">${escapeHtml(item.person)} · ${escapeHtml(item.channel)}</p>
        <div class="whyBlock"><span>Why press play</span><p>${escapeHtml(item.why)}</p></div>
        <p class="risk"><strong>Stop rule:</strong> ${escapeHtml(item.stop)}</p>
        ${linkMarkup(item.href, "Play on YouTube", "primaryButton")}
      </div>
    </article>`;
  }

  function renderListen() {
    const prefs = loadPrefs();
    const kafkaHref = validExternalUrl(prefs.sources.kafkaOnTheShore);
    return `${pageHeader("One scrollable queue", "Listen / watch", "Pick before you drive: image, duration, exact person connection, one honest stop rule, then the play link. Opening a link records no progress.")}
      <section class="audioPin">
        <div>
          <p class="eyebrow">Already in progress</p>
          <h2>Kafka on the Shore · audiobook</h2>
          <p>${kafkaHref ? "Your exact player is linked on this browser." : "Wisdom knows the status because you said it; Chrome did not reveal the exact player, so no resume URL is fabricated."}</p>
        </div>
        ${kafkaHref ? linkMarkup(kafkaHref, "Resume audio", "primaryButton") : '<button type="button" class="primaryButton" data-action="link-kafka">Link current player</button>'}
      </section>
      <section class="sectionBlock">
        <div class="sectionHeading"><div><p class="eyebrow">Start here</p><h2>From people you already care about</h2></div><p>${DATA.videos.anchored.length} exact videos</p></div>
        <div class="videoList">${DATA.videos.anchored.map(videoCard).join("")}</div>
      </section>
      <details class="discoveryDrawer">
        <summary><span><strong>Two new-person tests</strong><small>Open only when you want discovery</small></span><span aria-hidden="true">＋</span></summary>
        <div class="videoList discoveryVideos">${DATA.videos.discovery.map(videoCard).join("")}</div>
      </details>`;
  }

  function readRow(item) {
    return `<article class="readRow">
      <div><p class="pill">${escapeHtml(item.domain)}</p><h3>${escapeHtml(item.title)}</h3><p class="creator">${escapeHtml(item.creator)} · ${escapeHtml(item.time)}</p></div>
      <p>${escapeHtml(item.why)}</p>
      ${linkMarkup(item.href, "Read here", "primaryButton")}
    </article>`;
  }

  function renderRead() {
    const featured = DATA.reads.slice(0, 3);
    const more = DATA.reads.slice(3);
    return `${pageHeader("Core artifact", "Read inside Wisdom", "These open as actual internal reading pages. The first three are chosen from known signals or known starts; the rest stay one tap deeper.")}
      <section class="sectionBlock">
        <div class="sectionHeading"><div><p class="eyebrow">Start here</p><h2>Essays with a reason</h2></div><a href="/wisdom/essays/">Open full essay archive →</a></div>
        <div class="readList">${featured.map(readRow).join("")}</div>
      </section>
      <details class="libraryDrawer">
        <summary><span><strong>Three more internal essays</strong><small>Short, domain-separated backups</small></span><span aria-hidden="true">＋</span></summary>
        <div class="readList">${more.map(readRow).join("")}</div>
      </details>
      <section class="storySignal">
        <div><p class="eyebrow">Known story signal</p><h2>Cathedral · Raymond Carver</h2><p>You said it landed. Keep the exact story available; do not turn that into a generic short-story dump.</p></div>
        ${linkMarkup("https://cdn.theatlantic.com/assets/media/files/sept_1981_-_carver_-_cathedral.pdf", "Reread the story", "secondaryButton")}
        ${linkMarkup("/wisdom/short-stories/", "Browse the story shelf", "textLink")}
      </section>`;
  }

  function localStateFor(item) {
    if (!item.stateId) return null;
    if (item.stateType === "essay") {
      const root = safeJson(ESSAY_STATE_KEY, { essays: {} });
      const state = root.essays && root.essays[item.stateId];
      if (!state || state.status === "unread") return null;
      const completed = Array.isArray(state.completedUnitIds) ? state.completedUnitIds.length : 0;
      return `${state.status === "finished" ? "Finished" : "Reading"} · ${completed} section${completed === 1 ? "" : "s"} marked`;
    }
    const root = safeJson(LONG_STATE_KEY, { works: {} });
    const state = root.works && root.works[item.stateId];
    if (!state || state.status === "unread") return null;
    return `${state.status === "finished" ? "Finished" : "Reading"}${state.unitId ? ` · last place ${String(state.unitId).replaceAll("-", " ")}` : ""}`;
  }

  function longWorkRow(item) {
    const local = localStateFor(item);
    return `<li>
      <div><h3>${escapeHtml(item.title)}</h3><p class="creator">${escapeHtml(item.creator)}</p><p>${escapeHtml(item.note)}</p>${local ? `<p class="savedState">${escapeHtml(local)} · this browser</p>` : ""}</div>
      ${linkMarkup(item.href, local && !local.startsWith("Finished") ? "Continue" : "Open", "secondaryButton")}
    </li>`;
  }

  function renderLibrary() {
    return `${pageHeader("Shelves, not a homepage dump", "Library", "Long works live by domain. Reader state stays with the reader. Completed or rejected material is available in Archive without competing for today’s attention.")}
      <div class="libraryGroups">${DATA.longWorks.map(function (group) {
        return `<section class="libraryGroup"><div class="sectionHeading"><div><p class="eyebrow">Domain</p><h2>${escapeHtml(group.domain)}</h2></div><p>${group.items.length} ${group.items.length === 1 ? "home" : "works"}</p></div><ul>${group.items.map(longWorkRow).join("")}</ul></section>`;
      }).join("")}</div>
      <details class="archiveDrawer">
        <summary><span><strong>Archive · previously tried</strong><small>Kept for history; never active recommendations</small></span><span aria-hidden="true">＋</span></summary>
        <ul>${DATA.archive.map(function (item) { return `<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.state)}</span></li>`; }).join("")}</ul>
      </details>
      <section class="reviewBox">
        <p class="eyebrow">How to change the system</p>
        <h2>Give feedback in three sentences</h2>
        <ol><li>Which Home card should leave?</li><li>Which person should get a deeper source map?</li><li>What did you actually start, finish, or reject?</li></ol>
        <p>Agents update one canonical product note and the source data; they do not create another app.</p>
        ${linkMarkup("https://github.com/jerryshi042003/shishi88/blob/codex/wisdom-people-library/projects/wisdom-product-system.md", "Open the product & dev notes", "secondaryButton")}
      </section>`;
  }

  function render() {
    const route = currentRoute();
    const renderers = { home: renderHome, people: renderPeople, listen: renderListen, read: renderRead, library: renderLibrary };
    APP.innerHTML = renderers[route]();
    document.title = `Wisdom · ${routeNames[route]} demo`;
    document.querySelectorAll("[data-route-link]").forEach(function (link) {
      const active = link.dataset.routeLink === route;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    APP.querySelectorAll('[data-action="link-kafka"]').forEach(function (button) {
      button.addEventListener("click", openSourceDialog);
    });
  }

  const dialog = document.getElementById("sourceDialog");
  const form = document.getElementById("sourceForm");
  const sourceUrl = document.getElementById("sourceUrl");
  const sourceError = document.getElementById("sourceError");

  function openSourceDialog() {
    const prefs = loadPrefs();
    sourceUrl.value = prefs.sources.kafkaOnTheShore || "";
    sourceError.textContent = "";
    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  form.addEventListener("submit", function (event) {
    if (event.submitter && event.submitter.value === "cancel") return;
    event.preventDefault();
    const url = validExternalUrl(sourceUrl.value.trim());
    if (!url) {
      sourceError.textContent = "Use a complete http:// or https:// link.";
      return;
    }
    const prefs = loadPrefs();
    prefs.sources.kafkaOnTheShore = url;
    if (!savePrefs(prefs)) {
      sourceError.textContent = "This browser could not save the link.";
      return;
    }
    dialog.close();
    render();
  });

  window.addEventListener("hashchange", function () {
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
    APP.focus({ preventScroll: true });
  });

  if (!location.hash || !ROUTES.includes(currentRoute())) history.replaceState(null, "", "#home");
  render();
})();
