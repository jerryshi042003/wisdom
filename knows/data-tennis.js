// Knows content — tennis (personal domain), for the 3Blue1Brown-of-tennis goal.
// Sourced from the repo's own verified corpora: the Kovacs corpus (transcripts
// distilled into laws), the tennis shot library (physics-cited cards with
// verified footage), and the pro-training drill corpus (frame-by-frame sweeps).
// Un-linked learn entries are repo files — the private canon behind the card.
window.KNOWS_PARTS = window.KNOWS_PARTS || [];
window.KNOWS_PARTS.push([

{
  id: "tennis-science",
  domain: "personal",
  title: "Tennis science — the measurers",
  blurb: "The people who measure the serve instead of opining about it, and the measured claims themselves.",
  items: [
    { id: "mark-kovacs", kind: "person", name: "Mark Kovacs",
      hook: "Sport scientist behind the published 8-stage serve model; ex-USTA head of strength & conditioning; runs the Kovacs Institute — one of the few people who measures the serve.",
      why: ["The spine of your serve doctrine: eleven one-line laws in the repo corpus, each traceable to a captured transcript, from 'speed has exactly two correlates' to 'max two swing thoughts.' With Brian Gordon and Bruce Elliott, he's the measurement wing of serve coaching.",
            "For the 3B1B-tennis ambition he is the model author: mechanism first, myth demolition second, cues last — the exact talk-structure a measured tennis video needs."],
      learn: [
        { label: "Science of Your Serve — Tennis Congress talk (48:34, the doctrine's main source)", url: "https://www.youtube.com/watch?v=krKYy4eqgdQ" },
        { label: "What to AVOID on the serve — Changeover (10:10)", url: "https://www.youtube.com/watch?v=HdgBUIEaRsQ" },
        { label: "Repo canon: projects/kovacs-corpus.md — the 11 laws + your serve card" }
      ],
      quiz: [
        { q: "Per Kovacs, serve speed has exactly two measured correlates:", choices: ["Back-hip vertical displacement speed, and long-axis rotation speed from racket drop to contact", "Grip strength and wrist snap", "Knee-bend depth and toss height", "Shoulder turn and follow-through length"], a: 0,
          why: "Law #1 of the corpus. Everything else in the motion exists to serve those two — which is why cue lists that don't touch them don't add speed." },
        { q: "Kovacs on leg loading:", choices: ["Velocity of the load beats depth — 'every millisecond at the bottom is energy lost'", "Squat as deep as possible", "Legs contribute almost nothing", "Stay tall throughout"], a: 0,
          why: "Law #2: most good players squat too deep and die at the bottom. It's why 'bend your knees more' fails as a cue — the fix is faster, not lower." }
      ] },
    { id: "rod-cross", kind: "person", name: "Rod Cross",
      hook: "University of Sydney physicist who spent decades measuring tennis — ball/racket physics, spin, the geometry proving every serve is hit upward.",
      why: "The physics leg of your shot cards: serves clear the net leaving only 2–6° below horizontal, so spin makes the margin — the single most 3B1B-able fact in tennis. His Tennis Warehouse University pages with Crawford Lindsey are the free textbook.",
      learn: [
        { label: "TWU kick-serve physics (the 2–6° fact + ~4000rpm kick data)", url: "https://twu.tennis-warehouse.com/learning_center/kickserve.php" },
        { label: "TWU learning center (the whole free physics shelf)", url: "https://twu.tennis-warehouse.com/learning_center/" }
      ],
      quiz: [
        { q: "Cross/TWU measurement: serves cross into the court leaving the racket—", choices: ["Only 2–6° below horizontal — effectively swung upward, with spin creating the margin", "Angled 15–20° downward", "Perfectly flat", "It varies too much to measure"], a: 0,
          why: "Even the hardest flat serve barely tilts down; body tilt and spin bring it in. This is why 'swing up' is physics, not a style opinion — and a perfect first animated proof." }
      ] },
    { id: "brian-gordon", kind: "person", name: "Brian Gordon",
      hook: "Biomechanist who brought 3D motion-capture to stroke mechanics (with Bruce Elliott in the serve-research lineage); known for quantified serve and forehand models.",
      why: "The third measurer your corpus names alongside Kovacs and Elliott. His tennisplayer.net work is the archive-grade counterexample to tip content — joint-by-joint contributions, actual numbers, the standard your future videos have to meet.",
      learn: [{ label: "Tennisplayer.net biomechanics archive (the anti-aggregator resource)", url: "https://www.tennisplayer.net/" }] },
    { id: "eight-stage-serve", kind: "concept", name: "The 8-stage serve model",
      hook: "Kovacs & Ellenbecker's published framework dividing the serve into 8 stages across 3 phases — preparation, acceleration, follow-through — so faults can be located, not just felt.",
      why: "The map your serve card runs on: stage 4 (racket drop) is physical, not technical — gated by thoracic extension and shoulder external rotation — which is why 'get the racket lower' fails as an instruction. Published in Sports Health (2011), searchable by title: 'An 8-Stage Model for Evaluating the Tennis Serve.'",
      learn: [
        { label: "The Congress talk walks the stages on film", url: "https://www.youtube.com/watch?v=krKYy4eqgdQ" },
        { label: "Repo canon: projects/kovacs-corpus.md law #8 (stage 4 is physical)" }
      ],
      quiz: [
        { q: "Why does Kovacs call stage 4 (racket drop) 'physical, not technical'?", choices: ["Thoracic extension and shoulder external rotation gate it — no cue fixes a range the body doesn't have", "Because it happens too fast to see", "Because it doesn't affect speed", "Because only pros reach it"], a: 0,
          why: "The corpus's cause-over-effect rule: chase 'racket close to the head' and address the body, don't yank the arm into a pro-shaped screenshot." }
      ] },
    { id: "back-hip-engine", kind: "concept", name: "The back-hip engine",
      hook: "The load is back hip going back + down with ~10–15° of coil, then up-and-out at ~45° with contact inside the court — 'stick your front hip out' is the effect, not the cause.",
      why: "Laws #3 and #5 fused: the corpus calls 'front hip out' the worst coaching cue in serving history, and landing on/behind the baseline the giveaway that you went straight up and collapsed — which is your documented injury chain (low-back/ab/shoulder/elbow).",
      learn: [
        { label: "Repo canon: projects/kovacs-corpus.md laws #3/#5 + your two-cue serve card" },
        { label: "Kyrgios slow-mo — shallow bend, violent hip pop, law #2 in the flesh", url: "https://www.youtube.com/watch?v=Z_LU2q1CROA" }
      ],
      quiz: [
        { q: "Landing on or behind the baseline after a serve indicates—", choices: ["You went straight up and collapsed instead of traveling up-and-out at ~45°", "Good balance", "A deep knee bend paying off", "A toss too far left"], a: 0,
          why: "Kovacs's field check needing zero equipment: the landing spot audits the whole load direction. Inside the court = the energy went toward the target." }
      ] },
    { id: "long-axis-rotation", kind: "concept", name: "Long-axis rotation (ISR + pronation)",
      hook: "The second speed correlate: internal shoulder rotation plus forearm pronation from racket drop to contact — the wrist 'comes along for the ride.'",
      why: "Kills the wrist-snap myth with a measurement: legs contribute ~20–50% of power and the terminal speed rides the arm's long axis. If a coach says 'snap the wrist,' the corpus's answer is a measured no.",
      learn: [
        { label: "Where serve power REALLY comes from — Changeover (6:45)", url: "https://www.youtube.com/watch?v=jvDds3KEY4s" },
        { label: "Repo canon: projects/kovacs-corpus.md laws #1/#4" }
      ] },
    { id: "toss-and-miss-table", kind: "concept", name: "Toss fundamentals + the miss table",
      hook: "Only three toss fundamentals — straight arm, release between eyes and crown, direction 1:30–2:30; height is style. Misses: net = opened early/pulled down; long = toss into court or no long-axis rotation.",
      why: "The corpus's diagnostic economy: most serve fixes start by changing the toss, and the miss table says the toss is rarely the cause. Top-100 toss apex varies ~1.5–2 ft — style, not fundamentals.",
      learn: [
        { label: "Repo canon: projects/kovacs-corpus.md laws #6/#7" },
        { label: "Congress talk section on toss", url: "https://www.youtube.com/watch?v=krKYy4eqgdQ" }
      ],
      quiz: [
        { q: "You're serving into the net repeatedly. Per the miss table, check first:", choices: ["Whether the chest opened early / you pulled down — not the toss height", "Toss height immediately", "Grip tension", "String tension"], a: 0,
          why: "Law #7: net misses are almost never toss height. The table exists to stop the reflexive toss-tinkering that costs sessions." }
      ] },
    { id: "serve-spin-physics", kind: "concept", name: "Kick-serve spin, measured",
      hook: "A real kick serve carries ≈4000 rpm total, mostly sidespin, on an axis tilted 10–30° — measured, not vibes (Cross/TWU).",
      why: "The quantitative anchor for your trusted second serve — and your padel-smash discovery (lean in, still swing up, land inside) is the same 45° up-and-out mechanic found through a glass wall.",
      learn: [
        { label: "TWU kick-serve page (the numbers)", url: "https://twu.tennis-warehouse.com/learning_center/kickserve.php" },
        { label: "Repo canon: projects/tennis-shot-library.md card #2" }
      ] },
    { id: "cue-economy", kind: "concept", name: "Cue economy — style ≠ fundamentals",
      hook: "Max two swing thoughts at a time; 'if your body doesn't move like them, don't try to serve like them' — Serena/Isner/Kyrgios share fundamentals, not costumes.",
      why: "The corpus's meta-law and its literalism warning ('you give a good tip and people are so literal'): a good cue over-applied becomes the next fault. Also the editorial rule for teaching content — separate the invariant from the style before animating anything.",
      learn: [
        { label: "Repo canon: projects/kovacs-corpus.md laws #10/#11 + forehand-doctrine literalism note" }
      ] },
    { id: "two-hander-mechanics", kind: "concept", name: "Two-hander = left-hand forehand",
      hook: "At contact the LEFT wrist moves faster than the right (6.85 vs 6.31 m/s, published kinematics); power is trunk rotation through a stiff two-arm link — the right hand steers.",
      why: "Your backhand card's measured core (with the honest small-n caveat recorded): stiffness on that wing usually means the right hand became the engine. The left-hand-only drill exists because the measurement says the left side is the motor.",
      learn: [
        { label: "The kinematics study behind the card (PMC3588639)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3588639/" },
        { label: "Sinner court-level 2HBH — full turn, left-hand roll", url: "https://www.youtube.com/watch?v=Roc4Yao6iqE" },
        { label: "Repo canon: projects/tennis-shot-library.md card #4" }
      ] }
  ]
},

{
  id: "coaches-methods",
  domain: "personal",
  title: "Coaches & methods",
  blurb: "The teaching lineages your cards already draw from — measurers, academy models, and the S&C discovery from your own sweeps.",
  items: [
    { id: "vic-braden", kind: "person", name: "Vic Braden",
      hook: "The original measurer-educator: 1970s high-speed film analysis, a research center studying strokes frame-by-frame, and TV series that taught physics-grounded tennis to the public.",
      why: "The closest historical ancestor of a 3Blue1Brown-of-tennis: funny on camera, ruthless about measurement underneath ('laws of physics don't care about your opinion' was his whole shtick). Proof the format worked on television decades before YouTube.",
      learn: [{ label: "Braden's life and research center", url: "https://en.wikipedia.org/wiki/Vic_Braden" }],
      quiz: [
        { q: "Braden's distinctive contribution in the 1970s–80s was—", choices: ["High-speed film + physics analysis of strokes, taught to the public with humor", "Inventing the two-handed backhand", "Founding the ATP", "The first tennis video game"], a: 0,
          why: "He built a research operation around filming and measuring amateurs and pros, then translated it for TV — mechanism-first tennis education with mass reach, fifty years early." }
      ] },
    { id: "riccardo-piatti", kind: "person", name: "Riccardo Piatti",
      hook: "The small-academy master: built Sinner from age 13, earlier shaped Ljubičić and Raonic — a few courts, named staff, individual work over brand.",
      why: "Your drill corpus's 'go small' rule wearing a face: the Piatti Tennis Center's staff ARE the product — which is exactly why its S&C coach posts denser real training footage than any famous academy's brand account.",
      learn: [{ label: "Piatti's coaching arc", url: "https://en.wikipedia.org/wiki/Riccardo_Piatti" }] },
    { id: "sirola-piatti-sc", kind: "person", name: "Sirola (Piatti TC S&C)",
      hook: "The strength-and-conditioning coach whose account your corpus found posting 230 real training clips across 346 posts — denser than any player account, because for him the training IS the subject.",
      why: "Your own sweep's biggest methodological discovery: target whoever's PRODUCT is the training — S&C staff, physios, academy fitness leads — not players or star coaches. Cervara's media-brand account produced 1 card in 237 posts; this account is the counterexample that rewrote the rule.",
      learn: [{ label: "Repo canon: projects/pro-training-drill-corpus.md — 'who to sweep' rule" }] },
    { id: "patrick-mouratoglou", kind: "person", name: "Patrick Mouratoglou",
      hook: "Serena's coach 2012–22, academy founder — and the source of the return masterclass and Kyrgios-serve breakdowns your shot cards already cite.",
      why: "Worth knowing as a working teacher whose filmed breakdowns are genuinely specific — with the honest caveat your sourcing rules would attach: the brand machine around him is exactly the aggregator gravity your corpus avoids. Take the footage, skip the funnel.",
      learn: [{ label: "Return masterclass ep. 1 (already in your return card)", url: "https://www.youtube.com/watch?v=vPtNtNi8_NI" }] },
    { id: "craig-oshannessy", kind: "person", name: "Craig O'Shannessy",
      hook: "Brought rally-length data into coaching: the finding that roughly 70% of points end within the first four shots; worked with Djokovic's team (2017–19).",
      why: "The strategy-side measurer — his numbers invert club practice priorities: if most points are 0–4 shots, serve, return, and the next ball deserve most of the practice time that rallying currently gets. The data leg any tennis-education project needs beside the biomechanics leg.",
      learn: [{ label: "Brain Game Tennis (his data + patterns site)", url: "https://www.braingametennis.com/" }],
      quiz: [
        { q: "O'Shannessy's headline rally-length finding:", choices: ["~70% of points end within the first four shots", "Most points are 9+ shot rallies", "Rally length doesn't vary by level", "Second serves win most points"], a: 0,
          why: "Counted across pro and club play alike. The practice-time implication is the point: first-strike patterns deserve the hours that endless crosscourt rallying gets." }
      ] },
    { id: "takao-suzuki", kind: "person", name: "Takao Suzuki",
      hook: "Former Japanese No. 1 whose serve-teaching videos ('move under the ball,' the slice 'new theory') are the footage legs of your serve cards.",
      why: "The teaching source your bucket block is literally named after — the Suzuki/Kovacs build. His value in your system: a pro demonstrating the same up-and-out fundamentals Kovacs measures, at watchable speed with Japanese-coaching clarity.",
      learn: [
        { label: "Topspin serve — 'move under the ball'", url: "https://www.youtube.com/watch?v=lV9qtQZKsCU" },
        { label: "'New theory' slice serve", url: "https://www.youtube.com/watch?v=xL_ljXbnHPc" }
      ] }
  ]
},

{
  id: "tennis-strategy",
  domain: "personal",
  title: "Tennis strategy — the measured game",
  blurb: "Percentage structures that survive measurement — geometry, first-strike data, and time theft.",
  items: [
    { id: "first-strike-0-4", kind: "concept", name: "First-strike tennis (0–4 shots)",
      hook: "Most tennis points — around 70% at every level — end within four shots: serve, return, one ball each. The 'rally game' is the minority game.",
      why: "The single most practice-redirecting statistic in tennis (O'Shannessy's counting): your serve block and return card ARE the majority of tennis by rally share. Also a model 3B1B episode: one bar chart that overturns how everyone trains.",
      learn: [{ label: "Brain Game Tennis — first-strike data", url: "https://www.braingametennis.com/" }],
      quiz: [
        { q: "The practice implication of the 0–4 shot finding is—", choices: ["Serve, return, and serve+1/return+1 deserve the bulk of practice time", "Practice long rallies more", "Fitness matters more than shots", "Strategy only matters on clay"], a: 0,
          why: "Train the game that actually occurs: the opening exchange is most of tennis by frequency, and it's the part casual hitting practices least." }
      ] },
    { id: "serve-plus-one", kind: "concept", name: "Serve +1",
      hook: "The rehearsed pair: a located serve plus a pre-decided first groundstroke — treating the opening two shots as one unit.",
      why: "The bridge between your serve build and match play: a first serve is only as valuable as the ball you've already decided to hit after it. Pairs with the 0–4 data — this unit IS most service points.",
      learn: [{ label: "Repo canon: projects/tennis-shot-library.md serve cards + pattern notes" }] },
    { id: "wardlaw-directionals", kind: "concept", name: "Wardlaw directionals",
      hook: "Paul Wardlaw's percentage system: hit crosscourt unless the ball crosses your body (an outside ball) — change direction only when geometry subsidizes it.",
      why: "The cleanest formalization of shot selection ever written for coaches (from his book Pressure Tennis, developed coaching college tennis): direction changes off an inside ball multiply error rates. Ashe's 1975 final and your depth-first cards are both directionals-compliant. Ideal animated-geometry episode.",
      learn: [{ label: "Directionals summarized (concept overview)", url: "https://en.wikipedia.org/wiki/Tennis_strategy" }],
      quiz: [
        { q: "Per Wardlaw, you earn a direction change when—", choices: ["The ball crosses your body (an outside ball) — geometry subsidizes the new line", "You feel confident", "Every third shot", "The opponent serves and volleys"], a: 0,
          why: "Changing direction off an inside ball means redirecting momentum across the incoming angle — the highest-error act in groundstroke tennis. The rule prices it correctly." }
      ] },
    { id: "crosscourt-geometry", kind: "concept", name: "Crosscourt geometry",
      hook: "Crosscourt: the court is ~2.5 ft longer on the diagonal, the net is ~6 in lower in the middle, and your recovery distance is shorter. Three subsidies, one direction.",
      why: "The why under the directionals — and the most animatable fact set in tennis strategy: three overlays on one court diagram explain 80% of pro shot selection.",
      learn: [{ label: "Repo canon: geometry notes across shot-library cards" }] },
    { id: "time-theft", kind: "concept", name: "Time theft beats pace",
      hook: "Taking the ball early steals reaction time that adding pace can't buy: contact on the rise inside the baseline compresses the opponent's clock — Agassi's whole return career.",
      why: "Your return card's engine ('power comes from THEIR pace plus your contact point') generalized into the strategic principle. Also why 'heavy' opponents feel early rather than fast — the Rudy Quan contact observation from your own footage study.",
      learn: [
        { label: "Agassi: The Art of Returning Serve", url: "https://www.youtube.com/watch?v=dU3YNMIISXg" },
        { label: "Repo canon: projects/tennis-shot-library.md cards #3/#6" }
      ] },
    { id: "depth-over-pace", kind: "concept", name: "Depth is the multiplier",
      hook: "A ball landing past the service line at modest pace beats a hard ball landing short: depth controls opponent court position, which controls everything downstream.",
      why: "Your depth-ladder drill's rationale, and the honest card in the 'heavy ball' file: heaviness has no single lab metric, but depth is measurable today with zero equipment — count landings past the service line.",
      learn: [{ label: "Repo canon: projects/tennis-shot-library.md card #6 (depth ladder)" }] },
    { id: "patterns-of-play", kind: "concept", name: "Patterns of play",
      hook: "A pattern is a rehearsed 2–3 shot sequence with a target state — serve wide → forehand to the open court is the canonical example — decided before the point starts.",
      why: "The unit of strategic practice: patterns convert strategy from in-point decisions (slow, error-prone) into pre-point selections (fast, rehearsable). Your chess work found the same leak-shape: it's rarely knowledge, it's execution under clock.",
      learn: [{ label: "Brain Game pattern library", url: "https://www.braingametennis.com/" }] },
    { id: "match-charting", kind: "concept", name: "Match charting",
      hook: "Counting what actually happened — serve locations, rally lengths, error types — instead of remembering it. The Match Charting Project has crowdsourced thousands of pro matches shot-by-shot.",
      why: "The Blitz-Coach ethos applied to tennis: your chess pipeline proved on your own games that measured leaks beat remembered ones. Sackmann's open data is also the free dataset a tennis-education project can build visualizations on without rights issues.",
      learn: [{ label: "Tennis Abstract — Match Charting Project (open data)", url: "https://www.tennisabstract.com/charting/meta.html" }],
      quiz: [
        { q: "The Match Charting Project is valuable to an education project because—", choices: ["It's open, shot-by-shot pro data — chartable and animatable without rights problems", "It sells premium subscriptions", "It has video of every match", "It's official ATP data"], a: 0,
          why: "Crowdsourced, public, and granular: the raw material for measured claims about pro tennis without touching broadcast rights — the dataset side of the 3B1B recipe." }
      ] }
  ]
},

{
  id: "drill-canon",
  domain: "personal",
  title: "The drill canon",
  blurb: "Drills from your own corpus — each one exists because a measurement or a frame-by-frame sweep says so.",
  items: [
    { id: "suzuki-kovacs-block", kind: "concept", name: "The Suzuki/Kovacs bucket block",
      hook: "The serve build: 5 shadow rehearsals → 10 back-leg serves at 60% → 12 slice-flat firsts at 70–80% → 6 committed firsts → 6 kicks. Count only balls in AND landing you inside the baseline.",
      why: "Your first-serve project's actual prescription (two cues only: 'back hip back and down' + 'racket close to the head'). The landing check is the built-in measurement — no camera needed to audit the load direction.",
      learn: [{ label: "Repo canon: projects/kovacs-corpus.md — the 15-minute first-serve block" }] },
    { id: "left-hand-forehands", kind: "concept", name: "Left-hand-only forehands",
      hook: "Five minutes of left-arm-only forehands to open rally days, then both hands on keeping the same left-arm feeling — the two-hander engine swap.",
      why: "Direct consequence of the measured left-wrist speed advantage: if the left side is the motor, train it alone until the stiff right-hand-steered version stops being the default.",
      learn: [{ label: "Repo canon: projects/tennis-shot-library.md card #4 drill" }] },
    { id: "depth-ladder", kind: "concept", name: "The depth ladder",
      hook: "Rally sets of 10 targeting beyond the service line; goal 7/10 past it, nothing short on purpose. Separately: first three balls of each rally at 80% swing with full finish — no guiding.",
      why: "The D1-gap card's drill: depth is the controllable half of 'heavy' today, and counting landings converts a vibe ('hit deeper') into a score.",
      learn: [{ label: "Repo canon: projects/tennis-shot-library.md card #6" }] },
    { id: "compressed-return-drill", kind: "concept", name: "The compressed-return drill",
      hook: "Partner serves from the SERVICE LINE at 70%; you return from the baseline: split on their toss, unit turn, no backswing, contact out front. Then move them back to normal distance.",
      why: "Manufactures the time pressure that forbids a full swing — teaching the block-drive return the reaction-time math demands, before full-speed serves make the lesson expensive.",
      learn: [{ label: "Repo canon: projects/tennis-shot-library.md card #3 drill" }] },
    { id: "constraint-drills", kind: "concept", name: "Constraint drills vs cues",
      hook: "Two roads to the same position: simplify the cue (Kovacs: 'elbows away from the body') or remove the outcome so no cue is needed at all — your corpus's contrast finding.",
      why: "A genuine open question your corpus recorded honestly instead of welding into a false composite: cue-simplification and constraint-led design reach the same positions by different mechanisms, and the difference matters for how you'd teach on video.",
      learn: [{ label: "Repo canon: projects/kovacs-corpus.md — forehand doctrine null result" }] },
    { id: "sweep-the-practitioners", kind: "concept", name: "Sweep rule: whose product is the training?",
      hook: "Your corpus's paid-for lesson: player and star-coach accounts are training-sparse; S&C staff, physios, and small-academy fitness leads post the real work — because for them the training is the subject.",
      why: "Two wasted sweep rounds bought this rule, then one practitioner account (230 training clips in 346 posts) proved it. Restated after falsification: the variable is how close the surface is to the person doing the work — which tracks organization SIZE. Go small.",
      learn: [{ label: "Repo canon: projects/pro-training-drill-corpus.md — START HERE rules" }],
      quiz: [
        { q: "Per your own sweep rules, the best account type for real training footage is—", choices: ["S&C practitioners and small-academy staff — people whose subject IS the training", "The biggest player accounts", "Famous academy brand accounts", "Highlight aggregators"], a: 0,
          why: "The corpus falsified the star-first instinct twice: brand accounts sell champions, practitioner accounts document work. Small surface, close to the work, wins every tested class." }
      ] }
  ]
}

]);
