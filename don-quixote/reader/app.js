(function () {
  const data = window.WISDOM_TEXT;
  const state = { mode: "compare" };

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

  function compareSections() {
    return data.beats?.length ? data.beats : data.chapters;
  }

  function sectionLabel(section, index) {
    if (data.beats?.length) {
      return `Reading Beat ${section.number || index + 1} of ${compareSections().length}`;
    }
    return `${unitLabel()} ${section.number}`;
  }

  function comparePlainText(section, index) {
    const lines = [`${sectionLabel(section, index)}. ${section.title}`, ""];
    if (section.why?.length) {
      lines.push("Why this matters:", "", ...section.why, "");
    }
    if (section.quote) {
      lines.push(`Anchor quote: ${section.quote}`, "");
    }
    if (section.passages?.length) {
      section.passages.forEach((passage, passageIndex) => {
        lines.push(`Step ${section.number}.${passageIndex + 1}: ${passage.title}`, "");
        lines.push(data.lightChoice?.label || "Source-close text", "", ...(passage.body || []), "");
        if (passage.readerEdit?.length) {
          lines.push(`${data.editChoice.label}:`, "", ...passage.readerEdit, "");
        }
      });
    } else {
      lines.push(data.lightChoice?.label || "Source-close text", "", ...(section.body || []), "");
      if (section.readerEdit?.length) {
        lines.push(`${data.editChoice.label}:`, "", ...section.readerEdit);
      }
    }
    return lines.join("\n\n").trim();
  }

  function chapterPlainText(chapter) {
    const lines = [`${unitLabel()} ${chapter.number}. ${chapter.title}`, ""];
    if (state.mode === "compare") {
      return comparePlainText(chapter, 0);
    }
    lines.push(...chapter.body);
    if (chapter.note) {
      lines.push("", `Jerry note: ${chapter.note}`);
    }
    return lines.join("\n\n");
  }

  function fullPlainText() {
    if (state.mode === "source") {
      const chapters = modeChapters().map(chapterPlainText).join("\n\n");
      return `${data.title}\nOriginal source\n\n${chapters}`;
    }

    const label = state.mode === "compare" ? "Comparison reader" : "Lightly clarified text";
    const guide = guidePlainText();
    const body =
      state.mode === "compare"
        ? compareSections().map(comparePlainText).join("\n\n")
        : modeChapters().map(chapterPlainText).join("\n\n");
    return `${data.title}\n${label}\n\n${guide}\n\n${body}`;
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
    const sections = state.mode === "compare" ? compareSections() : modeChapters();
    sections.forEach((chapter, index) => {
      const button = el("button", "", "");
      button.type = "button";
      button.setAttribute("aria-label", `${sectionLabel(chapter, index)}: ${chapter.title}`);
      button.innerHTML = `<span class="navNumber">${chapter.number}</span><span class="navTitle">${chapter.title}</span>`;
      button.addEventListener("click", () => {
        const prefix = state.mode === "compare" && data.beats?.length ? "beat" : "chapter";
        document.getElementById(`${prefix}-${chapter.id}`)?.scrollIntoView({ block: "start" });
      });
      chapterNav.appendChild(button);
    });
  }

  function guidePlainText() {
    if (!data.guide?.points?.length) return "";
    const lines = [data.guide.title || "What to notice", "", ...(data.guide.intro || []), ""];
    if (data.beats?.length) {
      return lines.join("\n\n").trim();
    }
    data.guide.points.forEach((point) => {
      lines.push(point.title, "");
      if (point.quote) {
        lines.push(`Quote: ${point.quote}`, "");
      }
      lines.push(...point.body, "");
    });
    return lines.join("\n\n").trim();
  }

  function renderGuide() {
    guideTitle.textContent = data.guide?.title || "What to notice";
    guideIntro.replaceChildren();
    guideGrid.replaceChildren();
    renderParagraphs(guideIntro, data.guide?.intro || []);
    if (data.beats?.length) {
      guideGrid.hidden = true;
      return;
    }
    guideGrid.hidden = false;
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
    if (state.mode === "compare" && data.beats?.length) {
      compareSections().forEach((beat, index) => {
        const block = el("article", "chapterBlock beatBlock", "");
        block.id = `beat-${beat.id}`;

        const header = el("div", "chapterHeader", "");
        const titleGroup = el("div", "", "");
        titleGroup.appendChild(el("p", "chapterKicker", sectionLabel(beat, index)));
        titleGroup.appendChild(el("h3", "", beat.title));

        const copy = el("button", "copyButton", "Copy");
        copy.type = "button";
        copy.addEventListener("click", () => copyText(comparePlainText(beat, index), `Beat ${beat.number}`));

        header.appendChild(titleGroup);
        header.appendChild(copy);
        block.appendChild(header);

        if (beat.why?.length || beat.quote) {
          const why = el("aside", "beatWhy", "");
          why.appendChild(el("p", "beatWhyLabel", "Why this beat matters"));
          if (beat.quote) {
            why.appendChild(el("blockquote", "", beat.quote));
          }
          renderParagraphs(why, beat.why || []);
          block.appendChild(why);
        }

        if (beat.passages?.length) {
          const passageList = el("div", "passageList", "");
          beat.passages.forEach((passage, passageIndex) => {
            const passageUnit = el("section", "passageUnit", "");
            passageUnit.id = `passage-${passage.id}`;
            const passageHeader = el("div", "passageHeader", "");
            passageHeader.appendChild(el("p", "passageKicker", `Step ${beat.number}.${passageIndex + 1}`));
            passageHeader.appendChild(el("h4", "", passage.title));
            passageUnit.appendChild(passageHeader);

            const compare = el("div", "beatCompare passageCompare", "");

            const lightSection = el("section", "comparisonSection", "");
            lightSection.appendChild(el("p", "comparisonLabel", data.lightChoice?.label || "Source-close text"));
            const lightBody = el("div", "chapterBody", "");
            renderParagraphs(lightBody, passage.body || []);
            lightSection.appendChild(lightBody);
            compare.appendChild(lightSection);

            if (passage.readerEdit?.length) {
              const editSection = el("section", "comparisonSection readerEditSection", "");
              editSection.appendChild(el("p", "comparisonLabel", data.editChoice.label));
              const editBody = el("div", "chapterBody readerEditBody", "");
              renderParagraphs(editBody, passage.readerEdit);
              editSection.appendChild(editBody);
              compare.appendChild(editSection);
            }

            passageUnit.appendChild(compare);
            passageList.appendChild(passageUnit);
          });
          block.appendChild(passageList);
        } else {
          const compare = el("div", "beatCompare", "");

          const lightSection = el("section", "comparisonSection", "");
          lightSection.appendChild(el("p", "comparisonLabel", data.lightChoice?.label || "Source-close text"));
          const lightBody = el("div", "chapterBody", "");
          renderParagraphs(lightBody, beat.body || []);
          lightSection.appendChild(lightBody);
          compare.appendChild(lightSection);

          if (beat.readerEdit?.length) {
            const editSection = el("section", "comparisonSection readerEditSection", "");
            editSection.appendChild(el("p", "comparisonLabel", `${data.editChoice.label} (${data.editChoice.detail})`));
            const editBody = el("div", "chapterBody readerEditBody", "");
            renderParagraphs(editBody, beat.readerEdit);
            editSection.appendChild(editBody);
            compare.appendChild(editSection);
          }

          block.appendChild(compare);
        }
        chapterList.appendChild(block);
      });
      return;
    }

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

      if (state.mode === "compare") {
        const lightSection = el("section", "comparisonSection", "");
        lightSection.appendChild(el("p", "comparisonLabel", data.lightChoice?.label || "Light edit"));
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
          block.appendChild(editSection);
        }
      } else {
        const body = el("div", "chapterBody", "");
        renderParagraphs(body, chapter.body);
        block.appendChild(body);
      }

      if (chapter.note && state.mode === "adapted") {
        const note = el("aside", "chapterNote", "");
        note.appendChild(el("p", "chapterNoteLabel", "Jerry note"));
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
    copyAll.textContent = mode === "source" ? "Copy original" : mode === "compare" ? "Copy comparison" : "Copy light edit";
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
    setMode("compare");

    document.querySelectorAll(".modeButton").forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.mode));
    });
    copyAll.addEventListener("click", () => {
      const label = state.mode === "source" ? "Original" : state.mode === "compare" ? "Comparison" : "Light edit";
      copyText(fullPlainText(), label);
    });
  }

  init();
})();
