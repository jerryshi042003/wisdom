(function () {
  "use strict";

  var SOURCE_KEY = "wisdom-private-source:v1:all-that-is-solid";
  var PROGRESS_KEY = "wisdom-private-progress:v1:all-that-is-solid";
  var SYNC_KEY = "wisdom-private-sync:v1:all-that-is-solid";
  var WORK_ID = "all-that-is-solid";
  var syncConfig = document.querySelector('meta[name="wisdom-sync-base"]');
  var SYNC_BASE = syncConfig ? syncConfig.content : "";
  var MAX_FILE_BYTES = 4 * 1024 * 1024;
  var MARKER_SYNC_DELAY = 8000;
  var SECTION_GUIDES = {
    "penguin-preface": "Berman’s 1988 update sharpens the book’s practical standard: modernism matters when it helps ordinary people become agents, not merely objects, of change. His Brasília example makes the political stakes of urban design concrete.",
    "original-preface": "This is the book’s compact emotional key. Modern life offers growth and adventure while dissolving the homes, values, and attachments people need; Berman refuses to simplify that contradiction.",
    "introduction": "Berman defines modernity as a shared experience of permanent transformation, then argues that nineteenth-century writers understood its contradictions more fully than many twentieth-century theories. This is the conceptual map for everything that follows.",
    "faust": "Berman reads Goethe’s Faust as the first great drama of development: the desire to expand human powers escapes private life and becomes a project to remake the world.",
    "faust-developer": "Faust’s final transformation is the book’s central warning. Development can be visionary and genuinely public-minded while still crushing the people and places that stand in its path.",
    "faust-epilogue": "Berman moves from Goethe’s character to modern states, planners, and experts. The useful question is not whether development is good or evil, but who controls it, who pays, and whether ordinary people can shape its ends.",
    "marx": "Berman reunites two ideas often kept apart: economic modernization and artistic modernism. He treats Marx as a writer of lived modern experience, not only as an economist or political theorist.",
    "marx-melting": "The famous melting image is dialectical: capitalism destroys inherited limits and creates extraordinary freedoms, but it also makes every achievement unstable and disposable.",
    "marx-destruction": "Capitalism survives through continual self-revolution. Berman’s point is more unsettling than simple destruction: innovation attacks yesterday’s successful forms precisely because they succeeded.",
    "marx-conclusion": "Berman values Marx less for a final solution than for a way of entering modern contradictions honestly. A humane politics must begin inside modernity rather than fantasizing about escape from it.",
    "baudelaire": "The street becomes Berman’s laboratory. Baudelaire shows how rebuilt cities change inner life, forcing strangers, classes, traffic, beauty, and danger into new encounters.",
    "baudelaire-eyes": "A new boulevard makes social inequality mutually visible. The scene matters because recognition does not automatically create solidarity; it can produce shame, resentment, tenderness, or denial.",
    "baudelaire-macadam": "Losing the artist’s halo is also a gain. Modern art becomes more truthful when it enters ordinary traffic, risk, comedy, and compromised public life instead of claiming purity above them.",
    "baudelaire-highway": "Twentieth-century planning tries to eliminate the street’s conflict by separating people, traffic, work, residence, rich, and poor. Berman argues that this apparent order also removes the public encounters that make democratic urban life possible.",
    "petersburg": "St. Petersburg lets Berman study modernization imposed from above on an underdeveloped society. The city is spectacular and unreal at once, generating both obedience and unusually intense forms of dissent.",
    "petersburg-underground": "The Underground Man is not merely a private neurotic. His humiliating street encounter shows what happens when modern self-consciousness grows faster than public rights and usable forms of action.",
    "petersburg-crystal": "The Crystal Palace is both technological wonder and closed utopia. Berman uses it to distinguish environments that invite continued human change from perfect systems that leave their inhabitants nothing to do.",
    "petersburg-biely": "Biely’s fractured novel turns political confusion into form. Its modernism is useful because it helps people recognize and resist the absurd systems they inhabit rather than merely celebrating chaos.",
    "new-york": "The final chapter brings the argument home. New York’s buildings, roads, neighborhoods, and demolitions are not background; they are public symbols that organize what kinds of life people can imagine.",
    "new-york-moses": "Robert Moses embodies Faustian development in Berman’s own city. The Cross-Bronx story is strongest when read as both public history and self-critique: the drive to escape old neighborhoods also helped make their destruction possible.",
    "new-york-1960s": "Jane Jacobs and the street movements offer an alternative modernism built from everyday urban complexity rather than expert control. The point is not nostalgia; it is development that treats lived social intelligence as real knowledge.",
    "new-york-1970s": "With endless expansion no longer credible, modernists turn toward memory, home, and repair. Berman ends without promising stability: making a home in modernity means preserving human bonds while accepting that every form remains open to change."
  };

  var installCard = document.getElementById("installCard");
  var bookFile = document.getElementById("bookFile");
  var chapter = document.getElementById("chapter");
  var chapterNumber = document.getElementById("chapterNumber");
  var chapterTitle = document.getElementById("chapterTitle");
  var chapterBody = document.getElementById("chapterBody");
  var sectionGuide = document.getElementById("sectionGuide");
  var sectionGuideText = document.getElementById("sectionGuideText");
  var chapterActions = document.getElementById("chapterActions");
  var previousChapter = document.getElementById("previousChapter");
  var markChapter = document.getElementById("markChapter");
  var nextChapter = document.getElementById("nextChapter");
  var privateControls = document.getElementById("privateControls");
  var removeBook = document.getElementById("removeBook");
  var syncBar = document.getElementById("syncBar");
  var syncSummary = document.getElementById("syncSummary");
  var sharePairing = document.getElementById("sharePairing");
  var chapterNav = document.getElementById("chapterNav");
  var menuProgress = document.getElementById("menuProgress");
  var readerMenu = document.getElementById("readerMenu");
  var readerLocation = document.getElementById("readerLocation");
  var readerStatus = document.getElementById("readerStatus");
  var book = loadJson(SOURCE_KEY);
  var progress = normalizeProgress(loadJson(PROGRESS_KEY));
  var syncIdentity = loadJson(SYNC_KEY);
  var scrollTimer = null;
  var markerTimer = null;
  var syncBusy = false;
  var markerQueued = false;
  var syncLayer = window.WisdomPrivateSync;
  var libraryLayer = window.WisdomPrivateLibrary;
  var libraryRoot = libraryLayer ? libraryLayer.load() : null;
  var parserLayer = window.WisdomBermanParser;
  var syncClient = SYNC_BASE && window.WisdomPrivateSyncClient && syncLayer ?
    window.WisdomPrivateSyncClient.create({
      cryptoLayer: syncLayer,
      fetchImpl: window.fetch.bind(window),
      baseUrl: SYNC_BASE
    }) : null;

  function loadJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); }
    catch (error) { return null; }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function parseBerman(raw) {
    if (!parserLayer) throw new Error("The private reader parser did not load");
    return parserLayer.parse(raw);
  }

  function validBook(value) {
    return !!parserLayer && parserLayer.validBook(value);
  }

  function normalizeProgress(value) {
    value = value && typeof value === "object" ? value : {};
    return {
      unitId: typeof value.unitId === "string" ? value.unitId : "penguin-preface",
      completed: Array.isArray(value.completed) ? value.completed.filter(function (id) { return typeof id === "string"; }) : [],
      offsets: value.offsets && typeof value.offsets === "object" ? value.offsets : {},
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : ""
    };
  }

  function saveProgress(touch) {
    if (touch !== false) progress.updatedAt = new Date().toISOString();
    saveJson(PROGRESS_KEY, progress);
    if (touch !== false) scheduleMarkerSync();
  }

  function activeIndex() {
    var index = book.units.findIndex(function (unit) { return unit.id === progress.unitId; });
    return index === -1 ? 0 : index;
  }

  function setStatus(message) {
    readerStatus.textContent = message || "";
  }

  function validSyncIdentity(value) {
    return !!syncLayer && syncLayer.validIdentity(value);
  }

  function saveSyncIdentity() {
    saveJson(SYNC_KEY, syncIdentity);
  }

  function renderSync() {
    if (!book || !syncClient) {
      syncBar.hidden = true;
      return;
    }
    syncBar.hidden = false;
    if (!validSyncIdentity(syncIdentity)) {
      syncSummary.textContent = "Preparing encrypted sync…";
      sharePairing.hidden = true;
      return;
    }
    if (syncIdentity.uploaded) {
      syncSummary.textContent = navigator.onLine ? "Book and marker synced" : "Saved here · sync resumes online";
      sharePairing.hidden = false;
    } else {
      syncSummary.textContent = "Encrypting one hosted copy…";
      sharePairing.hidden = true;
    }
  }

  function sameIdentity(left, right) {
    return validSyncIdentity(left) && validSyncIdentity(right) &&
      left.vaultId === right.vaultId && left.masterKey === right.masterKey;
  }

  async function ensureIdentity() {
    if (libraryLayer) {
      if (!libraryLayer.validRoot(libraryRoot)) {
        libraryRoot = libraryLayer.save(libraryLayer.createRoot(syncLayer));
      }
      var derived = await libraryLayer.deriveWorkIdentity(libraryRoot, WORK_ID);
      if (!sameIdentity(syncIdentity, derived)) {
        syncIdentity = derived;
        syncIdentity.uploaded = false;
        saveSyncIdentity();
      }
      return;
    }
    if (validSyncIdentity(syncIdentity)) return;
    syncIdentity = syncLayer.createIdentity();
    syncIdentity.uploaded = false;
    saveSyncIdentity();
  }

  function pairingUrl() {
    if (libraryLayer && libraryLayer.validRoot(libraryRoot)) {
      return location.origin + location.pathname + libraryLayer.pairingFragment(libraryRoot);
    }
    return location.origin + location.pathname + syncLayer.pairingFragment(syncIdentity);
  }

  function scheduleMarkerSync() {
    if (!book || !syncIdentity || !syncIdentity.uploaded || !syncClient) return;
    window.clearTimeout(markerTimer);
    markerTimer = window.setTimeout(pushMarker, MARKER_SYNC_DELAY);
  }

  async function pushMarker() {
    if (!book || !syncIdentity || !syncIdentity.uploaded || !syncClient) return;
    if (syncBusy) {
      markerQueued = true;
      return;
    }
    syncBusy = true;
    try {
      await syncClient.pushMarker(syncIdentity, progress);
      syncSummary.textContent = "Book and marker synced";
    } catch (error) {
      syncSummary.textContent = "Marker saved here · sync will retry";
      markerQueued = true;
    } finally {
      syncBusy = false;
      if (markerQueued && navigator.onLine) {
        markerQueued = false;
        scheduleMarkerSync();
      }
    }
  }

  async function pullMarker() {
    if (!book || !syncIdentity || !syncIdentity.uploaded || !syncClient || syncBusy) return;
    syncBusy = true;
    var missingVault = false;
    try {
      var remote = await syncClient.downloadMarker(syncIdentity);
      var selected = syncLayer.newerMarker(progress, remote);
      if (selected === remote && remote) {
        progress = normalizeProgress(remote);
        saveProgress(false);
        renderChapter(true);
      } else if (progress.updatedAt && (!remote || progress.updatedAt > remote.updatedAt)) {
        markerQueued = true;
      }
      syncSummary.textContent = "Book and marker synced";
    } catch (error) {
      missingVault = error && error.status === 404;
      syncSummary.textContent = "Saved here · sync resumes online";
    } finally {
      syncBusy = false;
      if (missingVault) {
        syncIdentity.uploaded = false;
        saveSyncIdentity();
        hostBookOnce();
        return;
      }
      if (markerQueued && navigator.onLine) {
        markerQueued = false;
        scheduleMarkerSync();
      }
    }
  }

  async function hostBookOnce() {
    if (!book || !syncClient) return;
    await ensureIdentity();
    renderSync();
    if (syncIdentity.uploaded) {
      pullMarker();
      return;
    }
    syncBusy = true;
    setStatus("Encrypting and hosting your private copy…");
    try {
      await syncClient.uploadBookOnce(syncIdentity, book);
      syncIdentity.uploaded = true;
      saveSyncIdentity();
      syncBusy = false;
      renderSync();
      await pushMarker();
      if (libraryLayer && libraryLayer.validRoot(libraryRoot)) {
        await libraryLayer.syncKnownBooks({
          libraryRoot: libraryRoot,
          syncClient: syncClient,
          excludeWorkId: WORK_ID
        });
      }
      setStatus("Uploaded once. Copy one device link—every private Wisdom book opens there.");
    } catch (error) {
      syncSummary.textContent = "Saved here · encrypted upload will retry";
      setStatus("Book saved in this browser. Hosting will retry when online.");
    } finally {
      syncBusy = false;
    }
  }

  async function restoreHostedBook(identity, options) {
    options = options || {};
    if (!syncClient || !validSyncIdentity(identity)) return false;
    syncIdentity = identity;
    syncIdentity.uploaded = true;
    saveSyncIdentity();
    if (options.consumeFragment) history.replaceState(null, "", location.pathname + location.search);
    setStatus("Opening your encrypted hosted copy…");
    syncBusy = true;
    try {
      var remote = await syncClient.download(syncIdentity);
      if (!validBook(remote.book)) throw new Error("Hosted book did not validate");
      book = remote.book;
      saveJson(SOURCE_KEY, book);
      progress = normalizeProgress(remote.marker);
      saveProgress(false);
      render();
      setStatus("Paired. Book and latest marker restored.");
      return true;
    } catch (error) {
      localStorage.removeItem(SYNC_KEY);
      syncIdentity = null;
      setStatus(options.keepLibrary && error && error.status === 404 ?
        "This book has not finished uploading from your computer yet." :
        "That private pairing link could not open the hosted book.");
      render();
      return false;
    } finally {
      syncBusy = false;
    }
  }

  function renderNav() {
    chapterNav.textContent = "";
    book.units.forEach(function (unit) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chapterLink";
      button.textContent = unit.number + " · " + unit.title;
      button.dataset.unitId = unit.id;
      button.dataset.complete = String(progress.completed.indexOf(unit.id) !== -1);
      button.setAttribute("aria-current", String(unit.id === progress.unitId));
      button.addEventListener("click", function () {
        openUnit(unit.id, true);
        readerMenu.open = false;
      });
      chapterNav.appendChild(button);
    });
    menuProgress.textContent = progress.completed.length + " of " + book.units.length + " sections read";
  }

  function renderChapter(restoreScroll) {
    var index = activeIndex();
    var unit = book.units[index];
    progress.unitId = unit.id;
    saveJson(PROGRESS_KEY, progress);
    chapterNumber.textContent = unit.number;
    chapterTitle.textContent = unit.title;
    var guide = SECTION_GUIDES[unit.id] || "";
    sectionGuide.hidden = !guide;
    sectionGuide.open = false;
    sectionGuideText.textContent = guide;
    chapterBody.textContent = "";
    unit.paragraphs.forEach(function (text) {
      var p = document.createElement("p");
      p.textContent = text;
      chapterBody.appendChild(p);
    });
    readerLocation.textContent = unit.number.replace("Section ", "") + " of " + book.units.length;
    previousChapter.disabled = index === 0;
    nextChapter.disabled = index === book.units.length - 1;
    var complete = progress.completed.indexOf(unit.id) !== -1;
    markChapter.dataset.complete = String(complete);
    markChapter.textContent = complete ? "Read ✓" : "Mark read";
    renderNav();
    if (restoreScroll) {
      requestAnimationFrame(function () {
        window.scrollTo(0, Math.max(0, Number(progress.offsets[unit.id]) || 0));
      });
    }
  }

  function openUnit(unitId, resetScroll) {
    if (!book.units.some(function (unit) { return unit.id === unitId; })) return;
    progress.unitId = unitId;
    if (resetScroll) progress.offsets[unitId] = 0;
    saveProgress();
    renderChapter(true);
  }

  function render() {
    if (!validBook(book)) {
      book = null;
      installCard.hidden = false;
      chapter.hidden = true;
      chapterActions.hidden = true;
      privateControls.hidden = true;
      readerMenu.hidden = true;
      renderSync();
      return;
    }
    installCard.hidden = true;
    chapter.hidden = false;
    chapterActions.hidden = false;
    privateControls.hidden = false;
    readerMenu.hidden = false;
    renderChapter(true);
    renderSync();
  }

  bookFile.addEventListener("change", function () {
    var file = bookFile.files && bookFile.files[0];
    if (!file) return;
    if (!/\.(?:txt|text)$/i.test(file.name || "")) {
      setStatus("Use a plain-text .txt file");
      bookFile.value = "";
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStatus("That file is too large. Use the plain-text edition under 4 MB.");
      bookFile.value = "";
      return;
    }
    setStatus("Reading and checking the 41-section Wisdom edition…");
    var reader = new FileReader();
    reader.onload = function () {
      try {
        book = parseBerman(reader.result);
        progress = normalizeProgress(null);
        saveJson(SOURCE_KEY, book);
        saveProgress();
        render();
        if (syncClient) hostBookOnce();
        else setStatus("Ready: 41 cleaned sections saved in this browser");
      } catch (error) {
        setStatus(error.message || "Could not import that book");
      }
      bookFile.value = "";
    };
    reader.onerror = function () {
      setStatus("Could not read that file");
      bookFile.value = "";
    };
    reader.readAsText(file);
  });

  previousChapter.addEventListener("click", function () {
    var index = activeIndex();
    if (index > 0) openUnit(book.units[index - 1].id, true);
  });
  nextChapter.addEventListener("click", function () {
    var index = activeIndex();
    if (index < book.units.length - 1) openUnit(book.units[index + 1].id, true);
  });
  markChapter.addEventListener("click", function () {
    var id = progress.unitId;
    var index = progress.completed.indexOf(id);
    if (index === -1) progress.completed.push(id);
    else progress.completed.splice(index, 1);
    saveProgress();
    renderChapter(false);
  });
  sharePairing.addEventListener("click", async function () {
    if (!syncClient || !validSyncIdentity(syncIdentity) || !syncIdentity.uploaded) return;
    var url = pairingUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setStatus("Private pairing link copied.");
      } else {
        window.prompt("Copy this private pairing link:", url);
      }
    } catch (error) {
      if (!error || error.name !== "AbortError") window.prompt("Copy this private pairing link:", url);
    }
  });
  removeBook.addEventListener("click", function () {
    var message = syncClient ?
      "Remove the book, marker, and private pairing key from this device? The encrypted hosted copy remains available to devices already paired." :
      "Remove All That Is Solid Melts Into Air and its reading progress from this browser?";
    if (!window.confirm(message)) return;
    localStorage.removeItem(SOURCE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(SYNC_KEY);
    book = null;
    syncIdentity = null;
    progress = normalizeProgress(null);
    render();
    setStatus(syncClient ? "Removed from this device" : "Private book removed");
  });
  window.addEventListener("scroll", function () {
    if (!book) return;
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(function () {
      progress.offsets[progress.unitId] = Math.round(window.scrollY);
      saveProgress();
    }, 600);
  }, { passive: true });
  window.addEventListener("online", function () {
    renderSync();
    if (!syncClient) return;
    if (book && syncIdentity && syncIdentity.uploaded) pullMarker();
    else if (book) hostBookOnce();
  });
  window.addEventListener("offline", renderSync);
  document.addEventListener("visibilitychange", function () {
    if (syncClient && document.visibilityState === "visible") pullMarker();
  });

  window.WisdomBermanPrivate = {
    SOURCE_KEY: SOURCE_KEY,
    PROGRESS_KEY: PROGRESS_KEY,
    SYNC_KEY: SYNC_KEY,
    parseBerman: parseBerman,
    validBook: validBook,
    syncEnabled: Boolean(syncClient)
  };

  (async function start() {
    var pairedLibrary = syncClient && libraryLayer && libraryLayer.parsePairingFragment(location.hash);
    if (pairedLibrary) {
      libraryRoot = libraryLayer.save(pairedLibrary);
      var libraryIdentity = await libraryLayer.deriveWorkIdentity(libraryRoot, WORK_ID);
      await restoreHostedBook(libraryIdentity, { consumeFragment: true, keepLibrary: true });
      return;
    }
    var pairedIdentity = syncClient && syncLayer.parsePairingFragment(location.hash);
    if (pairedIdentity) {
      await restoreHostedBook(pairedIdentity, { consumeFragment: true });
      return;
    }
    render();
    if (!syncClient) return;
    if (libraryLayer && libraryLayer.validRoot(libraryRoot)) {
      await ensureIdentity();
      if (book) hostBookOnce();
      else await restoreHostedBook(syncIdentity, { keepLibrary: true });
      return;
    }
    if (book) hostBookOnce();
  })();
})();
