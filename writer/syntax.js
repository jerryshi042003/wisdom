// Markdown marking for the highlight layer.
//
// Hard constraint that shapes every decision here: the highlight layer is a
// <pre> sitting under a transparent <textarea>, and the caret only lands in the
// right place if both boxes lay text out identically. So structure is expressed
// with colour, opacity, underline, and paint-only weight (-webkit-text-stroke) —
// never font-size, font-weight, or anything else that changes an advance width.

const LINE_RULES = [
  ["fence", /^(\s*)(```|~~~)(.*)$/u],
  ["heading", /^(#{1,6})([ \t]+)(.*)$/u],
  ["rule", /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/u],
  ["quote", /^(\s*>+[ \t]?)/u],
  ["list", /^(\s*)((?:[-*+]|\d+[.)]))([ \t]+)/u]
];

const INLINE_RULES = [
  // [display, whole-match regex, groups to treat as content]
  ["code", /`[^`\n]+`/gu],
  ["image", /!\[[^\]\n]*\]\([^)\n\s]+\)/gu],
  ["link", /\[[^\]\n]*\]\([^)\n\s]+\)/gu],
  ["autolink", /<(?:https?:\/\/|mailto:)[^>\s]+>/gu],
  ["footnote", /\[\^[^\]\n]+\]/gu],
  ["strong", /(\*\*|__)(?=\S)([^*_\n]+?)(?<=\S)\1/gu],
  ["em", /(\*|_)(?=\S)([^*_\n]+?)(?<=\S)\1/gu],
  ["strike", /~~(?=\S)([^~\n]+?)(?<=\S)~~/gu]
];

export function markMarkdown(text, add) {
  const taken = new Uint8Array(text.length);
  const claim = (start, end) => {
    for (let index = start; index < end; index += 1) taken[index] = 1;
  };
  const free = (start, end) => {
    for (let index = start; index < end; index += 1) if (taken[index]) return false;
    return true;
  };

  let offset = 0;
  let inFence = false;
  let inFrontMatter = /^---[ \t]*(?:\n|$)/u.test(text);
  const lines = text.split("\n");

  lines.forEach((line, lineNumber) => {
    const start = offset;
    const end = start + line.length;
    offset = end + 1;

    if (inFrontMatter) {
      add(start, end, "meta");
      claim(start, end);
      if (lineNumber > 0 && /^---[ \t]*$/u.test(line)) inFrontMatter = false;
      return;
    }

    const fence = line.match(LINE_RULES[0][1]);
    if (fence) {
      add(start, end, "syn");
      claim(start, end);
      inFence = !inFence;
      return;
    }
    if (inFence) {
      add(start, end, "code");
      claim(start, end);
      return;
    }

    if (LINE_RULES[2][1].test(line) && line.trim()) {
      add(start, end, "syn");
      claim(start, end);
      return;
    }

    let contentStart = start;

    const heading = line.match(LINE_RULES[1][1]);
    if (heading) {
      const marker = heading[1].length + heading[2].length;
      add(start, start + marker, "syn");
      claim(start, start + marker);
      add(start + marker, end, `head h${heading[1].length}`);
      contentStart = start + marker;
    } else {
      const quote = line.match(LINE_RULES[3][1]);
      if (quote) {
        add(start, start + quote[1].length, "syn");
        claim(start, start + quote[1].length);
        add(start + quote[1].length, end, "quote");
        contentStart = start + quote[1].length;
      }
      const list = line.slice(contentStart - start).match(LINE_RULES[4][1]);
      if (list) {
        const from = contentStart + list[1].length;
        const to = from + list[2].length;
        add(from, to, "marker");
        claim(from, to);
      }
    }

    // Inline pass, restricted to this line so a stray delimiter cannot bleed.
    for (const [kind, pattern] of INLINE_RULES) {
      pattern.lastIndex = 0;
      for (const match of line.matchAll(pattern)) {
        const from = start + match.index;
        const to = from + match[0].length;
        if (!free(from, to)) continue;
        claim(from, to);
        markInline(kind, match[0], from, add);
      }
    }
  });
}

function markInline(kind, raw, from, add) {
  const to = from + raw.length;

  if (kind === "code") {
    add(from, from + 1, "syn");
    add(from + 1, to - 1, "code");
    add(to - 1, to, "syn");
    return;
  }

  if (kind === "autolink" || kind === "footnote") {
    add(from, to, "syn");
    return;
  }

  if (kind === "image" || kind === "link") {
    const open = raw.indexOf("[");
    const close = raw.indexOf("](");
    add(from, from + open + 1, "syn");
    add(from + open + 1, from + close, "link");
    add(from + close, to, "syn");
    return;
  }

  const delimiter = kind === "strike" ? 2 : raw.startsWith("**") || raw.startsWith("__") ? 2 : 1;
  const body = kind === "strong" ? "strong" : kind === "em" ? "em" : "strike";
  add(from, from + delimiter, "syn");
  add(from + delimiter, to - delimiter, body);
  add(to - delimiter, to, "syn");
}
