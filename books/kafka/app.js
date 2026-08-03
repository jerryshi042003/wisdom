(function () {
  "use strict";

  var data = window.KAFKA_REFERENCE_MAP;
  if (!data) return;

  var search = document.getElementById("referenceSearch");
  var filter = document.getElementById("referenceFilter");
  var list = document.getElementById("referenceList");
  var count = document.getElementById("inventoryCount");
  var empty = document.getElementById("emptyState");

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function filterGroup(status) {
    if (["direct-title", "contained-work", "explicit-allusion", "paratext-source"].indexOf(status) !== -1) return "direct";
    if (status === "author-only") return "author";
    return "unresolved";
  }

  function accessLabel(record) {
    if (record.accessMode === "public-source" || record.accessMode === "internal-and-public-source") return "Read source";
    if (record.accessMode === "source-locator" || record.accessMode === "metadata-only") return "Locate source";
    return "Metadata only";
  }

  function statusLabel(status) {
    return {
      "direct-title": "Direct title",
      "contained-work": "Named inside a collection",
      "explicit-allusion": "Named story",
      "paratext-source": "Text source",
      "author-only": "Author or concept only",
      "unresolved-title": "Title unresolved",
      "in-novel-unresolved": "In-world / unresolved"
    }[status] || status.replaceAll("-", " ");
  }

  function renderStart(record, index) {
    var card = element("article", "startCard");
    card.appendChild(element("span", "startNumber", String(index + 1).padStart(2, "0") + " · chapter " + record.chapter));
    card.appendChild(element("h3", "", record.title));
    card.appendChild(element("p", "startCreator", record.creator));
    card.appendChild(element("p", "startWhy", record.whyStart));
    var link = element("a", "", index === 0 ? "Continue in Wisdom" : "Open source or edition");
    link.href = index === 0 ? data.burtonTrail.coreStartUrl : record.sourceUrl;
    if (/^https:/u.test(link.href)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    card.appendChild(link);
    return card;
  }

  function renderReference(record) {
    var row = element("article", "referenceRow");
    row.dataset.filterGroup = filterGroup(record.referenceStatus);
    var chapter = element("div", "referenceChapter", "Ch " + record.chapter);
    var identity = element("div", "referenceIdentity");
    identity.appendChild(element("span", "referenceMeta", statusLabel(record.referenceStatus)));
    identity.appendChild(element("h3", "", record.title));
    identity.appendChild(element("p", "referenceCreator", record.creator));
    var context = element("div", "referenceContext");
    context.appendChild(element("p", "referenceRole", record.role));
    var source = element("p", "referenceSource");
    source.appendChild(document.createTextNode(record.sourceVersion + " · "));
    if (record.sourceUrl) {
      var sourceLink = element("a", "", accessLabel(record));
      sourceLink.href = record.sourceUrl;
      if (/^https:/u.test(record.sourceUrl)) {
        sourceLink.target = "_blank";
        sourceLink.rel = "noopener noreferrer";
      }
      source.appendChild(sourceLink);
    } else {
      source.appendChild(element("span", "", accessLabel(record)));
    }
    source.appendChild(document.createTextNode(" · "));
    var evidence = element("a", "", "Why it is here");
    evidence.href = record.evidenceUrl;
    evidence.target = "_blank";
    evidence.rel = "noopener noreferrer";
    source.appendChild(evidence);
    context.appendChild(source);
    row.appendChild(chapter);
    row.appendChild(identity);
    row.appendChild(context);
    return row;
  }

  function searchable(record) {
    return [record.title, record.creator, record.chapter, record.kind, record.referenceStatus, record.role, record.sourceVersion, record.rights].concat(record.keywords || []).join(" ").toLocaleLowerCase();
  }

  function renderList() {
    var query = search.value.trim().toLocaleLowerCase();
    var selected = filter.value;
    var visible = data.references.filter(function (record) {
      return (selected === "all" || filterGroup(record.referenceStatus) === selected) && (!query || searchable(record).includes(query));
    });
    list.textContent = "";
    visible.forEach(function (record) { list.appendChild(renderReference(record)); });
    count.textContent = visible.length + " of " + data.references.length;
    empty.hidden = visible.length !== 0;
  }

  document.getElementById("mapSubtitle").textContent = data.subtitle;
  document.getElementById("burtonSelection").textContent = data.burtonTrail.selection;
  document.getElementById("burtonCorrection").textContent = data.burtonTrail.correction;
  document.getElementById("burtonExact").href = data.burtonTrail.exactTaleUrl;
  document.getElementById("burtonContinue").href = data.burtonTrail.coreStartUrl;
  document.getElementById("counterargument").textContent = data.counterargument;
  document.getElementById("outputPrompt").textContent = data.outputPrompt;
  document.getElementById("sourceMethod").textContent = data.evidenceUniverse.method + " Cutoff: " + data.builtAtCutoff + ".";

  var startGrid = document.getElementById("startGrid");
  data.startIds.forEach(function (id, index) {
    var record = data.references.find(function (item) { return item.id === id; });
    if (record) startGrid.appendChild(renderStart(record, index));
  });

  var excluded = document.getElementById("excludedList");
  data.excludedOrInferred.forEach(function (item) {
    var paragraph = element("p", "excludedItem");
    paragraph.appendChild(element("strong", "", item.title + ": "));
    paragraph.appendChild(document.createTextNode(item.reason));
    excluded.appendChild(paragraph);
  });

  search.addEventListener("input", renderList);
  filter.addEventListener("change", renderList);
  renderList();
})();
