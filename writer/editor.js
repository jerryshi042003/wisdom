// The editor engine.
//
// A transparent <textarea> over a <pre> that paints the same text with colour.
// The textarea keeps everything the browser is better at than any JavaScript
// rewrite of it: the caret, undo, autocorrect, spellcheck, IME composition,
// selection, accessibility, and iOS text interaction. The <pre> under it does
// the only thing the textarea cannot: show structure.
//
// The whole design rests on one invariant — the two boxes must lay text out
// identically, to the pixel. Anything that changes an advance width (size,
// weight, letter-spacing, a different font) breaks caret alignment silently,
// which is why weight is faked with -webkit-text-stroke and why every metric
// lives in a CSS custom property both boxes read.

import { markMarkdown } from "./syntax.js";
import { paragraphAt, sentenceAt, styleFlags, words } from "./prose.js";

const ESCAPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
const escapeHtml = (value) => value.replace(/[&<>]/gu, (character) => ESCAPE[character]);

export class Editor {
  constructor({ textarea, mirror, scroller, sheet }) {
    this.textarea = textarea;
    this.mirror = mirror;
    this.scroller = scroller;
    this.sheet = sheet;

    this.options = {
      focus: "off", // "off" | "sentence" | "paragraph"
      typewriter: false,
      parts: new Set(), // any of noun verb adj adv conj
      style: false,
      authorship: false
    };

    this.text = "";
    this.origins = ""; // one character per text character: t typed, p pasted
    this.lastInputType = "";
    this.frame = 0;
    this.onChange = () => {};
    this.onCaret = () => {};

    this.bind();
  }

  bind() {
    const { textarea } = this;

    textarea.addEventListener("beforeinput", (event) => {
      this.lastInputType = event.inputType || "";
    });

    textarea.addEventListener("input", () => {
      this.absorb(textarea.value, this.lastInputType);
      this.schedule({ scroll: true });
      this.onChange();
    });

    // Chinese/Japanese input updates the value without firing input on every
    // keystroke in some engines; repaint on composition too or the mirror lags
    // a syllable behind the caret.
    textarea.addEventListener("compositionupdate", () => this.schedule({ scroll: true }));
    textarea.addEventListener("compositionend", () => {
      this.absorb(textarea.value, "insertCompositionText");
      this.schedule({ scroll: true });
      this.onChange();
    });

    for (const type of ["keyup", "click", "select", "focus"]) {
      textarea.addEventListener(type, () => {
        this.schedule({ scroll: this.options.typewriter && type === "keyup" });
        this.onCaret();
      });
    }

    document.addEventListener("selectionchange", () => {
      if (document.activeElement === textarea) this.schedule({ scroll: false });
    });

    window.addEventListener("resize", () => this.schedule({ scroll: true }));
  }

  // Keep the per-character origin map aligned with the text through an edit.
  // A single common-prefix/common-suffix diff is exact for the one-edit-per-
  // input-event that a textarea actually produces, and costs nothing.
  absorb(next, inputType) {
    const previous = this.text;
    if (next === previous) return;

    let start = 0;
    const shortest = Math.min(previous.length, next.length);
    while (start < shortest && previous[start] === next[start]) start += 1;
    let tail = 0;
    while (
      tail < shortest - start &&
      previous[previous.length - 1 - tail] === next[next.length - 1 - tail]
    ) tail += 1;

    const removed = previous.length - start - tail;
    const inserted = next.length - start - tail;
    const pasted = inputType === "insertFromPaste" || inputType === "insertFromDrop";
    const mark = pasted ? "p" : "t";

    this.text = next;
    this.origins =
      this.origins.slice(0, start) + mark.repeat(Math.max(0, inserted)) + this.origins.slice(start + Math.max(0, removed));
    if (this.origins.length !== next.length) this.origins = "t".repeat(next.length);
  }

  load(text, origins) {
    this.text = text || "";
    this.origins = origins && origins.length === this.text.length ? origins : "t".repeat(this.text.length);
    this.textarea.value = this.text;
    this.render({ scroll: false });
  }

  setOption(name, value) {
    this.options[name] = value;
    this.render({ scroll: name === "typewriter" && value });
  }

  get caret() {
    return this.textarea.selectionEnd;
  }

  schedule(options) {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.render(options);
    });
  }

  // Build the mark map, collapse it into runs, and paint.
  render({ scroll = false } = {}) {
    const text = this.text;
    const length = text.length;
    const marks = new Array(length).fill(null);
    const add = (from, to, className) => {
      const start = Math.max(0, from);
      const end = Math.min(length, to);
      for (let index = start; index < end; index += 1) {
        marks[index] = marks[index] ? `${marks[index]} ${className}` : className;
      }
    };

    markMarkdown(text, add);

    if (this.options.parts.size) {
      for (const item of words(text)) {
        if (item.tag && this.options.parts.has(item.tag)) add(item.start, item.end, `pos-${item.tag}`);
      }
    }

    if (this.options.style) {
      for (const flag of styleFlags(text)) add(flag.start, flag.end, `flag flag-${flag.kind}`);
    }

    if (this.options.authorship) {
      for (let index = 0; index < length; index += 1) {
        if (this.origins[index] === "p") add(index, index + 1, "pasted");
      }
    }

    let live = null;
    if (this.options.focus !== "off") {
      const caret = this.caret;
      live = this.options.focus === "sentence" ? sentenceAt(text, caret) : paragraphAt(text, caret);
      add(live.start, live.end, "live");
    }

    // Collapse the mark map into runs. Inline <span> boundaries do not create
    // soft-wrap opportunities, so the mirror wraps exactly like the textarea —
    // which is why the caret is measured with a Range below rather than with an
    // injected marker element. An inline-block marker *would* add a break
    // opportunity and could rewrap a word mid-caret.
    const pieces = [];
    let runStart = 0;
    const flush = (end) => {
      if (end <= runStart) return;
      const className = marks[runStart];
      const chunk = escapeHtml(text.slice(runStart, end));
      pieces.push(className ? `<span class="seg ${className}">${chunk}</span>` : `<span class="seg">${chunk}</span>`);
      runStart = end;
    };

    for (let index = 1; index <= length; index += 1) {
      if (index === length || marks[index] !== marks[runStart]) flush(index);
    }

    // A trailing newline in a <pre> collapses; without this the sheet stops
    // growing exactly when the writer presses return at the bottom.
    this.mirror.innerHTML = `${pieces.join("")}${text.endsWith("\n") ? "\n" : ""}`;
    this.mirror.classList.toggle("focused", this.options.focus !== "off");

    if (scroll && this.options.typewriter) this.centerCaret();
  }

  // Where the caret sits, measured on the highlight layer with a DOM Range.
  // Returns a viewport-space top/bottom for the caret's line, or null.
  caretRect() {
    const index = this.caret;
    const walker = document.createTreeWalker(this.mirror, NodeFilter.SHOW_TEXT);
    let seen = 0;
    let node = walker.nextNode();
    let target = null;
    let offset = 0;

    while (node) {
      const length = node.nodeValue.length;
      if (index <= seen + length) {
        target = node;
        offset = index - seen;
        break;
      }
      seen += length;
      node = walker.nextNode();
      if (!node) {
        // Caret past the last text node (trailing newline): use the end.
        break;
      }
    }
    if (!target) return null;

    const range = document.createRange();
    try {
      // A collapsed range has no rect in some engines; span one character.
      if (offset < target.nodeValue.length) range.setStart(target, offset), range.setEnd(target, offset + 1);
      else if (offset > 0) range.setStart(target, offset - 1), range.setEnd(target, offset);
      else return null;
    } catch {
      return null;
    }

    const rects = range.getClientRects();
    const rect = rects.length ? rects[rects.length - 1] : range.getBoundingClientRect();
    return rect && (rect.top || rect.bottom) ? rect : null;
  }

  // Typewriter mode: hold the caret's line at the optical centre of the page
  // and move the text under it. The scroller carries 45vh/55vh of padding so
  // the first and last lines can reach the middle.
  centerCaret() {
    const rect = this.caretRect();
    const scroller = this.scroller;
    const frame = scroller.getBoundingClientRect();
    const line = parseFloat(getComputedStyle(this.mirror).lineHeight) || 28;
    const top = rect ? rect.top - frame.top : this.mirror.getBoundingClientRect().top - frame.top;
    const delta = top - scroller.clientHeight / 2 + line / 2;
    const limit = scroller.scrollHeight - scroller.clientHeight;
    scroller.scrollTop = Math.max(0, Math.min(limit, scroller.scrollTop + delta));
  }

  // Keep the caret on screen without moving the page more than necessary.
  revealCaret() {
    const rect = this.caretRect();
    if (!rect) return;
    const scroller = this.scroller;
    const frame = scroller.getBoundingClientRect();
    const top = rect.top - frame.top;
    const margin = 96;
    if (top < margin) scroller.scrollTop += top - margin;
    else if (top > scroller.clientHeight - margin) scroller.scrollTop += top - (scroller.clientHeight - margin);
  }

  insert(value) {
    const textarea = this.textarea;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.setRangeText(value, start, end, "end");
    this.absorb(textarea.value, "insertText");
    this.render({ scroll: true });
    this.onChange();
  }

  select(start, end) {
    this.textarea.focus();
    this.textarea.setSelectionRange(start, end);
    this.render({ scroll: true });
    if (this.options.typewriter) this.centerCaret();
    else this.revealCaret();
  }

  // Share of characters the writer actually typed. iA Writer calls this
  // authorship; the honest version of the number is "not pasted".
  authorshipShare() {
    if (!this.origins.length) return 1;
    let typed = 0;
    for (const flag of this.origins) if (flag === "t") typed += 1;
    return typed / this.origins.length;
  }
}
