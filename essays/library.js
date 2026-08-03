(function () {
  "use strict";

  var catalog = window.ESSAY_CATALOG || { essays: [] };
  var essays = Array.isArray(catalog.essays) ? catalog.essays.slice() : [];
  var longData = window.WISDOM_V1_DATA || {works: [], searchRecords: []};

  var DOMAINS = [
    {
      id: "stories",
      label: "Stories",
      note: "Recent reads first; no new recommendation wall.",
      path: [
        {
          id: "story-swim-team",
          title: "The Swim Team",
          author: "Miranda July",
          displayStatus: "Read · liked a lot",
          idea: "A repeated practice gives lonely time a shape.",
          href: "https://cdn.waterstones.com/special/pdf/9781782116295.pdf#page=13"
        },
        {
          id: "story-cathedral",
          title: "Cathedral",
          author: "Raymond Carver",
          displayStatus: "Finished · liked",
          idea: "Connection arrives through doing something together.",
          href: "https://cdn.theatlantic.com/assets/media/files/sept_1981_-_carver_-_cathedral.pdf"
        },
        {
          id: "story-the-south",
          title: "The South",
          author: "Jorge Luis Borges",
          displayStatus: "Read · reread anytime",
          idea: "A chosen ending can feel more alive than prolonged survival.",
          href: "https://www.penguinrandomhouse.com/books/16193/ficciones-by-jorge-luis-borges-introduction-by-john-sturrock/9780679422990/"
        }
      ]
    },
    {
      id: "life",
      label: "Life & practice",
      note: "Move from intention to a practice that survives mood.",
      pathIds: ["marcus-aurelius-book-2", "marcus-aurelius-book-5", "james-laws-of-habit"]
    },
    {
      id: "society",
      label: "Self & society",
      note: "Notice approval, institutions, and the stories people inherit.",
      pathIds: ["orwell-shooting-elephant", "orwell-why-i-write", "orwell-politics-english"]
    },
    {
      id: "systems",
      label: "Thinking & systems",
      note: "Stay with Tao before moving to Dijkstra or another teacher.",
      pathIds: ["tao-genius", "tao-work-hard"],
      pathTail: {
        id: "tao-dumb-questions",
        title: "Ask Yourself Dumb Questions—and Answer Them!",
        author: "Terence Tao",
        displayStatus: "At Tao’s site",
        idea: "A basic question can expose the hidden assumption keeping a hard problem vague.",
        href: "https://terrytao.wordpress.com/career-advice/ask-yourself-dumb-questions-and-answer-them/"
      }
    },
    {
      id: "art",
      label: "Art & writing",
      note: "Follow one voice across attention, craft, and style.",
      pathIds: ["dfw-this-is-water", "dfw-federer", "dfw-tense-present"]
    },
    {
      id: "design",
      label: "Design judgment",
      note: "1 Choose before the reveal. 2 Learn the vocabulary. 3 Audit one repeated Wisdom interaction: keep, remove, or change.",
      pathIds: ["kowalski-train-judgement", "freiberg-invisible-details"]
    }
  ];

  var PATH_IDEAS = {
    "marcus-aurelius-book-2": "Rehearse the difficult day before other people choose your mood.",
    "marcus-aurelius-book-5": "Getting out of bed is part of doing the work of a human being.",
    "james-laws-of-habit": "Make useful action easier through repetition and structure.",
    "orwell-shooting-elephant": "A public role can force a person to perform what he privately rejects.",
    "orwell-why-i-write": "Writing motives mix truth, ego, beauty, and political purpose.",
    "orwell-politics-english": "Bad language can hide bad thought; concrete revision exposes it.",
    "tao-genius": "Mathematical ability grows through accumulated work, tools, questions, and luck.",
    "tao-work-hard": "High-quality, directed effort matters more than exhausted hours.",
    "tao-rigour": "Skill moves from intuition to rigour and eventually to informed intuition.",
    "dfw-this-is-water": "Attention decides whether ordinary life becomes resentment or choice.",
    "dfw-federer": "Technical mastery becomes visible as beauty in a moving body.",
    "dfw-tense-present": "Arguments about usage are also arguments about authority and belonging.",
    "kowalski-train-judgement": "Choose before the reveal; name which purpose, context, or frequency changed your decision.",
    "freiberg-invisible-details": "Use interruptibility, momentum, input, frequency, and restraint to explain why an interaction feels coherent."
  };

  var REPORTED_STATUS = {
    "tao-genius": "Finished"
  };

  var READABLE_STATUS = {
    "full-text": true,
    "permissioned-source": true,
    "guided-source": true,
    "external-reader": true
  };

  var STATUS_LABEL = {
    "full-text": "Read here",
    "permissioned-source": "Read here",
    "guided-source": "Guided here",
    "external-reader": "Open reader",
    "metadata-only": "At source",
    "pending-fetch": "Planned"
  };

  var state = {
    domain: domainFromHash(),
    query: "",
    availability: "ready",
    searchExpandedAvailability: false
  };

  var domainPicker = document.getElementById("domainPicker");
  var domainSelect = document.getElementById("domainSelect");
  var pathKicker = document.getElementById("pathKicker");
  var domainTitle = document.getElementById("domainTitle");
  var domainNote = document.getElementById("domainNote");
  var pathList = document.getElementById("pathList");
  var storyShelfLink = document.getElementById("storyShelfLink");
  var catalogTitle = document.getElementById("catalogTitle");
  var resultCount = document.getElementById("resultCount");
  var catalogResults = document.getElementById("catalogResults");
  var searchInput = document.getElementById("essaySearch");
  var availabilityFilter = document.getElementById("availabilityFilter");

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function findDomain(id) {
    for (var i = 0; i < DOMAINS.length; i += 1) {
      if (DOMAINS[i].id === id) return DOMAINS[i];
    }
    return DOMAINS[0];
  }

  function domainFromHash() {
    var id = window.location.hash.replace(/^#/, "");
    for (var i = 0; i < DOMAINS.length; i += 1) {
      if (DOMAINS[i].id === id) return id;
    }
    return "stories";
  }

  function domainFor(essay) {
    if (essay.author === "Emil Kowalski" || essay.author === "Rauno Freiberg") return "design";
    if (essay.author === "Terence Tao") return "systems";
    if (essay.author === "George Orwell") return "society";
    if (essay.author === "David Foster Wallace") return "art";
    if (essay.shelf === "life-practice" || essay.shelf === "execution") return "life";
    if (essay.shelf === "freedom") return "society";
    if (essay.shelf === "systems") return "systems";
    return "art";
  }

  function essayById(id) {
    for (var i = 0; i < essays.length; i += 1) {
      if (essays[i].id === id) return essays[i];
    }
    return null;
  }

  function hrefFor(essay) {
    if (essay.status === "external-reader" && essay.existingReader) return essay.existingReader;
    return "/wisdom/essays/reader/index.html?essay=" + encodeURIComponent(essay.id);
  }

  function savedStatus(essay) {
    var stored = window.WisdomEssayState && window.WisdomEssayState.storedStatus(essay.id);
    if (REPORTED_STATUS[essay.id] && (!stored || stored === "reading")) return REPORTED_STATUS[essay.id];
    if (!stored) return "";
    return { reading: "In progress", finished: "Finished", dropped: "Dropped" }[stored] || "";
  }

  function statusFor(essay) {
    return savedStatus(essay) || STATUS_LABEL[essay.status] || "Details";
  }

  function oneIdea(essay) {
    if (PATH_IDEAS[essay.id]) return PATH_IDEAS[essay.id];
    var why = String(essay.why || "").replace(/\s+/g, " ").trim();
    if (!why) return (essay.themes || []).slice(0, 3).join(" · ");
    var sentence = why.match(/^.*?[.!?](?:\s|$)/);
    var idea = sentence ? sentence[0].trim() : why;
    if (idea.length > 150) idea = idea.slice(0, 147).replace(/\s+\S*$/, "") + "…";
    return idea;
  }

  function makeRow(item, rank) {
    var link = el("a", rank ? "essayCard pathCard" : "essayCard", "");
    var targetHref = item.href || hrefFor(item);
    link.href = targetHref;
    if (/^https?:/.test(targetHref)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    if (item.id) link.id = (rank ? "path-" : "essay-") + item.id;

    if (rank) link.appendChild(el("span", "pathRank", String(rank)));

    var copy = el("span", "essayCardCopy");
    copy.appendChild(el("strong", "essayTitle", item.title));
    copy.appendChild(el("span", "essayAuthor", item.author));
    copy.appendChild(el("span", "essayIdea", item.idea || oneIdea(item)));
    link.appendChild(copy);
    link.appendChild(el("span", "essayStatus", item.displayStatus || statusFor(item)));
    return link;
  }

  function renderDomains() {
    domainPicker.textContent = "";
    domainSelect.textContent = "";
    DOMAINS.forEach(function (domain) {
      var option = el("option", "", domain.label);
      option.value = domain.id;
      domainSelect.appendChild(option);
      var button = el("button", "domainOption", domain.label);
      button.type = "button";
      button.dataset.domain = domain.id;
      button.setAttribute("aria-pressed", String(domain.id === state.domain));
      button.addEventListener("click", function () {
        chooseDomain(domain.id);
      });
      domainPicker.appendChild(button);
    });
    domainSelect.value = state.domain;
  }

  function chooseDomain(domainId) {
    state.domain = findDomain(domainId).id;
    state.query = "";
    searchInput.value = "";
    if (state.searchExpandedAvailability) {
      state.availability = "ready";
      state.searchExpandedAvailability = false;
      availabilityFilter.value = "ready";
    }
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + state.domain);
    }
    render();
  }

  function renderPath(domain) {
    domainTitle.textContent = domain.label;
    domainNote.textContent = domain.note;
    pathKicker.textContent = domain.id === "stories" ? "Recent reading" : "Read in this order";
    pathList.textContent = "";

    var path = domain.path || (domain.pathIds || []).map(essayById).filter(Boolean);
    if (domain.pathTail) path = path.concat([domain.pathTail]);
    path.slice(0, 3).forEach(function (item, index) {
      var li = el("li", "pathItem");
      li.appendChild(makeRow(item, index + 1));
      pathList.appendChild(li);
    });

    storyShelfLink.hidden = domain.id !== "stories";
  }

  function normalizedHaystack(essay) {
    return [
      essay.id,
      essay.title,
      essay.titleOriginal,
      essay.author,
      essay.authorNative,
      essay.kind,
      essay.why,
      PATH_IDEAS[essay.id],
      (essay.themes || []).join(" ")
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function filteredEssays() {
    var query = state.query.toLowerCase();
    return essays.filter(function (essay) {
      if (query) {
        if (normalizedHaystack(essay).indexOf(query) === -1) return false;
      } else if (domainFor(essay) !== state.domain) {
        return false;
      }
      if (state.availability === "ready" && !READABLE_STATUS[essay.status]) return false;
      return true;
    });
  }

  function groupByAuthor(items) {
    var groups = [];
    var byAuthor = Object.create(null);
    items.forEach(function (essay) {
      var key = essay.author || "Unknown";
      if (!byAuthor[key]) {
        byAuthor[key] = { author: key, essays: [] };
        groups.push(byAuthor[key]);
      }
      byAuthor[key].essays.push(essay);
    });
    return groups;
  }

  function renderAuthorGroups(items, domain) {
    var pathIds = Object.create(null);
    (domain.pathIds || []).forEach(function (id) { pathIds[id] = true; });
    var remaining = items.filter(function (essay) { return !pathIds[essay.id]; });
    var groups = groupByAuthor(remaining);

    if (!groups.length) {
      catalogResults.appendChild(el("p", "emptyState", "The ordered path above contains every ready item in this lane."));
      return;
    }

    var grid = el("div", "authorGrid");
    groups.forEach(function (group) {
      var details = el("details", "authorGroup");
      var summary = el("summary", "authorSummary");
      summary.appendChild(el("strong", "", group.author));
      summary.appendChild(el("span", "", group.essays.length + (group.essays.length === 1 ? " work" : " works")));
      details.appendChild(summary);
      var rows = el("div", "authorRows");
      group.essays.forEach(function (essay) { rows.appendChild(makeRow(essay)); });
      details.appendChild(rows);
      grid.appendChild(details);
    });
    catalogResults.appendChild(grid);
  }

  function renderSearchResults(items) {
    if (!items.length) {
      catalogResults.appendChild(el("p", "emptyState", "No title, author, or idea matches this search."));
      return;
    }
    var list = el("div", "searchResults");
    items.forEach(function (essay) { list.appendChild(makeRow(essay)); });
    catalogResults.appendChild(list);
  }

  function longSearchResults(query) {
    if (!query || !Array.isArray(longData.works) || !Array.isArray(longData.searchRecords)) return [];
    var lowered = query.toLowerCase();
    var firstMatchByWork = Object.create(null);
    longData.searchRecords.forEach(function (record) {
      if (!firstMatchByWork[record.workId] && String(record.text || "").toLowerCase().indexOf(lowered) !== -1) {
        firstMatchByWork[record.workId] = record;
      }
    });
    return longData.works.filter(function (work) { return firstMatchByWork[work.id]; }).map(function (work) {
      var match = firstMatchByWork[work.id];
      var href = "/wisdom/" + String(work.readerHref || "").replace(/^\/+/, "");
      if (match.unitId) href += "#chapter-" + encodeURIComponent(match.unitId);
      return {
        id: "long-" + work.id,
        title: work.title,
        author: work.person,
        idea: "Matched " + (match.type === "passage" ? "a marked passage" : match.type === "unit" ? "chapter context" : "the work path") + ": " + match.label,
        displayStatus: "Long read",
        href: href
      };
    });
  }

  function renderCatalog(domain) {
    var items = filteredEssays();
    catalogResults.textContent = "";

    if (state.query) {
      var longMatches = longSearchResults(state.query);
      catalogTitle.textContent = "Search results";
      var total = items.length + longMatches.length;
      resultCount.textContent = total + (total === 1 ? " result" : " results") + " across essays, chapters, context, and passages";
      renderSearchResults(items.concat(longMatches));
      return;
    }

    catalogTitle.textContent = "Browse by author";
    if (domain.id === "stories") {
      resultCount.textContent = "3 finished stories";
      catalogResults.appendChild(el("p", "emptyState", "Finished stories stay in the path above. Open the story shelf only when you want another."));
      return;
    }
    resultCount.textContent = items.length + (items.length === 1 ? " ready work" : " ready works");
    renderAuthorGroups(items, domain);
  }

  function render() {
    var domain = findDomain(state.domain);
    renderDomains();
    renderPath(domain);
    renderCatalog(domain);
  }

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value.trim();
    if (state.query && state.availability === "ready") {
      state.availability = "all";
      state.searchExpandedAvailability = true;
      availabilityFilter.value = "all";
    } else if (!state.query && state.searchExpandedAvailability) {
      state.availability = "ready";
      state.searchExpandedAvailability = false;
      availabilityFilter.value = "ready";
    }
    renderCatalog(findDomain(state.domain));
  });

  domainSelect.addEventListener("change", function () {
    chooseDomain(domainSelect.value);
  });

  availabilityFilter.addEventListener("change", function () {
    state.availability = availabilityFilter.value;
    state.searchExpandedAvailability = false;
    renderCatalog(findDomain(state.domain));
  });

  window.addEventListener("hashchange", function () {
    state.domain = domainFromHash();
    render();
  });

  window.addEventListener("pageshow", render);

  window.WisdomEssayLibrary = {
    domains: DOMAINS.map(function (domain) { return domain.id; }),
    allIds: essays.map(function (essay) { return essay.id; }),
    domainFor: domainFor,
    hrefFor: hrefFor
  };

  render();
})();
