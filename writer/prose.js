// Prose analysis: sentence splitting, a heuristic part-of-speech tagger, and a
// style checker.
//
// The tagger is deliberately a lexicon + suffix system, not a statistical
// parser: it has to run on every keystroke, offline, with no model download.
// It is right about 85% of the time, which is enough for its only job — making
// a habit visible ("every third word is an adjective") rather than labelling
// language correctly. The UI says so; do not let it grow into a claim of
// linguistic accuracy.

const set = (words) => new Set(words.split(/\s+/u).filter(Boolean));

const CONJUNCTION = set(`
  and but or nor yet so although though because since unless until while whilst
  whereas whether if than when whenever where wherever once before after as
  therefore however moreover furthermore nevertheless nonetheless plus versus
`);

const PREPOSITION = set(`
  of in to on at by with from into about over under between through during
  without within against among across behind beyond upon toward towards near
  onto off out up down for like per than via despite besides beneath below
  above along around beside inside outside since until throughout
`);

const DETERMINER = set(`
  the a an this that these those my your his her its our their some any each
  every no another both few many most much several all half either neither
  what which whose
`);

const PRONOUN = set(`
  i you he she it we they me him us them mine yours hers ours theirs myself
  yourself himself herself itself ourselves themselves who whom anyone everyone
  someone nobody anything everything something nothing one ones
`);

// Auxiliaries and the irregular verbs a suffix rule can never catch.
const VERB = set(`
  is are was were be been being am have has had having do does did doing will
  would can could shall should may might must ought
  get gets got gotten make makes made take takes took taken see sees saw seen
  know knows knew known think thinks thought come comes came go goes went gone
  say says said want wants give gives gave given find finds found tell tells
  told become becomes became feel feels felt keep keeps kept leave leaves left
  put puts mean means meant read reads write writes wrote written hold holds
  held bring brings brought stand stands stood understand understands
  understood let lets run runs ran sit sits sat speak speaks spoke spoken
  begin begins began begun break breaks broke broken buy buys bought choose
  chooses chose chosen draw draws drew drawn drive drives drove driven eat eats
  ate eaten fall falls fell fallen grow grows grew grown hear hears heard lose
  loses lost pay pays paid send sends sent set sets show shows showed shown
  sleep sleeps slept spend spends spent teach teaches taught wear wears wore
  win wins won seem seems seemed look looks looked work works worked need needs
  needed try tries tried ask asks asked turn turns turned start starts started
  help helps helped talk talks talked move moves moved live lives lived believe
  believes believed bring wait waits waited
`);

// Common adjectives with noun-shaped or bare endings.
const ADJECTIVE = set(`
  good bad big small new old great high low long short same different own other
  another next last first second young early late hard easy real true false
  right wrong sure clear dark light bright warm cool cold quiet loud clean
  dirty full empty free busy strong weak deep shallow wide narrow thick thin
  heavy soft rough smooth sharp dull sweet bitter fresh dead alive whole broken
  strange common rare simple complex plain fine nice poor rich cheap dear safe
  wild calm tired ready able likely unlikely certain possible impossible major
  minor local single double every enough less least more most best worst better
  worse able unable aware afraid alone happy sad angry
`);

const ADVERB = set(`
  very really quite rather just too also only even still never always often
  sometimes seldom rarely soon now then here there again almost already
  perhaps maybe indeed instead nearly hardly barely merely simply once twice
  together apart forward back away ever yet far well much else otherwise
  anyway somehow somewhat thus hence today tonight tomorrow yesterday
`);

// -ly words that are not adverbs.
const NOT_ADVERB = set(`
  only family reply apply supply imply comply rely july italy ugly holy silly
  lonely lovely likely unlikely friendly early daily weekly monthly yearly
  costly deadly elderly orderly ally rally belly jelly fly ply sly
`);

const ADJECTIVE_SUFFIX = ["ous", "ful", "ive", "able", "ible", "ical", "ic", "ish", "less", "esque", "most", "ent", "ant"];
const NOUN_SUFFIX = ["tion", "sion", "ment", "ness", "ity", "ship", "hood", "ance", "ence", "ism", "ist", "age", "ure", "dom", "ery", "cy"];
const VERB_SUFFIX = ["ize", "ise", "ify", "ate", "ed", "ing"];

const ABBREVIATION = set(`
  mr. mrs. ms. dr. prof. sr. jr. st. vs. etc. e.g. i.e. cf. al. fig. no. inc.
  ltd. co. u.s. u.k. a.m. p.m. ph.d. approx.
`);

export const POS = Object.freeze(["noun", "verb", "adj", "adv", "conj"]);

export function tagWord(word, previous) {
  const lower = word.toLowerCase();

  if (CONJUNCTION.has(lower)) return "conj";
  if (PREPOSITION.has(lower)) return "conj"; // function words read as one class here
  if (DETERMINER.has(lower) || PRONOUN.has(lower)) return null;
  if (VERB.has(lower)) return "verb";
  if (ADVERB.has(lower)) return "adv";
  if (ADJECTIVE.has(lower)) return "adj";

  if (lower.endsWith("ly") && lower.length > 4 && !NOT_ADVERB.has(lower)) return "adv";

  // "to write", "to run" — the infinitive is the one context rule worth having.
  if (previous === "to" && !DETERMINER.has(lower)) return "verb";

  for (const suffix of NOUN_SUFFIX) if (lower.endsWith(suffix) && lower.length > suffix.length + 2) return "noun";
  for (const suffix of ADJECTIVE_SUFFIX) if (lower.endsWith(suffix) && lower.length > suffix.length + 2) return "adj";
  for (const suffix of VERB_SUFFIX) if (lower.endsWith(suffix) && lower.length > suffix.length + 2) return "verb";

  return "noun";
}

const WORD = /[A-Za-z][A-Za-z'’-]*/gu;

// Every word in the text with its span and tag. One pass, reused by the
// highlighter and the notes panel.
export function words(text) {
  const found = [];
  let previous = "";
  for (const match of text.matchAll(WORD)) {
    const word = match[0];
    found.push({ start: match.index, end: match.index + word.length, word, tag: tagWord(word, previous) });
    previous = word.toLowerCase();
  }
  return found;
}

// Sentence spans. Splits on . ! ? … followed by whitespace or end, and refuses
// to split after a known abbreviation or a single initial ("J. Shi").
export function sentences(text) {
  const spans = [];
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character !== "." && character !== "!" && character !== "?" && character !== "…") continue;

    let after = index + 1;
    while (after < text.length && (text[after] === '"' || text[after] === "'" || text[after] === "”" || text[after] === "’" || text[after] === ")")) after += 1;
    const next = text[after];
    if (next !== undefined && !/\s/u.test(next)) continue;

    if (character === ".") {
      const before = text.slice(Math.max(0, index - 12), index + 1);
      const token = (before.match(/\S+$/u) || [""])[0].toLowerCase();
      if (ABBREVIATION.has(token)) continue;
      if (/^[A-Za-z]\.$/u.test(token)) continue;
    }

    const end = after;
    if (text.slice(start, end).trim()) spans.push({ start, end });
    start = end;
  }
  if (text.slice(start).trim()) spans.push({ start, end: text.length });
  return spans;
}

export function paragraphAt(text, caret) {
  let start = text.lastIndexOf("\n\n", Math.max(0, caret - 1));
  start = start === -1 ? 0 : start + 2;
  let end = text.indexOf("\n\n", caret);
  end = end === -1 ? text.length : end;
  return { start, end };
}

export function sentenceAt(text, caret) {
  const spans = sentences(text);
  for (const span of spans) {
    if (caret >= span.start && caret <= span.end) return span;
  }
  return spans.length ? spans[spans.length - 1] : { start: 0, end: text.length };
}

// ── Style ────────────────────────────────────────────────────────────────────
// Each entry is a phrase and why it is flagged. Nothing here is a rule; the
// panel says "worth a look", never "wrong".

const FILLER = [
  "very", "really", "quite", "rather", "actually", "basically", "literally",
  "simply", "totally", "definitely", "certainly", "absolutely", "truly",
  "extremely", "incredibly", "somewhat", "somehow", "essentially", "virtually",
  "arguably", "clearly", "obviously", "just"
];

const HEDGE = [
  "i think", "i believe", "i feel like", "it seems", "it appears", "perhaps",
  "maybe", "sort of", "kind of", "a bit", "pretty much", "more or less",
  "in my opinion", "needless to say"
];

const CLICHE = [
  "at the end of the day", "the fact that", "in order to", "due to the fact that",
  "at this point in time", "for all intents and purposes", "think outside the box",
  "low-hanging fruit", "moving forward", "in terms of", "when it comes to",
  "it goes without saying", "first and foremost", "each and every",
  "few and far between", "tip of the iceberg", "last but not least",
  "the bottom line", "paradigm shift", "game changer", "deep dive",
  "circle back", "double-edged sword", "avid reader", "in this day and age",
  "only time will tell", "food for thought", "level playing field"
];

const REDUNDANCY = [
  "absolutely essential", "advance planning", "basic fundamentals",
  "close proximity", "completely eliminate", "end result", "exact same",
  "final outcome", "free gift", "future plans", "past history",
  "personal opinion", "revert back", "unexpected surprise", "very unique",
  "whether or not", "atm machine", "added bonus", "brief summary",
  "current status", "each individual", "join together", "new innovation",
  "plan ahead", "repeat again", "still remains", "sudden impulse"
];

const KINDS = [
  { kind: "filler", note: "filler — cut it and read the sentence again", phrases: FILLER },
  { kind: "hedge", note: "hedge — you already earned the claim", phrases: HEDGE },
  { kind: "cliche", note: "cliché — someone else's phrase", phrases: CLICHE },
  { kind: "redundancy", note: "redundant — one of these words is enough", phrases: REDUNDANCY }
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

const STYLE_PATTERNS = KINDS.map(({ kind, note, phrases }) => ({
  kind,
  note,
  pattern: new RegExp(`(?<![A-Za-z])(${phrases.map(escapeRegExp).join("|")})(?![A-Za-z])`, "giu")
}));

const PASSIVE = /\b(?:is|are|was|were|been|being|be)\s+(?:\w+ly\s+)?(\w+(?:ed|en))\b/giu;

export function styleFlags(text) {
  const flags = [];
  for (const { kind, note, pattern } of STYLE_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      flags.push({ start: match.index, end: match.index + match[0].length, kind, note, phrase: match[0] });
    }
  }
  for (const match of text.matchAll(PASSIVE)) {
    flags.push({
      start: match.index,
      end: match.index + match[0].length,
      kind: "passive",
      note: "possibly passive — who is doing this?",
      phrase: match[0]
    });
  }
  return flags.sort((a, b) => a.start - b.start);
}

// Reading time uses 238 wpm, the mean silent-reading rate for English prose in
// Brysbaert's 2019 meta-analysis of 190 studies — not the 200/250 that writing
// apps copy from each other.
export const WORDS_PER_MINUTE = 238;

export function stats(text) {
  const allWords = words(text);
  const spans = sentences(text);
  const flags = styleFlags(text);
  const counts = { noun: 0, verb: 0, adj: 0, adv: 0, conj: 0 };
  for (const item of allWords) if (item.tag) counts[item.tag] += 1;

  const perSentence = spans.map((span) => {
    const slice = text.slice(span.start, span.end);
    return (slice.match(WORD) || []).length;
  });
  const longest = perSentence.reduce((best, count, index) => (count > perSentence[best] ? index : best), 0);

  return {
    words: allWords.length,
    characters: text.length,
    sentences: spans.length,
    paragraphs: text.split(/\n{2,}/u).filter((block) => block.trim()).length,
    minutes: allWords.length / WORDS_PER_MINUTE,
    averageSentence: spans.length ? allWords.length / spans.length : 0,
    longestSentence: spans.length ? { words: perSentence[longest], ...spans[longest] } : null,
    counts,
    flags
  };
}
