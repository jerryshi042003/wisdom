(function () {
  const data = window.WISDOM_TEXT;
  const state = { mode: "jerry" };

  const title = document.getElementById("title");
  const subtitle = document.getElementById("subtitle");
  const sourceLink = document.getElementById("sourceLink");
  const guideTitle = document.getElementById("guideTitle");
  const guideIntro = document.getElementById("guideIntro");
  const guideGrid = document.getElementById("guideGrid");
  const chapterList = document.getElementById("chapterList");
  const chapterNav = document.getElementById("chapterNav");
  const copyAll = document.getElementById("copyAll");
  const toast = document.getElementById("toast");

  function unitLabel() {
    return data.unitLabel || "Chapter";
  }

  function modeLabel(mode) {
    return data.modeLabels?.[mode] || (mode === "jerry" ? "Jerry" : mode === "compare" ? "Guided" : mode === "adapted" ? "Clean" : "Source");
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

  function chapterBody(chapter) {
    if (state.mode === "source") return chapter.body;
    if (state.mode === "jerry") return chapter.jerryEdit?.length ? chapter.jerryEdit : chapter.readerEdit;
    if (state.mode === "compare") return chapter.readerEdit?.length ? chapter.readerEdit : chapter.body;
    return chapter.body;
  }

  function chapterPlainText(chapter) {
    const lines = [`${unitLabel()} ${chapter.number}. ${chapter.title}`, ""];
    if ((state.mode === "jerry" || state.mode === "compare") && chapter.context?.length) {
      lines.push("Before you read:", "", ...chapter.context, "");
    }
    lines.push(...chapterBody(chapter));
    return lines.join("\n\n");
  }

  function guidePlainText() {
    if (!data.guide?.points?.length) return "";
    const lines = [data.guide.title || "What to notice", "", ...(data.guide.intro || []), ""];
    data.guide.points.forEach((point) => {
      lines.push(point.title, "");
      if (point.quote) {
        lines.push(`Quote: ${point.quote}`, "");
      }
      lines.push(...point.body, "");
    });
    return lines.join("\n\n").trim();
  }

  function fullPlainText() {
    const chapters = modeChapters().map(chapterPlainText).join("\n\n");
    const label = state.mode === "source" ? "Original source" : `${modeLabel(state.mode)} reader`;
    const guide = state.mode === "jerry" || state.mode === "compare" ? `${guidePlainText()}\n\n` : "";
    return `${data.title}\n${label}\n\n${guide}${chapters}`;
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
      button.setAttribute("aria-label", `${unitLabel()} ${chapter.number}: ${chapter.title}`);
      button.innerHTML = `<span class="navNumber">${chapter.number}</span><span class="navTitle">${chapter.title}</span>`;
      button.addEventListener("click", () => {
        document.getElementById(`chapter-${chapter.id}`)?.scrollIntoView({ block: "start" });
      });
      chapterNav.appendChild(button);
    });
  }

  function renderGuide() {
    guideTitle.textContent = data.guide?.title || "What to notice";
    guideIntro.replaceChildren();
    guideGrid.replaceChildren();
    renderParagraphs(guideIntro, data.guide?.intro || []);
    (data.guide?.points || []).forEach((point) => {
      const card = el("article", "guidePoint", "");
      card.appendChild(el("h3", "", point.title));
      if (point.quote) {
        const quote = el("blockquote", "", point.quote);
        card.appendChild(quote);
      }
      renderParagraphs(card, point.body || []);
      guideGrid.appendChild(card);
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

      const copy = el("button", "copyButton", "Copy");
      copy.type = "button";
      copy.addEventListener("click", () => copyText(chapterPlainText(chapter), `${unitLabel()} ${chapter.number}`));

      header.appendChild(titleGroup);
      header.appendChild(copy);
      block.appendChild(header);

      if ((state.mode === "jerry" || state.mode === "compare") && chapter.context?.length) {
        const context = el("aside", "contextNote", "");
        context.appendChild(el("p", "contextNoteLabel", "Before you read"));
        renderParagraphs(context, chapter.context);
        block.appendChild(context);
      }

      const section = el("section", "comparisonSection", "");
      let labelText = "Original source";
      let labelClass = "comparisonLabel";
      if (state.mode === "jerry") {
        const isReady = chapter.jerryEditStatus === "ready";
        labelText = isReady
          ? `${data.jerryChoice.label} (${data.jerryChoice.detail})`
          : `${data.jerryChoice.label} pending: ${data.jerryChoice.fallbackDetail}`;
        labelClass = isReady ? "comparisonLabel jerryLabel" : "comparisonLabel fallbackLabel";
      } else if (state.mode === "compare") {
        labelText = `${data.editChoice.label} (${data.editChoice.detail})`;
        labelClass = "comparisonLabel guidedLabel";
      } else if (state.mode === "adapted") {
        labelText = data.lightChoice?.label || "Clean full edition";
      }
      section.appendChild(el("p", labelClass, labelText));
      const body = el("div", "chapterBody", "");
      renderParagraphs(body, chapterBody(chapter));
      section.appendChild(body);
      block.appendChild(section);

      chapterList.appendChild(block);
    });
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.classList.toggle("sourceMode", mode === "source");
    document.body.classList.toggle("compareMode", mode === "compare");
    document.body.classList.toggle("jerryMode", mode === "jerry");
    document.querySelectorAll(".modeButton").forEach((button) => {
      const isActive = button.dataset.mode === mode;
      button.classList.toggle("active", isActive);
      button.textContent = modeLabel(button.dataset.mode);
      button.setAttribute("aria-selected", String(isActive));
    });
    copyAll.textContent = `Copy ${modeLabel(mode).toLowerCase()}`;
    renderNav();
    renderChapters();
  }

  function init() {
    title.textContent = data.title;
    subtitle.textContent = data.subtitle;
    sourceLink.href = data.source.localPath;
    sourceLink.textContent = "Reading fallback";
    sourceLink.title = data.source.label;
    renderGuide();
    setMode("jerry");

    document.querySelectorAll(".modeButton").forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.mode));
    });
    copyAll.addEventListener("click", () => {
      copyText(fullPlainText(), modeLabel(state.mode));
    });
  }

  init();
})();
