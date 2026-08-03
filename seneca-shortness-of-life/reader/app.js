(function () {
  const data = window.WISDOM_TEXT;
  const state = { mode: "compare" };

  const title = document.getElementById("title");
  const subtitle = document.getElementById("subtitle");
  const sourceLink = document.getElementById("sourceLink");
  const readerNoteText = document.getElementById("readerNoteText");
  const highlightGrid = document.getElementById("highlightGrid");
  const chapterList = document.getElementById("chapterList");
  const chapterNav = document.getElementById("chapterNav");
  const copyAll = document.getElementById("copyAll");
  const toast = document.getElementById("toast");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderParagraph(target, paragraph, segments) {
    const node = el("p", "", "");
    if (!segments?.length) {
      node.textContent = paragraph;
      target.appendChild(node);
      return;
    }
    segments.forEach((segment) => {
      const text = segment.text || "";
      if (segment.edited && text.trim()) {
        const mark = el("span", "editMark", text);
        mark.setAttribute("title", "Edited wording");
        node.appendChild(mark);
      } else {
        node.appendChild(document.createTextNode(text));
      }
    });
    target.appendChild(node);
  }

  function renderParagraphs(target, paragraphs, markedParagraphs) {
    paragraphs.forEach((paragraph, index) => {
      renderParagraph(target, paragraph, markedParagraphs?.[index]);
    });
  }

  function modeChapters() {
    return state.mode === "source" ? data.sourceChapters : data.chapters;
  }

  function chapterPlainText(chapter) {
    const lines = [`${chapter.number}. ${chapter.title}`, ""];
    if (state.mode !== "source" && chapter.context?.length) {
      lines.push("Before you read:", "", ...chapter.context, "");
    }
    if (state.mode === "compare") {
      lines.push("Light edit:", "", ...chapter.body, "");
      if (chapter.readerEdit?.length) {
        lines.push(`${data.editChoice.label}:`, "", ...chapter.readerEdit);
        if (chapter.readerEditNotes?.length) {
          lines.push("", "Reader notes:", "", ...chapter.readerEditNotes);
        }
      }
      return lines.join("\n\n");
    }
    lines.push(...chapter.body);
    if (chapter.note) {
      lines.push("", `Reader note: ${chapter.note}`);
    }
    return lines.join("\n\n");
  }

  function fullPlainText() {
    const chapters = modeChapters().map(chapterPlainText).join("\n\n");
    if (state.mode === "source") {
      return `${data.title}\nOriginal source\n\n${chapters}`;
    }

    const passages = data.passages
      .map((passage) => `${passage.title}\n\n${passage.excerpt}\n\nNote: ${passage.note}`)
      .join("\n\n");
    const label = state.mode === "compare" ? "Teaching comparison reader" : "Lightly clarified text";
    return `${data.title}\n${label}\n\n${data.readerNote.join("\n\n")}\n\n${passages}\n\n${chapters}`;
  }

  async function copyText(text, label) {
    try {
      let copied = false;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      } else {
        copied = copyViaTextarea(text);
      }
      if (copied) {
        showToast(`${label} copied`);
      } else {
        showCopyPanel(text, label);
        showToast(`${label} selected`);
      }
    } catch (error) {
      showCopyPanel(text, label);
      showToast(`${label} selected`);
      console.error(error);
    }
  }

  function copyViaTextarea(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    document.body.appendChild(area);
    area.focus();
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  }

  function showCopyPanel(text, label) {
    document.querySelector(".copyPanel")?.remove();
    const panel = el("section", "copyPanel", "");
    panel.setAttribute("aria-label", `${label} copy text`);
    const header = el("div", "copyPanelHeader", "");
    header.appendChild(el("h2", "", label));
    const close = el("button", "copyButton", "Close");
    close.type = "button";
    close.addEventListener("click", () => panel.remove());
    header.appendChild(close);

    const area = el("textarea", "copyArea", "");
    area.value = text;
    area.setAttribute("readonly", "");

    panel.appendChild(header);
    panel.appendChild(area);
    document.body.appendChild(panel);
    area.focus();
    area.select();
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
      button.setAttribute("aria-label", `Chapter ${chapter.number}: ${chapter.title}`);
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
      if (passage.role) {
        card.appendChild(el("p", "passageRole", passage.role));
      }
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
      titleGroup.appendChild(el("p", "chapterKicker", `Chapter ${chapter.number}`));
      titleGroup.appendChild(el("h3", "", chapter.title));

      const copy = el("button", "copyButton", "Copy");
      copy.type = "button";
      copy.addEventListener("click", () => copyText(chapterPlainText(chapter), `Chapter ${chapter.number}`));

      header.appendChild(titleGroup);
      header.appendChild(copy);
      block.appendChild(header);

      if (state.mode !== "source" && chapter.context?.length) {
        const context = el("aside", "chapterContext", "");
        context.appendChild(el("p", "chapterContextLabel", "Before you read"));
        renderParagraphs(context, chapter.context);
        block.appendChild(context);
      }

      if (state.mode === "compare") {
        const lightSection = el("section", "comparisonSection", "");
        lightSection.appendChild(el("p", "comparisonLabel", "Light edit (near-original)"));
        const lightBody = el("div", "chapterBody", "");
        renderParagraphs(lightBody, chapter.body, chapter.bodyMarks);
        lightSection.appendChild(lightBody);
        block.appendChild(lightSection);

        if (chapter.readerEdit?.length) {
          const editSection = el("section", "comparisonSection readerEditSection", "");
          editSection.appendChild(el("p", "comparisonLabel", `${data.editChoice.label} (${data.editChoice.detail})`));
          const editBody = el("div", "chapterBody readerEditBody", "");
          renderParagraphs(editBody, chapter.readerEdit, chapter.readerEditMarks);
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
        renderParagraphs(body, chapter.body, chapter.bodyMarks);
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
    copyAll.textContent = mode === "source" ? "Copy original" : mode === "compare" ? "Copy teaching view" : "Copy light edit";
    renderNav();
    renderChapters();
  }

  function init() {
    title.textContent = data.title;
    subtitle.textContent = data.subtitle;
    sourceLink.href = data.source.localPath;
    sourceLink.textContent = "Reading fallback";
    sourceLink.title = data.source.label;
    renderReaderNote();
    renderHighlights();
    setMode("compare");

    document.querySelectorAll(".modeButton").forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.mode));
    });
    copyAll.addEventListener("click", () => {
      const label = state.mode === "source" ? "Original" : state.mode === "compare" ? "Teaching view" : "Light edit";
      copyText(fullPlainText(), label);
    });
  }

  init();
})();
