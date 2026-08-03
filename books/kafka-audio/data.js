(function () {
  "use strict";

  var yt = function (id, start) {
    return "https://www.youtube.com/watch?v=" + id + (start ? "&t=" + start + "s" : "");
  };

  var vesaIds = {
    0: "58v4lGt7-EA", 1: "Rz1Vrtux6HU", 2: "v77ozgbU0U4", 3: "T_XVWaYJN1Q",
    4: "W-u3xXXdKUE", 5: "IJ-iQqq5U-c", 6: "MB0vAzqP2TM", 7: "VNkprZSHOyc",
    8: "0-y_F2qMBIU", 9: "felNWWWcCjc", 10: "xBccEXoRd2U", 11: "BJBvSaTM_cE",
    12: "Bejk2FvqaeA", 13: "iimsUMc89j0", 14: "EMNbkM1oApY", 15: "pe5jYpm7Vi4",
    16: "tfKzcfgTZ4A", 17: "dFYuGCatjNc", 18: "qKrRVs0ojgI", 19: "g4ywEY1K0eE",
    20: "HDNG8GqL6Ns", 21: "UktIWlXsivI", 22: "AJgmF2oY_f8", 23: "XwzuN3xWgds",
    24: "hpHr7844mLs", 25: "usdOD4u5dzM", 26: "6XgBmW3x0Hc", 27: "slHvPGX3jj0",
    28: "er4BRubZm48", 29: "8RIJT2EtEuM", 30: "DWg-b3W-Yzo", 31: "sNgVOMGEsv8",
    32: "O12d4qWmZUQ", 33: "RbEa8LKmwTM", 34: "TyefsP3Lwec", 35: "pzzcKwfSUf0",
    36: "sytEic2sN0M", 37: "u4GiGei-feo", 38: "NLULFZP8ZoI", 39: "6fBeL5sIbtg",
    40: "cyw2aYJN8lo", 41: "BZa7FJ4iSco", 42: "S-CwImy4-Jk", 43: "aibF26yh1mI",
    44: "tV9GvvoL2dk", 45: "tCrGzrx5v_w", 46: "luyExUJWwxA", 47: "1vUqjCXQ59M",
    48: "7ekN_0faq68", 49: "NpFvwPz-yhE"
  };

  var vesaVideos = Object.keys(vesaIds).map(function (chapter) {
    return {
      chapter: Number(chapter),
      label: Number(chapter) === 0 ? "The Boy Named Crow" : "Chapter " + chapter,
      id: vesaIds[chapter],
      url: yt(vesaIds[chapter])
    };
  });

  window.KAFKA_AUDIO_GUIDE = {
    checkedAt: "2026-07-25",
    chapters: Array.from({ length: 50 }, function (_, index) { return index; }),
    sources: [
      {
        id: "tangku",
        name: "Tangku H4x",
        handle: "@tangkuh4x",
        color: "#6f5bd3",
        tint: "#eeeafe",
        thumbnail: "https://i.ytimg.com/vi/zLdTuWN5n9I/hqdefault.jpg",
        representativeUrl: yt("zLdTuWN5n9I", 131),
        coverage: { start: 1, end: 21 },
        voice: "Polished male · MEMOXZA-created · likely synthetic",
        pace: "164–192 sampled words/min",
        music: "No music in sampled passages",
        verdict: "Jerry’s favorite voice. Calm, clean, unusually listenable, with the same speaker fingerprint across early, odd, and even chapters.",
        proof: "Five uploads cover Chapters 1–21. Four opening bumpers visibly and audibly credit MEMOXZA; Chapter 21 starts without one. Five upload samples cross-match at 0.972–0.986.",
        confidence: "Same voice high · MEMOXZA role known · model unresolved",
        videos: [
          { chapters: [1, 15], label: "Chapters 1–15", id: "NErT08ipvBo", url: yt("NErT08ipvBo") },
          { chapters: [16, 16], label: "Chapter 16", id: "VQ7Z2Kr0HVw", url: yt("VQ7Z2Kr0HVw") },
          { chapters: [17, 18], label: "Chapters 17–18", id: "sWsi0GAa09g", url: yt("sWsi0GAa09g") },
          { chapters: [19, 20], label: "Chapters 19–20", id: "zLdTuWN5n9I", url: yt("zLdTuWN5n9I") },
          { chapters: [21, 21], label: "Chapter 21", id: "WP3269Xew3A", url: yt("WP3269Xew3A") }
        ]
      },
      {
        id: "vesa",
        name: "VesaVersion2",
        handle: "@vesaversion298",
        color: "#2474c7",
        tint: "#e5f1fb",
        thumbnail: "https://i.ytimg.com/vi/XwzuN3xWgds/hqdefault.jpg",
        representativeUrl: yt("XwzuN3xWgds", 131),
        coverage: { start: 0, end: 49 },
        voice: "Male · Indian accent · human-likely",
        pace: "187 sampled words/min",
        music: "No background music",
        verdict: "The only complete, chapter-separated public route found. Faster and rougher than Tangku, but easy to resume and dependable through the ending.",
        proof: "A prologue upload plus one public upload for every numbered Chapter 1–49.",
        confidence: "Coverage exact · human-likely",
        videos: vesaVideos
      },
      {
        id: "eden",
        name: "Eden Audiobooks",
        handle: "@edenaudiobooks8487",
        color: "#c57225",
        tint: "#f8eadb",
        thumbnail: "https://i.ytimg.com/vi/OHWEC86-Bxc/hqdefault.jpg",
        representativeUrl: yt("OHWEC86-Bxc"),
        coverage: { start: 0, end: 39 },
        voice: "Woman · slow · human-likely",
        pace: "125 sampled words/min",
        music: "Continuous soft background music",
        verdict: "The gentlest DIY version: spacious pace and music throughout. Four of the titled five parts are public; the ending is absent.",
        proof: "Audio headings verify Part 3 starts at Chapter 20. The four public parts cover Prologue–10, 11–19, 20–29, and 30–39.",
        confidence: "Part boundaries audio-verified",
        videos: [
          { chapters: [0, 10], label: "Part 1/5 · Prologue–10", id: "OHWEC86-Bxc", url: yt("OHWEC86-Bxc") },
          { chapters: [11, 19], label: "Part 2/5 · Chapters 11–19", id: "LYaS9-AKDxk", url: yt("LYaS9-AKDxk") },
          { chapters: [20, 29], label: "Part 3/5 · Chapters 20–29", id: "zbsE-aUd0bk", url: yt("zbsE-aUd0bk") },
          { chapters: [30, 39], label: "Part 4/5 · Chapters 30–39", id: "U4RiXjEfGiE", url: yt("U4RiXjEfGiE") }
        ],
        missing: "Part 5/5 (expected Chapters 40–49) was not found."
      }
    ],
    modelAudit: {
      headline: "MEMOXZA created it; the exact voice model remains unresolved.",
      summary: "Four Tangku openings visibly and audibly say “This audio book is Create by MEMOXZA.” That identifies a production credit, not a narrator or model. Every accessible comment and the major public stock-voice families were checked; none supplies an exact match.",
      facts: [
        "ElevenLabs’ own classifier returned only a 2% match and “very unlikely” for ElevenLabs generation. Its suggested library voices were acoustic neighbors, not source matches.",
        "All 11 publicly accessible comments across the five Kafka uploads were retrieved and read. None names a narrator, voice, model, provider, ElevenLabs, or MEMOXZA.",
        "Samples from all five Tangku uploads cross-match at 0.972–0.986 cosine similarity, strongly supporting one consistent voice across Chapters 1–21.",
        "Controlled comparisons found no identity-level stock match: Microsoft 23 voices (best Ryan 0.694), Apple 13 (Ralph 0.684), Google 33 (Enceladus 0.690), Amazon Polly 18 (Brian Standard 0.641), and OpenAI 10 (Ash 0.651).",
        "Thirty PlayHT narrative voices were enumerated, but every official sample URL returned 403. CapCut and Speechify expose no complete comparable public catalog; OpenAI Sage hit its download limit and current OpenAI.fm did not expose Echo.",
        "Exact-name searches for MEMOXZA across the web, YouTube, GitHub, Instagram, Facebook, and TikTok found no indexed identity or model disclosure.",
        "A broad deepfake detector called Tangku synthetic, but it also mislabeled the official human audiobook preview. That detector is corroboration only, never proof.",
        "The official audiobook is read by Sean Barrett and Oliver Le Sueur. Tangku’s embedding is only about 0.72 similar to the official preview, so it is not that recording."
      ],
      candidates: "Best-supported conclusion: a private/custom voice, a legacy or withdrawn voice, or a closed catalog. Microsoft Ryan is the closest reproducible stock substitute found—not the exact voice.",
      demo: {
        label: "Wisdom demo passage",
        text: "“We do not receive a short life, but we make it a short one… Life is long enough, if you know how to use it.”",
        result: "Microsoft en-GB-RyanNeural · closest reproducible stock substitute in this audit (0.694 average), still far below an identity match."
      },
      links: [
        { label: "ElevenLabs classifier", url: "https://elevenlabs.io/ai-speech-classifier" },
        { label: "OpenAI voice guide", url: "https://developers.openai.com/api/docs/guides/text-to-speech#voice-options" },
        { label: "Google voice list", url: "https://cloud.google.com/text-to-speech/docs/list-voices-and-types" },
        { label: "Amazon Polly voices", url: "https://docs.aws.amazon.com/polly/latest/dg/available-voices.html" },
        { label: "Official audiobook", url: "https://www.penguin.co.uk/books/357849/kafka-on-the-shore-by-haruki-murakami/9781473582538" }
      ]
    },
    minorSources: [
      {
        name: "ShareAStory",
        style: "Small chapter-separated reading",
        coverage: "Prologue + Chapters 1–4 found",
        thumbnail: "https://i.ytimg.com/vi/KpVHeaVbPfc/hqdefault.jpg",
        url: yt("KpVHeaVbPfc")
      },
      {
        name: "Ruth Senpai",
        style: "Partial DIY chapter reading",
        coverage: "Chapters 1, 2, and 4 found",
        thumbnail: "https://i.ytimg.com/vi/-u5fTM2XzDo/hqdefault.jpg",
        url: yt("-u5fTM2XzDo")
      },
      {
        name: "Thee Landstander",
        style: "Single chapter find",
        coverage: "Chapter 16",
        thumbnail: "https://i.ytimg.com/vi/E1Q8qSdXiMg/hqdefault.jpg",
        url: yt("E1Q8qSdXiMg")
      },
      {
        name: "Google Play Books",
        style: "Official publisher preview",
        coverage: "10:37 sample · not a chapter route",
        thumbnail: "https://i.ytimg.com/vi/GEGFdQTc-Vk/hqdefault.jpg",
        url: yt("GEGFdQTc-Vk")
      },
      {
        name: "AMAR Library",
        style: "Short “Part 1” upload",
        coverage: "23-minute fragment · chapter range unverified",
        thumbnail: "https://i.ytimg.com/vi/VOB0CO1zACg/hqdefault.jpg",
        url: yt("VOB0CO1zACg")
      }
    ]
  };
})();
