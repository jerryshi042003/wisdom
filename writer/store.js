// Local-only document storage.
//
// Everything a writer types stays in this browser: no account, no token, no
// network call, no sync service. That is a deliberate limit, not a missing
// feature — the drafts are more private than a cloud editor's and the app works
// on a plane. The cost is honest and stated in the app: clearing site data
// clears the drafts, so Export is a first-class button rather than an
// afterthought.

const KEY = "quiet.v1";
const nowISO = () => new Date().toISOString();

// Paragraphs are single lines on purpose: the editor soft-wraps, and hard
// wrapping a welcome note teaches a new writer the wrong habit.
const WELCOME = `# The room

This is a writing room, not a word processor. It does four things and refuses the rest.

**Typewriter** holds your line at the middle of the screen and moves the page under it. You never write at the bottom edge again.

**Focus** dims everything except the sentence you are in, so you stop editing the line above while trying to find the next one.

**Lens** colours one part of speech at a time. Turn on *adverbs* and read a paragraph — the padding stops being a feeling and becomes something you can see. Turn on *adjectives* when a draft feels overwritten.

**Style check** underlines filler, hedges, clichés, and redundancy. It is a smell detector, not a grammar checker, and it is never right by authority.

Notes counts what you wrote. Drafts holds everything, stored in this browser alone. Export writes a plain \`.md\` file you own.

Markdown is the only formatting: \`#\` for a heading, \`*emphasis*\`, \`**strong**\`, \`> quote\`, \`- list\`.

Now delete all of this and write the first sentence.
`;

function readRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.docs)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export class Store {
  constructor() {
    const saved = readRaw();
    if (saved) {
      this.docs = saved.docs;
      this.activeId = saved.activeId;
      this.prefs = saved.prefs || {};
    } else {
      const first = this.blank(WELCOME);
      this.docs = [first];
      this.activeId = first.id;
      this.prefs = {};
    }
    if (!this.active) this.activeId = this.docs[0]?.id;
    this.failed = false;
  }

  blank(text = "") {
    return {
      id: `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      text,
      origins: "t".repeat(text.length),
      created: nowISO(),
      updated: nowISO()
    };
  }

  get active() {
    return this.docs.find((doc) => doc.id === this.activeId) || null;
  }

  // A draft's name is its first heading, or its first line of prose. Naming a
  // file is a decision the writer should not have to make before writing.
  static titleOf(doc) {
    const text = (doc?.text || "").trim();
    if (!text) return "Untitled";
    const heading = text.match(/^#{1,6}[ \t]+(.+)$/mu);
    const line = heading ? heading[1] : text.split("\n").find((candidate) => candidate.trim());
    const clean = (line || "Untitled")
      .replace(/[*_`>#[\]]/gu, "")
      .replace(/\(([^)]*)\)/gu, "")
      .trim();
    return clean.length > 64 ? `${clean.slice(0, 63)}…` : clean || "Untitled";
  }

  update(text, origins) {
    const doc = this.active;
    if (!doc) return;
    doc.text = text;
    doc.origins = origins;
    doc.updated = nowISO();
    this.persist();
  }

  create(text = "") {
    const doc = this.blank(text);
    this.docs.unshift(doc);
    this.activeId = doc.id;
    this.persist();
    return doc;
  }

  open(id) {
    if (this.docs.some((doc) => doc.id === id)) {
      this.activeId = id;
      this.persist();
    }
    return this.active;
  }

  remove(id) {
    this.docs = this.docs.filter((doc) => doc.id !== id);
    if (!this.docs.length) this.docs = [this.blank("")];
    if (!this.docs.some((doc) => doc.id === this.activeId)) this.activeId = this.docs[0].id;
    this.persist();
    return this.active;
  }

  setPref(name, value) {
    this.prefs[name] = value;
    this.persist();
  }

  // Newest-first, which is how drafts are actually looked for.
  ordered() {
    return [...this.docs].sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
  }

  persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ docs: this.docs, activeId: this.activeId, prefs: this.prefs }));
      this.failed = false;
    } catch {
      // Out of quota or private-mode storage. Say so rather than pretending to
      // have saved: silent data loss is the one unforgivable bug in an editor.
      this.failed = true;
    }
  }
}
