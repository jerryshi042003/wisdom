// ==UserScript==
// @name         Wisdom Source Analysis
// @namespace    https://wisdom-reader.onrender.com/
// @version      1.0.0
// @description  Add local Wisdom analysis to a canonical source page without copying its body.
// @match        https://terrytao.wordpress.com/career-advice/does-one-have-to-be-a-genius-to-do-maths/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";
  var SOURCES = [{"url":"https://terrytao.wordpress.com/career-advice/does-one-have-to-be-a-genius-to-do-maths/","title":"Does One Have to Be a Genius to Do Maths?","sourceModified":"2024-03-18T07:03:05","units":[{"id":"opening","title":"A label is not an explanation","anchor":"Better beware of notions","endAnchor":"other supernatural abilities","analysis":["The epigraph belongs to Ortega y Gasset, not Tao; it frames genius as a label that can stop explanation. Tao then rejects a magical faculty while still acknowledging intelligence, patience, and maturity.","His replacement is a causal bundle: work, field knowledge, borrowed tools, questions, conversation, and big-picture judgment. Many parts are trainable; none promise equal outcomes or erase unequal constraints."],"comprehensionPrompt":"What process does the word genius hide, and which ingredient in Tao's replacement bundle is currently most limiting?"},{"id":"lone-genius","title":"The romantic picture is wrong","anchor":"The popular image","endAnchor":"Poincaré conjecture","analysis":["Tao separates originality from creation out of nothing. Wiles and Perelman made distinctive breakthroughs, but those breakthroughs still depended on literature, tools, and many earlier contributors.","The cumulative account can understate rare individual insight, so the useful synthesis is dependency plus distinction: identify both the inherited foundation and the genuinely new move."],"comprehensionPrompt":"For one breakthrough you admire, what was inherited and what was genuinely distinctive?"},{"id":"myth-damage","title":"What the myth damages","anchor":"Actually, I find the reality","endAnchor":"some other problems as well","analysis":["Tao's strongest move is behavioral: the genius myth can produce grand-problem fixation, weak self-checking, or discouragement. He redirects attention to controllable practices such as planning, education, and skeptical review.","This is experienced professional judgment rather than a causal experiment. Effort language can also become blame if it hides time, health, teaching, mentorship, or access."],"comprehensionPrompt":"Which failure mode—grandiosity, weak checking, or discouragement—looks most like your current behavior?"},{"id":"contribution","title":"Contribution is not a ranking","anchor":"Of course, even if one dismisses","endAnchor":"see what I mean by this","analysis":["Tao replaces best-overall ranking with local fit. A field has more worthwhile problems than a few stars can cover, so a particular tool set or viewpoint can be useful without being universally superior.","Comparative advantage is an analogy, not a career theorem. Scarce jobs and gatekeeping remain real, and unglamorous work is valuable only when it contributes or builds capability rather than becoming permanent avoidance."],"comprehensionPrompt":"What neglected problem fits your current tools better than the glamorous problem you compare yourself against?"},{"id":"talent-trap","title":"Easy success can become a trap","anchor":"abundance of raw talent","endAnchor":"even more so","analysis":["Easy early success can make struggle feel like an identity threat. Protecting the image of effortless ability then suppresses basic questions, range-building, patience, and deliberate practice.","The counterweight is calibrated difficulty, not suffering for its own sake. Talent can accelerate learning; badly chosen struggle can waste time or cause burnout."],"comprehensionPrompt":"Which capability have you avoided because being a beginner would threaten how competent you feel?"},{"id":"not-a-sport","title":"Mathematics is not a sport","anchor":"not a sport","endAnchor":"all the good people it can get","analysis":["Tao changes the objective function from rank to shared understanding and useful development. This does not lower rigor; it changes what rigor is for.","Ranks, funding, jobs, and prizes still affect opportunity and sometimes carry information. The practical question is whether the score serves the work or quietly replaces it."],"comprehensionPrompt":"What score are you optimizing, and who benefits if it rises?"},{"id":"updates","title":"Further reading and later limits","anchor":"Further reading","endAnchor":"Notices Amer. Math. Soc.","analysis":["The bibliography is evidence context, not a five-link assignment. The 2023 update concedes Tao's unusual education and says the essay rests more on decades of observing and talking with many people than on treating his own path as typical.","That clarification strengthens the basis without proving a universal causal claim; his observation pool may still be selective. The 2024 note records an AMS reprint, not a new argument."],"comprehensionPrompt":"How does the 2023 clarification strengthen the essay, and what does it still fail to prove?"}]}];
  var canonical = location.href.split("#")[0].split("?")[0].replace(/\/$/, "") + "/wisdom/";
  var source = SOURCES.find(function (item) { return item.url === canonical; });
  if (!source || document.getElementById("wisdom-source-overlay-host")) return;

  function compact(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
  var candidates = Array.from(document.querySelectorAll("article blockquote, article p, article li, .entry-content blockquote, .entry-content p, .entry-content li, main blockquote, main p, main li"));
  candidates = candidates.filter(function (node, index, values) { return compact(node.textContent) && values.indexOf(node) === index; });

  function locate(unit) {
    var start = candidates.findIndex(function (node) { return compact(node.textContent).toLowerCase().includes(unit.anchor.toLowerCase()); });
    var end = candidates.findIndex(function (node, index) { return index >= start && compact(node.textContent).toLowerCase().includes(unit.endAnchor.toLowerCase()); });
    if (start < 0 || end < start) return null;
    return { start: candidates[start], nodes: candidates.slice(start, end + 1) };
  }

  var aligned = source.units.map(function (unit) { return { unit: unit, match: locate(unit) }; });
  var host = document.createElement("aside");
  host.id = "wisdom-source-overlay-host";
  host.setAttribute("aria-label", "Wisdom source analysis");
  document.body.appendChild(host);
  var shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>
    :host { all: initial; }
    button { font: 700 14px/1.3 system-ui, sans-serif; }
    #open { position: fixed; z-index: 2147483646; right: 16px; bottom: 16px; min-height: 48px; border: 0; border-radius: 999px; padding: 0 18px; background: #245768; color: white; box-shadow: 0 5px 22px #0003; cursor: pointer; }
    #panel { box-sizing: border-box; position: fixed; z-index: 2147483647; inset: 12px 12px 12px auto; width: min(390px, calc(100vw - 24px)); overflow: auto; border: 1px solid #bdd0d6; border-radius: 14px; background: #f6f8f9; color: #20262c; box-shadow: 0 12px 48px #0004; font: 15px/1.55 system-ui, sans-serif; }
    #panel[hidden] { display: none; }
    header { position: sticky; top: 0; display: flex; justify-content: space-between; gap: 12px; align-items: start; padding: 14px; background: #f6f8f9ee; border-bottom: 1px solid #d4dde1; backdrop-filter: blur(8px); }
    h2 { margin: 0; font: 750 19px/1.25 Georgia, serif; }
    header p, .notice { margin: 4px 0 0; color: #56626c; font-size: 12px; }
    #close { min-width: 44px; min-height: 44px; border: 1px solid #c9d2d7; border-radius: 9px; background: white; cursor: pointer; }
    nav { display: grid; gap: 6px; padding: 12px; }
    nav button { min-height: 44px; border: 1px solid #c9d5da; border-radius: 9px; padding: 9px 10px; background: white; color: #244854; text-align: left; cursor: pointer; }
    nav button[disabled] { color: #8a5353; background: #f5eaea; cursor: not-allowed; }
    #analysis { margin: 0 12px 12px; border-left: 4px solid #397789; border-radius: 9px; background: #e8f1f3; padding: 13px; }
    #analysis h3 { margin: 0 0 8px; font: 750 18px/1.25 Georgia, serif; }
    #analysis p { margin: 0 0 10px; }
    #analysis .prompt { border-top: 1px solid #bfd2d8; padding-top: 10px; color: #274c57; font-weight: 700; }
    button:focus-visible { outline: 3px solid #78afbf; outline-offset: 2px; }
  </style>
  <button id="open" type="button">Wisdom analysis</button>
  <section id="panel" hidden aria-label="Local Wisdom analysis panel">
    <header><div><h2>${source.title}</h2><p>Analysis on the canonical page · source body is not stored by this widget</p></div><button id="close" type="button" aria-label="Close Wisdom analysis">×</button></header>
    <p class="notice" style="padding:0 12px">If an anchor changes, that section is disabled instead of attaching analysis to a guessed passage.</p>
    <nav aria-label="Source sections"></nav>
    <article id="analysis" hidden></article>
  </section>`;
  var open = shadow.getElementById("open");
  var panel = shadow.getElementById("panel");
  var close = shadow.getElementById("close");
  var nav = shadow.querySelector("nav");
  var analysis = shadow.getElementById("analysis");
  var highlighted = [];

  function clearHighlight() {
    highlighted.forEach(function (node) { node.style.outline = ""; node.style.outlineOffset = ""; });
    highlighted = [];
  }
  function show(item) {
    if (!item.match) return;
    clearHighlight();
    highlighted = item.match.nodes;
    highlighted.forEach(function (node) { node.style.outline = "3px solid #78afbf"; node.style.outlineOffset = "4px"; });
    item.match.start.scrollIntoView({ behavior: "smooth", block: "center" });
    analysis.textContent = "";
    var heading = document.createElement("h3");
    heading.textContent = item.unit.title;
    analysis.appendChild(heading);
    item.unit.analysis.forEach(function (value) { var paragraph = document.createElement("p"); paragraph.textContent = value; analysis.appendChild(paragraph); });
    var prompt = document.createElement("p");
    prompt.className = "prompt";
    prompt.textContent = "Check: " + item.unit.comprehensionPrompt;
    analysis.appendChild(prompt);
    analysis.hidden = false;
  }
  aligned.forEach(function (item, index) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = (index + 1) + ". " + item.unit.title + (item.match ? "" : " · source changed");
    button.disabled = !item.match;
    button.addEventListener("click", function () { show(item); });
    nav.appendChild(button);
  });
  open.addEventListener("click", function () { panel.hidden = false; open.hidden = true; (nav.querySelector("button:not([disabled])") || close).focus(); });
  close.addEventListener("click", function () { clearHighlight(); panel.hidden = true; open.hidden = false; open.focus(); });
})();
