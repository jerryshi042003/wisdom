(function () {
  "use strict";

  var data = window.SHORT_STORY_CATALOG || { stories: [] };
  var byId = Object.create(null);
  data.stories.forEach(function (story) { byId[story.id] = story; });

  var COMPLETED = [
    {
      title: "The Swim Team",
      author: "Miranda July",
      status: "Read · liked a lot",
      href: "https://cdn.waterstones.com/special/pdf/9781782116295.pdf#page=13"
    },
    {
      title: "Cathedral",
      author: "Raymond Carver",
      status: "Finished · liked",
      href: "https://cdn.theatlantic.com/assets/media/files/sept_1981_-_carver_-_cathedral.pdf"
    },
    {
      title: "The South",
      author: "Jorge Luis Borges",
      status: "Read · reread",
      href: "https://www.penguinrandomhouse.com/books/16193/ficciones-by-jorge-luis-borges-introduction-by-john-sturrock/9780679422990/"
    }
  ];

  var PATHS = [
    { id: "longing", label: "Longing", title: "Longing and illusion", note: "How desire writes a second world.", ids: ["chekhov-the-kiss", "joyce-araby", "borges-the-south"] },
    { id: "class", label: "Class", title: "Class pressure", note: "What beauty and loyalty hide.", ids: ["mansfield-garden-party", "murakami-barn-burning", "faulkner-barn-burning"] },
    { id: "dream", label: "Dream", title: "Dream and testimony", note: "When perception stops being neutral.", ids: ["soseki-ten-nights", "akutagawa-in-a-grove", "cortazar-axolotl"] },
    { id: "aftermath", label: "Aftermath", title: "Encounter and aftermath", note: "What remains after contact.", ids: ["lispector-smallest-woman", "munro-bear-came-over-mountain"] }
  ];

  var active = pathFromHash();
  var pathPicker = document.getElementById("pathPicker");
  var pathTitle = document.getElementById("pathTitle");
  var pathNote = document.getElementById("pathNote");
  var storyList = document.getElementById("storyList");

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function external(link, href) {
    link.href = href;
    if (/^https?:/.test(href)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  }

  function pathFromHash() {
    var hash = location.hash.replace(/^#/, "");
    return PATHS.some(function (path) { return path.id === hash; }) ? hash : PATHS[0].id;
  }

  function sourceFor(story) {
    var source = story.sources.find(function (item) { return item.kind === "read" || item.kind === "audio"; }) || story.sources[0];
    return source && source.url ? source.url : "#";
  }

  function renderCompleted() {
    var target = document.getElementById("readGrid");
    target.textContent = "";
    COMPLETED.forEach(function (item) {
      var link = external(element("a", "readItem"), item.href);
      var copy = element("span", "");
      copy.appendChild(element("strong", "", item.title));
      copy.appendChild(element("small", "", item.author));
      link.appendChild(copy);
      link.appendChild(element("span", "readStatus", item.status));
      target.appendChild(link);
    });
  }

  function renderPicker() {
    pathPicker.textContent = "";
    PATHS.forEach(function (path) {
      var button = element("button", "pathOption", path.label);
      button.type = "button";
      button.setAttribute("aria-pressed", String(path.id === active));
      button.addEventListener("click", function () {
        active = path.id;
        history.replaceState(null, "", "#" + path.id);
        render();
      });
      pathPicker.appendChild(button);
    });
  }

  function storyRow(story, index) {
    var link = external(element("a", "storyRow"), sourceFor(story));
    link.setAttribute("aria-label", "Open " + story.title + " by " + story.author);
    link.appendChild(element("span", "storyIndex", String(index + 1)));
    var copy = element("span", "storyCopy");
    copy.appendChild(element("strong", "", story.title));
    copy.appendChild(element("small", "", story.author + " · " + story.time));
    copy.appendChild(element("span", "storyQuestion", story.output));
    link.appendChild(copy);
    link.appendChild(element("span", "storyAvailability", story.availability));
    return link;
  }

  function renderPath() {
    var path = PATHS.find(function (candidate) { return candidate.id === active; }) || PATHS[0];
    pathTitle.textContent = path.title;
    pathNote.textContent = path.note;
    storyList.textContent = "";
    path.ids.forEach(function (id, index) {
      var story = byId[id];
      if (!story) return;
      var li = element("li", "");
      li.appendChild(storyRow(story, index));
      storyList.appendChild(li);
    });
  }

  function render() {
    renderPicker();
    renderPath();
  }

  window.WisdomStoryPaths = { paths: PATHS, completed: COMPLETED };
  window.addEventListener("hashchange", function () { active = pathFromHash(); render(); });
  renderCompleted();
  render();
}());
