(function () {
  "use strict";

  var data = window.KAFKA_AUDIO_GUIDE;
  if (!data) return;

  var selectedChapter = 1;
  var rail = document.getElementById("chapterRail");
  var lanes = document.getElementById("coverageLanes");
  var chapterSources = document.getElementById("chapterSources");
  var voiceGrid = document.getElementById("voiceGrid");

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function chapterLabel(chapter) {
    return chapter === 0 ? "Prologue" : "Chapter " + chapter;
  }

  function videoFor(source, chapter) {
    return source.videos.find(function (video) {
      if (video.chapter !== undefined) return video.chapter === chapter;
      return chapter >= video.chapters[0] && chapter <= video.chapters[1];
    });
  }

  function sourceCovers(source, chapter) {
    return Boolean(videoFor(source, chapter));
  }

  function recommendation(source, chapter) {
    if (source.id === "tangku" && chapter >= 1 && chapter <= 21) return "Best voice";
    if (source.id === "vesa" && (chapter === 0 || chapter >= 22)) return "Recommended route";
    if (source.id === "eden") return "Slow + music";
    return "Complete fallback";
  }

  function makeExternalLink(label, href, className) {
    var link = el("a", className, label);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  function renderRail() {
    rail.textContent = "";
    data.chapters.forEach(function (chapter) {
      var button = el("button", "chapterPill", chapter === 0 ? "P" : String(chapter));
      button.type = "button";
      button.dataset.chapter = String(chapter);
      button.setAttribute("role", "listitem");
      button.setAttribute("aria-label", chapterLabel(chapter));
      if (chapter === selectedChapter) {
        button.classList.add("isSelected");
        button.setAttribute("aria-current", "true");
      }
      var dots = el("span", "pillDots");
      data.sources.forEach(function (source) {
        if (!sourceCovers(source, chapter)) return;
        var dot = el("i", "");
        dot.style.backgroundColor = source.color;
        dots.appendChild(dot);
      });
      button.appendChild(dots);
      button.addEventListener("click", function () { selectChapter(chapter, false); });
      rail.appendChild(button);
    });
  }

  function renderLanes() {
    lanes.textContent = "";
    data.sources.forEach(function (source) {
      var lane = el("div", "coverageLane");
      var label = el("button", "laneLabel");
      label.type = "button";
      label.style.setProperty("--source-color", source.color);
      label.appendChild(el("strong", "", source.name));
      label.appendChild(el("span", "", source.coverage.start === 0
        ? "Prologue–" + source.coverage.end
        : source.coverage.start + "–" + source.coverage.end));
      label.addEventListener("click", function () {
        selectChapter(source.coverage.start, true);
      });
      lane.appendChild(label);

      var track = el("div", "laneTrack");
      data.chapters.forEach(function (chapter) {
        var cell = el("button", "laneCell");
        cell.type = "button";
        cell.title = sourceCovers(source, chapter)
          ? source.name + " covers " + chapterLabel(chapter)
          : source.name + " does not cover " + chapterLabel(chapter);
        cell.setAttribute("aria-label", cell.title);
        if (sourceCovers(source, chapter)) {
          cell.classList.add("hasCoverage");
          cell.style.backgroundColor = source.color;
        }
        if (chapter === selectedChapter) cell.classList.add("isSelected");
        cell.addEventListener("click", function () { selectChapter(chapter, false); });
        track.appendChild(cell);
      });
      lane.appendChild(track);
      lanes.appendChild(lane);
    });
  }

  function renderChapterSources() {
    var sources = data.sources.filter(function (source) {
      return sourceCovers(source, selectedChapter);
    });
    document.getElementById("selectedChapterTitle").textContent = chapterLabel(selectedChapter);
    document.getElementById("selectedChapterEyebrow").textContent =
      selectedChapter === 0 ? "Before Chapter 1" : "Selected chapter";
    document.getElementById("selectedChapterCount").textContent =
      sources.length + (sources.length === 1 ? " public option" : " public options");
    chapterSources.textContent = "";

    if (!sources.length) {
      chapterSources.appendChild(el("p", "emptyState", "No chapter-specific public upload was verified."));
      return;
    }

    sources.sort(function (a, b) {
      var rank = function (source) {
        if (source.id === "tangku" && selectedChapter >= 1 && selectedChapter <= 21) return 0;
        if (source.id === "vesa" && (selectedChapter === 0 || selectedChapter >= 22)) return 0;
        if (source.id === "eden") return 2;
        return 1;
      };
      return rank(a) - rank(b);
    });

    sources.forEach(function (source) {
      var video = videoFor(source, selectedChapter);
      var card = el("article", "chapterSourceCard");
      card.style.setProperty("--source-color", source.color);
      card.style.setProperty("--source-tint", source.tint);
      var marker = el("span", "sourceMarker", recommendation(source, selectedChapter));
      card.appendChild(marker);
      var copy = el("div", "chapterSourceCopy");
      copy.appendChild(el("h3", "", source.name));
      copy.appendChild(el("p", "chapterSourceStyle", source.voice + " · " + source.music));
      copy.appendChild(el("p", "chapterSourceVideo", video.label));
      card.appendChild(copy);
      card.appendChild(makeExternalLink("Open on YouTube ↗", video.url, "listenButton"));
      chapterSources.appendChild(card);
    });
  }

  function selectChapter(chapter, scroll) {
    selectedChapter = chapter;
    renderRail();
    renderLanes();
    renderChapterSources();
    var selected = rail.querySelector('[data-chapter="' + chapter + '"]');
    if (selected) selected.scrollIntoView({ behavior: scroll ? "smooth" : "auto", inline: "center", block: "nearest" });
    if (scroll) document.querySelector(".timelineSection").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderLegend() {
    var legend = document.getElementById("timelineLegend");
    data.sources.forEach(function (source) {
      var item = el("span", "");
      var dot = el("i", "");
      dot.style.backgroundColor = source.color;
      item.appendChild(dot);
      item.appendChild(document.createTextNode(source.name));
      legend.appendChild(item);
    });
  }

  function renderVoices() {
    data.sources.forEach(function (source) {
      var card = el("article", "voiceCard");
      card.style.setProperty("--source-color", source.color);
      card.style.setProperty("--source-tint", source.tint);
      var imageLink = makeExternalLink("", source.representativeUrl, "voiceThumb");
      var image = el("img", "");
      image.src = source.thumbnail;
      image.alt = source.name + " representative YouTube thumbnail";
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      imageLink.appendChild(image);
      imageLink.appendChild(el("span", "", "▶"));
      card.appendChild(imageLink);

      var body = el("div", "voiceBody");
      var head = el("div", "voiceHead");
      var identity = el("div", "");
      identity.appendChild(el("h3", "", source.name));
      identity.appendChild(el("p", "", source.handle));
      head.appendChild(identity);
      head.appendChild(el("span", "coverageBadge", source.coverage.start === 0
        ? "P–" + source.coverage.end
        : source.coverage.start + "–" + source.coverage.end));
      body.appendChild(head);
      body.appendChild(el("p", "voiceType", source.voice));
      body.appendChild(el("p", "voiceVerdict", source.verdict));
      var facts = el("dl", "voiceFacts");
      [["Pace", source.pace], ["Sound", source.music], ["Confidence", source.confidence]].forEach(function (fact) {
        facts.appendChild(el("dt", "", fact[0]));
        facts.appendChild(el("dd", "", fact[1]));
      });
      body.appendChild(facts);
      body.appendChild(el("p", "voiceProof", source.proof + (source.missing ? " " + source.missing : "")));
      var action = el("button", "voiceJump", "Show first covered chapter");
      action.type = "button";
      action.addEventListener("click", function () { selectChapter(source.coverage.start, true); });
      body.appendChild(action);
      card.appendChild(body);
      voiceGrid.appendChild(card);
    });
  }

  function renderModelAudit() {
    var audit = data.modelAudit;
    var body = document.getElementById("modelAuditBody");
    body.appendChild(el("p", "auditHeadline", audit.headline));
    body.appendChild(el("p", "", audit.summary));
    var list = el("ul", "auditFacts");
    audit.facts.forEach(function (fact) { list.appendChild(el("li", "", fact)); });
    body.appendChild(list);
    var candidates = el("p", "auditCandidates");
    candidates.appendChild(el("strong", "", "What remains possible: "));
    candidates.appendChild(document.createTextNode(audit.candidates));
    body.appendChild(candidates);
    var demo = el("blockquote", "demoQuote");
    demo.appendChild(el("small", "", audit.demo.label));
    demo.appendChild(el("p", "", audit.demo.text));
    demo.appendChild(el("footer", "", audit.demo.result));
    body.appendChild(demo);
    var links = el("div", "auditLinks");
    audit.links.forEach(function (link) {
      links.appendChild(makeExternalLink(link.label + " ↗", link.url, ""));
    });
    body.appendChild(links);
  }

  function renderMinorSources() {
    var grid = document.getElementById("minorGrid");
    data.minorSources.forEach(function (source) {
      var card = makeExternalLink("", source.url, "minorCard");
      var image = el("img", "");
      image.src = source.thumbnail;
      image.alt = "";
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      card.appendChild(image);
      var copy = el("span", "");
      copy.appendChild(el("strong", "", source.name));
      copy.appendChild(el("span", "", source.style));
      copy.appendChild(el("small", "", source.coverage));
      card.appendChild(copy);
      grid.appendChild(card);
    });
  }

  document.querySelectorAll("[data-jump]").forEach(function (button) {
    button.addEventListener("click", function () {
      selectChapter(Number(button.dataset.jump), true);
    });
  });

  renderLegend();
  renderRail();
  renderLanes();
  renderChapterSources();
  renderVoices();
  renderModelAudit();
  renderMinorSources();
})();
