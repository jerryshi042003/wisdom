(function () {
  "use strict";

  var LONG_STATE_KEY = "wisdom-reader-v1-state";
  var GROUPS = [
    {
      target: "epicWorlds",
      books: [
        { source: "essay", id: "homer-odyssey", title: "The Odyssey", detail: "Emily Wilson · 24-book companion", href: "/wisdom/essays/reader/index.html?essay=homer-odyssey", provenance: { label: "Source receipt", verified_as: "Emily Wilson's 2017 Norton translation · ISBN 9780393089059.", access_rights: "Wisdom stores only the rights-safe companion; the copyrighted translation remains in Jerry's lawful copy.", text_label: "Open the 24-book companion", text_url: "/wisdom/essays/reader/index.html?essay=homer-odyssey", claim: "Use this companion beside Emily Wilson's 2017 Norton translation, ISBN 9780393089059. Wisdom stores no Wilson source body.", fidelity: "Personal-copy companion · copyrighted translation remains in Jerry's lawful copy." } },
        { source: "long", id: "arabian-nights", reportedStatus: "Paused · opening read" },
        { source: "long", id: "don-quixote" }
      ]
    },
    {
      target: "selfRole",
      books: [
        { source: "long", id: "ivan" },
        { source: "long", id: "seneca" },
        { source: "long", id: "nietzsche" }
      ]
    },
    {
      target: "nextClassics",
      books: [
        {
          source: "external",
          id: "moby-dick",
          title: "Moby-Dick",
          detail: "Herman Melville · Start with the comic voice, not the symbol system",
          href: "https://www.gutenberg.org/ebooks/2701",
          provenance: {
            verified_as: "Complete 1851 novel · Project Gutenberg eBook 2701.",
            access_rights: "Public domain in the USA; the complete text stays with Project Gutenberg.",
            what_changed: "Added as a real complete-book path. Read Chapters 1–3 before deciding whether the digressions feel alive or merely obstructive.",
            text_label: "Read the complete book",
            text_url: "https://www.gutenberg.org/ebooks/2701"
          }
        },
        {
          source: "external",
          id: "middlemarch",
          title: "Middlemarch",
          detail: "George Eliot · Watch good intentions enter social systems",
          href: "https://www.gutenberg.org/ebooks/145",
          provenance: {
            verified_as: "Complete 1871–72 novel · Project Gutenberg eBook 145.",
            access_rights: "Public domain in the USA; the complete text stays with Project Gutenberg.",
            what_changed: "Added as a real complete-book path. The Prelude and Book I establish the central question: what happens when moral ambition has no adequate form?",
            text_label: "Read the complete book",
            text_url: "https://www.gutenberg.org/ebooks/145"
          }
        },
        {
          source: "external",
          id: "brothers-karamazov",
          title: "The Brothers Karamazov",
          detail: "Fyodor Dostoevsky · A family argument enlarged into moral philosophy",
          href: "https://www.gutenberg.org/ebooks/28054",
          provenance: {
            verified_as: "Complete Constance Garnett translation · Project Gutenberg eBook 28054.",
            access_rights: "The Garnett translation is public domain in the USA; the complete text stays with Project Gutenberg.",
            what_changed: "Added as a real complete-book path. Begin by tracking what each brother treats as evidence before trying to solve the novel's theology.",
            text_label: "Read the complete book",
            text_url: "https://www.gutenberg.org/ebooks/28054"
          }
        }
      ]
    }
  ];

  var longData = window.WISDOM_V1_DATA || { works: [] };
  var longModel = window.WISDOM_V1_MODEL;
  var catalog = window.ESSAY_CATALOG || { essays: [] };
  var essayState = window.WisdomEssayState;
  var stateNotice = document.getElementById("stateNotice");

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function announce(message) {
    stateNotice.textContent = message;
    stateNotice.hidden = !message;
  }

  function loadLongState() {
    if (!longModel) return { state: { schemaVersion: 1, activeWorkId: null, works: {} }, recovered: true };
    try {
      var raw = localStorage.getItem(LONG_STATE_KEY);
      return {
        state: raw ? longModel.normalizeState(JSON.parse(raw), longData) : longModel.defaultState(),
        recovered: false
      };
    } catch (error) {
      return { state: longModel.defaultState(), recovered: true };
    }
  }

  function longRecord(config, longState) {
    var work = longData.works.find(function (item) { return item.id === config.id; });
    if (!work || !longModel) return null;
    var saved = longModel.workState(longState, work);
    var completed = saved.completedUnitIds.length;
    var total = work.units.length;
    var current = work.units.find(function (unit) { return unit.id === saved.unitId; }) || work.units[0];
    var mode = work.modes.indexOf(saved.mode) !== -1 ? saved.mode : work.defaultMode;
    var modeParam = work.modeParams[mode] || work.modeParams[work.defaultMode];
    var href = "/wisdom/" + work.readerHref.replace(/^\/+/, "");
    if (modeParam) href += "?mode=" + encodeURIComponent(modeParam);
    if (current) href += "#chapter-" + encodeURIComponent(current.id);
    var hasStoredState = Boolean(longState.works && longState.works[config.id]);
    var provenance = work.source && work.source.provenance ? work.source.provenance : {
      label: "Source receipt",
      claim: work.source.version,
      text_label: work.source.label,
      text_url: work.source.url,
      fidelity: "The reader identifies its edition and links the source of record."
    };
    return {
      title: work.title,
      detail: work.person + " · " + total + " " + (total === 1 ? work.unitLabel.toLowerCase() : work.unitLabel.toLowerCase() + "s"),
      href: href,
      status: !hasStoredState && config.reportedStatus ? "reading" : (saved.status || "unread"),
      reportedStatus: !hasStoredState ? config.reportedStatus : "",
      completed: completed,
      total: total,
      provenance: provenance
    };
  }

  function essayRecord(config) {
    var essay = catalog.essays.find(function (item) { return item.id === config.id; });
    if (!essay || !essayState) return null;
    var loaded = essayState.getEssay(essay.id, essay.guideUnitIds || [], essay.guideInitialState || null);
    return {
      title: config.title,
      detail: config.detail,
      href: config.href,
      status: loaded.state.status || "unread",
      completed: loaded.state.completedUnitIds.length,
      total: (essay.guideUnitIds || []).length,
      recovered: loaded.recovered,
      provenance: config.provenance || null
    };
  }

  function externalRecord(config) {
    return {
      title: config.title,
      detail: config.detail,
      href: config.href,
      status: "unread",
      completed: 0,
      total: 0,
      provenance: config.provenance
    };
  }

  function statusText(book) {
    if (book.reportedStatus) return book.reportedStatus;
    if (book.status === "finished") return "Finished";
    if (book.status === "dropped") return "Dropped";
    if (book.status === "reading") return book.completed + " of " + book.total + " · In progress";
    if (book.completed > 0) return book.completed + " of " + book.total;
    return "Not started";
  }

  function actionText(status) {
    if (status === "finished") return "Reread";
    if (status === "reading") return "Continue";
    if (status === "dropped") return "Reopen";
    return "Open";
  }

  function receiptLine(body, label, value) {
    if (!value) return;
    var line = element("p", "bookReceiptLine");
    line.appendChild(element("strong", "", label + ": "));
    line.appendChild(document.createTextNode(value));
    body.appendChild(line);
  }

  function renderCard(book, order) {
    var article = element("article", "bookCard");
    var link = element("a", "bookLink");
    link.href = book.href;
    link.setAttribute("aria-label", actionText(book.status) + " " + book.title);

    var index = element("span", "bookIndex", String(order).padStart(2, "0"));
    index.setAttribute("aria-hidden", "true");
    link.appendChild(index);

    var copy = element("span", "bookCopy");
    copy.appendChild(element("span", "bookTitle", book.title));
    copy.appendChild(element("span", "bookDetail", book.detail));
    link.appendChild(copy);

    var state = element("span", "bookState");
    state.appendChild(element("span", "bookStatus", statusText(book)));
    state.appendChild(element("span", "bookAction", actionText(book.status)));
    link.appendChild(state);

    article.appendChild(link);
    if (book.provenance) {
      var details = element("details", "bookProvenance");
      details.appendChild(element("summary", "bookProvenanceSummary", "Source receipt"));
      var body = element("div", "bookProvenanceBody");
      receiptLine(body, "Found via", book.provenance.found_via);
      receiptLine(body, "Verified as", book.provenance.verified_as || book.provenance.claim);
      receiptLine(body, "Access & rights", book.provenance.access_rights || book.provenance.fidelity);
      receiptLine(body, "What changed", book.provenance.what_changed);
      var links = element("p", "bookProvenanceLinks");
      if (book.provenance.reference_label && book.provenance.reference_url) {
        var reference = element("a", "", book.provenance.reference_label);
        reference.href = book.provenance.reference_url;
        reference.target = "_blank";
        reference.rel = "noreferrer";
        links.appendChild(reference);
      }
      if (book.provenance.text_label && book.provenance.text_url) {
        if (links.childNodes.length) links.appendChild(document.createTextNode(" · "));
        var source = element("a", "", book.provenance.text_label);
        source.href = book.provenance.text_url;
        if (/^https?:/.test(book.provenance.text_url)) {
          source.target = "_blank";
          source.rel = "noreferrer";
        }
        links.appendChild(source);
      }
      if (book.provenance.related_label && book.provenance.related_url) {
        if (links.childNodes.length) links.appendChild(document.createTextNode(" · "));
        var related = element("a", "", book.provenance.related_label);
        related.href = book.provenance.related_url;
        if (/^https?:/.test(book.provenance.related_url)) {
          related.target = "_blank";
          related.rel = "noreferrer";
        }
        links.appendChild(related);
      }
      if (links.childNodes.length) body.appendChild(links);
      details.appendChild(body);
      article.appendChild(details);
    }
    return article;
  }

  function render() {
    var loadedLong = loadLongState();
    var recoveredEssay = false;
    var failed = false;

    GROUPS.forEach(function (group) {
      var target = document.getElementById(group.target);
      target.textContent = "";
      group.books.forEach(function (config, index) {
        var book = config.source === "essay"
          ? essayRecord(config)
          : (config.source === "external" ? externalRecord(config) : longRecord(config, loadedLong.state));
        if (!book) {
          failed = true;
          return;
        }
        recoveredEssay = recoveredEssay || Boolean(book.recovered);
        target.appendChild(renderCard(book, index + 1));
      });
    });
    if (failed) announce("One book record could not be loaded.");
    else if (loadedLong.recovered || recoveredEssay) announce("Saved progress could not be read. Open a reader to recover or start again.");
    else announce("");
  }

  render();
  window.addEventListener("pageshow", render);
  window.addEventListener("storage", function (event) {
    if (event.key === LONG_STATE_KEY || (essayState && event.key === essayState.STORAGE_KEY)) render();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") render();
  });
})();
