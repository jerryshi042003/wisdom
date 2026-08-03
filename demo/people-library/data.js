window.WISDOM_LIBRARY_DEMO = {
  version: 1,
  reviewedAt: "2026-07-19",
  home: {
    recommendationIds: ["essay-james-blindness", "video-miura", "manga-tokyo-these-days"],
    discoveryId: "essay-hojoki"
  },
  knownContinuations: [
    {
      id: "audio-kafka-shore",
      kind: "audio",
      title: "Kafka on the Shore",
      creator: "Haruki Murakami",
      state: "In progress",
      detail: "Exact player not connected yet",
      why: "This is here because you said you are already listening—not because Wisdom inferred progress from a tab or click.",
      sourceKey: "kafkaOnTheShore"
    },
    {
      id: "essay-tao-genius-known",
      kind: "essay",
      title: "Does One Have to Be a Genius to Do Maths?",
      creator: "Terence Tao",
      state: "Started previously",
      detail: "Section progress appears only if this browser saved it",
      why: "Your reading ledger says you started it. Wisdom will not invent a percentage.",
      href: "/wisdom/essays/reader/index.html?essay=tao-genius",
      stateId: "tao-genius"
    }
  ],
  artifacts: {
    "essay-james-blindness": {
      id: "essay-james-blindness",
      type: "essay",
      title: "On a Certain Blindness in Human Beings",
      creator: "William James",
      meta: "Read inside Wisdom · about 35 min",
      href: "/wisdom/essays/reader/index.html?essay=james-certain-blindness",
      action: "Read inside Wisdom",
      why: "You liked Carver’s “Cathedral.” James takes its live question—how badly we misread another person’s inner world—and argues it directly instead of turning it into another symbolic story.",
      risk: "Longer and more lecture-like than Carver. Leave after the opening examples if the argument feels obvious.",
      domain: "Other minds"
    },
    "video-miura": {
      id: "video-miura",
      type: "video",
      title: "The Great Berserk Exhibition interview",
      creator: "Kentaro Miura",
      meta: "YouTube · 11:18 · English subtitles",
      href: "https://www.youtube.com/watch?v=-SqR0zmXfJU",
      action: "Play on YouTube",
      thumbnail: "https://i.ytimg.com/vi/-SqR0zmXfJU/hqdefault.jpg",
      why: "Because Berserk is a confirmed love: this is Miura’s only substantial on-camera interview, not a fan explainer. It shows the one-work, one-desk life that made the art—and the trap inside that devotion.",
      risk: "Archival subtitles and exhibition framing; useful as direct creator evidence, not a complete biography.",
      domain: "People you like"
    },
    "manga-tokyo-these-days": {
      id: "manga-tokyo-these-days",
      type: "manga",
      title: "Tokyo These Days · Volume 1",
      creator: "Taiyo Matsumoto",
      meta: "Official VIZ page · one-volume test",
      href: "https://www.viz.com/tokyo-these-days",
      action: "Open official edition",
      why: "Same creator as Tekkonkinkreet and the Ping Pong manga. This is the clearest next Matsumoto test: an older editor tries to rebuild a working community for one last book, with less visual decoding than Tekkonkinkreet.",
      risk: "Slow, melancholy, and full of manga-industry detail. Stop after Volume 1 if it earns respect but no pull.",
      domain: "Same creator"
    },
    "essay-hojoki": {
      id: "essay-hojoki",
      type: "essay",
      title: "Hojoki · An Account of My Hut",
      creator: "Kamo no Chomei",
      meta: "Read inside Wisdom · about 10 min",
      href: "/wisdom/essays/reader/index.html?essay=chomei-hojoki",
      action: "Try the first 5 minutes",
      why: "Outside the current person map, but not random filler: a medieval Japanese witness watches fire, famine, earthquake, and status vanish, then asks whether retreat into a tiny hut is freedom or another attachment.",
      risk: "The old translation can feel distant. Stop after the first disaster sequence if no image sticks.",
      domain: "Outside the map"
    }
  },
  people: [
    {
      id: "murakami",
      name: "Haruki Murakami",
      relation: "Current person",
      signal: "You loved “Barn Burning” and the 2009 Jerusalem address; Kafka on the Shore audio is in progress.",
      rule: "Do not add another Murakami commitment until the Kafka reaction is known. Keep the author map available, but let the current work breathe.",
      items: [
        { label: "In progress · audio", title: "Kafka on the Shore", action: "Link your current player", sourceAction: "link-kafka" },
        { label: "Loved · text", title: "Barn Burning", note: "Ordinary detail, menace, class pressure, and unresolved absence are the live taste signals." },
        { label: "Loved · speech", title: "Always on the Side of the Egg", href: "https://www.haaretz.com/israel-news/culture/2009-02-17/ty-article/always-on-the-side-of-the-egg/0000017f-db26-d3ff-a7ff-fba694020000" }
      ]
    },
    {
      id: "carver",
      name: "Raymond Carver",
      relation: "New positive signal",
      signal: "You said “Cathedral” landed. The useful signal is connection through one shared physical act, not “read more American short stories.”",
      rule: "Deepen the exact mechanism before adding a broad Carver syllabus.",
      items: [
        { label: "Liked · story", title: "Cathedral", href: "https://cdn.theatlantic.com/assets/media/files/sept_1981_-_carver_-_cathedral.pdf" },
        { label: "Internal bridge · essay", title: "William James · On a Certain Blindness", href: "/wisdom/essays/reader/index.html?essay=james-certain-blindness", note: "Same other-minds problem, argued directly." }
      ]
    },
    {
      id: "matsumoto",
      name: "Taiyo Matsumoto",
      relation: "Mixed but real affinity",
      signal: "Tekkonkinkreet was good but too complex; Ping Pong’s storytelling landed strongly.",
      rule: "Choose a more legible work by the same maker, not another visually dense read-alike.",
      items: [
        { label: "Next · manga", title: "Tokyo These Days · Volume 1", href: "https://www.viz.com/tokyo-these-days", note: "One-volume test; older collaborators making one last book." },
        { label: "Liked, complex", title: "Tekkonkinkreet", note: "Keep as an art/form anchor, not a template for more homework." },
        { label: "Loved · adaptation", title: "Ping Pong the Animation", note: "Storytelling and embodied struggle are the stronger bridge." }
      ]
    },
    {
      id: "miura",
      name: "Kentaro Miura",
      relation: "Confirmed creator anchor",
      signal: "Berserk is a confirmed love; its compounding craft and moral/emotional force are both relevant.",
      rule: "Prefer Miura’s own words and drawing process over plot recap or fan mythology.",
      items: [
        { label: "Start here · video", title: "Great Berserk Exhibition interview · 11:18", href: "https://www.youtube.com/watch?v=-SqR0zmXfJU" },
        { label: "Known anchor", title: "Berserk", note: "Do not mislabel it unread or turn completion into a request for generic dark fantasy." }
      ]
    },
    {
      id: "choe",
      name: "David Choe",
      relation: "Whole-person voice anchor",
      signal: "The doer/experiential creator path already holds Jerry’s attention: LA, art hustle, risk, travel, confession, and post-success searching.",
      rule: "Use firsthand action and the moral/persona counter-record together. Do not turn the person into a clean guru.",
      items: [
        { label: "Watch · 21:41", title: "Hitchhiking Across China · Thumbs Up S3 Part 1", href: "https://www.youtube.com/watch?v=HQ7GRWWgOGM", note: "Choe actually moving through a place, not another podcast summarizing his ethos." },
        { label: "Creator archive", title: "David Choe video index", href: "https://davidchoe.com/index" }
      ]
    },
    {
      id: "orwell",
      name: "George Orwell",
      relation: "Major writing anchor",
      signal: "You like Orwell’s anti-cant, plainspoken moral clarity; 1984 is a strong signal and “Shooting an Elephant” was about 6/10.",
      rule: "Keep the author map, but rank the exact essay. A liked author does not make every artifact a recommendation.",
      items: [
        { label: "Best next essay", title: "Why I Write", href: "https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/why-i-write/", note: "Directly tests the voice/craft anchor." },
        { label: "Read · about 6/10", title: "Shooting an Elephant", href: "https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/shooting-an-elephant/" },
        { label: "Official essay index", title: "Politics and the English Language", href: "https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/politics-and-the-english-language/" }
      ]
    }
  ],
  videos: {
    anchored: [
      {
        id: "video-miura",
        person: "Kentaro Miura",
        connection: "Because you really liked Berserk",
        title: "The Great Berserk Exhibition interview",
        duration: "11:18",
        channel: "Archival upload · English subtitles",
        href: "https://www.youtube.com/watch?v=-SqR0zmXfJU",
        thumbnail: "https://i.ytimg.com/vi/-SqR0zmXfJU/hqdefault.jpg",
        why: "Miura’s only substantial on-camera interview. Use it to see the maker and working life behind the art—not to rehear the plot.",
        stop: "Stop if the exhibition framing gives you no direct creator signal after three minutes."
      },
      {
        id: "video-miyazaki-moebius",
        person: "Hayao Miyazaki × Moebius",
        connection: "Because Porco Rosso, Mononoke, Nausicaä, and manga form already matter",
        title: "Miyazaki and Moebius talk about artistic influence",
        duration: "6:03",
        channel: "Archival filmed conversation",
        href: "https://www.youtube.com/watch?v=2L0YgdIpXas",
        thumbnail: "https://i.ytimg.com/vi/2L0YgdIpXas/hqdefault.jpg",
        why: "Six minutes, two people already in the map, one exact bridge: Miyazaki explains how Moebius’s images shook manga artists.",
        stop: "The upload is brief and poorly labeled; leave if the archival context is too thin."
      },
      {
        id: "video-choe-china",
        person: "David Choe",
        connection: "Because Choe already works as a whole-person doer/creator anchor",
        title: "Hitchhiking Across China · Thumbs Up S3 Part 1",
        duration: "21:41",
        channel: "VICE",
        href: "https://www.youtube.com/watch?v=HQ7GRWWgOGM",
        thumbnail: "https://i.ytimg.com/vi/HQ7GRWWgOGM/hqdefault.jpg",
        why: "This is Choe acting, traveling, improvising, and meeting people—not another clean retrospective about him.",
        stop: "His persona, risk addiction, and VICE editing are part of the artifact. Stop if chaos is doing all the work."
      },
      {
        id: "video-moebius-doc",
        person: "Jean Giraud / Moebius",
        connection: "Only after the six-minute Miyazaki conversation earns a deeper pass",
        title: "How one artist invented modern pop culture",
        duration: "50:59",
        channel: "matttt · comic & manga history",
        href: "https://www.youtube.com/watch?v=QWaCsteIYig",
        thumbnail: "https://i.ytimg.com/vi/QWaCsteIYig/hqdefault.jpg",
        why: "The useful mechanism is Gir/Moebius: one identity masters constraints, another protects experimentation. The network is richer than the title’s lone-genius claim.",
        stop: "Skip the full hour unless the two-mode working idea matters; the title overstates one person’s causal role."
      }
    ],
    discovery: [
      {
        id: "video-leguin",
        person: "Ursula K. Le Guin",
        connection: "New person · earned by the current quiet-life question, not by YouTube",
        title: "Bill Moyers on The Lathe of Heaven",
        duration: "22:42",
        channel: "Archival public-television interview",
        href: "https://www.youtube.com/watch?v=O1bZe7bdXMw",
        thumbnail: "https://i.ytimg.com/vi/O1bZe7bdXMw/hqdefault.jpg",
        why: "Moyers challenges Le Guin instead of admiring her: is taking it easy humane, or passive? That argument is the reason to try it.",
        stop: "Use 6:17–8:15 and 10:50–11:14; leave if it becomes a calm-life sermon."
      },
      {
        id: "video-jon-bois",
        person: "Jon Bois",
        connection: "New person · a bounded sports/comedy method test",
        title: "What if Barry Bonds had played without a baseball bat?",
        duration: "12:47",
        channel: "Secret Base",
        href: "https://www.youtube.com/watch?v=JwMfT2cZGHg",
        thumbnail: "https://i.ytimg.com/vi/JwMfT2cZGHg/hqdefault.jpg",
        why: "One ridiculous sports question becomes a transparent model, a joke, and something you can argue with. It earns one test, not a new topic lane.",
        stop: "Leave after two minutes if baseball charts feel like homework."
      }
    ]
  },
  reads: [
    {
      id: "essay-james-blindness",
      domain: "Other minds",
      title: "On a Certain Blindness in Human Beings",
      creator: "William James",
      time: "about 35 min",
      href: "/wisdom/essays/reader/index.html?essay=james-certain-blindness",
      why: "Best internal follow-up to Cathedral: the same failure to see another person’s inner life, now stated as an argument."
    },
    {
      id: "essay-tao-genius",
      domain: "Making and mastery",
      title: "Does One Have to Be a Genius to Do Maths?",
      creator: "Terence Tao",
      time: "about 6 min",
      href: "/wisdom/essays/reader/index.html?essay=tao-genius",
      why: "Already started. Tao replaces lone-genius romance with cumulative work; continue before adding another mastery essay."
    },
    {
      id: "essay-soseki",
      domain: "Voice and self",
      title: "My Individualism",
      creator: "Natsume Soseki",
      time: "about 20 min",
      href: "/wisdom/essays/reader/index.html?essay=soseki-kojinshugi",
      why: "A modern Japanese writer describes finding his own path after borrowed standards failed. Relevant beside Murakami, but not sold as a Murakami imitation."
    },
    {
      id: "essay-hojoki",
      domain: "A life under pressure",
      title: "Hojoki · An Account of My Hut",
      creator: "Kamo no Chomei",
      time: "about 10 min",
      href: "/wisdom/essays/reader/index.html?essay=chomei-hojoki",
      why: "A compact, strange world-perspective test: disasters, impermanence, and the unresolved cost of retreat."
    },
    {
      id: "essay-su-shi",
      domain: "Attention",
      title: "Night Stroll to Chengtian Temple",
      creator: "Su Shi",
      time: "about 3 min",
      href: "/wisdom/essays/reader/index.html?essay=sushi-chengtiansi-yeyou",
      why: "The smallest complete internal read: moonlight, a friend awake, and one night made sufficient without a life lesson."
    },
    {
      id: "essay-chesterton-bed",
      domain: "Comic release",
      title: "On Lying in Bed",
      creator: "G. K. Chesterton",
      time: "about 6 min",
      href: "/wisdom/essays/reader/index.html?essay=chesterton-on-lying-in-bed",
      why: "A real comic-reset lane: one deliberately unserious defense of idleness, short enough to reject without follow-up."
    }
  ],
  longWorks: [
    {
      domain: "Classic fiction",
      items: [
        { id: "odyssey", title: "The Odyssey · 18 scene path", creator: "Homer", href: "/wisdom/essays/reader/index.html?essay=homer-odyssey-scenes", note: "Selected source scenes, translation context, and criticism; the reader owns progress.", stateType: "essay", stateId: "homer-odyssey-scenes" },
        { id: "ivan", title: "The Death of Ivan Ilyich", creator: "Leo Tolstoy", href: "/wisdom/the-death-of-ivan-ilyich/reader/", note: "Complete twelve-chapter Jerry Edition plus source modes.", stateType: "long", stateId: "ivan" },
        { id: "don-quixote", title: "Don Quixote · Chapter I", creator: "Miguel de Cervantes", href: "/wisdom/don-quixote/reader/", note: "One bounded chapter with a teaching rewrite and reference timeline.", stateType: "long", stateId: "don-quixote" },
        { id: "arabian-nights", title: "Arabian Nights · Burton Volume 1", creator: "Anonymous / Richard Burton translation", href: "/wisdom/arabian-nights/reader/", note: "Long story collection; use the saved last chapter, not a fake percent.", stateType: "long", stateId: "arabian-nights" }
      ]
    },
    {
      domain: "Philosophy and practice",
      items: [
        { id: "seneca", title: "On the Shortness of Life", creator: "Seneca", href: "/wisdom/seneca-shortness-of-life/reader/", note: "Jerry reached Chapter 12 previously; local reader state may have a newer last place.", stateType: "long", stateId: "seneca" },
        { id: "nietzsche", title: "Schopenhauer as Educator", creator: "Friedrich Nietzsche", href: "/wisdom/nietzsche-schopenhauer-educator/reader/", note: "Long-form source and teaching modes; use only when the person/voice earns it.", stateType: "long", stateId: "nietzsche" }
      ]
    },
    {
      domain: "Commercial manga",
      items: [
        { id: "taste-manga", title: "Detailed manga status belongs in Taste", creator: "Cross-app boundary", href: "https://jerry-movie-graph.onrender.com/?media=manga", note: "Wisdom may explain one next work; Taste should own start, finish, drop, and reaction after its stale-data repair." }
      ]
    }
  ],
  archive: [
    { title: "Joe Pera Talks You to Sleep", state: "Listened · no reaction recorded" },
    { title: "Cassavetes / Rowlands / Gazzara interview", state: "Listened · 5/10" },
    { title: "Penn and Teller on respect and work", state: "Listened · no reaction recorded" }
  ]
};
