// A small Markdown renderer for the reading view and for print/PDF.
//
// Deliberately not a CommonMark implementation. It covers what an essay uses —
// headings, paragraphs, emphasis, quotes, lists, code, links, rules, footnote
// markers — and escapes first so no draft can inject markup into the page.

const ESCAPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const escapeHtml = (value) => value.replace(/[&<>"]/gu, (character) => ESCAPE[character]);

// Only these schemes survive; a draft is untrusted input like any other.
function safeUrl(raw) {
  const url = raw.trim();
  if (/^(?:https?:\/\/|mailto:|#|\/|\.\/|\.\.\/)/iu.test(url)) return escapeHtml(url);
  return "";
}

function inline(text) {
  let output = escapeHtml(text);

  output = output.replace(/`([^`]+)`/gu, (_match, code) => `<code>${code}</code>`);
  output = output.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/gu, (_match, alt, url) => {
    const href = safeUrl(url);
    return href ? `<img src="${href}" alt="${alt}" />` : alt;
  });
  output = output.replace(/\[([^\]]+)\]\(([^)\s]+)\)/gu, (_match, label, url) => {
    const href = safeUrl(url);
    return href ? `<a href="${href}" rel="noopener noreferrer">${label}</a>` : label;
  });
  output = output.replace(/(\*\*|__)(?=\S)([\s\S]+?)(?<=\S)\1/gu, (_match, _delimiter, body) => `<strong>${body}</strong>`);
  output = output.replace(/(?<![*\w])\*(?=\S)([^*\n]+?)(?<=\S)\*(?![*\w])/gu, (_match, body) => `<em>${body}</em>`);
  output = output.replace(/(?<![_\w])_(?=\S)([^_\n]+?)(?<=\S)_(?![_\w])/gu, (_match, body) => `<em>${body}</em>`);
  output = output.replace(/~~(?=\S)([^~\n]+?)(?<=\S)~~/gu, (_match, body) => `<del>${body}</del>`);
  output = output.replace(/ {2,}$/gmu, "<br />");
  return output;
}

export function renderMarkdown(source) {
  const lines = String(source || "").replace(/\r\n?/gu, "\n").split("\n");
  const out = [];
  let index = 0;

  // Front matter is metadata, not prose; the reading view drops it.
  if (lines[0] === "---") {
    const close = lines.indexOf("---", 1);
    if (close > 0) index = close + 1;
  }

  const paragraph = [];
  const flush = () => {
    if (!paragraph.length) return;
    out.push(`<p>${inline(paragraph.join("\n"))}</p>`);
    paragraph.length = 0;
  };

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      flush();
      index += 1;
      continue;
    }

    const fence = line.match(/^\s*(?:```|~~~)(.*)$/u);
    if (fence) {
      flush();
      const body = [];
      index += 1;
      while (index < lines.length && !/^\s*(?:```|~~~)\s*$/u.test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      out.push(`<pre><code>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})[ \t]+(.*)$/u);
    if (heading) {
      flush();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/u.test(line)) {
      flush();
      out.push("<hr />");
      index += 1;
      continue;
    }

    if (/^\s*>/u.test(line)) {
      flush();
      const body = [];
      while (index < lines.length && /^\s*>/u.test(lines[index])) {
        body.push(lines[index].replace(/^\s*>[ \t]?/u, ""));
        index += 1;
      }
      out.push(`<blockquote>${renderMarkdown(body.join("\n"))}</blockquote>`);
      continue;
    }

    const bullet = line.match(/^\s*(?:[-*+])[ \t]+/u);
    const numbered = line.match(/^\s*\d+[.)][ \t]+/u);
    if (bullet || numbered) {
      flush();
      const tag = bullet ? "ul" : "ol";
      const items = [];
      const marker = bullet ? /^\s*(?:[-*+])[ \t]+/u : /^\s*\d+[.)][ \t]+/u;
      while (index < lines.length && marker.test(lines[index])) {
        const first = lines[index].replace(marker, "");
        const parts = [first];
        index += 1;
        // Continuation lines belong to the item they are indented under.
        while (index < lines.length && /^\s{2,}\S/u.test(lines[index]) && !marker.test(lines[index])) {
          parts.push(lines[index].trim());
          index += 1;
        }
        items.push(`<li>${inline(parts.join(" "))}</li>`);
      }
      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    paragraph.push(line);
    index += 1;
  }

  flush();
  return out.join("\n");
}
