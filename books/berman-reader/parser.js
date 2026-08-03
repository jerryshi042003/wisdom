(function (root) {
  "use strict";

  var EXPECTED_IDS = [
    "penguin-preface", "original-preface", "introduction",
    "faust", "faust-dreamer", "faust-lover", "faust-developer", "faust-epilogue",
    "marx", "marx-melting", "marx-destruction", "marx-nakedness", "marx-values", "marx-halo", "marx-conclusion",
    "baudelaire", "baudelaire-pastoral", "baudelaire-heroism", "baudelaire-eyes", "baudelaire-macadam", "baudelaire-highway",
    "petersburg", "petersburg-geometry", "petersburg-pushkin", "petersburg-nicholas", "petersburg-gogol",
    "petersburg-dostoevsky", "petersburg-1860s", "petersburg-chernyshevsky", "petersburg-underground",
    "petersburg-paris", "petersburg-political", "petersburg-crystal", "petersburg-1905", "petersburg-biely",
    "petersburg-mandelstam", "petersburg-conclusion",
    "new-york", "new-york-moses", "new-york-1960s", "new-york-1970s"
  ];

  function normalizeText(raw) {
    return String(raw || "")
      .replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function paragraphs(text) {
    return normalizeText(text).split(/\n\s*\n/).map(function (part) {
      return part.replace(/\s*\n\s*/g, " ").trim();
    }).filter(Boolean);
  }

  function parse(raw) {
    var text = normalizeText(raw);
    if (!text || text.length > 1200000) throw new Error("Choose the cleaned Wisdom edition (under 1.2 MB)");
    if (!/^# All That Is Solid Melts Into Air\s*$/m.test(text)) throw new Error("This is not the cleaned Wisdom edition");

    var marker = /^## ([a-z0-9-]+) \| (.+)\s*$/gm;
    var matches = [];
    var found;
    while ((found = marker.exec(text))) {
      matches.push({ id: found[1], title: found[2].trim(), index: found.index, end: marker.lastIndex });
    }
    if (matches.length !== EXPECTED_IDS.length) throw new Error("Wisdom expected the 41-section cleaned edition");
    if (matches.some(function (item, index) { return item.id !== EXPECTED_IDS[index]; })) {
      throw new Error("The cleaned sections were missing or out of order");
    }

    var units = matches.map(function (item, index) {
      return {
        id: item.id,
        number: "Section " + (index + 1),
        title: item.title,
        paragraphs: paragraphs(text.slice(item.end, matches[index + 1] ? matches[index + 1].index : text.length))
      };
    });
    if (units.some(function (unit) { return unit.paragraphs.length < 2; })) {
      throw new Error("One or more sections looked incomplete");
    }
    return {
      schemaVersion: 1,
      workId: "all-that-is-solid",
      title: "All That Is Solid Melts Into Air",
      units: units,
      charCount: text.length
    };
  }

  function validBook(value) {
    return value && value.schemaVersion === 1 && value.workId === "all-that-is-solid" &&
      Array.isArray(value.units) && value.units.length === EXPECTED_IDS.length &&
      value.units.every(function (unit, index) { return unit && unit.id === EXPECTED_IDS[index]; });
  }

  root.WisdomBermanParser = {
    EXPECTED_IDS: EXPECTED_IDS.slice(),
    parse: parse,
    validBook: validBook
  };
})(typeof window !== "undefined" ? window : globalThis);
