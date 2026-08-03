(function () {
  const data = window.WISDOM_TEXT;
  const state = { mode: "compare" };

  const title = document.getElementById("title");
  const subtitle = document.getElementById("subtitle");
  const readerNoteText = document.getElementById("readerNoteText");
  const highlightGrid = document.getElementById("highlightGrid");
  const chapterList = document.getElementById("chapterList");
  const chapterNav = document.getElementById("chapterNav");
  const toast = document.getElementById("toast");

  function unitLabel() {
    return data.unitLabel || "Chapter";
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderParagraphs(target, paragraphs) {
    paragraphs.forEach((paragraph) => {
      target.appendChild(el("p", "", paragraph));
    });
  }

  function modeChapters() {
    return state.mode === "source" ? data.sourceChapters : data.chapters;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 1600);
  }

  function renderNav() {
    chapterNav.replaceChildren();
    modeChapters().forEach((chapter) => {
      const button = el("button", "", "");
      button.type = "button";
      button.setAttribute("aria-label", `${unitLabel()} ${chapter.number}: ${chapter.title}`);
      button.innerHTML = `<span class="navNumber">${chapter.number}</span><span class="navTitle">${chapter.title}</span>`;
      button.addEventListener("click", () => {
        document.getElementById(`chapter-${chapter.id}`)?.scrollIntoView({ block: "start" });
      });
      chapterNav.appendChild(button);
    });
  }

  function renderReaderNote() {
    readerNoteText.replaceChildren();
    renderParagraphs(readerNoteText, data.readerNote);
  }

  function renderHighlights() {
    highlightGrid.replaceChildren();
    data.passages.forEach((passage) => {
      const card = el("article", "highlightCard", "");
      card.appendChild(el("h3", "", passage.title));
      const quote = el("blockquote", "", passage.excerpt);
      card.appendChild(quote);
      renderParagraphs(card, [passage.note]);
      highlightGrid.appendChild(card);
    });
  }

  function renderChapters() {
    chapterList.replaceChildren();
    modeChapters().forEach((chapter) => {
      const block = el("article", "chapterBlock", "");
      block.id = `chapter-${chapter.id}`;

      const header = el("div", "chapterHeader", "");
      const titleGroup = el("div", "", "");
      titleGroup.appendChild(el("p", "chapterKicker", `${unitLabel()} ${chapter.number}`));
      titleGroup.appendChild(el("h3", "", chapter.title));

      header.appendChild(titleGroup);
      block.appendChild(header);

      if (state.mode !== "source" && chapter.context?.length) {
        const context = el("aside", "chapterContext", "");
        context.appendChild(el("p", "chapterContextLabel", "Before you read"));
        renderParagraphs(context, chapter.context);
        block.appendChild(context);
      }

      if (state.mode === "compare") {
        const lightSection = el("section", "comparisonSection", "");
        lightSection.appendChild(el("p", "comparisonLabel", "Light edit (~1% changed)"));
        const lightBody = el("div", "chapterBody", "");
        renderParagraphs(lightBody, chapter.body);
        lightSection.appendChild(lightBody);
        block.appendChild(lightSection);

        if (chapter.readerEdit?.length) {
          const editSection = el("section", "comparisonSection readerEditSection", "");
          editSection.appendChild(el("p", "comparisonLabel", `${data.editChoice.label} (${data.editChoice.detail})`));
          const editBody = el("div", "chapterBody readerEditBody", "");
          renderParagraphs(editBody, chapter.readerEdit);
          editSection.appendChild(editBody);
          if (chapter.readerEditNotes?.length) {
            const editNotes = el("aside", "readerEditNotes", "");
            editNotes.appendChild(el("p", "readerEditNotesLabel", "Reader notes"));
            renderParagraphs(editNotes, chapter.readerEditNotes);
            editSection.appendChild(editNotes);
          }
          block.appendChild(editSection);
        }
      } else {
        const body = el("div", "chapterBody", "");
        renderParagraphs(body, chapter.body);
        block.appendChild(body);
      }

      if (chapter.note && state.mode === "adapted") {
        const note = el("aside", "chapterNote", "");
        note.appendChild(el("p", "chapterNoteLabel", "Reader note"));
        renderParagraphs(note, [chapter.note]);
        block.appendChild(note);
      }

      chapterList.appendChild(block);
    });
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.classList.toggle("sourceMode", mode === "source");
    document.body.classList.toggle("compareMode", mode === "compare");
    document.querySelectorAll(".modeButton").forEach((button) => {
      const isActive = button.dataset.mode === mode;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
    renderNav();
    renderChapters();
  }

  function init() {
    title.textContent = data.title;
    subtitle.textContent = data.subtitle;
    renderReaderNote();
    renderHighlights();
    setMode("compare");

    document.querySelectorAll(".modeButton").forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.mode));
    });
  }

  init();
})();
