(function () {
  "use strict";

  var script = document.currentScript;
  var workId = script && script.dataset.workId;
  if (!workId) return;

  var STATE_KEY = "wisdom-reader-v1-state";
  var CORRUPT_KEY = "wisdom-reader-v1-corrupt";
  var currentUnitId = null;
  var chapterObserver = null;
  var corruptRecovered = false;
  var initialResumeDone = false;

  function emptyState() {
    return {schemaVersion: 1, activeWorkId: null, works: {}, updatedAt: null};
  }

  function readState() {
    try {
      var raw = localStorage.getItem(STATE_KEY);
      if (!raw) return emptyState();
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.schemaVersion !== 1 || !parsed.works || typeof parsed.works !== "object" || Array.isArray(parsed.works)) throw new Error("Unsupported reading state");
      return parsed;
    } catch (_error) {
      try {
        var broken = localStorage.getItem(STATE_KEY);
        if (broken) localStorage.setItem(CORRUPT_KEY, broken);
        localStorage.removeItem(STATE_KEY);
      } catch (_storageError) {}
      corruptRecovered = true;
      return emptyState();
    }
  }

  function workState(state) {
    var value = state.works[workId];
    return value && typeof value === "object" ? value : {
      status: "unread", unitId: null, completedUnitIds: [], note: "", teachback: "", output: ""
    };
  }

  function writeWork(patch) {
    try {
      var state = readState();
      var prior = workState(state);
      var next = Object.assign({}, prior, patch, {updatedAt: new Date().toISOString()});
      if (!Array.isArray(next.completedUnitIds)) next.completedUnitIds = [];
      next.completedUnitIds = Array.from(new Set(next.completedUnitIds.filter(function (id) { return typeof id === "string"; })));
      state.works[workId] = next;
      state.activeWorkId = next.status === "reading" ? workId : (state.activeWorkId === workId ? null : state.activeWorkId);
      state.updatedAt = next.updatedAt;
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
      updateStatePanel();
      return next;
    } catch (_error) {
      return null;
    }
  }

  function writePosition(unitId) {
    var prior = workState(readState());
    if (["finished", "dropped"].indexOf(prior.status) !== -1) return;
    writeWork({status: "reading", unitId: unitId || prior.unitId});
  }

  function unitIdFromElement(node) {
    if (!node || !node.id) return null;
    if (node.id.indexOf("chapter-") === 0) return node.id.slice(8);
    if (/^p\d+$/.test(node.id)) return node.id;
    return null;
  }

  function requestedUnit() {
    var raw = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (raw.indexOf("chapter-") === 0) return raw.slice(8);
    if (/^p\d+$/.test(raw)) return raw;
    return null;
  }

  function unitBlocks() {
    return Array.from(document.querySelectorAll(".chapterBlock,.paraBlock"));
  }

  function addText(parent, tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function applyMode() {
    var modeLabels = {source: "Original", adapted: "Clean", compare: "Guided", jerry: "Jerry Edition"};
    Array.from(document.querySelectorAll(".modeButton[data-mode]")).forEach(function (item) {
      if (modeLabels[item.dataset.mode]) item.textContent = modeLabels[item.dataset.mode];
    });
    var mode = new URLSearchParams(location.search).get("mode") || "adapted";
    var button = Array.from(document.querySelectorAll(".modeButton[data-mode]")).find(function (item) { return item.dataset.mode === mode; });
    if (button && !button.classList.contains("active")) button.click();
  }

  function ensureChapterPicker() {
    var nav = document.querySelector(".chapterNav");
    if (!nav || nav.closest(".chapterPicker")) return;
    var picker = document.createElement("details");
    picker.className = "chapterPicker";
    var summary = document.createElement("summary");
    summary.textContent = "Chapters";
    nav.parentNode.insertBefore(picker, nav);
    picker.appendChild(summary);
    picker.appendChild(nav);
    nav.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button) return;
      var buttons = Array.from(nav.querySelectorAll("button"));
      var blocks = unitBlocks();
      var block = blocks[buttons.indexOf(button)];
      if (block) showUnit(unitIdFromElement(block), {scroll: true, updateHash: true});
      picker.open = false;
    }, true);
  }

  function ensureReaderBar() {
    var rail = document.querySelector(".sideRail");
    var mode = rail && rail.querySelector(".modeSwitch");
    var picker = rail && rail.querySelector(".chapterPicker");
    if (!rail || !mode || !picker || rail.querySelector(".v5LegacyBar")) return;
    var bar = document.createElement("nav");
    bar.className = "v5LegacyBar";
    bar.setAttribute("aria-label", "Reader controls");
    rail.insertBefore(bar, rail.firstChild);
    bar.appendChild(picker);

    var current = document.createElement("span");
    current.className = "v5LegacyCurrent";
    current.id = "v5LegacyCurrent";
    current.textContent = "Chapter";
    current.setAttribute("aria-live", "polite");
    bar.appendChild(current);

    var options = document.createElement("details");
    options.className = "v5LegacyOptions";
    var summary = document.createElement("summary");
    summary.textContent = "More";
    options.appendChild(summary);
    var body = document.createElement("div");
    body.className = "v5LegacyOptionsBody";
    options.appendChild(body);
    body.appendChild(mode);
    [
      document.querySelector(".readerGuide"),
      document.querySelector(".readerAbout"),
      document.getElementById("wisdomLongState"),
      document.querySelector(".readerPrelude")
    ].forEach(function (item) {
      if (item) body.appendChild(item);
    });
    bar.appendChild(options);
    mode.addEventListener("click", function () { options.open = false; });
  }

  function ensureFocusHeader() {
    var brand = document.querySelector(".wisdomBrand");
    var tabs = document.querySelector(".wisdomTabs");
    if (brand) {
      brand.textContent = "‹ Books";
      brand.href = "/wisdom/books/";
    }
    if (tabs) tabs.hidden = true;
    document.body.classList.add("readerFocusPage");
  }

  function ensureGuideDetails() {
    var guide = document.querySelector(".guideBand");
    if (!guide || guide.closest(".readerGuide")) return;
    var details = document.createElement("details");
    details.className = "readerGuide";
    var summary = document.createElement("summary");
    summary.textContent = "Before you read";
    guide.parentNode.insertBefore(details, guide);
    details.appendChild(summary);
    details.appendChild(guide);
  }

  function ensurePrelude() {
    var note = document.getElementById("readerNoteBand");
    var highlights = document.getElementById("highlights");
    if (!note || note.closest(".readerPrelude")) return;
    var details = document.createElement("details");
    details.className = "readerPrelude";
    var summary = document.createElement("summary");
    summary.textContent = "Context & marked passages";
    note.parentNode.insertBefore(details, note);
    details.appendChild(summary);
    details.appendChild(note);
    if (highlights) details.appendChild(highlights);
  }

  function ensureHeaderDetails() {
    var header = document.querySelector(".readerHeader");
    var subtitle = header && header.querySelector(".subtitle");
    var actions = header && header.querySelector(".headerActions");
    if (!header || header.querySelector(".readerAbout") || (!subtitle && !actions)) return;
    var details = document.createElement("details");
    details.className = "readerAbout";
    var summary = document.createElement("summary");
    summary.textContent = "About this edition";
    details.appendChild(summary);
    if (subtitle) details.appendChild(subtitle);
    if (actions) details.appendChild(actions);
    header.appendChild(details);
  }

  function ensureStatePanel() {
    if (document.getElementById("wisdomLongState")) return;
    var header = document.querySelector(".readerHeader");
    if (!header) return;
    var panel = document.createElement("details");
    panel.className = "wisdomLongState";
    panel.id = "wisdomLongState";
    var summary = document.createElement("summary");
    summary.id = "wisdomLongStateSummary";
    summary.textContent = "Reading state";
    panel.appendChild(summary);
    var body = document.createElement("div");
    body.className = "wisdomLongStateBody";

    var statusLabel = addText(body, "label", "wisdomLongField", "Status");
    statusLabel.htmlFor = "wisdomLongStatus";
    var select = document.createElement("select");
    select.id = "wisdomLongStatus";
    [["reading", "Reading"], ["finished", "Finished"], ["dropped", "Dropped"]].forEach(function (pair) {
      var option = document.createElement("option");
      option.value = pair[0];
      option.textContent = pair[1];
      select.appendChild(option);
    });
    statusLabel.appendChild(select);

    [["wisdomLongNote", "One note", "Only what you want to remember"], ["wisdomLongTeachback", "One idea", "Optional — in your own words"], ["wisdomLongOutput", "One next move", "Optional — practice, conversation, or project move"]].forEach(function (field) {
      var label = addText(body, "label", "wisdomLongField", field[1]);
      label.htmlFor = field[0];
      var area = document.createElement("textarea");
      area.id = field[0];
      area.rows = 2;
      area.maxLength = 5000;
      area.placeholder = field[2];
      label.appendChild(area);
    });

    var save = addText(body, "button", "wisdomLongSave", "Save");
    save.type = "button";
    save.addEventListener("click", function () {
      writeWork({
        status: select.value,
        unitId: currentUnitId,
        note: document.getElementById("wisdomLongNote").value,
        teachback: document.getElementById("wisdomLongTeachback").value,
        output: document.getElementById("wisdomLongOutput").value
      });
      panel.open = false;
    });
    panel.appendChild(body);
    header.insertAdjacentElement("afterend", panel);
    updateStatePanel();
    if (corruptRecovered) {
      var notice = addText(body, "p", "wisdomRecoveryNotice", "Unreadable progress was set aside. This reader started from a clean local state.");
      notice.setAttribute("role", "status");
    }
  }

  function updateStatePanel() {
    var summary = document.getElementById("wisdomLongStateSummary");
    if (!summary) return;
    var current = workState(readState());
    var names = {unread: "Not started", reading: "Reading", finished: "Finished", dropped: "Dropped"};
    var blocks = unitBlocks();
    var completed = Array.isArray(current.completedUnitIds) ? current.completedUnitIds.length : 0;
    summary.textContent = (names[current.status] || "Reading") + " · " + completed + " of " + blocks.length;
    document.getElementById("wisdomLongStatus").value = current.status === "unread" ? "reading" : current.status;
    document.getElementById("wisdomLongNote").value = current.note || "";
    document.getElementById("wisdomLongTeachback").value = current.teachback || "";
    document.getElementById("wisdomLongOutput").value = current.output || "";
  }

  function ensurePager() {
    var list = document.querySelector(".chapterList") || unitBlocks()[0] && unitBlocks()[0].parentElement;
    if (!list || document.getElementById("wisdomUnitPager")) return;
    var pager = document.createElement("nav");
    pager.className = "wisdomUnitPager";
    pager.id = "wisdomUnitPager";
    pager.setAttribute("aria-label", "Chapter progress");
    [["wisdomPrevUnit", "Previous"], ["wisdomCompleteUnit", "Mark read"], ["wisdomNextUnit", "Next"]].forEach(function (entry) {
      var button = addText(pager, "button", "", entry[1]);
      button.type = "button";
      button.id = entry[0];
    });
    list.insertAdjacentElement("afterend", pager);
    document.getElementById("wisdomPrevUnit").addEventListener("click", function () { moveUnit(-1); });
    document.getElementById("wisdomNextUnit").addEventListener("click", function () { moveUnit(1); });
    document.getElementById("wisdomCompleteUnit").addEventListener("click", toggleCurrentComplete);
  }

  function moveUnit(delta) {
    var blocks = unitBlocks();
    var index = blocks.findIndex(function (block) { return unitIdFromElement(block) === currentUnitId; });
    var target = blocks[index + delta];
    if (target) showUnit(unitIdFromElement(target), {scroll: true, updateHash: true});
  }

  function toggleCurrentComplete() {
    if (!currentUnitId) return;
    var current = workState(readState());
    var completed = new Set(Array.isArray(current.completedUnitIds) ? current.completedUnitIds : []);
    if (completed.has(currentUnitId)) completed.delete(currentUnitId); else completed.add(currentUnitId);
    writeWork({
      status: current.status === "unread" ? "reading" : current.status,
      unitId: currentUnitId,
      completedUnitIds: Array.from(completed)
    });
    updatePager();
  }

  function updatePager() {
    var blocks = unitBlocks();
    var index = blocks.findIndex(function (block) { return unitIdFromElement(block) === currentUnitId; });
    var previous = document.getElementById("wisdomPrevUnit");
    var next = document.getElementById("wisdomNextUnit");
    var complete = document.getElementById("wisdomCompleteUnit");
    if (!previous || !next || !complete) return;
    previous.disabled = index <= 0;
    next.disabled = index < 0 || index >= blocks.length - 1;
    var done = (workState(readState()).completedUnitIds || []).indexOf(currentUnitId) !== -1;
    complete.textContent = done ? "Read ✓" : "Mark read";
    complete.setAttribute("aria-pressed", String(done));
    Array.from(document.querySelectorAll(".chapterNav button")).forEach(function (button, buttonIndex) {
      if (buttonIndex === index) button.setAttribute("aria-current", "true"); else button.removeAttribute("aria-current");
    });
    var currentLabel = document.getElementById("v5LegacyCurrent");
    if (currentLabel) currentLabel.textContent = (index >= 0 ? "Chapter " + (index + 1) : "Chapter") + " of " + blocks.length;
  }

  function showUnit(unitId, options) {
    var blocks = unitBlocks();
    if (!blocks.length) return;
    var target = blocks.find(function (block) { return unitIdFromElement(block) === unitId; }) || blocks[0];
    currentUnitId = unitIdFromElement(target);
    blocks.forEach(function (block) { block.hidden = block !== target; });
    if (options && options.updateHash) history.replaceState(null, "", "#" + target.id);
    writePosition(currentUnitId);
    updatePager();
    if (options && options.scroll) requestAnimationFrame(function () { target.scrollIntoView({block: "start"}); });
  }

  function enhanceUnits() {
    var blocks = unitBlocks();
    if (!blocks.length) return;
    ensurePager();
    var saved = workState(readState()).unitId;
    var requested = requestedUnit();
    var shouldScroll = !initialResumeDone && Boolean(requested);
    showUnit(requested || currentUnitId || saved || unitIdFromElement(blocks[0]), {scroll: shouldScroll, updateHash: false});
    initialResumeDone = true;
  }

  function watchRenders() {
    var list = document.querySelector(".chapterList") || unitBlocks()[0] && unitBlocks()[0].parentElement;
    if (!list || !("MutationObserver" in window)) return;
    chapterObserver = new MutationObserver(function () { requestAnimationFrame(enhanceUnits); });
    chapterObserver.observe(list, {childList: true});
  }

  function start() {
    applyMode();
    ensureFocusHeader();
    ensureChapterPicker();
    ensureHeaderDetails();
    ensureGuideDetails();
    ensurePrelude();
    ensureStatePanel();
    ensureReaderBar();
    enhanceUnits();
    watchRenders();
  }

  requestAnimationFrame(function () { requestAnimationFrame(start); });
  window.addEventListener("hashchange", function () { showUnit(requestedUnit(), {scroll: true, updateHash: false}); });
}());
