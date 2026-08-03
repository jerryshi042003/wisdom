(function () {
  var catalog = window.ESSAY_CATALOG || { essays: [], shelves: [] };
  var params = new URLSearchParams(window.location.search);
  var requestedEssayId = params.get("essay") || "";
  var legacyEssayAliases = { "homer-odyssey-scenes": "homer-odyssey" };
  var essayId = legacyEssayAliases[requestedEssayId] || requestedEssayId;
  if (requestedEssayId && requestedEssayId !== essayId && window.history && window.history.replaceState) {
    params.set("essay", essayId);
    window.history.replaceState(null, "", window.location.pathname + "?" + params.toString() + window.location.hash);
  }

  var titleEl = document.getElementById("title");
  var eyebrow = document.getElementById("eyebrow");
  var byline = document.getElementById("byline");
  var sourceLine = document.getElementById("sourceLine");
  var provenanceSlot = document.getElementById("provenanceSlot");
  var readerContext = document.getElementById("readerContext");
  var whyBand = document.getElementById("whyBand");
  var whyText = document.getElementById("whyText");
  var articleBody = document.getElementById("articleBody");
  var metaCardSlot = document.getElementById("metaCardSlot");
  var pagerRow = document.getElementById("pagerRow");
  var audioDock = document.getElementById("audioDock");
  var audioParts = document.getElementById("audioParts");
  var audioPlayer = document.getElementById("audioPlayer");
  var audioNote = document.getElementById("audioNote");
  var toast = document.getElementById("toast");
  var copyAll = document.getElementById("copyAll");

  var LANG_LABEL = { en: "English", zh: "中文", ja: "日本語" };
  var fontSize = Number(localStorage.getItem("essayFontSize") || 19);

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function asArray(value) {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }

  function shortDate(value) {
    return typeof value === "string" && value ? value.slice(0, 10) : "";
  }

  function externalLink(label, href, className) {
    if (!href) return null;
    var link = el("a", className || "", label);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener";
    return link;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () { toast.classList.remove("show"); }, 1800);
  }

  function applyFontSize() {
    articleBody.style.setProperty("--reader-size", fontSize + "px");
    localStorage.setItem("essayFontSize", String(fontSize));
  }

  document.getElementById("fontUp").addEventListener("click", function () {
    fontSize = Math.min(26, fontSize + 1);
    applyFontSize();
  });
  document.getElementById("fontDown").addEventListener("click", function () {
    fontSize = Math.max(15, fontSize - 1);
    applyFontSize();
  });

  function catalogEntry(id) {
    for (var i = 0; i < catalog.essays.length; i++) {
      if (catalog.essays[i].id === id) return catalog.essays[i];
    }
    return null;
  }

  var entry = catalogEntry(essayId);

  function renderHeaderFromEntry(source) {
    document.title = source.title + " - Wisdom Reader";
    titleEl.textContent = "";
    titleEl.appendChild(document.createTextNode(source.title));
    if (source.titleOriginal) {
      titleEl.appendChild(document.createTextNode(" "));
      var orig = el("span", "orig", source.titleOriginal);
      orig.setAttribute("lang", source.language || "en");
      titleEl.appendChild(orig);
    }
    var bits = [source.author];
    if (source.authorNative) bits.push(source.authorNative);
    if (source.year) bits.push(String(source.year));
    if (source.language) bits.push(LANG_LABEL[source.language] || source.language);
    byline.textContent = bits.join(" · ");
    eyebrow.textContent = (source.kind || "essay") + " · essay library";
    if (source.why) {
      readerContext.hidden = false;
      whyBand.hidden = false;
      whyText.textContent = source.why;
    }
  }

  function wireCopyButton(label, getText) {
    copyAll.textContent = label;
    copyAll.addEventListener("click", function () {
      var text = getText();
      function done(ok) { showToast(ok ? "Copied" : "Copy failed - select manually"); }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var area = document.createElement("textarea");
        area.value = text;
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        document.body.removeChild(area);
        done(ok);
      }
    });
  }

  function renderCopyButton(paragraphs, title) {
    wireCopyButton("Copy", function () { return title + "\n\n" + paragraphs.join("\n\n"); });
  }

  function annotationCopyText(data) {
    if (!data.annotatedParagraphs || !data.annotatedParagraphs.length) return data.paragraphs;
    return data.annotatedParagraphs.map(function (paragraph, index) {
      var pinyin = paragraph.segments.map(function (segment) {
        return segment.pinyin || segment.reading || segment.text;
      }).join(" ").replace(/\s+([，。！？：；])/g, "$1");
      var glosses = paragraph.segments.filter(function (segment) { return segment.gloss; }).map(function (segment) {
        return segment.text + " = " + segment.gloss;
      }).join(" · ");
      return data.paragraphs[index] + "\n" + pinyin + (glosses ? "\n" + glosses : "") + "\n" + paragraph.translation;
    });
  }

  function renderAnnotatedParagraph(paragraph, index, language) {
    var source = el("p", "annotatedSource");
    source.id = "p" + (index + 1);
    source.setAttribute("lang", language === "zh" ? "zh-Hant" : language);
    var lastBase = null;
    paragraph.segments.forEach(function (segment) {
      var pronunciation = segment.pinyin || segment.reading;
      if (!pronunciation) {
        if (lastBase && /^[\s、，。！？：；,.!?;:）)」』】》〉]+$/.test(segment.text)) {
          lastBase.appendChild(document.createTextNode(segment.text));
        } else {
          source.appendChild(el("span", "interlinearPlain", segment.text));
          lastBase = null;
        }
        return;
      }
      var token = el("span", "interlinearToken");
      var ruby = document.createElement("ruby");
      var base = el("rb", "tokenSource", segment.text);
      var reading = el("rt", "", pronunciation);
      reading.setAttribute("aria-hidden", "true");
      ruby.appendChild(base);
      ruby.appendChild(reading);
      token.appendChild(ruby);
      if (segment.gloss) {
        var gloss = el("span", "tokenGloss", segment.gloss);
        gloss.setAttribute("lang", "en");
        token.appendChild(gloss);
      }
      source.appendChild(token);
      lastBase = base;
    });
    articleBody.appendChild(source);
    var details = el("details", "sentenceTranslation");
    var summary = el("summary", "", "Natural English");
    summary.setAttribute("aria-label", "Show natural English translation for paragraph " + (index + 1));
    var translation = el("p", "paragraphTranslation", paragraph.translation);
    translation.setAttribute("lang", "en");
    translation.setAttribute("aria-label", "English translation for paragraph " + (index + 1));
    details.appendChild(summary);
    details.appendChild(translation);
    articleBody.appendChild(details);
  }

  function renderAudio(data) {
    var parts = (data.audio && data.audio.parts) || [];
    if (!parts.length) return;
    audioDock.hidden = false;
    audioNote.textContent = "Generated narration (" + ((data.audio && data.audio.voice) || "canonical voice") + "). One file per section.";
    parts.forEach(function (part, index) {
      var button = el("button", "ctrlButton", "Part " + (index + 1));
      button.type = "button";
      button.addEventListener("click", function () {
        audioPlayer.src = "../audio/" + data.id + "/wisdom/" + part.file;
        audioPlayer.play();
      });
      audioParts.appendChild(button);
    });
  }

  function renderPager(current) {
    var siblings = catalog.essays.filter(function (essay) {
      return essay.shelf === current.shelf && essay.status === "full-text";
    });
    var index = siblings.findIndex(function (essay) { return essay.id === current.id; });
    if (index === -1) return;
    var prev = siblings[index - 1];
    var next = siblings[index + 1];
    if (prev) {
      var a = el("a", "secondaryLink", "← " + prev.title);
      a.href = "index.html?essay=" + encodeURIComponent(prev.id);
      pagerRow.appendChild(a);
    } else {
      pagerRow.appendChild(el("span", "", ""));
    }
    if (next) {
      var b = el("a", "secondaryLink", next.title + " →");
      b.href = "index.html?essay=" + encodeURIComponent(next.id);
      pagerRow.appendChild(b);
    }
  }

  function renderMetaCard(source, heading, message) {
    var card = el("section", "metaCard");
    card.appendChild(el("h2", "", heading));
    card.appendChild(el("p", "", message));
    if (source.rights && source.rights.note) {
      card.appendChild(el("p", "", "Rights: " + source.rights.note));
    }
    if (source.rights && source.rights.usPdOn) {
      card.appendChild(el("p", "", "Becomes a full-text candidate (US) on " + source.rights.usPdOn + "."));
    }
    if (source.language && source.language !== "en" && source.rights && source.rights.status === "copyrighted") {
      card.appendChild(el("p", "", "No source text, pronunciation, or English layer is stored here until a rights-safe edition is available."));
    }
    var links = el("div", "metaLinks");
    (source.links || []).forEach(function (link) {
      var a = el("a", "secondaryLink", link.label);
      a.href = link.url;
      if (/^https?:/.test(link.url)) { a.rel = "noopener"; a.target = "_blank"; }
      links.appendChild(a);
    });
    if (source.existingReader) {
      var open = el("a", "primaryLink", "Open the guided reader");
      open.href = source.existingReader;
      links.insertBefore(open, links.firstChild);
    }
    card.appendChild(links);
    metaCardSlot.appendChild(card);
  }

  function renderBookCompanion(data) {
    var guide = data.guide;
    var privateSourceApi = window.WisdomPrivateSource;
    var unitIds = guide.units.map(function (unit) { return unit.id; });
    var sourcesById = {};
    guide.criticismSources.forEach(function (source) { sourcesById[source.id] = source; });
    var stateApi = window.WisdomEssayState;

    // The retired scene path and this book path share one storage root. Preserve
    // any explicit decision/notes, but never turn a completed excerpt into a
    // fabricated completed book.
    try {
      var root = JSON.parse(stateApi.exportJson());
      var legacy = root && root.essays && root.essays["homer-odyssey-scenes"];
      if (legacy) {
        if (!root.essays[data.id]) {
          root.essays[data.id] = Object.assign({}, legacy, {
            completedUnitIds: [],
            evidence: "Legacy selected-scene state migrated without claiming any full Wilson book was completed."
          });
        }
        delete root.essays["homer-odyssey-scenes"];
        stateApi.importJson(JSON.stringify(root));
      }
    } catch (error) {
      // A malformed record is handled by the state helper's normal recovery path.
    }

    var loaded = stateApi.getEssay(data.id, unitIds, guide.initialState);
    var current = loaded.state;
    var activeUnitId = null;
    var unitChecks = {};
    var unitDetails = {};
    var unitSummaries = {};

    renderHeaderFromEntry(Object.assign({}, entry || {}, data));
    document.body.classList.add("linkedGuidePage");
    eyebrow.textContent = "Personal-copy companion · all 24 books";
    sourceLine.textContent = "Use with Emily Wilson · Norton 2017 · private text and reading marker sync across your devices";
    articleBody.classList.add("linkedGuideBody", "companionBody");
    articleBody.setAttribute("aria-label", "Twenty-four-book companion for Emily Wilson's Odyssey translation");

    var editionDetails = el("details", "sourceVersionDetails");
    var editionSummary = document.createElement("summary");
    editionSummary.textContent = "Edition and rights boundary";
    editionDetails.appendChild(editionSummary);
    editionDetails.appendChild(el("p", "", guide.source.author + ", “" + guide.source.title + ".” Translated by " + guide.source.translator + ". " + guide.source.publisher + ", " + guide.source.edition + ". ISBN " + guide.source.isbn + "."));
    editionDetails.appendChild(el("p", "", guide.rights.note));
    provenanceSlot.appendChild(editionDetails);
    if (loaded.recovered) {
      provenanceSlot.appendChild(el("p", "provenanceBand", "A damaged local reading-state record was set aside. The companion is usable again; import a prior export if you want to restore it."));
    }

    wireCopyButton("Copy next path", function () {
      return guide.afterword.title + "\n\n" + guide.afterword.readingOrder.map(function (item, index) {
        return (index + 1) + ". " + item.work + " — " + item.edition + "\nWhy: " + item.why + "\nWhen: " + item.when;
      }).join("\n\n");
    });

    var companionContext = el("details", "companionContext");
    var companionContextSummary = document.createElement("summary");
    companionContextSummary.textContent = "Edition, reading method, and Homer context";
    companionContext.appendChild(companionContextSummary);
    if (!whyBand.hidden) {
      whyBand.classList.add("companionWhyBand");
      companionContext.appendChild(whyBand);
    }
    readerContext.hidden = true;
    var startCard = el("section", "sourceAttribution companionStartCard");
    startCard.appendChild(el("p", "layerLabel", "One book, one margin"));
    startCard.appendChild(el("h2", "", "Read Wilson first; use this only when friction appears"));
    guide.guideIntro.forEach(function (paragraph) { startCard.appendChild(el("p", "", paragraph)); });
    var startActions = el("div", "sourceActions");
    var homerMapLink = el("a", "secondaryLink homerMapLink", "Open Homer orientation");
    homerMapLink.href = "../../homer/";
    startActions.appendChild(homerMapLink);
    copyAll.classList.add("copyCitationButton");
    startActions.appendChild(copyAll);
    startCard.appendChild(startActions);
    companionContext.appendChild(startCard);

    var myth = guide.mythMap;
    var mythCard = el("section", "mythMapCard");
    mythCard.appendChild(el("p", "layerLabel", "Relationship map · not one canon"));
    mythCard.appendChild(el("h2", "", myth.title));
    mythCard.appendChild(el("p", "mythSummary", myth.summary));
    var verbGrid = el("div", "mythVerbGrid");
    myth.verbs.forEach(function (item) {
      var card = el("article", "mythVerbCard");
      card.appendChild(el("p", "mythWork", item.work));
      card.appendChild(el("h3", "", item.verb));
      card.appendChild(el("p", "", item.intention));
      verbGrid.appendChild(card);
    });
    mythCard.appendChild(verbGrid);
    var connectionDetails = el("details", "mythDetails");
    var connectionSummary = document.createElement("summary");
    connectionSummary.textContent = "How they connect: Sirens, the dead, and voice";
    connectionDetails.appendChild(connectionSummary);
    myth.connections.forEach(function (item) {
      var section = el("section", "mythConnection");
      section.appendChild(el("h3", "", item.title));
      section.appendChild(el("p", "", item.explanation));
      connectionDetails.appendChild(section);
    });
    mythCard.appendChild(connectionDetails);
    var timestampDetails = el("details", "mythDetails timestampDetails");
    var timestampSummary = document.createElement("summary");
    timestampSummary.textContent = "Useful film and jazz timestamps";
    timestampDetails.appendChild(timestampSummary);
    var timestampList = el("ol", "timestampList");
    myth.timestamps.forEach(function (item) {
      var li = document.createElement("li");
      li.appendChild(el("strong", "", item.anchor + " · " + item.work));
      li.appendChild(el("span", "", item.watchFor));
      timestampList.appendChild(li);
    });
    timestampDetails.appendChild(timestampList);
    mythCard.appendChild(timestampDetails);
    companionContext.appendChild(mythCard);
    articleBody.appendChild(companionContext);

    var companionPanel = el("section", "guidedPassPanel companionPanel v5Reader");
    var readerBar = el("nav", "v5ReaderBar");
    readerBar.setAttribute("aria-label", "Book navigation");
    var contentsMenu = el("details", "v5ReaderMenu v5ContentsMenu");
    var contentsSummary = document.createElement("summary");
    contentsSummary.textContent = "Contents";
    contentsMenu.appendChild(contentsSummary);
    var contentsList = el("div", "v5ContentsList");
    guide.units.forEach(function (unit) {
      var button = el("button", "v5ContentsItem", unit.bookNumber + ". " + unit.title);
      button.type = "button";
      button.dataset.unitId = unit.id;
      contentsList.appendChild(button);
    });
    contentsMenu.appendChild(contentsList);
    readerBar.appendChild(contentsMenu);
    var activeBookLabel = el("span", "v5CurrentUnit", "Book 1 of " + unitIds.length);
    activeBookLabel.setAttribute("aria-live", "polite");
    readerBar.appendChild(activeBookLabel);
    var moreMenu = el("details", "v5ReaderMenu v5MoreMenu");
    var moreSummary = document.createElement("summary");
    moreSummary.textContent = "More";
    moreMenu.appendChild(moreSummary);
    var moreBody = el("div", "v5MoreBody");
    moreMenu.appendChild(moreBody);
    readerBar.appendChild(moreMenu);
    companionPanel.appendChild(readerBar);
    var textTools = document.querySelector(".readerTools");
    if (textTools) {
      moreBody.appendChild(textTools);
      var oldTop = document.querySelector(".readerTop");
      if (oldTop) oldTop.hidden = true;
    }
    var activeBookTools = el("section", "v6ActiveBookTools");
    activeBookTools.setAttribute("aria-label", "Current book tools");
    moreBody.appendChild(activeBookTools);
    var continueRow = el("div", "continueRow");
    continueRow.appendChild(el("span", "layerLabel", "Resume the book"));
    var continueLink = el("a", "primaryLink continueUnitLink continueBookButton", "Continue");
    continueLink.id = "continueUnitLink";
    continueRow.appendChild(continueLink);
    companionPanel.appendChild(continueRow);

    var stateCard = el("details", "readingStateCard");
    var stateSummary = document.createElement("summary");
    var stateSummaryText = el("span", "", "Unread · 0 of 24 · state & note");
    stateSummary.appendChild(stateSummaryText);
    stateCard.appendChild(stateSummary);
    var stateBody = el("div", "readingStateBody");
    stateBody.appendChild(el("p", "layerLabel", "Local reading state"));
    stateBody.appendChild(el("h2", "", "Keep your place without pretending you finished"));
    stateBody.appendChild(el("p", "stateEvidence", guide.initialState.evidence));
    var stateRow = el("div", "stateRow");
    var statusLabel = el("label", "fieldLabel", "Decision");
    statusLabel.htmlFor = "guideStatus";
    var statusSelect = document.createElement("select");
    statusSelect.id = "guideStatus";
    statusSelect.className = "stateSelect";
    [["unread", "Unread"], ["reading", "Reading"], ["finished", "Finished"], ["dropped", "Dropped"]].forEach(function (option) {
      var node = document.createElement("option");
      node.value = option[0];
      node.textContent = option[1];
      statusSelect.appendChild(node);
    });
    statusLabel.appendChild(statusSelect);
    stateRow.appendChild(statusLabel);
    var progressWrap = el("div", "progressWrap");
    progressWrap.appendChild(el("span", "fieldLabel", "Books"));
    var progress = document.createElement("progress");
    progress.max = unitIds.length;
    progress.setAttribute("aria-label", "Completed books");
    var progressText = el("span", "progressText");
    progressText.setAttribute("role", "status");
    progressText.setAttribute("aria-live", "polite");
    progressWrap.appendChild(progress);
    progressWrap.appendChild(progressText);
    stateRow.appendChild(progressWrap);
    stateBody.appendChild(stateRow);
    var noteLabel = el("label", "fieldLabel", "One note");
    noteLabel.htmlFor = "guideNote";
    var noteInput = document.createElement("textarea");
    noteInput.id = "guideNote";
    noteInput.className = "stateTextarea";
    noteInput.rows = 3;
    noteInput.maxLength = 5000;
    noteInput.placeholder = "Only write what you want to remember. Blank is honest.";
    noteLabel.appendChild(noteInput);
    stateBody.appendChild(noteLabel);
    var stateActions = el("div", "stateActions");
    var saveState = el("button", "primaryLink", "Save state");
    saveState.type = "button";
    var exportState = el("button", "secondaryLink", "Export");
    exportState.type = "button";
    var importState = el("button", "secondaryLink", "Import");
    importState.type = "button";
    var importInput = document.createElement("input");
    importInput.className = "visuallyHidden";
    importInput.type = "file";
    importInput.accept = "application/json,.json";
    importInput.tabIndex = -1;
    var restoreState = el("button", "secondaryLink", "Restore backup");
    restoreState.type = "button";
    restoreState.hidden = !stateApi.backupAvailable();
    var resetState = el("button", "textButton", "Reset this reading");
    resetState.type = "button";
    [saveState, exportState, importState, restoreState, resetState].forEach(function (button) { stateActions.appendChild(button); });
    stateBody.appendChild(stateActions);
    stateBody.appendChild(importInput);
    stateCard.appendChild(stateBody);
    moreBody.appendChild(stateCard);

    var privateSourceController = privateSourceApi ? privateSourceApi.createOdysseyBookController({
      el: el,
      showToast: showToast,
      unitIds: unitIds,
      activeUnitId: function () { return activeUnitId; },
      onMarker: function (marker) {
        if (!marker || !marker.state || !unitDetails[marker.activeUnitId]) return;
        current = stateApi.saveEssay(data.id, marker.state, unitIds, guide.initialState).state;
        activeUnitId = marker.activeUnitId;
        window.setTimeout(function () {
          updateControls();
          showToast("Reading marker restored");
        }, 0);
      },
      onRender: function (openUnitId) {
        window.setTimeout(function () { syncActiveBookTools(openUnitId || activeUnitId); }, 0);
      }
    }) : null;
    if (privateSourceController) moreBody.appendChild(privateSourceController.controlCard);
    moreBody.appendChild(editionDetails);
    moreBody.appendChild(companionContext);

    function renderCompanionLens(lens) {
      var source = sourcesById[lens.sourceId] || {};
      var card = el("article", "lensCard companionLens");
      card.dataset.criticismSource = lens.sourceId;
      card.appendChild(el("h3", "", source.person || "Named scholar"));
      card.appendChild(el("p", "lensSourceTitle", source.title || lens.sourceId));
      card.appendChild(el("p", "lensClaim", lens.claim));
      lens.paraphrase.forEach(function (paragraph) { card.appendChild(el("p", "lensParaphrase", paragraph)); });
      card.appendChild(el("p", "lensMeta lensLimit", "Where this lens stops: " + lens.limit));
      return card;
    }

    guide.units.forEach(function (unit) {
      var details = el("details", "guideUnit companionUnit v5BookUnit");
      details.dataset.unitId = unit.id;
      details.id = "unit-" + unit.id;
      var summary = document.createElement("summary");
      summary.setAttribute("aria-label", "Book " + unit.bookNumber + ": " + unit.title);
      summary.appendChild(el("span", "unitNumber", String(unit.bookNumber)));
      summary.appendChild(el("span", "unitTitle", unit.title));
      summary.appendChild(el("span", "unitMeta", unit.estimatedMinutes + " min · " + unit.themes.slice(0, 2).join(" · ")));
      details.appendChild(summary);
      var content = el("div", "guideUnitContent companionUnitContent");
      content.appendChild(el("p", "sourceLocator bookLocator", unit.locator + " · read your copy here or in the book before opening Clear"));

      if (privateSourceController) content.appendChild(privateSourceController.mount(unit.id));

      var companionGuide = el("details", "companionGuide");
      var companionGuideSummary = document.createElement("summary");
      companionGuideSummary.textContent = "Book guide";
      companionGuide.appendChild(companionGuideSummary);
      var companionGuideBody = el("div", "companionGuideBody");
      companionGuide.appendChild(companionGuideBody);
      content.appendChild(companionGuide);

      var before = el("section", "companionSection beforeRead");
      before.appendChild(el("p", "layerLabel", "Before you read"));
      unit.beforeYouRead.forEach(function (paragraph) { before.appendChild(el("p", "", paragraph)); });
      companionGuideBody.appendChild(before);

      var clear = el("details", "clearTranslationCard clearCompanionCard");
      var clearSummary = document.createElement("summary");
      clearSummary.textContent = "Clear companion · open after reading if the movement is fuzzy";
      clear.appendChild(clearSummary);
      var clearBody = el("div", "clearTranslationBody");
      clearBody.appendChild(el("p", "layerLabel", "Original companion · not source text or another translation"));
      clearBody.appendChild(el("p", "translationScope", unit.clearCompanion.scope));
      unit.clearCompanion.text.forEach(function (paragraph) { clearBody.appendChild(el("p", "translationText", paragraph)); });
      clear.appendChild(clearBody);
      companionGuideBody.appendChild(clear);

      var translation = el("section", "companionSection translationWatch");
      translation.appendChild(el("p", "layerLabel", "Translation watch"));
      translation.appendChild(el("p", "", unit.clearCompanion.translationChoice));
      companionGuideBody.appendChild(translation);

      var why = el("section", "companionSection whyBookMatters");
      why.appendChild(el("p", "layerLabel", "Why this book matters"));
      unit.whyItMatters.forEach(function (paragraph) { why.appendChild(el("p", "", paragraph)); });
      companionGuideBody.appendChild(why);

      var lenses = el("details", "analysisCard companionLenses");
      var lensesSummary = document.createElement("summary");
      lensesSummary.textContent = unit.lenses.length + " scholar lens" + (unit.lenses.length === 1 ? "" : "es") + " · optional";
      lenses.appendChild(lensesSummary);
      var lensesBody = el("div", "analysisBody");
      lensesBody.appendChild(el("p", "layerLabel", "Named scholarship · independent paraphrase · links stay in the final source shelf"));
      var lensStack = el("div", "lensStack");
      unit.lenses.forEach(function (lens) { lensStack.appendChild(renderCompanionLens(lens)); });
      lensesBody.appendChild(lensStack);
      lenses.appendChild(lensesBody);
      companionGuideBody.appendChild(lenses);

      var promptGrid = el("div", "unitPromptGrid");
      var comprehension = el("section", "unitPrompt comprehensionPrompt");
      comprehension.appendChild(el("p", "layerLabel", "Check your understanding"));
      comprehension.appendChild(el("p", "", unit.comprehensionPrompt));
      promptGrid.appendChild(comprehension);
      var outputPrompt = el("section", "unitPrompt outputPrompt");
      outputPrompt.appendChild(el("p", "layerLabel", "One output"));
      outputPrompt.appendChild(el("p", "", unit.outputPrompt));
      promptGrid.appendChild(outputPrompt);
      companionGuideBody.appendChild(promptGrid);

      var completeLabel = el("label", "unitComplete");
      var check = document.createElement("input");
      check.type = "checkbox";
      check.dataset.unitId = unit.id;
      check.setAttribute("aria-label", "Mark Book " + unit.bookNumber + " read");
      completeLabel.appendChild(check);
      completeLabel.appendChild(document.createTextNode(" I read this complete book"));
      content.appendChild(completeLabel);
      details.addEventListener("toggle", function () {
        if (!details.open) return;
        var privateReading = content.querySelector(".privateSourceReading");
        if (privateReading && !privateReading.open) privateReading.open = true;
      });
      details.appendChild(content);
      companionPanel.appendChild(details);
      unitChecks[unit.id] = check;
      unitDetails[unit.id] = details;
      unitSummaries[unit.id] = summary;
    });

    var unitPager = el("nav", "v5UnitPager");
    unitPager.setAttribute("aria-label", "Move between books");
    var previousBook = el("button", "v5PagerButton", "Previous");
    previousBook.type = "button";
    var nextBook = el("button", "v5PagerButton", "Next");
    nextBook.type = "button";
    unitPager.appendChild(previousBook);
    unitPager.appendChild(nextBook);
    companionPanel.appendChild(unitPager);

    var afterReading = el("details", "v5AfterReading");
    var afterReadingSummary = document.createElement("summary");
    afterReadingSummary.textContent = "After reading";
    afterReading.appendChild(afterReadingSummary);
    var afterReadingBody = el("div", "v5AfterReadingBody");
    afterReading.appendChild(afterReadingBody);

    var counter = el("details", "counterargumentCard");
    var counterSummary = document.createElement("summary");
    counterSummary.textContent = "Strongest counter-reading";
    counter.appendChild(counterSummary);
    counter.appendChild(el("p", "counterPrompt", guide.counterargument.prompt));
    counter.appendChild(el("p", "", guide.counterargument.strongestCase));
    afterReadingBody.appendChild(counter);

    var reflection = el("section", "reflectionCard");
    reflection.appendChild(el("p", "layerLabel", "Finish the loop"));
    reflection.appendChild(el("h2", "", "One teach-back, one real connection"));
    var teachLabel = el("label", "fieldLabel", guide.reflection.teachBack);
    teachLabel.htmlFor = "guideTeachBack";
    var teachInput = document.createElement("textarea");
    teachInput.id = "guideTeachBack";
    teachInput.className = "stateTextarea";
    teachInput.rows = 3;
    teachInput.maxLength = 5000;
    teachInput.placeholder = "Leave blank until these are your words.";
    teachLabel.appendChild(teachInput);
    reflection.appendChild(teachLabel);
    var outputLabel = el("label", "fieldLabel", guide.reflection.output);
    outputLabel.htmlFor = "guideOutput";
    var outputInput = document.createElement("textarea");
    outputInput.id = "guideOutput";
    outputInput.className = "stateTextarea";
    outputInput.rows = 3;
    outputInput.maxLength = 5000;
    outputInput.placeholder = "One decision or comparison; no reaction is pre-filled.";
    outputLabel.appendChild(outputInput);
    reflection.appendChild(outputLabel);
    var saveReflection = el("button", "primaryLink", "Save reflection");
    saveReflection.type = "button";
    reflection.appendChild(saveReflection);
    afterReadingBody.appendChild(reflection);

    var afterword = el("details", "afterwordCard");
    var afterwordToggle = document.createElement("summary");
    afterwordToggle.textContent = "After the Odyssey · optional next reading";
    afterword.appendChild(afterwordToggle);
    afterword.appendChild(el("p", "layerLabel", "After the Odyssey"));
    afterword.appendChild(el("h2", "", guide.afterword.title));
    afterword.appendChild(el("p", "afterwordSummary", guide.afterword.summary));
    var readingOrder = el("ol", "readingOrder");
    guide.afterword.readingOrder.forEach(function (item) {
      var li = document.createElement("li");
      li.appendChild(el("h3", "", item.work));
      li.appendChild(el("p", "editionChoice", item.edition));
      li.appendChild(el("p", "", item.why));
      li.appendChild(el("p", "whenChoice", "When: " + item.when));
      readingOrder.appendChild(li);
    });
    afterword.appendChild(readingOrder);
    var principles = el("ul", "translationPrinciples");
    guide.afterword.principles.forEach(function (principle) {
      principles.appendChild(el("li", "", principle));
    });
    afterword.appendChild(principles);
    afterReadingBody.appendChild(afterword);

    var sources = el("details", "sourcesShelf");
    var sourcesSummary = document.createElement("summary");
    sourcesSummary.textContent = "Optional source shelf · 12 scholarly records";
    sources.appendChild(sourcesSummary);
    sources.appendChild(el("p", "sourceShelfNote", "These links are provenance, not the reading path. No source body is stored here."));
    var sourceList = el("ul", "sourceShelfList");
    guide.criticismSources.forEach(function (source) {
      var li = document.createElement("li");
      var link = externalLink(source.person + " — " + source.title + " ↗", source.url, "sourceShelfLink");
      li.appendChild(link);
      li.appendChild(el("span", "", source.limits));
      sourceList.appendChild(li);
    });
    sources.appendChild(sourceList);
    afterReadingBody.appendChild(sources);
    companionPanel.appendChild(afterReading);
    articleBody.appendChild(companionPanel);

    function syncActiveBookTools(unitId) {
      var targetId = unitDetails[unitId] ? unitId : activeUnitId;
      Array.from(activeBookTools.children).forEach(function (tool) {
        if (tool._wisdomHome) tool._wisdomHome.appendChild(tool);
      });
      var active = unitDetails[targetId];
      var reading = active && active.querySelector(".privateSourceReading");
      if (reading && !reading.open) reading.open = true;
      window.setTimeout(function () {
        var tools = active ? Array.from(active.querySelectorAll(".privateViewToolbar, .privateBookAnalysis, .companionGuide, .unitComplete")) : [];
        tools.forEach(function (tool) {
          tool._wisdomHome = tool.parentNode;
          activeBookTools.appendChild(tool);
        });
      }, 0);
    }

    function showUnit(unitId, options) {
      var targetId = unitDetails[unitId] ? unitId : unitIds[0];
      activeUnitId = targetId;
      Object.keys(unitDetails).forEach(function (id) {
        unitDetails[id].hidden = id !== targetId;
        unitDetails[id].open = id === targetId;
      });
      syncActiveBookTools(targetId);
      var index = unitIds.indexOf(targetId);
      activeBookLabel.textContent = "Book " + (index + 1) + " of " + unitIds.length;
      previousBook.disabled = index <= 0;
      nextBook.disabled = index >= unitIds.length - 1;
      Array.from(contentsList.querySelectorAll("button")).forEach(function (button) {
        if (button.dataset.unitId === targetId) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
      contentsMenu.open = false;
      if (options && options.updateHash) history.replaceState(null, "", "#unit-" + targetId);
      if (options && options.scroll) {
        var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        readerBar.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
      if (privateSourceController) {
        privateSourceController.saveMarker({
          schemaVersion: 1,
          workId: data.id,
          activeUnitId: targetId,
          state: current
        });
      }
    }

    contentsList.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-unit-id]");
      if (button) showUnit(button.dataset.unitId, { scroll: true, updateHash: true });
    });
    previousBook.addEventListener("click", function () {
      showUnit(unitIds[unitIds.indexOf(activeUnitId) - 1], { scroll: true, updateHash: true });
    });
    nextBook.addEventListener("click", function () {
      showUnit(unitIds[unitIds.indexOf(activeUnitId) + 1], { scroll: true, updateHash: true });
    });

    continueLink.addEventListener("click", function (event) {
      event.preventDefault();
      showUnit(continueLink.dataset.targetUnit, { scroll: true, updateHash: true });
    });

    function updateControls() {
      statusSelect.value = current.status;
      noteInput.value = current.note;
      teachInput.value = current.teachBack;
      outputInput.value = current.output;
      Object.keys(unitChecks).forEach(function (id) { unitChecks[id].checked = current.completedUnitIds.indexOf(id) !== -1; });
      progress.value = current.completedUnitIds.length;
      progressText.textContent = current.completedUnitIds.length + " of " + unitIds.length;
      var continueId = unitIds.find(function (id) { return current.completedUnitIds.indexOf(id) === -1; }) || unitIds[unitIds.length - 1];
      var continueIndex = unitIds.indexOf(continueId) + 1;
      continueLink.dataset.targetUnit = continueId;
      continueLink.href = "#unit-" + continueId;
      continueLink.textContent = (current.completedUnitIds.length === unitIds.length ? "Review " : "Continue ") + "Book " + continueIndex + " of " + unitIds.length;
      var names = { unread: "Unread", reading: "Reading", finished: "Finished", dropped: "Dropped" };
      stateSummaryText.textContent = names[current.status] + " · " + current.completedUnitIds.length + " of " + unitIds.length + " · state & note";
      stateSummary.setAttribute("aria-label", names[current.status] + ": " + current.completedUnitIds.length + " of " + unitIds.length + " books; open state and note");
      restoreState.hidden = !stateApi.backupAvailable();
      var hashUnit = decodeURIComponent(location.hash.replace(/^#unit-/, ""));
      showUnit(activeUnitId || (unitDetails[hashUnit] ? hashUnit : continueId), { scroll: false, updateHash: false });
    }

    function save(message) {
      current.status = statusSelect.value;
      current.note = noteInput.value;
      current.teachBack = teachInput.value;
      current.output = outputInput.value;
      var result = stateApi.saveEssay(data.id, current, unitIds, guide.initialState);
      current = result.state;
      updateControls();
      showToast(result.ok ? message : "Could not save in this browser");
    }

    Object.keys(unitChecks).forEach(function (id) {
      unitChecks[id].addEventListener("change", function () {
        var completed = new Set(current.completedUnitIds);
        if (unitChecks[id].checked) completed.add(id); else completed.delete(id);
        current.completedUnitIds = unitIds.filter(function (unitId) { return completed.has(unitId); });
        if (current.status === "unread" && unitChecks[id].checked) statusSelect.value = "reading";
        save(unitChecks[id].checked ? "Book saved" : "Book reopened");
      });
    });
    statusSelect.addEventListener("change", function () { save("Decision saved"); });
    saveState.addEventListener("click", function () { save("State saved"); });
    saveReflection.addEventListener("click", function () { save("Reflection saved"); });
    exportState.addEventListener("click", function () {
      var blob = new Blob([stateApi.exportJson()], { type: "application/json" });
      var href = URL.createObjectURL(blob);
      var download = document.createElement("a");
      download.href = href;
      download.download = "wisdom-essay-reader-state.json";
      document.body.appendChild(download);
      download.click();
      document.body.removeChild(download);
      URL.revokeObjectURL(href);
      showToast("State exported");
    });
    importState.addEventListener("click", function () { importInput.click(); });
    importInput.addEventListener("change", function () {
      var file = importInput.files && importInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          stateApi.importJson(String(reader.result || ""));
          current = stateApi.getEssay(data.id, unitIds, guide.initialState).state;
          updateControls();
          showToast("State imported");
        } catch (error) {
          showToast(error.message || "Import failed");
        }
        importInput.value = "";
      };
      reader.readAsText(file);
    });
    restoreState.addEventListener("click", function () {
      try {
        stateApi.restoreBackup();
        current = stateApi.getEssay(data.id, unitIds, guide.initialState).state;
        updateControls();
        showToast("Backup restored");
      } catch (error) {
        showToast(error.message || "Restore failed");
      }
    });
    resetState.addEventListener("click", function () {
      if (!window.confirm("Reset this Odyssey reading and clear its local notes?")) return;
      stateApi.resetEssay(data.id);
      current = stateApi.getEssay(data.id, unitIds, guide.initialState).state;
      updateControls();
      showToast("Odyssey state reset");
    });

    updateControls();
    applyFontSize();
  }

  function renderLinkedGuide(data) {
    var guide = data.guide;
    if (Number(guide.schemaVersion || 0) === 4 && guide.contentType === "book-companion") {
      renderBookCompanion(data);
      return;
    }
    var snapshot = data.sourceSnapshot;
    var isScenePath = Number(guide.schemaVersion || 0) >= 3;
    var unitNoun = isScenePath ? "scene" : "source section";
    var unitNounPlural = isScenePath ? "scenes" : "source sections";
    var unitIds = guide.units.map(function (unit) { return unit.id; });
    var sourceSections = {};
    snapshot.sections.forEach(function (section) { sourceSections[section.id] = section; });
    var criticismById = {};
    (guide.criticismSources || []).forEach(function (source) { criticismById[source.id] = source; });
    var stateApi = window.WisdomEssayState;
    var loaded = stateApi.getEssay(data.id, unitIds, guide.initialState);
    var current = loaded.state;
    if (data.id === "tao-genius" && guide.initialState && guide.initialState.status === "finished") {
      try {
        var reportMigrationKey = "wisdom-continuity-reported-state-2026-07-19-2";
        if (!localStorage.getItem(reportMigrationKey)) {
          if (current.status !== "finished" && current.status !== "dropped") {
            current = stateApi.saveEssay(data.id, Object.assign({}, current, {
              status: "finished",
              evidence: guide.initialState.evidence || current.evidence
            }), unitIds, guide.initialState).state;
          }
          localStorage.setItem(reportMigrationKey, "applied");
        }
      } catch (error) {
        // The finished initial state remains truthful when storage is unavailable.
      }
    }
    var resumeUnitId = unitIds.find(function (id) { return current.completedUnitIds.indexOf(id) === -1; }) || unitIds[unitIds.length - 1];
    var unitChecks = {};
    var unitDetails = {};
    var unitSummaries = {};
    var analysisCards = [];

    function appendSourceRuns(parent, runs) {
      runs.forEach(function (run) {
        var node = document.createTextNode(run.text);
        (run.marks || []).forEach(function (mark) {
          var wrapper = document.createElement(mark === "strong" ? "strong" : "em");
          wrapper.appendChild(node);
          node = wrapper;
        });
        if (run.href) {
          var link = document.createElement("a");
          link.href = run.href;
          link.target = "_blank";
          link.rel = "noopener";
          link.appendChild(node);
          node = link;
        }
        parent.appendChild(node);
      });
    }

    function renderSourceBlock(block, index) {
      var node;
      if (block.type === "list") {
        node = document.createElement("ul");
        block.items.forEach(function (runs) {
          var item = document.createElement("li");
          appendSourceRuns(item, runs);
          node.appendChild(item);
        });
      } else {
        node = document.createElement(block.type === "quote" ? "blockquote" : "p");
        appendSourceRuns(node, block.runs);
      }
      node.classList.add("sourceBlock");
      node.dataset.sourceBlock = String(index + 1);
      return node;
    }

    renderHeaderFromEntry(Object.assign({}, entry || {}, data));
    document.body.classList.add("linkedGuidePage");
    eyebrow.textContent = isScenePath ? "Original + Guided · selected scene path" : "Original + Guided · complete attributed essay";
    var sourceSummaryBits = ["Original by " + guide.source.author];
    if (guide.source.translator) sourceSummaryBits.push(guide.source.translator + " translation");
    sourceSummaryBits.push(isScenePath ? unitIds.length + " selected scenes" : snapshot.wordCount + " words");
    if (guide.estimatedMinutes) sourceSummaryBits.push(guide.estimatedMinutes + " min total");
    sourceLine.textContent = sourceSummaryBits.join(" · ");
    var versionDetails = el("div", "sourceVersionBody");
    if (guide.source.versionNote) versionDetails.appendChild(el("p", "", guide.source.versionNote));
    var editionBits = [];
    if (guide.source.edition) editionBits.push("Edition: " + guide.source.edition);
    if (guide.source.translator) editionBits.push("Translator: " + guide.source.translator);
    if (guide.source.provider) editionBits.push("Provider: " + guide.source.provider);
    if (editionBits.length) versionDetails.appendChild(el("p", "", editionBits.join(" · ") + "."));
    var dateBits = [];
    if (shortDate(guide.source.published)) dateBits.push("published " + shortDate(guide.source.published));
    if (shortDate(guide.source.modified)) dateBits.push("source updated " + shortDate(guide.source.modified));
    if (shortDate(snapshot.captured)) dateBits.push("captured " + shortDate(snapshot.captured));
    if (dateBits.length) versionDetails.appendChild(el("p", "", dateBits.join(" · ") + "."));
    if (guide.rights && guide.rights.note) versionDetails.appendChild(el("p", "", guide.rights.note));
    if (guide.reproductionPolicy && guide.reproductionPolicy.thirdPartyNote) {
      versionDetails.appendChild(el("p", "", guide.reproductionPolicy.thirdPartyNote));
    }
    if (guide.layerDefinitions) {
      var layerList = el("dl", "layerDefinitions");
      Object.keys(guide.layerDefinitions).forEach(function (name) {
        layerList.appendChild(el("dt", "", name));
        layerList.appendChild(el("dd", "", guide.layerDefinitions[name]));
      });
      versionDetails.appendChild(layerList);
    }
    if (guide.sourceAccess && guide.sourceAccess.fallbackMode === "local-overlay") {
      var overlayNote = el("p", "sourceOverlayNote", "Optional desktop fallback: ");
      var overlayLink = el("a", "", "install the source-page analysis widget");
      overlayLink.href = "../source-overlay.user.js";
      overlayLink.target = "_blank";
      overlayLink.rel = "noopener";
      overlayNote.appendChild(overlayLink);
      overlayNote.appendChild(document.createTextNode(". It adds these notes to the canonical page and stores no source body."));
      versionDetails.appendChild(overlayNote);
    }
    if (loaded.recovered) {
      provenanceSlot.appendChild(el("p", "provenanceBand", "A damaged local reading-state record was set aside. The guide is usable again; import a prior export if you want to restore it."));
    }

    if (!whyBand.hidden) {
      var why = whyText.textContent;
      whyBand.textContent = "";
      whyBand.classList.add("linkedWhyBand");
      var whyToggle = el("button", "contextToggle", "Why now");
      whyToggle.type = "button";
      whyToggle.setAttribute("aria-label", "Why now");
      whyToggle.setAttribute("aria-expanded", "false");
      var whyCopy = el("p", "", why);
      whyCopy.id = "whyNowCopy";
      whyCopy.hidden = true;
      whyToggle.setAttribute("aria-controls", whyCopy.id);
      whyToggle.addEventListener("click", function () {
        whyCopy.hidden = !whyCopy.hidden;
        whyToggle.setAttribute("aria-expanded", String(!whyCopy.hidden));
      });
      whyBand.appendChild(whyToggle);
      whyBand.appendChild(whyCopy);
    }

    wireCopyButton("Copy citation", function () {
      var citation = guide.source.author + ", “" + guide.source.title + ".”";
      if (guide.source.translator) citation += " Translated by " + guide.source.translator + ".";
      if (guide.source.edition) citation += " " + guide.source.edition + ".";
      if (guide.source.publisher) citation += " " + guide.source.publisher + ".";
      return citation + "\n" + (guide.source.recordUrl || guide.source.url);
    });

    articleBody.classList.add("linkedGuideBody");
    articleBody.setAttribute("aria-label", "Original source with aligned Wisdom analysis");
    articleBody.dataset.sourceSha256 = snapshot.normalizedArticleSha256 || guide.source.fullSourceSha256 || "";

    var attribution = el("details", "sourceAttribution");
    var attributionSummary = document.createElement("summary");
    attributionSummary.textContent = "Source";
    attribution.appendChild(attributionSummary);
    attribution.appendChild(el("p", "layerLabel", isScenePath ? "Original source · exact selected passages" : "Original source · reproduced with attribution"));
    attribution.appendChild(el("h2", "", guide.source.title));
    attribution.appendChild(el("p", "", isScenePath
      ? "The selected public-domain passages below stay separate from context, criticism, and Wisdom synthesis. The linked full edition remains the source of record."
      : "The exact source text below stays separate from Wisdom Reader analysis. The linked publisher page remains canonical."));
    attribution.appendChild(versionDetails);
    var attributionActions = el("div", "sourceActions");
    var canonicalLink = externalLink(isScenePath ? "Open full source text ↗" : "View current source ↗", guide.source.url, "primaryLink fullSourceLink");
    if (canonicalLink) attributionActions.appendChild(canonicalLink);
    if (guide.source.recordUrl && guide.source.recordUrl !== guide.source.url) {
      attributionActions.appendChild(externalLink("Edition record ↗", guide.source.recordUrl, "secondaryLink sourceRecordLink"));
    }
    if (isScenePath) {
      var homerMapLink = el("a", "secondaryLink homerMapLink", "Open Homer map");
      homerMapLink.href = "../../homer/";
      attributionActions.appendChild(homerMapLink);
    }
    var policyLink = externalLink("Rights / reuse ↗", guide.rights && guide.rights.policyUrl, "secondaryLink");
    if (policyLink) attributionActions.appendChild(policyLink);
    copyAll.classList.add("copyCitationButton");
    attributionActions.appendChild(copyAll);
    attribution.appendChild(attributionActions);
    if (!whyBand.hidden) attribution.appendChild(whyBand);
    readerContext.hidden = true;

    var controlStrip = el("section", "readerControlStrip");
    controlStrip.setAttribute("aria-label", "Reading controls");
    articleBody.appendChild(controlStrip);

    var modeBar = el("section", "guideModeBar");
    modeBar.setAttribute("aria-label", "Reading layout");
    var modeButtons = el("div", "guideModeButtons");
    modeButtons.setAttribute("role", "group");
    modeButtons.setAttribute("aria-label", "Choose reading layout");
    var compareButton = el("button", "ctrlButton compareToggle", "Compare");
    compareButton.type = "button";
    modeButtons.appendChild(compareButton);
    modeBar.appendChild(modeButtons);

    var columns = el("div", "guideColumns readingFlow");

    function setMode(compare) {
      columns.classList.toggle("readingFlow", !compare);
      columns.classList.toggle("sourceCompare", compare);
      compareButton.setAttribute("aria-pressed", String(compare));
      compareButton.textContent = compare ? "Read" : "Compare";
      compareButton.setAttribute("aria-label", compare ? "Switch to read layout" : "Switch to comparison layout");
      analysisCards.forEach(function (card) { card.open = compare; });
    }
    compareButton.addEventListener("click", function () {
      setMode(compareButton.getAttribute("aria-pressed") !== "true");
    });

    var guidePanel = el("section", "guidedPassPanel");
    guidePanel.setAttribute("aria-label", "Wisdom Reader guided pass");
    var continueRow = el("div", "continueRow");
    var continueLink = el("a", "primaryLink continueUnitLink continueSceneButton", "Continue");
    continueLink.id = "continueUnitLink";
    continueLink.href = "#unit-" + resumeUnitId;
    continueRow.appendChild(continueLink);
    controlStrip.appendChild(continueRow);
    controlStrip.appendChild(modeBar);
    controlStrip.appendChild(attribution);
    var stateCard = el("details", "readingStateCard");
    var stateSummary = document.createElement("summary");
    var stateSummaryText = el("span", "", "Reading · 0 of " + unitIds.length + " · state & note");
    stateSummary.setAttribute("aria-label", "Reading state and note: 0 of " + unitIds.length + " " + unitNounPlural);
    stateSummary.appendChild(stateSummaryText);
    stateCard.appendChild(stateSummary);
    var stateBody = el("div", "readingStateBody");
    stateBody.appendChild(el("p", "layerLabel", "Local reading state"));
    stateBody.appendChild(el("h2", "", "Keep your place without pretending you finished"));
    if (guide.initialState && guide.initialState.evidence) {
      stateBody.appendChild(el("p", "stateEvidence", guide.initialState.evidence));
    }
    var statusRow = el("div", "stateRow");
    var statusLabel = el("label", "fieldLabel", "Decision");
    statusLabel.htmlFor = "guideStatus";
    var statusSelect = document.createElement("select");
    statusSelect.id = "guideStatus";
    statusSelect.className = "stateSelect";
    [
      ["unread", "Unread"],
      ["reading", "Reading"],
      ["finished", "Finished"],
      ["dropped", "Dropped"]
    ].forEach(function (option) {
      var node = document.createElement("option");
      node.value = option[0];
      node.textContent = option[1];
      statusSelect.appendChild(node);
    });
    statusLabel.appendChild(statusSelect);
    statusRow.appendChild(statusLabel);
    var progressWrap = el("div", "progressWrap");
    var progressLabel = el("span", "fieldLabel", isScenePath ? "Scenes" : "Source sections");
    var progress = document.createElement("progress");
    progress.max = unitIds.length;
    progress.setAttribute("aria-label", "Completed " + unitNounPlural);
    var progressText = el("span", "progressText");
    progressText.setAttribute("role", "status");
    progressText.setAttribute("aria-live", "polite");
    progressWrap.appendChild(progressLabel);
    progressWrap.appendChild(progress);
    progressWrap.appendChild(progressText);
    statusRow.appendChild(progressWrap);
    stateBody.appendChild(statusRow);

    var noteLabel = el("label", "fieldLabel", "One note");
    noteLabel.htmlFor = "guideNote";
    var noteInput = document.createElement("textarea");
    noteInput.id = "guideNote";
    noteInput.className = "stateTextarea";
    noteInput.rows = 3;
    noteInput.maxLength = 5000;
    noteInput.placeholder = "Only write what you want to remember. Blank is honest.";
    noteLabel.appendChild(noteInput);
    stateBody.appendChild(noteLabel);

    var stateActions = el("div", "stateActions");
    var saveState = el("button", "primaryLink", "Save state");
    saveState.type = "button";
    var exportState = el("button", "secondaryLink", "Export");
    exportState.type = "button";
    var importState = el("button", "secondaryLink", "Import");
    importState.type = "button";
    var importInput = document.createElement("input");
    importInput.id = "guideImport";
    importInput.className = "visuallyHidden";
    importInput.type = "file";
    importInput.accept = "application/json,.json";
    importInput.tabIndex = -1;
    var restoreState = el("button", "secondaryLink", "Restore backup");
    restoreState.type = "button";
    restoreState.hidden = !stateApi.backupAvailable();
    var resetState = el("button", "textButton", "Reset this reading");
    resetState.type = "button";
    stateActions.appendChild(saveState);
    stateActions.appendChild(exportState);
    stateActions.appendChild(importState);
    stateActions.appendChild(restoreState);
    stateActions.appendChild(resetState);
    stateBody.appendChild(stateActions);
    stateBody.appendChild(importInput);
    stateCard.appendChild(stateBody);
    controlStrip.appendChild(stateCard);

    function renderLensCard(lens, index) {
      var source = criticismById[lens.sourceId] || {};
      var card = el("article", "lensCard");
      card.dataset.criticismSource = lens.sourceId || "";
      var head = el("div", "lensHead");
      var identity = el("div", "lensIdentity");
      identity.appendChild(el("h3", "", source.person || lens.sourceId || "Named critical lens"));
      var identityBits = [];
      if (source.role) identityBits.push(source.role);
      if (source.title) identityBits.push(source.title);
      if (identityBits.length) identity.appendChild(el("p", "", identityBits.join(" · ")));
      head.appendChild(identity);
      var links = el("div", "lensLinks");
      var sourceLink = externalLink("Read source ↗", source.url, "lensSourceLink");
      if (sourceLink) links.appendChild(sourceLink);
      if (source.credentialsUrl && source.credentialsUrl !== source.url) {
        links.appendChild(externalLink("About scholar ↗", source.credentialsUrl, "lensCredentialsLink"));
      }
      if (links.children.length) head.appendChild(links);
      card.appendChild(head);
      if (lens.claim) card.appendChild(el("p", "lensClaim", lens.claim));
      asArray(lens.paraphrase).forEach(function (paragraph) {
        card.appendChild(el("p", "lensParaphrase", paragraph));
      });
      if (lens.briefExcerpt) {
        var excerptText = typeof lens.briefExcerpt === "string" ? lens.briefExcerpt : lens.briefExcerpt.text;
        if (excerptText) {
          var excerpt = el("blockquote", "lensExcerpt", "“" + excerptText + "”");
          excerpt.setAttribute("cite", source.url || "");
          card.appendChild(excerpt);
        }
      }
      if (lens.locator) card.appendChild(el("p", "lensMeta", "Where to verify: " + lens.locator));
      if (lens.limit) card.appendChild(el("p", "lensMeta lensLimit", "Where this lens stops: " + lens.limit));
      var rightsBits = [];
      if (source.accessMode) rightsBits.push(source.accessMode);
      if (source.rightsBasis) rightsBits.push(source.rightsBasis);
      if (rightsBits.length) card.appendChild(el("p", "lensMeta", "Access: " + rightsBits.join(" · ") + "."));
      return card;
    }

    guide.units.forEach(function (unit, index) {
      var details = el("details", "guideUnit");
      if (unit.id === resumeUnitId) details.open = true;
      details.dataset.unitId = unit.id;
      details.id = "unit-" + unit.id;
      var summary = document.createElement("summary");
      summary.setAttribute("aria-label", (isScenePath ? "Scene " : "Section ") + (index + 1) + ": " + unit.title);
      summary.appendChild(el("span", "unitNumber", String(index + 1)));
      summary.appendChild(el("span", "unitTitle", unit.title));
      var unitMetaBits = [];
      if (unit.estimatedMinutes) unitMetaBits.push(unit.estimatedMinutes + " min");
      if (unit.themes && unit.themes.length) unitMetaBits.push(unit.themes.slice(0, 2).join(" · "));
      if (unitMetaBits.length) summary.appendChild(el("span", "unitMeta", unitMetaBits.join(" · ")));
      details.appendChild(summary);
      var content = el("div", "guideUnitContent");
      var sourceSection = sourceSections[unit.id];
      var original = el("section", "sourceSection");
      original.setAttribute("aria-label", "Original source " + unitNoun + " " + (index + 1));
      var sourceLayerBits = ["Original", guide.source.author];
      if (guide.source.translator) sourceLayerBits.push(guide.source.translator + " translation");
      sourceLayerBits.push(isScenePath ? "selected passage" : "page as captured");
      original.appendChild(el("p", "layerLabel", sourceLayerBits.join(" · ")));
      original.appendChild(el("p", "sourceLocator", unit.locator));
      if (!isScenePath && unit.id === "opening" && guide.reproductionPolicy && guide.reproductionPolicy.thirdPartyNote) {
        original.appendChild(el("p", "thirdPartyNote", guide.reproductionPolicy.thirdPartyNote));
      }
      var sourceText = el("div", "sourceTextBlocks");
      sourceText.dataset.sourceSection = unit.id;
      sourceText.dataset.sourceSectionSha256 = sourceSection ? sourceSection.normalizedSha256 : "";
      if (sourceSection) {
        sourceSection.blocks.forEach(function (block, blockIndex) {
          sourceText.appendChild(renderSourceBlock(block, blockIndex));
        });
      } else {
        sourceText.appendChild(el("p", "provenanceBand", "This selected passage is missing from the generated source snapshot."));
      }
      original.appendChild(sourceText);
      var sourceCredit = el("p", "sourceCredit");
      sourceCredit.appendChild(document.createTextNode(isScenePath ? "Exact selected passage · " : "Exact source snapshot · "));
      var inSource = el("a", "sourceJump", isScenePath ? "open full edition ↗" : "view current source ↗");
      inSource.href = guide.source.url;
      inSource.target = "_blank";
      inSource.rel = "noopener";
      sourceCredit.appendChild(inSource);
      original.appendChild(sourceCredit);
      content.appendChild(original);

      var guideSide = el("div", "guideSide");
      if (isScenePath && unit.clearTranslation) {
        var translation = el("details", "clearTranslationCard");
        var translationSummary = document.createElement("summary");
        translationSummary.textContent = "Clear translation · open when the wording slows you down";
        translationSummary.setAttribute("aria-label", "Open clear translation for " + unit.title);
        translation.appendChild(translationSummary);
        var translationBody = el("div", "clearTranslationBody");
        translationBody.appendChild(el("p", "layerLabel", "Clear translation · selective direct rewrite"));
        translationBody.appendChild(el("p", "translationScope", unit.clearTranslation.scope));
        asArray(unit.clearTranslation.text).forEach(function (paragraph) {
          translationBody.appendChild(el("p", "translationText", paragraph));
        });
        translationBody.appendChild(el("p", "translationWhy", "Translation note: " + unit.clearTranslation.why));
        translation.appendChild(translationBody);
        guideSide.appendChild(translation);
        analysisCards.push(translation);
      }

      var analysis = el("details", "analysisCard");
      var analysisSummary = document.createElement("summary");
      analysisSummary.textContent = isScenePath
        ? "Context + " + (unit.lenses || []).length + " named lens" + ((unit.lenses || []).length === 1 ? "" : "es") + " · optional"
        : "Wisdom analysis · optional";
      analysisSummary.setAttribute("aria-label", "Open optional guide for " + unit.title);
      analysis.appendChild(analysisSummary);
      var analysisBody = el("div", "analysisBody");
      if (isScenePath) {
        analysisBody.appendChild(el("p", "layerLabel", "Guide · editorial context and attributed critical lenses"));
        var context = el("section", "analysisSection sceneContext");
        context.appendChild(el("p", "layerLabel", "Context before interpretation"));
        asArray(unit.context).forEach(function (paragraph) { context.appendChild(el("p", "", paragraph)); });
        analysisBody.appendChild(context);

        var lensSection = el("section", "analysisSection namedLenses");
        lensSection.appendChild(el("p", "layerLabel", "Named critical lenses · linked paraphrase, not copied criticism"));
        var lensStack = el("div", "lensStack");
        (unit.lenses || []).forEach(function (lens, lensIndex) {
          lensStack.appendChild(renderLensCard(lens, lensIndex));
        });
        lensSection.appendChild(lensStack);
        analysisBody.appendChild(lensSection);

        var synthesis = el("section", "analysisSection wisdomSynthesis");
        synthesis.appendChild(el("p", "layerLabel", "Wisdom synthesis · hold the lenses together"));
        asArray(unit.wisdomSynthesis).forEach(function (paragraph) { synthesis.appendChild(el("p", "", paragraph)); });
        analysisBody.appendChild(synthesis);

        var promptGrid = el("div", "unitPromptGrid");
        var comprehension = el("section", "unitPrompt comprehensionPrompt");
        comprehension.appendChild(el("p", "layerLabel", "Check your understanding"));
        comprehension.appendChild(el("p", "", unit.comprehensionPrompt));
        promptGrid.appendChild(comprehension);
        var outputPrompt = el("section", "unitPrompt outputPrompt");
        outputPrompt.appendChild(el("p", "layerLabel", "Output / action"));
        outputPrompt.appendChild(el("p", "", unit.outputPrompt));
        promptGrid.appendChild(outputPrompt);
        analysisBody.appendChild(promptGrid);
      } else {
        analysisBody.appendChild(el("p", "layerLabel", "Wisdom analysis · editorial, not the source author's words"));
        (unit.analysis || []).forEach(function (paragraph) { analysisBody.appendChild(el("p", "", paragraph)); });
        var prompt = el("section", "comprehensionPrompt");
        prompt.appendChild(el("p", "layerLabel", "Check your understanding"));
        prompt.appendChild(el("p", "", unit.comprehensionPrompt));
        analysisBody.appendChild(prompt);
      }

      if ((unit.notes && unit.notes.length) || (unit.formulaNotes && unit.formulaNotes.length)) {
        var notes = el("details", "frictionNotes");
        var notesSummary = document.createElement("summary");
        notesSummary.textContent = "Notes only if needed";
        notes.appendChild(notesSummary);
        var noteList = document.createElement("dl");
        (unit.notes || []).forEach(function (note) {
          noteList.appendChild(el("dt", "", note.target + " — " + note.meaning));
          noteList.appendChild(el("dd", "", note.explanation));
        });
        (unit.formulaNotes || []).forEach(function (formula) {
          noteList.appendChild(el("dt", "formulaTerm", formula.expression));
          noteList.appendChild(el("dd", "", "Read as: " + formula.spoken + ". " + formula.explanation));
          (formula.symbols || []).forEach(function (item) {
            noteList.appendChild(el("dd", "formulaSymbol", item.symbol + " — " + item.meaning));
          });
          if (formula.workedExample) noteList.appendChild(el("dd", "formulaExample", "Example: " + formula.workedExample));
        });
        notes.appendChild(noteList);
        analysisBody.appendChild(notes);
      }
      analysis.appendChild(analysisBody);
      guideSide.appendChild(analysis);
      content.appendChild(guideSide);
      analysisCards.push(analysis);

      var completeLabel = el("label", "unitComplete");
      var check = document.createElement("input");
      check.type = "checkbox";
      check.dataset.unitId = unit.id;
      check.setAttribute("aria-label", "Mark " + unit.title + " read");
      completeLabel.appendChild(check);
      completeLabel.appendChild(document.createTextNode(" I read this " + unitNoun));
      content.appendChild(completeLabel);
      details.appendChild(content);
      guidePanel.appendChild(details);
      unitChecks[unit.id] = check;
      unitDetails[unit.id] = details;
      unitSummaries[unit.id] = summary;
    });

    if (guide.counterargument) {
      var counter = el("details", "counterargumentCard");
      var counterSummary = document.createElement("summary");
      counterSummary.textContent = isScenePath ? "Strongest counter-reading" : "Strongest counterargument";
      counter.appendChild(counterSummary);
      counter.appendChild(el("p", "counterPrompt", guide.counterargument.prompt));
      counter.appendChild(el("p", "", guide.counterargument.strongestCase));
      guidePanel.appendChild(counter);
    }

    var reflection = el("section", "reflectionCard");
    reflection.appendChild(el("p", "layerLabel", "Optional memory"));
    reflection.appendChild(el("h2", "", "One idea, one next move"));
    var teachLabel = el("label", "fieldLabel", guide.reflection.teachBack);
    teachLabel.htmlFor = "guideTeachBack";
    var teachInput = document.createElement("textarea");
    teachInput.id = "guideTeachBack";
    teachInput.className = "stateTextarea";
    teachInput.rows = 3;
    teachInput.maxLength = 5000;
    teachInput.placeholder = "Leave blank until these are your words.";
    teachLabel.appendChild(teachInput);
    reflection.appendChild(teachLabel);
    var outputLabel = el("label", "fieldLabel", guide.reflection.output);
    outputLabel.htmlFor = "guideOutput";
    var outputInput = document.createElement("textarea");
    outputInput.id = "guideOutput";
    outputInput.className = "stateTextarea";
    outputInput.rows = 3;
    outputInput.maxLength = 5000;
    outputInput.placeholder = "One real next action; no reaction is pre-filled.";
    outputLabel.appendChild(outputInput);
    reflection.appendChild(outputLabel);
    var saveReflection = el("button", "primaryLink", "Save reflection");
    saveReflection.type = "button";
    reflection.appendChild(saveReflection);
    guidePanel.appendChild(reflection);

    var nextCard = el("section", "nextDecisionCard");
    nextCard.appendChild(el("p", "layerLabel", "Transparent next decision"));
    var nextContent = el("div", "nextDecisionContent");
    nextCard.appendChild(nextContent);
    guidePanel.appendChild(nextCard);

    columns.appendChild(guidePanel);
    articleBody.appendChild(columns);
    setMode(false);

    continueLink.addEventListener("click", function (event) {
      event.preventDefault();
      var targetId = continueLink.dataset.targetUnit;
      var target = unitDetails[targetId];
      if (!target) return;
      target.open = true;
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      window.setTimeout(function () { unitSummaries[targetId].focus({ preventScroll: true }); }, reduceMotion ? 0 : 250);
    });

    function updateControls() {
      statusSelect.value = current.status;
      noteInput.value = current.note;
      teachInput.value = current.teachBack;
      outputInput.value = current.output;
      Object.keys(unitChecks).forEach(function (id) {
        unitChecks[id].checked = current.completedUnitIds.indexOf(id) !== -1;
      });
      progress.value = current.completedUnitIds.length;
      progressText.textContent = current.completedUnitIds.length + " of " + unitIds.length;
      var continueUnitId = unitIds.find(function (id) { return current.completedUnitIds.indexOf(id) === -1; }) || unitIds[unitIds.length - 1];
      var continueIndex = unitIds.indexOf(continueUnitId) + 1;
      continueLink.dataset.targetUnit = continueUnitId;
      continueLink.href = "#unit-" + continueUnitId;
      continueLink.textContent = (current.completedUnitIds.length === unitIds.length ? "Review " : "Continue ") + unitNoun + " " + continueIndex + " of " + unitIds.length;
      var stateNames = { unread: "Unread", reading: "Reading", finished: "Finished", dropped: "Dropped" };
      stateSummaryText.textContent = (stateNames[current.status] || current.status) + " · " + current.completedUnitIds.length + " of " + unitIds.length + " · state & note";
      stateSummary.setAttribute("aria-label", (stateNames[current.status] || current.status) + ": " + current.completedUnitIds.length + " of " + unitIds.length + " " + unitNounPlural + "; open state and note");
      restoreState.hidden = !stateApi.backupAvailable();
      nextContent.textContent = "";
      if (current.status === "dropped" || current.status === "finished") {
        var next = asArray(guide.curatedNext)[0];
        nextContent.appendChild(el("p", "", "Because you chose " + current.status + ", the queue reveals one next reading—not the source's whole link graph."));
        if (next) {
          var nextLink = el("a", "primaryLink", next.title + " →");
          nextLink.href = "index.html?essay=" + encodeURIComponent(next.id);
          nextContent.appendChild(nextLink);
          nextContent.appendChild(el("p", "nextWhy", next.why));
        }
      } else {
        nextContent.appendChild(el("p", "", "The next reading stays hidden until you explicitly choose Finished or Dropped. Completing a " + unitNoun + " never marks the whole reading finished, and opening source links never marks them read."));
      }
    }

    function save(message) {
      current.status = statusSelect.value;
      current.note = noteInput.value;
      current.teachBack = teachInput.value;
      current.output = outputInput.value;
      var result = stateApi.saveEssay(data.id, current, unitIds, guide.initialState);
      current = result.state;
      updateControls();
      showToast(result.ok ? message : "Could not save in this browser");
    }

    Object.keys(unitChecks).forEach(function (id) {
      unitChecks[id].addEventListener("change", function () {
        var set = new Set(current.completedUnitIds);
        if (unitChecks[id].checked) set.add(id); else set.delete(id);
        current.completedUnitIds = unitIds.filter(function (unitId) { return set.has(unitId); });
        if (current.status === "unread" && unitChecks[id].checked) statusSelect.value = "reading";
        save(unitChecks[id].checked ? (isScenePath ? "Scene saved" : "Section saved") : (isScenePath ? "Scene reopened" : "Section reopened"));
      });
    });
    statusSelect.addEventListener("change", function () { save("Decision saved"); });
    saveState.addEventListener("click", function () { save("State saved"); });
    saveReflection.addEventListener("click", function () { save("Reflection saved"); });
    exportState.addEventListener("click", function () {
      var blob = new Blob([stateApi.exportJson()], { type: "application/json" });
      var href = URL.createObjectURL(blob);
      var download = document.createElement("a");
      download.href = href;
      download.download = "wisdom-essay-reader-state.json";
      document.body.appendChild(download);
      download.click();
      document.body.removeChild(download);
      URL.revokeObjectURL(href);
      showToast("State exported");
    });
    importState.addEventListener("click", function () { importInput.click(); });
    importInput.addEventListener("change", function () {
      var file = importInput.files && importInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          stateApi.importJson(String(reader.result || ""));
          current = stateApi.getEssay(data.id, unitIds, guide.initialState).state;
          updateControls();
          showToast("State imported");
        } catch (error) {
          showToast(error.message || "Import failed");
        }
        importInput.value = "";
      };
      reader.readAsText(file);
    });
    restoreState.addEventListener("click", function () {
      try {
        stateApi.restoreBackup();
        current = stateApi.getEssay(data.id, unitIds, guide.initialState).state;
        updateControls();
        showToast("Backup restored");
      } catch (error) {
        showToast(error.message || "Restore failed");
      }
    });
    resetState.addEventListener("click", function () {
      if (!window.confirm("Reset this reading to the recorded starting point and clear its local notes?")) return;
      stateApi.resetEssay(data.id);
      current = stateApi.getEssay(data.id, unitIds, guide.initialState).state;
      updateControls();
      showToast("Essay state reset");
    });

    updateControls();
    applyFontSize();
  }

  function renderText(data) {
    renderHeaderFromEntry(Object.assign({}, entry || {}, data));
    sourceLine.textContent = (data.sourceLabel || "") + (data.sourcePage ? " · " + data.sourcePage : "");
    if (data.provenance && data.provenance.indexOf("model") === 0) {
      var band = el("p", "provenanceBand",
        "Seeded canonical text, pending source verification - running scripts/build_essays_sources.py replaces it with the fetched library text.");
      provenanceSlot.appendChild(band);
    }
    if (data.sourceVersionNote) {
      var sourceVersionDetails = el("details", "sourceVersionDetails");
      var sourceVersionSummary = document.createElement("summary");
      sourceVersionSummary.textContent = "Source version";
      sourceVersionDetails.appendChild(sourceVersionSummary);
      sourceVersionDetails.appendChild(el("p", "", data.sourceVersionNote));
      provenanceSlot.appendChild(sourceVersionDetails);
    }
    if (data.guideIntro && data.guideIntro.length) {
      var guideBand = document.getElementById("guideBand");
      var guideIntro = document.getElementById("guideIntro");
      readerContext.hidden = false;
      guideBand.hidden = false;
      data.guideIntro.forEach(function (paragraph) {
        guideIntro.appendChild(el("p", "", paragraph));
      });
    }
    articleBody.setAttribute("lang", data.language || "en");
    if (data.annotatedParagraphs && data.annotatedParagraphs.length) {
      var key = el("p", "annotationKey", data.glossLabel || data.annotationLabel || "Pronunciation above · one English meaning below each phrase");
      key.setAttribute("lang", "en");
      articleBody.appendChild(key);
      if (data.translationMethod) {
        var method = el("p", "annotationMethod", data.translationMethod);
        method.setAttribute("lang", "en");
        articleBody.appendChild(method);
      }
      if (data.glossSource) {
        var credit = el("p", "glossCredit", "Word meanings: ");
        var sourceLink = el("a", "", data.glossSource.name);
        sourceLink.href = data.glossSource.url;
        sourceLink.rel = "noopener";
        sourceLink.target = "_blank";
        credit.appendChild(sourceLink);
        credit.appendChild(document.createTextNode(" · "));
        var licenseLink = el("a", "", data.glossSource.license);
        licenseLink.href = data.glossSource.licenseUrl;
        licenseLink.rel = "noopener";
        licenseLink.target = "_blank";
        credit.appendChild(licenseLink);
        articleBody.appendChild(credit);
      }
    }
    data.paragraphs.forEach(function (paragraph, index) {
      var annotated = data.annotatedParagraphs && data.annotatedParagraphs[index];
      if (annotated) renderAnnotatedParagraph(annotated, index, data.language || "en");
      else {
        var p = el("p", "", paragraph);
        p.id = "p" + (index + 1);
        articleBody.appendChild(p);
      }
      var note = data.notes && data.notes[String(index + 1)];
      if (note) {
        var noteDetails = el("details", "paraNote");
        noteDetails.setAttribute("aria-label", "Reader note for paragraph " + (index + 1));
        noteDetails.appendChild(el("summary", "", "Reader note"));
        noteDetails.appendChild(el("p", "", note));
        articleBody.appendChild(noteDetails);
      }
    });
    applyFontSize();
    renderCopyButton(annotationCopyText(data), data.title);
    renderAudio(data);
    if (entry) renderPager(entry);
  }

  function fail(message) {
    titleEl.textContent = "Essay not found";
    byline.textContent = message || "Unknown essay id.";
  }

  if (!essayId) {
    fail("Open this page from the Essay Library.");
    return;
  }

  if (!entry) {
    // catalog may be stale relative to a fresh text folder; try the data file anyway
    loadData(essayId, renderText, function () { fail("Not in the catalog. Rebuild catalog.js."); });
    return;
  }

  if (entry.hasLinkedGuide) {
    loadData(essayId, renderLinkedGuide, function () {
      renderHeaderFromEntry(entry);
      renderMetaCard(entry, "Guide data missing", "The catalog knows about this guided path, but its generated data is missing. Re-run scripts/build_essays_reader_data.py.");
    });
  } else if (entry.status === "full-text") {
    loadData(essayId, renderText, function () {
      renderHeaderFromEntry(entry);
      renderMetaCard(entry, "Text data missing", "catalog.js says this text exists, but its data.js did not load. Re-run scripts/build_essays_reader_data.py.");
    });
  } else if (entry.status === "pending-fetch") {
    renderHeaderFromEntry(entry);
    sourceLine.textContent = "Verified public-domain source configured - text not fetched into the repo yet.";
    renderMetaCard(entry, "In the fetch pipeline",
      "This essay is public domain and its source is already configured. Run `python3 scripts/build_essays_sources.py --only " + entry.id + "` (or the full build) from a network-enabled machine, commit, and this page becomes the full reader.");
  } else {
    renderHeaderFromEntry(entry);
    sourceLine.textContent = "Stored as metadata only - the text stays with its rights holder.";
    renderMetaCard(entry, entry.status === "external-reader" ? "Already in the library" : "Copyright shelf",
      entry.status === "external-reader"
        ? "This text already has its own guided reader on this site."
        : "Read it at the link below. The row keeps the name, the why, and the rights status so the shelf stays complete.");
  }

  function loadData(id, onLoad, onError) {
    var script = document.createElement("script");
    var dataFile = entry && entry.id === id && entry.dataFile ? entry.dataFile : "data.js";
    script.src = "../texts/" + encodeURIComponent(id) + "/wisdom/" + encodeURIComponent(dataFile);
    script.onload = function () {
      if (window.ESSAY_TEXT && window.ESSAY_TEXT.id === id) {
        onLoad(window.ESSAY_TEXT);
      } else {
        onError();
      }
    };
    script.onerror = onError;
    document.head.appendChild(script);
  }
})();
