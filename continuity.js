(function () {
  "use strict";

  const data = window.WISDOM_CONTINUITY_DATA;
  const model = window.WISDOM_CONTINUITY_MODEL;
  const essayState = window.WisdomEssayState;
  const longData = window.WISDOM_V1_DATA;
  const longModel = window.WISDOM_V1_MODEL;
  const LONG_KEY = "wisdom-reader-v1-state";
  const LONG_RECOVERY_KEY = "wisdom-reader-v1-recovery";
  const LONG_CORRUPT_KEY = "wisdom-reader-v1-corrupt";
  const REPORT_MIGRATION_KEY = "wisdom-continuity-reported-state-2026-07-19-2";
  const currentThread = data.threads.find(thread => thread.id === data.currentThreadId) || data.threads[0];
  const $ = id => document.getElementById(id);
  let currentResolution = null;
  let currentLongState = longModel.defaultState();
  let recoveryAnnounced = false;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function externalAttributes(href) {
    return /^https?:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  function announce(message, error) {
    const node = $("globalStatus");
    if (!node) return;
    node.textContent = message;
    node.classList.toggle("errorText", Boolean(error));
  }

  function readLongState() {
    let raw = null;
    try { raw = localStorage.getItem(LONG_KEY); } catch (_error) { return longModel.defaultState(); }
    if (!raw) return longModel.defaultState();
    try {
      return longModel.normalizeState(JSON.parse(raw), longData);
    } catch (_error) {
      try {
        localStorage.setItem(LONG_CORRUPT_KEY, raw);
        localStorage.removeItem(LONG_KEY);
      } catch (_storageError) {}
      if (!recoveryAnnounced) {
        recoveryAnnounced = true;
        window.setTimeout(() => announce("Unreadable book progress was set aside.", true), 0);
      }
      return longModel.defaultState();
    }
  }

  function stateFor(item) {
    const loaded = essayState.getEssay(item.id, item.unitIds || [], item.initialState || null);
    if (loaded.recovered && !recoveryAnnounced) {
      recoveryAnnounced = true;
      window.setTimeout(() => announce("Unreadable essay progress was set aside; nothing was invented.", true), 0);
    }
    return loaded.state;
  }

  function migrateReportedStates() {
    try {
      if (localStorage.getItem(REPORT_MIGRATION_KEY)) return;
      for (const thread of data.threads) {
        for (const item of thread.items.filter(candidate => candidate.reportedStatus === "finished")) {
          const existing = stateFor(item);
          if (existing.status !== "finished") {
            essayState.saveEssay(item.id, {
              ...existing,
              status: "finished",
              evidence: item.initialState?.evidence || existing.evidence
            }, item.unitIds || [], item.initialState || null);
          }
        }
      }
      localStorage.setItem(REPORT_MIGRATION_KEY, "applied");
    } catch (_error) {
      // Canonical initial state still keeps the visible status truthful when storage is unavailable.
    }
  }

  function resolution() {
    return model.resolveThread(currentThread, stateFor);
  }

  function threadStepsHtml() {
    return currentThread.items.map((item, index) => {
      const state = stateFor(item);
      const isDone = state.status === "finished" || state.status === "dropped";
      const isCurrent = currentResolution && currentResolution.index === index;
      const mark = isDone ? "✓" : String(index + 1);
      return `<li class="${isDone ? "isDone" : isCurrent ? "isCurrent" : ""}">
        <span class="stepMark">${mark}</span><span>${escapeHtml(item.title)}</span>
      </li>`;
    }).join("");
  }

  function longWorkHref(work, state) {
    const unit = work.units.find(candidate => candidate.id === state.unitId) || work.units[0];
    const savedMode = work.modes.includes(state.mode) ? state.mode : work.defaultMode;
    const mode = work.modeParams?.[savedMode] || work.modeParams?.[work.defaultMode] || "";
    let href = `/${String(work.readerHref || "").replace(/^\/+/, "")}`;
    if (mode) href += `?mode=${encodeURIComponent(mode)}`;
    if (unit) href += `#chapter-${encodeURIComponent(unit.id)}`;
    return href;
  }

  function activeLongReading() {
    const active = longData.works.find(work => work.id === currentLongState.activeWorkId);
    if (active) {
      const state = longModel.workState(currentLongState, active);
      if (state.status === "reading") return {work: active, state};
    }
    for (const work of longData.works) {
      const state = longModel.workState(currentLongState, work);
      if (state.status === "reading") return {work, state};
    }
    return null;
  }

  function renderLongCurrent(active) {
    const {work, state} = active;
    const unit = work.units.find(candidate => candidate.id === state.unitId) || work.units[0];
    const completed = state.completedUnitIds.length;
    const total = work.units.length;
    const idea = work.path?.strongestIdeas?.[0] || work.path?.whyNow || "Continue from the saved place.";
    const context = work.path?.context?.[0] || work.path?.whyNow || "";
    const source = work.source || {};
    const href = longWorkHref(work, state);
    const savedLayer = work.path?.layer || work.defaultMode;
    const layer = savedLayer === "Teaching Edit" ? "Guided" : savedLayer;

    $("continueTitle").textContent = "Continue";
    $("continueState").textContent = `${completed} of ${total} marked read`;
    $("sessionPanel").hidden = true;
    $("currentWork").innerHTML = `<article class="currentCard currentBookCard">
      <div class="currentMain">
        <p class="currentStatus">${escapeHtml(unit?.title || work.unitLabel || "Saved place")} · ${escapeHtml(layer)}</p>
        <h2>${escapeHtml(work.title)}</h2>
        <p class="currentByline">${escapeHtml(work.person)}</p>
        <p class="currentIdea">${escapeHtml(idea)}</p>
        <a class="primaryAction" href="${escapeHtml(href)}">Continue reading</a>
        <details class="currentContext">
          <summary>Context &amp; source</summary>
          ${context ? `<p>${escapeHtml(context)}</p>` : ""}
          <p><strong>Source:</strong> ${escapeHtml(source.label || "Reader source")} · ${escapeHtml(source.version || "version noted in reader")}</p>
          <p><strong>Counterpoint:</strong> ${escapeHtml(work.path?.counterargument || "No counterargument recorded.")}</p>
        </details>
      </div>
    </article>`;
  }

  function renderCurrent() {
    currentResolution = resolution();
    const container = $("currentWork");
    const stateNode = $("continueState");
    const session = $("sessionPanel");

    const activeLong = activeLongReading();
    if (activeLong) {
      renderLongCurrent(activeLong);
      return;
    }

    $("continueTitle").textContent = currentResolution.mode === "reading" ? "Continue" : "Up next";

    if (currentResolution.mode === "complete") {
      stateNode.textContent = "Tao path complete";
      session.hidden = true;
      container.innerHTML = `<div class="currentCard"><div class="completeThread">
        <p class="currentStatus">Path complete</p>
        <h2>Keep the thread. Choose later.</h2>
        <p>The next author stays parked until you deliberately change course.</p>
      </div></div>`;
      return;
    }

    session.hidden = false;
    const item = currentResolution.item;
    const state = currentResolution.state;
    const mode = currentResolution.mode === "reading" ? "Continue" : "Next in Tao";
    const action = currentResolution.mode === "reading" ? "Continue reading" : `Start ${item.title}`;
    stateNode.textContent = `${currentThread.person} · ${currentResolution.index + 1} of ${currentThread.items.length}`;

    container.innerHTML = `<article class="currentCard">
      <div class="currentMain">
        <p class="currentStatus">${escapeHtml(mode)} · ${escapeHtml(item.time)}</p>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="currentByline">${escapeHtml(currentThread.person)} · ${escapeHtml(item.mode)}</p>
        <p class="currentIdea">${escapeHtml(item.centralIdea)}</p>
        <a class="primaryAction" href="${escapeHtml(item.href)}"${externalAttributes(item.href)} data-start-current>${escapeHtml(action)}</a>
        <details class="currentContext">
          <summary>Context</summary>
          <p>${escapeHtml(item.connectsBack)}</p>
          <p><strong>Source:</strong> ${escapeHtml(item.sourceLabel)} · ${escapeHtml(item.sourceVersion)}</p>
          <p><strong>Counterpoint:</strong> ${escapeHtml(item.counterweight)}</p>
        </details>
      </div>
      <details class="threadSummary">
        <summary>${escapeHtml(currentThread.person)} path · ${currentResolution.index + 1} of ${currentThread.items.length}</summary>
        <div class="threadSummaryBody" aria-label="Terence Tao reading path">
          <p class="threadMemory">${escapeHtml(currentThread.rememberPerson)}</p>
          <ol class="threadSteps">${threadStepsHtml()}</ol>
        </div>
      </details>
    </article>`;

    populateSession(item, state);
  }

  function populateSession(item, state) {
    $("comprehensionPrompt").textContent = item.comprehension;
    $("sessionStatus").value = state.status === "unread" ? "reading" : state.status;
    $("sessionNote").value = state.note;
    $("sessionTeachBack").value = state.teachBack;
    $("sessionOutput").value = state.output;
    const source = $("openFromReflection");
    source.href = item.href;
    if (/^https?:\/\//.test(item.href)) {
      source.target = "_blank";
      source.rel = "noopener noreferrer";
    } else {
      source.removeAttribute("target");
      source.removeAttribute("rel");
    }
  }

  function completedRecords() {
    const threadCompletions = model.completedThreadItems(currentThread, stateFor).map(({item, state}) => ({
      id: item.id,
      title: item.title,
      person: currentThread.person,
      status: "Finished",
      href: item.href,
      centralIdea: item.centralIdea,
      memoryLabel: state.teachBack || state.note || "No personal note saved"
    }));
    const longCompletions = longData.works.flatMap(work => {
      const state = longModel.workState(currentLongState, work);
      if (state.status !== "finished") return [];
      return [{
        id: work.id,
        title: work.title,
        person: work.person,
        status: "Finished",
        href: longWorkHref(work, state),
        memoryLabel: state.teachback || state.note || "No personal note saved"
      }];
    });
    return [...threadCompletions, ...longCompletions, ...data.completed];
  }

  function recentHtml(item) {
    return `<a class="recentItem" href="${escapeHtml(item.href)}"${externalAttributes(item.href)}>
      <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.person)}</p></div>
      <p class="readState">${escapeHtml(item.status)}</p>
    </a>`;
  }

  function compactReadHtml(item) {
    return `<article class="compactRow"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.person)} · ${escapeHtml(item.status)}</p></div>
      <a href="${escapeHtml(item.href)}"${externalAttributes(item.href)}>Reread</a></article>`;
  }

  function renderCompleted() {
    const completed = completedRecords();
    $("recentList").innerHTML = completed.slice(0, 3).map(recentHtml).join("");
    const earlier = completed.slice(3);
    const panel = $("completed");
    panel.hidden = earlier.length === 0;
    $("completedList").innerHTML = earlier.map(compactReadHtml).join("");
  }

  function renderSecondaryProgress() {
    const rows = [];
    const activeLong = activeLongReading();
    for (const item of data.progressCatalog) {
      if (item.stateSource === "known") {
        if (item.workId) {
          const work = longData.works.find(candidate => candidate.id === item.workId);
          const stored = work && currentLongState.works?.[item.workId];
          if (work && stored) {
            const longState = longModel.workState(currentLongState, work);
            if (longState.status === "finished" || longState.status === "dropped" || activeLong?.work.id === work.id) continue;
            if (longState.status === "reading") {
              rows.push({item, status: `${longModel.progress(currentLongState, work)}% · saved place`});
              continue;
            }
          }
        }
        rows.push({item, status: item.status});
        continue;
      }
      const state = essayState.getEssay(item.id, [], null).state;
      if (state.status === "reading") rows.push({item, status: "In progress"});
    }
    for (const work of longData.works) {
      const state = longModel.workState(currentLongState, work);
      if (state.status !== "reading") continue;
      if (activeLong?.work.id === work.id) continue;
      const unit = work.units.find(candidate => candidate.id === state.unitId) || work.units[0];
      rows.push({
        item: {title: work.title, person: work.person, href: longWorkHref(work, state)},
        status: `${longModel.progress(currentLongState, work)}% · saved place`
      });
    }
    const visible = rows.slice(0, 3);
    const panel = $("secondaryProgress");
    panel.hidden = visible.length === 0;
    if (visible[0]) $("pausedSummary").textContent = visible[0].item.title;
    $("secondaryProgressList").innerHTML = visible.map(({item, status}) => `<article class="compactRow">
      <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.person)} · ${escapeHtml(status)}</p></div>
      <a href="${escapeHtml(item.href)}">Continue</a>
    </article>`).join("");
  }

  function render() {
    currentLongState = readLongState();
    renderCurrent();
    renderCompleted();
    renderSecondaryProgress();
  }

  function saveCurrent(nextState, message) {
    if (!currentResolution?.item) return false;
    const item = currentResolution.item;
    const result = essayState.saveEssay(item.id, nextState, item.unitIds || [], item.initialState || null);
    announce(result.ok ? message : "This browser could not save the reading state.", !result.ok);
    render();
    return result.ok;
  }

  function startCurrent(event) {
    if (!currentResolution?.item || currentResolution.mode === "reading") return;
    const item = currentResolution.item;
    const target = item.href;
    event.preventDefault();
    if (saveCurrent({...currentResolution.state, status: "reading"}, `${item.title} is now in progress.`)) {
      window.location.href = target;
    }
  }

  function saveSession() {
    if (!currentResolution?.item) return;
    const next = {
      ...currentResolution.state,
      status: $("sessionStatus").value,
      note: $("sessionNote").value,
      teachBack: $("sessionTeachBack").value,
      output: $("sessionOutput").value
    };
    const message = next.status === "finished"
      ? "Finished saved. The next Tao essay is ready."
      : next.status === "dropped"
        ? "Dropped. Nothing was inferred about why."
        : "Reading progress saved.";
    if (saveCurrent(next, message)) $("sessionPanel").open = false;
  }

  function restoreRaw(key, value) {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }

  function exportState() {
    try {
      const bundle = {
        schemaVersion: 1,
        kind: "wisdom-continuity-state",
        exportedAt: new Date().toISOString(),
        essays: JSON.parse(essayState.exportJson()),
        longWorks: readLongState()
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {type: "application/json"});
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = "wisdom-reading-state.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
      announce("Reading progress exported.");
    } catch (error) {
      announce(`Export failed: ${error.message}`, true);
    }
  }

  async function importState(file) {
    try {
      if (!file || file.size > 1_000_000) throw new Error("Choose a Wisdom JSON file under 1 MB");
      const bundle = JSON.parse(await file.text());
      const essayBackupKey = `${essayState.STORAGE_KEY}-backup`;
      const essayCorruptKey = `${essayState.STORAGE_KEY}-corrupt`;
      model.importBundleTransaction(bundle, {
        normalizeLong: value => longModel.normalizeState(value, longData),
        snapshot: () => ({
          essay: localStorage.getItem(essayState.STORAGE_KEY),
          essayBackup: localStorage.getItem(essayBackupKey),
          essayCorrupt: localStorage.getItem(essayCorruptKey),
          longWorks: localStorage.getItem(LONG_KEY),
          longRecovery: localStorage.getItem(LONG_RECOVERY_KEY)
        }),
        writeEssay: value => essayState.importJson(JSON.stringify(value)),
        writeLong: value => {
          const prior = localStorage.getItem(LONG_KEY);
          if (prior) localStorage.setItem(LONG_RECOVERY_KEY, prior);
          localStorage.setItem(LONG_KEY, JSON.stringify(value));
        },
        restore: snapshot => {
          restoreRaw(essayState.STORAGE_KEY, snapshot.essay);
          restoreRaw(essayBackupKey, snapshot.essayBackup);
          restoreRaw(essayCorruptKey, snapshot.essayCorrupt);
          restoreRaw(LONG_KEY, snapshot.longWorks);
          restoreRaw(LONG_RECOVERY_KEY, snapshot.longRecovery);
        }
      });
      announce("Reading progress imported after validation.");
      render();
    } catch (error) {
      announce(`Import rejected: ${error.message}`, true);
    } finally {
      $("importState").value = "";
    }
  }

  function recoverState() {
    let recovered = false;
    try {
      if (essayState.backupAvailable()) {
        essayState.restoreBackup();
        recovered = true;
      }
      const rawLong = localStorage.getItem(LONG_RECOVERY_KEY);
      if (rawLong) {
        const normalized = longModel.normalizeState(JSON.parse(rawLong), longData);
        const current = localStorage.getItem(LONG_KEY);
        if (current) localStorage.setItem(LONG_RECOVERY_KEY, current);
        localStorage.setItem(LONG_KEY, JSON.stringify(normalized));
        recovered = true;
      }
      if (!recovered) throw new Error("No valid previous state exists");
      announce("Previous reading state recovered.");
      render();
    } catch (error) {
      announce(`Recovery unavailable: ${error.message}`, true);
    }
  }

  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-start-current]");
    if (trigger) startCurrent(event);
  });
  $("saveReflection").addEventListener("click", saveSession);
  $("exportState").addEventListener("click", exportState);
  $("importState").addEventListener("change", event => importState(event.target.files[0]));
  $("recoverState").addEventListener("click", recoverState);
  window.addEventListener("pageshow", render);
  window.addEventListener("storage", event => {
    if ([essayState.STORAGE_KEY, LONG_KEY].includes(event.key)) render();
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });

  migrateReportedStates();
  render();
}());
