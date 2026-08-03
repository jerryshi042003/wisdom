(function (root) {
  "use strict";

  var STORAGE_KEY = "wisdom-private-source:v3:homer-odyssey:books";
  var PREVIOUS_STORAGE_KEY = "wisdom-private-source:v2:homer-odyssey:books";
  var LEGACY_BOOK_ONE_KEY = "wisdom-private-source:v1:homer-odyssey:book-1";
  var ANNOTATIONS_KEY = "wisdom-private-source:v1:homer-odyssey:clear-notes";
  var MAX_SOURCE_CHARS = 4000000;
  var MAX_ANNOTATION_CHARS = 2000000;
  var MIN_BOOK_LINES = 300;
  var MAX_BOOK_LINES = 1000;
  var BOOK_TITLES = [
    "The Boy and the Goddess",
    "A Dangerous Journey",
    "An Old King Remembers",
    "What the Sea God Said",
    "From the Goddess to the Storm",
    "A Princess and Her Laundry",
    "A Magical Kingdom",
    "The Songs of a Poet",
    "A Pirate in a Shepherd’s Cave",
    "The Winds and the Witch",
    "The Dead",
    "Difficult Choices",
    "Two Tricksters",
    "A Loyal Slave",
    "The Prince Returns",
    "Father and Son",
    "Insults and Abuse",
    "Two Beggars",
    "The Queen and the Beggar",
    "The Last Banquet",
    "An Archery Contest",
    "Bloodshed",
    "The Olive Tree Bed",
    "Restless Spirits"
  ];

  var TERM_GLOSSES = [
    ["Achaeans", "Greeks who fought at Troy; Homer also calls them Argives or Danaans."],
    ["Achaean", "Greek; a member of the coalition that fought at Troy."],
    ["Argives", "Greeks, named through the region of Argos."],
    ["Danaans", "Another Homeric name for the Greeks."],
    ["Ithaca", "Odysseus’ island kingdom and the home he is trying to recover."],
    ["Troy", "The city the Greeks destroyed after the ten-year Trojan War."],
    ["Olympus", "The divine home and meeting place of the Olympian gods."],
    ["Ogygia", "Calypso’s remote island, where Odysseus is held for years."],
    ["Scheria", "The Phaeacians’ island kingdom, Odysseus’ last stop before Ithaca."],
    ["Pylos", "Nestor’s kingdom; Telemachus visits it while searching for news."],
    ["Lacedaemon", "Sparta, the kingdom of Menelaus and Helen."],
    ["Sparta", "The kingdom of Menelaus and Helen, visited by Telemachus."],
    ["Greece", "The broad homeland of the Greek coalition that fought at Troy."],
    ["Argos", "A Greek city and region; Homer sometimes uses its name for Greece more broadly."],
    ["Phaeacia", "The Phaeacians’ homeland, also called Scheria."],
    ["Crete", "A large island repeatedly used in travel memories and Odysseus’ invented identities."],
    ["Egypt", "The wealthy eastern Mediterranean kingdom reached by Menelaus and used in travel stories."],
    ["Dulichium", "An island kingdom near Ithaca and the home of many suitors."],
    ["Zacynthus", "An island in Odysseus’ wider kingdom, near Ithaca."],
    ["Thrinacia", "The island where the Sun God’s sacred cattle graze."],
    ["Hades", "The realm of the dead; the name can also refer to its ruling god."],
    ["Erebus", "The dark region associated with the entrance to the world of the dead."],
    ["Ocean", "The great world-encircling river imagined at the earth’s outer boundary."],
    ["Thebes", "A major Greek city with a dense mythic history; Egyptian Thebes is a different place."],
    ["Sidon", "A Phoenician coastal city associated with trade and fine craftwork."],
    ["Phoenicia", "A seafaring eastern Mediterranean region associated with traders and raiders."],
    ["Lesbos", "An Aegean island mentioned on the Greek route home from Troy."],
    ["Lemnos", "An Aegean island linked in the poem to Hephaestus."],
    ["Cyprus", "An island strongly associated with Aphrodite."],
    ["Elis", "A region of the western Peloponnese."],
    ["Parnassus", "A mountain where the young Odysseus received the scar used in his recognition."],
    ["Cephallenia", "The island region ruled by Laertes before Odysseus."],
    ["Sicily", "A western Mediterranean island mentioned in stories of raiding and the slave trade."],
    ["Odysseus", "King of Ithaca; strategist, survivor, storyteller, husband, and father."],
    ["Telemachus", "Odysseus and Penelope’s son, coming of age during his father’s absence."],
    ["Penelope", "Odysseus’ wife, pressured by the suitors and skilled in delay and testing."],
    ["Athena", "Goddess of strategy and craft; Odysseus’ divine ally and Telemachus’ guide."],
    ["Zeus", "Ruler of the Olympian gods and enforcer of oaths, guests, and suppliants."],
    ["Poseidon", "Sea god who persecutes Odysseus after the blinding of Polyphemus."],
    ["Calypso", "Immortal goddess who keeps Odysseus on Ogygia and wants him as her husband."],
    ["Circe", "Goddess and enchantress who transforms Odysseus’ crew, then becomes an adviser."],
    ["Hermes", "Divine messenger and guide, often crossing boundaries between worlds."],
    ["Dawn", "The divine personification of daybreak; capitalization signals more than a time of day."],
    ["Mentor", "Odysseus’ Ithacan friend and household guardian; Athena often takes his form."],
    ["Apollo", "God of archery, music, plague, healing, and prophecy."],
    ["Aphrodite", "Goddess of sexual desire, beauty, and attraction."],
    ["Artemis", "Goddess of hunting and sudden death, especially for women."],
    ["Hephaestus", "Divine metalworker and craftsman, husband of Aphrodite in the poem’s song."],
    ["Ares", "God of violent war and Aphrodite’s lover in Demodocus’ song."],
    ["Helius", "The Sun God, owner of the sacred cattle Odysseus’ crew kill."],
    ["Hera", "Queen of the Olympian gods and wife of Zeus."],
    ["Persephone", "Queen of the dead and wife of Hades."],
    ["Cronus", "Father of Zeus; calling Zeus ‘son of Cronus’ is an epic family identifier."],
    ["Zephyr", "The west wind."],
    ["Furies", "Divine powers who punish severe violations within families and against the dead."],
    ["Amphitrite", "A sea goddess associated with Poseidon and the dangerous ocean."],
    ["Earth-Shaker", "An epithet for Poseidon, stressing his power over sea and earthquake."],
    ["Thunderlord", "An epithet for Zeus, stressing his authority through thunder and storm."],
    ["Atlas", "A primordial divine figure who holds apart earth and sky; Calypso is his daughter."],
    ["Muse", "A goddess who inspires song and gives the poet authority to tell the epic."],
    ["Nestor", "Elder king of Pylos, valued for memory, ritual knowledge, and long counsel."],
    ["Menelaus", "King of Sparta, Helen’s husband, and a veteran of Troy."],
    ["Helen", "Queen of Sparta whose departure with Paris helped cause the Trojan War."],
    ["Agamemnon", "Commander of the Greek army at Troy, killed at home after the war."],
    ["Orestes", "Agamemnon’s son, repeatedly presented to Telemachus as an avenging model."],
    ["Aegisthus", "Agamemnon’s killer and Clytemnestra’s lover; an opening example of ignored warning."],
    ["Clytemnestra", "Agamemnon’s wife, who helps kill him after his return from Troy."],
    ["Achilles", "The greatest Greek fighter at Troy; in the underworld he complicates the value of glory."],
    ["Ajax", "Name shared by two Greek warriors at Troy; the greater Ajax later refuses to speak to Odysseus."],
    ["Atreus", "Father of Agamemnon and Menelaus; ‘son of Atreus’ identifies either brother by lineage."],
    ["Priam", "King of Troy and father of Hector."],
    ["Patroclus", "Achilles’ closest companion, whose death drives Achilles back into battle."],
    ["Diomedes", "A prominent Greek warrior at Troy who returns safely to Argos."],
    ["Antilochus", "Nestor’s son and a younger Greek warrior killed at Troy."],
    ["Idomeneus", "Leader of the Cretan forces at Troy."],
    ["Heracles", "The great hero also known as Hercules; Odysseus encounters his shade among the dead."],
    ["Myrmidons", "The band of Greek warriors led by Achilles."],
    ["Neleus", "Former king of Pylos and father of Nestor."],
    ["Pisistratus", "Nestor’s son, who accompanies Telemachus from Pylos to Sparta."],
    ["Thrasymedes", "Nestor’s son and a veteran fighter at Troy."],
    ["Laertes", "Odysseus’ elderly father, living apart from the palace in Ithaca."],
    ["Eumaeus", "Odysseus’ enslaved swineherd and one of his most loyal household allies."],
    ["Eurycleia", "Enslaved household nurse who raised Odysseus and Telemachus."],
    ["Antinous", "The most openly violent and arrogant of Penelope’s suitors."],
    ["Eurymachus", "A leading suitor who relies on persuasion, concealment, and opportunism."],
    ["Amphinomus", "A comparatively thoughtful suitor whom Odysseus warns, but Athena keeps on the fatal path."],
    ["Irus", "A palace beggar pushed into a staged fight with the disguised Odysseus."],
    ["Melanthius", "An enslaved goatherd who supports the suitors and betrays Odysseus’ household."],
    ["Dolius", "An elderly enslaved farm worker in Laertes’ household and father of Melanthius and Melantho."],
    ["Medon", "A palace herald who is spared after the suitors’ deaths."],
    ["Phemius", "The Ithacan bard forced to perform for the suitors."],
    ["Theoclymenus", "A fugitive seer who travels with Telemachus and foresees the suitors’ deaths."],
    ["Piraeus", "Telemachus’ trusted Ithacan companion, asked to protect gifts from Sparta."],
    ["Icarius", "Penelope’s father."],
    ["Halitherses", "An Ithacan elder and bird-interpreter who warns the suitors."],
    ["Autolycus", "Odysseus’ maternal grandfather, famous for theft, oaths, and cunning."],
    ["Iphitus", "A guest-friend who gave Odysseus the bow later used in the contest."],
    ["Melantho", "An enslaved palace woman who sides with the suitors and abuses the disguised Odysseus."],
    ["Eurynome", "A palace housekeeper who attends Penelope and the disguised Odysseus."],
    ["Eupeithes", "Antinous’ father, who calls for revenge after the suitors are killed."],
    ["Nausicaa", "Phaeacian princess who encounters the shipwrecked Odysseus."],
    ["Alcinous", "King of the Phaeacians and host of Odysseus’ long self-narration."],
    ["Arete", "Phaeacian queen whose judgment and household authority matter to Odysseus’ return."],
    ["Laodamas", "Alcinous’ son and a leading young Phaeacian athlete."],
    ["Nausithous", "Founder and former king of the Phaeacian settlement on Scheria."],
    ["Demodocus", "The blind Phaeacian bard whose songs force Odysseus’ hidden grief into view."],
    ["Euryalus", "A Phaeacian athlete who insults Odysseus before apologizing with a gift."],
    ["Rhexenor", "Arete’s father and Alcinous’ brother."],
    ["Polybus", "A name shared by more than one figure, including a wealthy Egyptian host and a Phaeacian craftsman."],
    ["Polyphemus", "The Cyclops blinded by Odysseus; Poseidon’s son."],
    ["Cyclops", "A member of the one-eyed giant people who live without shared law or assembly."],
    ["Cyclopes", "The one-eyed giant people; plural of Cyclops."],
    ["Scylla", "A many-headed sea monster who takes sailors from passing ships."],
    ["Charybdis", "A deadly whirlpool opposite Scylla; the route forces a choice between dangers."],
    ["Sirens", "Deadly singers whose knowledge and beauty lure sailors away from survival."],
    ["Tiresias", "Dead Theban prophet whom Odysseus consults in the underworld."],
    ["Elpenor", "A young crewman whose unburied death exposes the cost hidden beneath adventure."],
    ["Phaeacians", "Sailors and hosts who carry Odysseus home after hearing his story."],
    ["Lotus Eaters", "People whose food makes visitors forget the desire to return home."],
    ["Laestrygonians", "Cannibal giants who destroy almost all of Odysseus’ ships."],
    ["Cicones", "People at Ismarus whom Odysseus’ crew raid immediately after leaving Troy."],
    ["Aeolus", "Keeper of the winds, who gives Odysseus a sealed bag containing dangerous winds."],
    ["Thesprotians", "A people of northwestern Greece who appear in Odysseus’ invented travel stories."],
    ["Phorcys", "An ancient sea god and father of the sea-nymph Thoösa."],
    ["Orion", "A giant hunter whose shade appears in the world of the dead."],
    ["Minos", "Mythic king of Crete who judges the dead in the underworld."],
    ["Peleus", "Achilles’ mortal father."],
    ["Leto", "Mother of Apollo and Artemis."],
    ["Antiphates", "King of the cannibal Laestrygonians; the name is also used for another figure."],
    ["Mentes", "Leader of the Taphians whose identity Athena uses when first visiting Telemachus."],
    ["Taphians", "A seafaring island people associated with trade and raiding."],
    ["Taphian", "A person from the Taphian islands."],
    ["Anchialus", "A name shared by Mentes’ father and a young Phaeacian nobleman."],
    ["Phronius", "Father of Noëmon."],
    ["Noëmon", "The Ithacan who lends Telemachus the ship for his journey."],
    ["Ethiopians", "A distant people at the world’s edges whom the gods visit for feasts."],
    ["nymph", "A female divinity associated with a place in nature, below the greatest Olympian gods in rank."],
    ["nymphs", "Female divinities associated with natural places; plural of nymph."],
    ["Ithacans", "The people of Ithaca, whose response to Odysseus’ absence and return remains politically important."],
    ["Phaeacian", "A person from Scheria/Phaeacia, the seafaring society that finally carries Odysseus home."],
    ["Trojans", "The people who defended Troy against the Greek coalition."],
    ["Greek", "A member of the coalition that fought at Troy; Wilson also uses Achaean, Argive, and Danaan."],
    ["Greeks", "The coalition that fought at Troy; Homer also calls them Achaeans, Argives, or Danaans."],
    ["Argive", "Greek, expressed through association with Argos."],
    ["suitors", "Powerful men occupying Odysseus’ household while competing to marry Penelope."],
    ["suppliant", "A vulnerable person formally asking protection; harming one violates sacred obligation."],
    ["libation", "A ritual drink poured out as an offering to a god or the dead."],
    ["hecatomb", "A large formal animal sacrifice; the word literally suggests a hundred cattle."],
    ["ambrosia", "Divine food or substance associated with immortality and preservation."],
    ["nectar", "The gods’ drink."],
    ["herald", "An official messenger who also organizes assemblies, feasts, and public order."],
    ["bard", "A professional singer-poet whose stories shape memory and reputation."],
    ["seer", "A person who interprets divine signs or speaks prophetic knowledge."],
    ["omen", "An event read as a sign of divine intention or future outcome."],
    ["dowry", "Property connected to a marriage and transferred between households."],
    ["shroud", "A cloth for wrapping a dead body; Penelope’s weaving delays remarriage."],
    ["asphodel", "A pale flowering plant conventionally associated with the fields of the dead."],
    ["heifer", "A young cow that has not yet borne a calf."],
    ["uncalved", "Not yet having given birth to a calf."],
    ["tripod", "A three-legged ceremonial stand or cauldron, often given as a valuable prize."],
    ["cauldron", "A large metal cooking vessel and valuable gift object."],
    ["greaves", "Armor protecting a warrior’s shins."],
    ["prow", "The front of a ship."],
    ["stern", "The back of a ship."],
    ["keel", "The main structural beam running along the bottom of a ship."],
    ["forestays", "Ropes supporting a ship’s mast from the front."],
    ["rigging", "The ropes and equipment used to support and control a ship’s mast and sails."],
    ["barley-groats", "Coarsely ground barley used as food or sprinkled in sacrifice."],
    ["distaff", "A tool that holds unspun fiber while thread is made."],
    ["loom", "A frame used to weave thread into cloth."],
    ["winnowing fan", "A broad tool for tossing grain so wind can separate grain from chaff."],
    ["scepter", "A staff marking royal, divine, or public speaking authority."],
    ["tunic", "A basic garment worn next to the body."],
    ["fleece", "A sheep’s woolly skin, used as bedding or cloth."],
    ["brooch", "A decorative pin used to fasten clothing."],
    ["plunder", "Property taken by force in war or raiding."],
    ["spoils", "Goods, weapons, or wealth taken from a defeated enemy."],
    ["augury", "Reading birds or other signs to interpret divine intention."],
    ["lest", "To prevent or avoid the risk that something happens."],
    ["xenia", "The sacred guest-host relationship, including food, shelter, gifts, and reciprocal restraint."],
    ["nostos", "Homecoming; especially a warrior’s difficult return from Troy."],
    ["kleos", "Reputation or glory preserved through what others say and sing about a person."],
    ["deathless", "Immortal; a conventional description of the gods."],
    ["owl-eyed", "A recurring epithet for Athena, linking her to sharp sight and the owl."],
    ["wine-dark", "A traditional poetic description of the sea; it evokes depth and sheen, not a literal color chart."],
    ["rosy-fingered", "A traditional image for dawn spreading reddish light across the sky."],
    ["far-shooting", "An epithet stressing a god’s power to strike from a distance."],
    ["epithet", "A recurring descriptive phrase attached to a person, god, place, or thing."],
    ["maidservant", "A woman serving a household; in this society she may be enslaved, not freely employed."],
    ["slave", "A person treated as another household’s property; loyalty does not make the condition voluntary."],
    ["slaves", "People treated as another household’s property; loyalty does not make the condition voluntary."]
  ];

  var WORD_REWRITES = [
    [/\bwooers\b/gi, "suitors"],
    [/\bhither\b/gi, "here"],
    [/\bthither\b/gi, "there"],
    [/\bwhence\b/gi, "from where"],
    [/\bwherefore\b/gi, "why"],
    [/\bere\b/gi, "before"],
    [/\bthus\b/gi, "in this way"],
    [/\bbeheld\b/gi, "saw"],
    [/\bbade\b/gi, "told"],
    [/\bslew\b/gi, "killed"],
    [/\bsmitten\b/gi, "struck"],
    [/\bsire\b/gi, "father"],
    [/\btries beguiling (him|her|them) with ([^,;]+) to cease all thoughts of\b/gi, "uses $2 to persuade $1 to stop thinking about"],
    [/\btries beguiling (him|her|them)\b/gi, "tries to persuade $1 deceptively"],
    [/\bbeguiling\b/gi, "deceptive"],
    [/\bbefell\b/gi, "happened to"],
    [/\bneed impelled\b/gi, "necessity drove"]
  ];

  var IMPORTANT_PATTERNS = [
    [/(?:tell me about|sing of|Muse\b|\bbard\b|\bpoet\b)/i, "story and who controls it"],
    [/(?:\bNobody\b|\bNo one\b|recogniz|\bscar\b|olive tree|marriage bed)/i, "identity and recognition"],
    [/(?:\bxenia\b|\bsuppliant\b|guest.*host|host.*guest)/i, "hospitality and power"],
    [/(?:\bslave\b|\bslaves\b|maidservant|enslaved)/i, "freedom, labor, and household power"],
    [/(?:\bblame\b|\bfault\b|\bfate\b|\bchoice\b|\bwarning\b|responsib)/i, "blame and responsibility"],
    [/(?:\bnostos\b|homecoming)/i, "homecoming and belonging"],
    [/(?:\brevenge\b|\bmercy\b|\bpeace\b)/i, "violence, revenge, and its limits"]
  ];

  var THEME_CONTEXT = {
    "story and who controls it": "The issue is not only what happened, but who gets to make that version authoritative.",
    "identity and recognition": "Notice what counts as proof of a person when appearance and speech can both be manipulated.",
    "hospitality and power": "Hospitality is a power test here: who may enter, ask, give, refuse, or punish.",
    "freedom, labor, and household power": "The household runs through coerced labor, so loyalty and affection should not erase unequal power.",
    "blame and responsibility": "Separate divine pressure, circumstance, and the choice a person still makes.",
    "homecoming and belonging": "Returning to a place is not yet the same as recovering a role, a household, or recognition.",
    "violence, revenge, and its limits": "The passage asks when punishment restores order and when it simply extends retaliation."
  };

  var BOOK_CONTEXT_RULES = {
    1: [
      ["divine-council", /(Calypso|Ogygia).*(Athena|Zeus)|(Athena|Zeus).*(Calypso|Ogygia)/i, "This passage sets the divine frame for the poem: Odysseus is delayed, but the gods are also debating how much responsibility belongs to mortals."],
      ["telemachus-visitor", /(Mentes|Mentor).*(Telemachus|suitors)|(Telemachus|suitors).*(Mentes|Mentor)/i, "Athena’s visit is about converting Telemachus from a passive heir into someone who can speak and act inside his own house."]
    ],
    2: [
      ["assembly", /(assembly|Ithacans).*(Telemachus|suitors)|(Telemachus|suitors).*(assembly|Ithacans)/i, "The assembly tests whether public speech has any force when the community recognizes abuse but will not restrain powerful men."],
      ["shroud", /(shroud|weav|loom).*(Penelope|Laertes)|(Penelope|Laertes).*(shroud|weav|loom)/i, "Penelope’s weaving is political action disguised as domestic work: it creates time without openly claiming authority."]
    ],
    3: [
      ["pylos-ritual", /(Pylos|Nestor).*(sacrifice|heifer|libation)|(sacrifice|heifer|libation).*(Pylos|Nestor)/i, "The ritual detail is doing social work: Telemachus learns how a functioning household receives strangers, honors gods, and transfers knowledge."],
      ["orestes-model", /(Orestes|Agamemnon).*(Telemachus|example)|(Telemachus|example).*(Orestes|Agamemnon)/i, "Orestes is being offered as a model for Telemachus, but the comparison quietly turns adulthood into an expectation of revenge."]
    ],
    4: [
      ["memory-at-sparta", /(Helen|Menelaus).*(Odysseus|remember)|(Odysseus|remember).*(Helen|Menelaus)/i, "The competing memories at Sparta show that a heroic story changes with the teller; admiration, guilt, and self-defense sit inside the same recollection."],
      ["proteus", /(Proteus|Old Man of the Sea).*(home|return|prophe)|(home|return|prophe).*(Proteus|Old Man of the Sea)/i, "Proteus turns travel information into a test of endurance: knowledge about return has to be captured, not simply requested."]
    ],
    5: [
      ["mortality-choice", /(stay here with me and be immortal|my modest wife Penelope)/i, "The choice is not beauty versus hardship. Odysseus chooses a finite human identity—with marriage, aging, and home—over timeless captivity."],
      ["raft-storm", /(raft|storm|Poseidon).*(Ino|veil|shore)|(Ino|veil|shore).*(raft|storm|Poseidon)/i, "The shipwreck stretches survival into a chain of judgments: when to trust help, when to abandon the raft, and when to spend the last reserve of strength."]
    ],
    6: [
      ["nausicaa-encounter", /(Nausicaa|girls).*(naked|suppliant)|(naked|suppliant).*(Nausicaa|girls)/i, "This encounter is about managing threat. Odysseus must ask for help without using the physical and social power that makes him frightening."],
      ["laundry-marriage", /(laundry|clothes|wash).*(marriage|husband|Nausicaa)|(marriage|husband|Nausicaa).*(laundry|clothes|wash)/i, "The ordinary laundry trip carries marriage politics underneath it: domestic preparation creates the meeting that the plot needs."]
    ],
    7: [
      ["arete-supplication", /(Arete|queen).*(suppliant|knees|Odysseus)|(suppliant|knees|Odysseus).*(Arete|queen)/i, "Odysseus directs his appeal to Arete because authority in this household is not located only in the king; reading the room correctly is part of survival."],
      ["phaeacian-palace", /(palace|Alcinous|Phaeacian).*(gold|silver|orchard)|(gold|silver|orchard).*(palace|Alcinous|Phaeacian)/i, "The abundance is not decorative filler. It establishes Phaeacia as an almost frictionless society whose wealth and transport make Odysseus’ final return possible."]
    ],
    8: [
      ["song-and-tears", /(Demodocus|bard|song).*(weep|tear|Odysseus)|(weep|tear|Odysseus).*(Demodocus|bard|song)/i, "The song exposes what Odysseus’ controlled public identity hides. His tears are evidence that heroic fame and lived trauma are not the same thing."],
      ["games-and-status", /(games|contest|discus).*(Odysseus|Euryalus)|(Odysseus|Euryalus).*(games|contest|discus)/i, "The athletic challenge is a status negotiation: the stranger has to reveal enough excellence to stop humiliation without yet revealing his name."]
    ],
    9: [
      ["cyclops-hospitality", /(Cyclops|Polyphemus).*(guest|host|Zeus|suppliant)|(guest|host|Zeus|suppliant).*(Cyclops|Polyphemus)/i, "The cave episode tests hospitality at its limit. Odysseus invokes a shared law that Polyphemus rejects, but Odysseus also entered expecting to take and receive."],
      ["nobody-name", /(Nobody|No one).*(name|Cyclops|Polyphemus)|(name|Cyclops|Polyphemus).*(Nobody|No one)/i, "The ‘Nobody’ trick makes anonymity a weapon; the later disclosure of Odysseus’ real name turns recovered identity back into danger."]
    ],
    10: [
      ["wind-bag", /(Aeolus|winds).*(bag|companions|crew)|(bag|companions|crew).*(Aeolus|winds)/i, "The wind bag is about trust inside the crew. The route home is available, but secrecy and suspicion make the group unable to use it."],
      ["circe-transformation", /(Circe|pigs|swine).*(men|companions|Hermes)|(men|companions|Hermes).*(Circe|pigs|swine)/i, "The transformation makes appetite and loss of self visible. Recovery requires both divine help and Odysseus’ willingness to confront the source of enchantment."]
    ],
    11: [
      ["underworld-knowledge", /(Tiresias|blood|dead).*(question|home|return)|(question|home|return).*(Tiresias|blood|dead)/i, "Knowledge from the dead has a price and an order. Odysseus controls access to the blood so that testimony arrives under his conditions."],
      ["achilles-glory", /(Achilles|glory|kleos).*(dead|life|slave)|(dead|life|slave).*(Achilles|glory|kleos)/i, "Achilles’ answer challenges the heroic value system that made him famous: glory preserved in song does not compensate the dead person who cannot live it."]
    ],
    12: [
      ["forced-choice", /(Scylla|Charybdis).*(choice|men|ship)|(choice|men|ship).*(Scylla|Charybdis)/i, "Scylla and Charybdis create a leadership problem with no clean outcome: Odysseus must choose a limited loss and cannot honestly promise safety to everyone."],
      ["sun-cattle", /(strict instructions.*avoid.*island of the Sun|starving.*cattle|poach.*Helius[’'] cattle)/i, "The cattle episode separates pressure from responsibility. Hunger explains the crew’s decision, but the warning makes the boundary and consequence explicit."]
    ],
    13: [
      ["home-disguised", /(Ithaca|home).*(recogniz|disguis|mist|Athena)|(recogniz|disguis|mist|Athena).*(Ithaca|home)/i, "Arrival does not complete the homecoming. Odysseus reaches Ithaca but must learn to see it, conceal himself, and determine whom the place still belongs to."],
      ["two-tricksters", /(Athena|Odysseus).*(lie|trick|deceiv|story)|(lie|trick|deceiv|story).*(Athena|Odysseus)/i, "Athena and Odysseus recognize each other through deception. Their intimacy is based less on openness than on delight in matching intelligence."]
    ],
    14: [
      ["eumaeus-host", /(Eumaeus|swineherd).*(guest|stranger|slave)|(guest|stranger|slave).*(Eumaeus|swineherd)/i, "Eumaeus practices the hospitality the suitors violate, even though he has far less power and is himself enslaved inside Odysseus’ household."],
      ["cretan-story", /(Crete|Cretan).*(story|Odysseus|stranger)|(story|Odysseus|stranger).*(Crete|Cretan)/i, "The invented Cretan history is not disposable lying. Odysseus uses a plausible life story to test Eumaeus while revealing truths in disguised form."]
    ],
    15: [
      ["eumaeus-life", /(Laertes bought me|story of your sufferings, Eumaeus)/i, "Eumaeus’ history interrupts the adventure plot to show how enslavement happens through kidnapping, trade, and household absorption—not through natural loyalty."],
      ["return-omen", /(No family in all of Ithaca has greater power|you are the kings forever)/i, "The omen interprets Telemachus’ return as a claim to household continuity; it turns travel back into a political contest at home."]
    ],
    16: [
      ["father-son-recognition", /(I am your father|It is me; no other is on his way)/i, "Recognition between father and son is emotionally real but also strategic: they immediately have to convert kinship into a dangerous joint plan."],
      ["counting-suitors", /(Athena told me to come here and make plans|hide them away inside the upstairs storage room)/i, "The planning passage is about asymmetry. A tiny group can act only through secrecy, control of weapons, and uncertainty about household loyalties."]
    ],
    17: [
      ["argos", /(Argos.*(?:realized Odysseus|wagged his tail)|twenty years had passed since Argos)/i, "Argos recognizes Odysseus without a test or explanation. The neglected dog makes the cost of the hero’s absence visible in one domestic life."],
      ["antinous-violence", /(Antinous.*(?:hurled|hit).*(?:stool|footstool)|(?:stool|footstool).*(?:hurled|hit).*Antinous)/i, "The assault supplies public evidence against Antinous: he violates hospitality while attacking someone who appears unable to retaliate."]
    ],
    18: [
      ["irus-fight", /(Irus|beggar).*(fight|Odysseus|suitors)|(fight|Odysseus|suitors).*(Irus|beggar)/i, "The staged fight turns poverty and bodily vulnerability into entertainment. Odysseus wins, but he must calibrate the victory to protect his disguise."],
      ["penelope-gifts", /(secretly procuring presents|They ought to bring.*give fine gifts)/i, "Penelope appears to comply while making the suitors pay into the household they are consuming; performance becomes a way to recover leverage."]
    ],
    19: [
      ["scar", /(felt the scar.*Autolycus|scar.*white-tusked boar)/i, "The scar joins bodily proof to an old family story. Recognition arrives through touch, then has to be suppressed because truth at the wrong time is dangerous."],
      ["penelope-interview", /(Penelope|queen).*(stranger|dream|geese|husband)|(stranger|dream|geese|husband).*(Penelope|queen)/i, "The interview is a contest of controlled disclosure. Both speakers seek proof while protecting themselves from the cost of believing too soon."]
    ],
    20: [
      ["restraint", /(Odysseus|heart).*(endure|restrain|anger|rage)|(endure|restrain|anger|rage).*(Odysseus|heart)/i, "The repeated self-command makes restraint an active heroic feat. Odysseus’ success now depends on not displaying the force he is famous for."],
      ["omens", /(plates of meat began to drip with blood|prophet Theoclymenus.*what awful thing|sun has vanished.*gloomy mist)/i, "The signs make the coming violence legible before it happens; the question is no longer whether warning exists, but why the suitors cannot use it."]
    ],
    21: [
      ["bow-test", /(bow|axes).*(Penelope|suitors|contest)|(Penelope|suitors|contest).*(bow|axes)/i, "The bow is both an object and a credential. The contest converts private knowledge of Odysseus’ household into a public test of legitimate authority."],
      ["stringing-bow", /(Odysseus|beggar).*(strung the (?:great |polished )?bow|tested the string)|(strung the (?:great |polished )?bow|tested the string).*(Odysseus|beggar)/i, "Stringing the bow is recognition through skilled action: the disguised body proves an identity before the name is openly restored."]
    ],
    22: [
      ["slaughter", /(suitors|Antinous|Eurymachus).*(kill|blood|mercy)|(kill|blood|mercy).*(suitors|Antinous|Eurymachus)/i, "The battle is also an argument about judgment: who is treated as collectively guilty, who may plead, and whether surrender can matter once revenge begins."],
      ["household-punishment", /(girls.*strung up.*noose|Melanthius.*\b(?:nose|ears|genitals)\b)/i, "This punishment is meant to restore household hierarchy, but the brutality should remain visible rather than disappearing inside the language of loyalty and betrayal."]
    ],
    23: [
      ["bed-test", /(olive tree|move(?:d)? (?:my|the) bed|bed.*(?:built|root|trunk)).*(Penelope|Odysseus)|(Penelope|Odysseus).*(olive tree|move(?:d)? (?:my|the) bed|bed.*(?:built|root|trunk))/i, "Penelope’s bed test asks for knowledge only the real husband could possess. Recognition becomes mutual because she tests him rather than merely being identified by him."],
      ["reunion-story", /(she told him how|he described the|his story ended)/i, "The reunion still requires narration: physical return becomes shared life only when absence can be told, heard, and placed inside the marriage."]
    ],
    24: [
      ["suitors-underworld", /(suitors|spirits|Hermes).*(Agamemnon|Hades|dead)|(Agamemnon|Hades|dead).*(suitors|spirits|Hermes)/i, "The dead suitors retell their defeat, and their version competes with the poem’s earlier framing. Even after judgment, control of the story remains unsettled."],
      ["peace-ending", /(make yet more war.*friendship|live in peace and in prosperity|oaths of peace)/i, "Winning the house does not end the social consequences of killing. The final problem is how retaliation stops when every death creates another family claim."]
    ]
  };

  function fail(message) {
    throw new Error(message);
  }

  function exactMarker(lines, marker, startAt) {
    for (var index = startAt || 0; index < lines.length; index += 1) {
      if (lines[index].trim() === marker) return index;
    }
    return -1;
  }

  function firstNonEmpty(lines, startAt, endAt) {
    for (var index = startAt; index < endAt; index += 1) {
      var value = lines[index].trim();
      if (value) return { index: index, value: value };
    }
    return null;
  }

  function countWords(lines) {
    return lines.join(" ").trim().split(/\s+/).filter(Boolean).length;
  }

  function extractBookBody(lines, startAt, endAt) {
    var verseLines = [];
    var sourceGaps = [];
    var blanks = 0;
    for (var index = startAt; index < endAt; index += 1) {
      var text = lines[index].trim();
      if (!text) {
        blanks += 1;
        continue;
      }
      if (verseLines.length && blanks >= 3) sourceGaps.push(verseLines.length);
      verseLines.push(text);
      blanks = 0;
    }
    return { lines: verseLines, sourceGaps: sourceGaps };
  }

  function extractOdysseyBooks(raw) {
    if (typeof raw !== "string" || !raw.trim()) fail("Choose a non-empty text file");
    if (raw.length > MAX_SOURCE_CHARS) fail("That text file is too large for the private reader");

    var lines = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
    var starts = [];
    var searchFrom = 0;
    for (var bookNumber = 1; bookNumber <= 24; bookNumber += 1) {
      var start = exactMarker(lines, "BOOK " + bookNumber, searchFrom);
      if (start === -1) fail("Could not find the Book " + bookNumber + " heading");
      starts.push(start);
      searchFrom = start + 1;
    }
    var notesStart = exactMarker(lines, "NOTES", starts[23] + 1);
    if (notesStart === -1) fail("Could not find the Notes boundary after Book 24");

    var books = starts.map(function (start, index) {
      var bookNumber = index + 1;
      var end = index < 23 ? starts[index + 1] : notesStart;
      var title = firstNonEmpty(lines, start + 1, end);
      if (!title || title.value !== BOOK_TITLES[index]) {
        fail("Book " + bookNumber + " does not match the expected Wilson export");
      }
      var body = extractBookBody(lines, title.index + 1, end);
      if (body.lines.length < MIN_BOOK_LINES || body.lines.length > MAX_BOOK_LINES) {
        fail("Book " + bookNumber + " looks incomplete or includes unexpected material");
      }
      return {
        unitId: "book-" + bookNumber,
        bookNumber: bookNumber,
        title: title.value,
        lines: body.lines,
        sourceGaps: body.sourceGaps,
        lineCount: body.lines.length,
        wordCount: countWords(body.lines)
      };
    });

    return {
      schemaVersion: 3,
      workId: "homer-odyssey",
      bookCount: books.length,
      totalLineCount: books.reduce(function (sum, book) { return sum + book.lineCount; }, 0),
      totalWordCount: books.reduce(function (sum, book) { return sum + book.wordCount; }, 0),
      books: books
    };
  }

  function storageOrDefault(storage) {
    return storage || root.localStorage;
  }

  function validBook(value, index, allowMissingGaps) {
    if (!value || !Array.isArray(value.lines)) return false;
    var gapsValid = allowMissingGaps && value.sourceGaps === undefined ||
      Array.isArray(value.sourceGaps) && value.sourceGaps.every(function (gap, gapIndex) {
        return Number.isInteger(gap) && gap > 0 && gap < value.lines.length &&
          (gapIndex === 0 || gap > value.sourceGaps[gapIndex - 1]);
      });
    return value.unitId === "book-" + (index + 1) &&
      value.bookNumber === index + 1 && value.title === BOOK_TITLES[index] &&
      Array.isArray(value.lines) && value.lines.length >= MIN_BOOK_LINES &&
      value.lines.length <= MAX_BOOK_LINES && value.lines.every(function (line) {
        return typeof line === "string" && line.length > 0;
      }) && gapsValid && value.lineCount === value.lines.length && Number.isInteger(value.wordCount) &&
      value.wordCount === countWords(value.lines);
  }

  function validStoredRecord(value, schemaVersion) {
    var expectedSchema = schemaVersion || 3;
    if (!value || value.schemaVersion !== expectedSchema || value.workId !== "homer-odyssey" ||
        value.bookCount !== 24 || !Array.isArray(value.books) || value.books.length !== 24 ||
        !value.books.every(function (book, index) { return validBook(book, index, expectedSchema === 2); })) return false;
    var totalLineCount = value.books.reduce(function (sum, book) { return sum + book.lineCount; }, 0);
    var totalWordCount = value.books.reduce(function (sum, book) { return sum + book.wordCount; }, 0);
    return value.totalLineCount === totalLineCount && value.totalWordCount === totalWordCount;
  }

  function migrateV2Record(value) {
    if (!validStoredRecord(value, 2)) return null;
    var migrated = JSON.parse(JSON.stringify(value));
    migrated.schemaVersion = 3;
    migrated.books.forEach(function (book) { book.sourceGaps = []; });
    return migrated;
  }

  function loadOdysseyBooks(storage) {
    var target = storageOrDefault(storage);
    var raw = target.getItem(STORAGE_KEY);
    if (raw) {
      try {
        var current = JSON.parse(raw);
        if (validStoredRecord(current)) return current;
      } catch (error) {
        return null;
      }
      return null;
    }
    var previousRaw = target.getItem(PREVIOUS_STORAGE_KEY);
    if (!previousRaw) return null;
    try {
      var migrated = migrateV2Record(JSON.parse(previousRaw));
      if (!migrated) return null;
      target.setItem(STORAGE_KEY, JSON.stringify(migrated));
      target.removeItem(PREVIOUS_STORAGE_KEY);
      target.removeItem(LEGACY_BOOK_ONE_KEY);
      return migrated;
    } catch (error) {
      return null;
    }
  }

  function saveOdysseyBooks(value, storage) {
    if (!validStoredRecord(value)) fail("The 24 books could not be saved safely");
    var target = storageOrDefault(storage);
    target.setItem(STORAGE_KEY, JSON.stringify(value));
    target.removeItem(PREVIOUS_STORAGE_KEY);
    target.removeItem(LEGACY_BOOK_ONE_KEY);
    return value;
  }

  function clearOdysseyBooks(storage) {
    var target = storageOrDefault(storage);
    target.removeItem(STORAGE_KEY);
    target.removeItem(PREVIOUS_STORAGE_KEY);
    target.removeItem(LEGACY_BOOK_ONE_KEY);
  }

  function emptyAnnotations() {
    return { schemaVersion: 1, workId: "homer-odyssey", viewMode: "clear", bookAnalysis: {}, unitEdits: {} };
  }

  function stringMapValid(map, maxValueLength) {
    return map && typeof map === "object" && !Array.isArray(map) && Object.keys(map).every(function (key) {
      return typeof map[key] === "string" && map[key].length <= maxValueLength;
    });
  }

  function validAnnotations(value) {
    if (!value || value.schemaVersion !== 1 || value.workId !== "homer-odyssey" ||
        ["clear", "original", "both"].indexOf(value.viewMode) === -1 ||
        !stringMapValid(value.bookAnalysis, 20000) || !stringMapValid(value.unitEdits, 20000)) return false;
    return JSON.stringify(value).length <= MAX_ANNOTATION_CHARS;
  }

  function loadAnnotations(storage) {
    var raw = storageOrDefault(storage).getItem(ANNOTATIONS_KEY);
    if (!raw) return emptyAnnotations();
    try {
      var value = JSON.parse(raw);
      return validAnnotations(value) ? value : emptyAnnotations();
    } catch (error) {
      return emptyAnnotations();
    }
  }

  function saveAnnotations(value, storage) {
    if (!validAnnotations(value)) fail("The private analysis is too large or damaged");
    storageOrDefault(storage).setItem(ANNOTATIONS_KEY, JSON.stringify(value));
    return value;
  }

  function stripVerseNumber(line) {
    return line.replace(/\s+(\d{1,4})$/, function (match, value) {
      return Number(value) % 10 === 0 ? "" : match;
    });
  }

  function normalizedBookText(book) {
    return book.lines.map(stripVerseNumber).join(" ").replace(/\s+/g, " ").trim();
  }

  function splitSentenceText(text) {
    var units = [];
    var start = 0;
    var boundary = /[.!?]+[”’"']*(?=\s+(?:[“‘"'(\[]*[A-Z])|$)/g;
    var match;
    while ((match = boundary.exec(text))) {
      var end = match.index + match[0].length;
      var sentence = text.slice(start, end).trim();
      if (sentence) units.push(sentence);
      start = end;
    }
    var rest = text.slice(start).trim();
    if (rest) units.push(rest);
    return units;
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function glossesForText(text, seenTerms) {
    var lower = text.toLowerCase();
    var seen = seenTerms || {};
    var matches = TERM_GLOSSES.filter(function (entry) {
      var term = entry[0];
      var pattern = new RegExp("(^|[^A-Za-z])" + escapeRegExp(term.toLowerCase()) + "(?=$|[^A-Za-z])");
      if (!pattern.test(lower) || seen[term.toLowerCase()]) return false;
      return true;
    }).slice(0, 2);
    matches.forEach(function (entry) { seen[entry[0].toLowerCase()] = true; });
    return matches.map(function (entry) { return { term: entry[0], meaning: entry[1] }; });
  }

  function rewriteSentence(text) {
    var rewritten = text;
    WORD_REWRITES.forEach(function (rule) { rewritten = rewritten.replace(rule[0], rule[1]); });
    return rewritten.replace(/\s+/g, " ").trim();
  }

  function importantReason(text) {
    var reasons = [];
    IMPORTANT_PATTERNS.forEach(function (entry) {
      if (entry[0].test(text) && reasons.indexOf(entry[1]) === -1) reasons.push(entry[1]);
    });
    return reasons.slice(0, 2);
  }

  function buildReadingUnits(book) {
    if (!book || !Array.isArray(book.lines)) fail("A valid book is required");
    var originalText = normalizedBookText(book);
    var seenTerms = {};
    return splitSentenceText(originalText).map(function (original, index) {
      var glosses = glossesForText(original, seenTerms);
      var important = importantReason(original);
      var clear = important.length ? original : rewriteSentence(original);
      var changed = clear !== original;
      return {
        id: book.unitId + ":sentence-" + (index + 1),
        index: index + 1,
        original: original,
        clear: clear,
        glosses: glosses,
        importantReasons: important,
        decision: changed ? "rewritten" : glosses.length ? "guided" : "kept",
        changed: changed,
        important: important.length > 0
      };
    });
  }

  function wordCountForText(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function contextForPassage(passage, bookNumber, state) {
    var text = passage.original;
    var rules = BOOK_CONTEXT_RULES[bookNumber] || [];
    for (var ruleIndex = 0; ruleIndex < rules.length; ruleIndex += 1) {
      var rule = rules[ruleIndex];
      if (!state.seenRules[rule[0]] && rule[1].test(text)) {
        state.seenRules[rule[0]] = true;
        state.lastContextIndex = passage.index;
        return { kind: "curated", text: rule[2] };
      }
    }

    var isLong = passage.wordCount >= 135 && passage.units.length >= 3;
    var questionCount = (text.match(/\?/g) || []).length;
    var isSubstantialQuestion = questionCount >= 2 && passage.wordCount >= 90 || questionCount >= 1 && passage.wordCount >= 120;
    if (!isLong && (!isSubstantialQuestion || state.genericCount >= 3 || passage.index - state.lastContextIndex < 2)) return null;

    var reasons = importantReason(text);
    var note;
    if (reasons.length) {
      note = "This passage is about " + reasons[0] + ". " + THEME_CONTEXT[reasons[0]];
    } else if (isSubstantialQuestion) {
      note = "This passage is organized around a question. Track who is allowed to answer, what evidence would count, and what the answer would authorize next.";
    } else if (/[“\"]/.test(text)) {
      note = "This is a sustained speech rather than a pile of plot facts. Separate the speaker’s claim, the evidence offered, and the action the listener is being asked to take.";
    } else if ((text.match(/\b[A-Z][A-Za-zÀ-ÖØ-öø-ÿ’'-]+\b/g) || []).length >= 8) {
      note = "This is a catalogue of people, places, or inherited ties. Its purpose is to establish memory, rank, and obligation; the individual names matter less than the network they create.";
    } else {
      note = "This is a long action sequence. Track the decision that changes what can happen next; the surrounding detail controls pace, pressure, and consequence.";
    }
    state.genericCount += 1;
    state.lastContextIndex = passage.index;
    return { kind: "orientation", text: note };
  }

  function buildReadingPassages(book) {
    var units = buildReadingUnits(book);
    var gapTargets = (book.sourceGaps || []).map(function (gap) {
      return countWords(book.lines.slice(0, gap));
    });
    var gapIndex = 0;
    var consumedWords = 0;
    var groups = [];
    var current = [];
    var currentWords = 0;

    function flush() {
      if (!current.length) return;
      groups.push(current);
      current = [];
      currentWords = 0;
    }

    units.forEach(function (unit) {
      var unitWords = wordCountForText(unit.original);
      var atSourceBreak = gapIndex < gapTargets.length && consumedWords >= gapTargets[gapIndex];
      if (current.length && (currentWords >= 165 || current.length >= 6 || atSourceBreak && currentWords >= 55)) flush();
      current.push(unit);
      currentWords += unitWords;
      consumedWords += unitWords;
      while (gapIndex < gapTargets.length && consumedWords >= gapTargets[gapIndex]) gapIndex += 1;
      if (/\?$/.test(unit.original) && currentWords >= 70) flush();
    });
    flush();

    var contextState = { seenRules: {}, genericCount: 0, lastContextIndex: -10 };
    return groups.map(function (group, index) {
      var passage = {
        id: book.unitId + ":passage-" + (index + 1),
        index: index + 1,
        units: group,
        original: group.map(function (unit) { return unit.original; }).join(" "),
        wordCount: group.reduce(function (sum, unit) { return sum + wordCountForText(unit.original); }, 0)
      };
      passage.context = contextForPassage(passage, book.bookNumber, contextState);
      return passage;
    });
  }

  function coverageReport(record) {
    var sentenceCount = 0;
    var failures = [];
    record.books.forEach(function (book) {
      var units = buildReadingUnits(book);
      sentenceCount += units.length;
      var rebuilt = units.map(function (unit) { return unit.original; }).join(" ").replace(/\s+/g, " ").trim();
      if (rebuilt !== normalizedBookText(book)) failures.push(book.unitId);
      if (units.some(function (unit) { return !unit.clear || !unit.decision; })) failures.push(book.unitId + ":empty");
    });
    return { bookCount: record.books.length, sentenceCount: sentenceCount, complete: failures.length === 0, failures: failures };
  }

  function createPrivateBackup(record, annotations) {
    if (!validStoredRecord(record) || !validAnnotations(annotations)) fail("The private backup could not be created safely");
    return JSON.stringify({
      schemaVersion: 1,
      type: "wisdom-private-odyssey-backup",
      exportedAt: new Date().toISOString(),
      source: record,
      annotations: annotations
    }, null, 2);
  }

  function parsePrivateBackup(raw) {
    var value;
    try { value = JSON.parse(raw); } catch (error) { fail("That is not a valid Wisdom private backup"); }
    if (!value || value.schemaVersion !== 1 || value.type !== "wisdom-private-odyssey-backup" ||
        !validStoredRecord(value.source) || !validAnnotations(value.annotations)) {
      fail("That backup is incomplete or damaged");
    }
    return { source: value.source, annotations: value.annotations };
  }

  function createOdysseyBookController(options) {
    var doc = root.document;
    var el = options.el;
    var showToast = options.showToast;
    var units = options.units || (options.unitIds || []).map(function (unitId, index) {
      return { id: unitId, bookNumber: index + 1, title: BOOK_TITLES[index] };
    });
    var unitIds = units.map(function (unit) { return unit.id; });
    var unitMeta = {};
    units.forEach(function (unit) { unitMeta[unit.id] = unit; });
    var mounts = {};
    var record = null;
    var annotations = emptyAnnotations();
    var hostedSync = null;
    try { record = loadOdysseyBooks(); } catch (error) { record = null; }
    try { annotations = loadAnnotations(); } catch (error) { annotations = emptyAnnotations(); }

    function bookForUnit(unitId) {
      if (!record || !Array.isArray(record.books)) return null;
      return record.books.find(function (book) { return book.unitId === unitId; }) || null;
    }

    function persistAnnotations(message) {
      try {
        saveAnnotations(annotations);
        if (message) showToast(message);
        return true;
      } catch (error) {
        showToast(error.message || "Could not save private analysis");
        return false;
      }
    }

    function renderAnalysis(book, clearSection) {
      var meta = unitMeta[book.unitId] || {};
      var analysis = el("details", "privateBookAnalysis");
      var analysisSummary = doc.createElement("summary");
      analysisSummary.textContent = "Your notes";
      analysis.appendChild(analysisSummary);
      var analysisBody = el("div", "privateBookAnalysisBody");
      analysisBody.appendChild(el("p", "layerLabel", "Private note"));
      analysisBody.appendChild(el("h4", "", "Analysis for Book " + book.bookNumber));
      var promptParts = [];
      if (meta.comprehensionPrompt) promptParts.push(meta.comprehensionPrompt);
      if (meta.outputPrompt) promptParts.push(meta.outputPrompt);
      if (promptParts.length) analysisBody.appendChild(el("p", "privateAnalysisPrompt", promptParts.join(" ")));
      var label = doc.createElement("label");
      label.className = "visuallyHidden";
      label.htmlFor = "privateAnalysis-" + book.bookNumber;
      label.textContent = "Personal analysis for Book " + book.bookNumber;
      var textarea = doc.createElement("textarea");
      textarea.id = label.htmlFor;
      textarea.className = "privateAnalysisInput";
      textarea.rows = 5;
      textarea.maxLength = 20000;
      textarea.placeholder = "Write what changed, what confused you, and what this book makes you think. This saves automatically.";
      textarea.value = annotations.bookAnalysis[book.unitId] || "";
      var saved = el("span", "privateSaveStatus", textarea.value ? "Saved" : "Not written yet");
      var timer = null;
      textarea.addEventListener("input", function () {
        saved.textContent = "Saving…";
        root.clearTimeout(timer);
        timer = root.setTimeout(function () {
          annotations.bookAnalysis[book.unitId] = textarea.value;
          if (persistAnnotations()) saved.textContent = "Saved";
        }, 350);
      });
      textarea.addEventListener("blur", function () {
        root.clearTimeout(timer);
        annotations.bookAnalysis[book.unitId] = textarea.value;
        if (persistAnnotations()) saved.textContent = "Saved";
      });
      analysisBody.appendChild(label);
      analysisBody.appendChild(textarea);
      analysisBody.appendChild(saved);
      analysis.appendChild(analysisBody);
      clearSection.appendChild(analysis);
    }

    function renderClearUnit(unit) {
      var article = el("article", "privateClearUnit privateClearUnit-" + unit.decision);
      if (unit.important) article.classList.add("privateClearUnitImportant");
      if (unit.decision !== "kept" || unit.important) {
        var meta = el("div", "privateClearMeta");
        var decisionText = unit.decision === "rewritten" ? "Edited for clarity" :
          unit.decision === "guided" ? "Useful term" : "Keep this wording";
        meta.appendChild(el("span", "privateUnitNumber", "Sentence " + unit.index));
        meta.appendChild(el("span", "privateDecision privateDecision-" + unit.decision, decisionText));
        article.appendChild(meta);
      }

      var custom = annotations.unitEdits[unit.id];
      var clearText = el("p", "privateClearText", custom || unit.clear);
      article.appendChild(clearText);
      var tools = el("details", "privateSentenceTools");
      var toolsSummary = doc.createElement("summary");
      toolsSummary.textContent = custom ? "Edit saved sentence" : unit.changed ? "See original or edit" : "Edit this sentence";
      tools.appendChild(toolsSummary);
      if (unit.changed || custom) {
        var original = el("div", "privateUnitOriginal");
        original.appendChild(el("p", "", unit.original));
        tools.appendChild(original);
      }
      var editor = el("div", "privateRewriteEditor");
      var editArea = doc.createElement("textarea");
      editArea.rows = 4;
      editArea.maxLength = 20000;
      editArea.value = custom || unit.clear;
      editArea.setAttribute("aria-label", "Edit sentence " + unit.index);
      var saveEdit = el("button", "primaryLink", "Save sentence");
      saveEdit.type = "button";
      var resetEdit = el("button", "textButton", "Use Wisdom version");
      resetEdit.type = "button";
      editor.appendChild(editArea);
      editor.appendChild(saveEdit);
      editor.appendChild(resetEdit);
      saveEdit.addEventListener("click", function () {
        var value = editArea.value.trim();
        if (!value) {
          showToast("A saved sentence cannot be blank");
          return;
        }
        annotations.unitEdits[unit.id] = value;
        if (persistAnnotations("Sentence saved on this browser")) {
          clearText.textContent = value;
          toolsSummary.textContent = "Edit saved sentence";
          tools.open = false;
        }
      });
      resetEdit.addEventListener("click", function () {
        delete annotations.unitEdits[unit.id];
        if (persistAnnotations("Wisdom version restored")) {
          clearText.textContent = unit.clear;
          editArea.value = unit.clear;
          toolsSummary.textContent = unit.changed ? "See original or edit" : "Edit this sentence";
          tools.open = false;
        }
      });
      tools.appendChild(editor);
      article.appendChild(tools);
      return article;
    }

    function renderPassage(passage) {
      var section = el("section", "privatePassage");
      section.appendChild(el("p", "privatePassageNumber", "Passage " + passage.index));
      if (passage.context) {
        var context = el("aside", "privatePassageContext privatePassageContext-" + passage.context.kind);
        context.appendChild(el("p", "layerLabel", "What this passage is doing"));
        context.appendChild(el("p", "privatePassageContextText", passage.context.text));
        section.appendChild(context);
      }
      var unitList = el("div", "privatePassageUnits");
      passage.units.forEach(function (unit) { unitList.appendChild(renderClearUnit(unit)); });
      section.appendChild(unitList);
      var terms = [];
      passage.units.forEach(function (unit) {
        unit.glosses.forEach(function (gloss) {
          if (!terms.some(function (entry) { return entry.term === gloss.term; })) terms.push(gloss);
        });
      });
      if (terms.length) {
        var termDetails = el("details", "privatePassageTerms");
        var termSummary = doc.createElement("summary");
        termSummary.textContent = "Terms · " + terms.map(function (entry) { return entry.term; }).join(", ");
        termDetails.appendChild(termSummary);
        var termBody = el("div", "privatePassageTermsBody");
        terms.forEach(function (gloss) {
          var item = el("p", "privateGloss");
          item.appendChild(el("strong", "", gloss.term + " — "));
          item.appendChild(doc.createTextNode(gloss.meaning));
          termBody.appendChild(item);
        });
        termDetails.appendChild(termBody);
        section.appendChild(termDetails);
      }
      return section;
    }

    function renderMount(unitId, openAfterImport) {
      var mount = mounts[unitId];
      if (!mount) return;
      mount.textContent = "";
      var book = bookForUnit(unitId);
      if (!book) {
        var missing = el("a", "privateSourceMissing", "Open from your encrypted library or import once on a computer →");
        missing.href = "#privateOdysseySource";
        mount.appendChild(missing);
        return;
      }

      var reading = el("details", "privateSourceReading");
      var summary = doc.createElement("summary");
      summary.textContent = "Book " + book.bookNumber + " · selective context + careful edits";
      reading.appendChild(summary);
      var body = el("div", "privateSourceText");
      body.dataset.viewMode = annotations.viewMode;
      reading.appendChild(body);

      function renderBook() {
        if (body.dataset.rendered === "true") return;
        var toolbar = el("details", "privateViewToolbar");
        var toolbarSummary = doc.createElement("summary");
        var viewNames = { clear: "Edited", original: "Original", both: "Both" };
        toolbarSummary.textContent = "Reading options · " + viewNames[annotations.viewMode];
        toolbar.appendChild(toolbarSummary);
        var toolbarBody = el("div", "privateViewToolbarBody");
        toolbar.appendChild(toolbarBody);
        [["clear", "Edited reading"], ["original", "Original verse lines"], ["both", "Both"]].forEach(function (option) {
          var node = el("button", "privateModeButton", option[1]);
          node.type = "button";
          node.dataset.viewMode = option[0];
          node.setAttribute("aria-pressed", String(annotations.viewMode === option[0]));
          node.addEventListener("click", function () {
            annotations.viewMode = option[0];
            body.dataset.viewMode = option[0];
            toolbarSummary.textContent = "Reading options · " + viewNames[option[0]];
            Array.from(toolbarBody.querySelectorAll("[data-view-mode]")).forEach(function (button) {
              button.setAttribute("aria-pressed", String(button === node));
            });
            persistAnnotations();
            toolbar.open = false;
          });
          toolbarBody.appendChild(node);
        });
        var helpToggle = el("button", "privateModeButton", "Help");
        helpToggle.type = "button";
        helpToggle.setAttribute("aria-pressed", "false");
        helpToggle.addEventListener("click", function () {
          var enabled = helpToggle.getAttribute("aria-pressed") !== "true";
          helpToggle.setAttribute("aria-pressed", String(enabled));
          body.dataset.help = String(enabled);
        });
        toolbarBody.appendChild(helpToggle);
        var editToggle = el("button", "privateModeButton", "Edit");
        editToggle.type = "button";
        editToggle.setAttribute("aria-pressed", "false");
        editToggle.addEventListener("click", function () {
          var enabled = editToggle.getAttribute("aria-pressed") !== "true";
          editToggle.setAttribute("aria-pressed", String(enabled));
          body.dataset.editing = String(enabled);
        });
        toolbarBody.appendChild(editToggle);
        body.appendChild(toolbar);

        var clearSection = el("section", "privateClearSection");
        clearSection.appendChild(el("h4", "", book.title));
        renderAnalysis(book, clearSection);
        var passages = buildReadingPassages(book);
        var list = el("div", "privateClearList");
        passages.forEach(function (passage) { list.appendChild(renderPassage(passage)); });
        clearSection.appendChild(list);
        body.appendChild(clearSection);

        var originalSection = el("section", "privateOriginalSection");
        originalSection.appendChild(el("h4", "", book.title + " · exact imported verse lines"));
        var gapSet = {};
        book.sourceGaps.forEach(function (index) { gapSet[index] = true; });
        book.lines.forEach(function (line, index) {
          var lineNode = el("span", "privateVerseLine", line);
          if (gapSet[index]) lineNode.classList.add("privateSourceGap");
          originalSection.appendChild(lineNode);
        });
        body.appendChild(originalSection);
        body.dataset.rendered = "true";
      }

      reading.addEventListener("toggle", function () { if (reading.open) renderBook(); });
      mount.appendChild(reading);
      if (openAfterImport) {
        reading.open = true;
        renderBook();
      }
    }

    function renderAll(openUnitId) {
      unitIds.forEach(function (unitId) { renderMount(unitId, unitId === openUnitId); });
      if (typeof options.onRender === "function") options.onRender(openUnitId);
    }

    var card = el("section", "privateSourceCard");
    card.id = "privateOdysseySource";
    card.appendChild(el("p", "layerLabel", "Your copy"));
    var sourceHeading = el("h3", "", record ? "Available on this device" : "Add your copy once");
    card.appendChild(sourceHeading);

    var status = el("p", "privateSourceStatus");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    card.appendChild(status);
    var sharePairing = el("button", "secondaryLink", "Copy device link");
    sharePairing.type = "button";
    sharePairing.hidden = true;
    card.appendChild(sharePairing);

    var manage = el("details", "privateSourceManage");
    var manageSummary = doc.createElement("summary");
    manageSummary.textContent = "Manage copy";
    manage.appendChild(manageSummary);
    manage.appendChild(el("p", "privateSourcePrivacy", "Import once on one computer. Wisdom encrypts the 24-book source before hosting it; the private device link opens the same copy and reading marker elsewhere. No Wilson text is included in the public site bundle."));

    var actions = el("div", "privateSourceActions");
    var choose = el("button", "primaryLink", "Import all 24 books");
    choose.type = "button";
    var exportBackup = el("button", "secondaryLink", "Export private backup");
    exportBackup.type = "button";
    var restoreBackup = el("button", "secondaryLink", "Restore private backup");
    restoreBackup.type = "button";
    var remove = el("button", "textButton", "Remove local text");
    remove.type = "button";
    var input = doc.createElement("input");
    input.className = "visuallyHidden";
    input.type = "file";
    input.accept = "text/plain,.txt";
    input.tabIndex = -1;
    var backupInput = doc.createElement("input");
    backupInput.className = "visuallyHidden";
    backupInput.type = "file";
    backupInput.accept = "application/json,.json";
    backupInput.tabIndex = -1;
    [choose, exportBackup, restoreBackup, remove, input, backupInput].forEach(function (node) { actions.appendChild(node); });
    manage.appendChild(actions);
    manage.appendChild(el("p", "privateBackupNote", "The device link is the normal way to open this copy elsewhere. The file backup is optional."));
    card.appendChild(manage);

    function renderControls() {
      if (!record) {
        sourceHeading.textContent = "Add your copy once";
        status.textContent = Object.keys(annotations.bookAnalysis).length ? "No source on this device · your private notes are still here." : "Checking your encrypted library…";
        choose.textContent = "Import all 24 books";
        exportBackup.hidden = true;
        remove.hidden = true;
        return;
      }
      sourceHeading.textContent = "Available on this device";
      var report = coverageReport(record);
      status.textContent = record.bookCount + " books · " + report.sentenceCount.toLocaleString() + " passages · " + record.totalLineCount.toLocaleString() + " verse lines";
      choose.textContent = "Replace all 24 books";
      exportBackup.hidden = false;
      remove.hidden = false;
    }
    renderControls();

    choose.addEventListener("click", function () { input.click(); });
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      if (file.size > MAX_SOURCE_CHARS * 4) {
        showToast("That text file is too large");
        input.value = "";
        return;
      }
      var reader = new root.FileReader();
      reader.onload = function () {
        try {
          var candidate = extractOdysseyBooks(String(reader.result || ""));
          var report = coverageReport(candidate);
          if (!report.complete) fail("The Clear layer did not cover every book safely");
          record = saveOdysseyBooks(candidate);
          renderControls();
          renderAll("book-1");
          if (hostedSync) hostedSync.sourceChanged(record);
          showToast("All 24 books saved; encrypted sync is starting");
        } catch (error) {
          showToast(error.message || "Odyssey import failed");
        }
        input.value = "";
      };
      reader.onerror = function () {
        showToast("Could not read that text file");
        input.value = "";
      };
      reader.readAsText(file);
    });

    exportBackup.addEventListener("click", function () {
      if (!record) return;
      try {
        var blob = new root.Blob([createPrivateBackup(record, annotations)], { type: "application/json" });
        var url = root.URL.createObjectURL(blob);
        var link = doc.createElement("a");
        link.href = url;
        link.download = "wisdom-odyssey-private-backup.json";
        doc.body.appendChild(link);
        link.click();
        link.remove();
        root.setTimeout(function () { root.URL.revokeObjectURL(url); }, 0);
        showToast("Private Odyssey backup exported");
      } catch (error) {
        showToast(error.message || "Could not export private backup");
      }
    });
    restoreBackup.addEventListener("click", function () { backupInput.click(); });
    backupInput.addEventListener("change", function () {
      var file = backupInput.files && backupInput.files[0];
      if (!file) return;
      if (file.size > MAX_SOURCE_CHARS * 4) {
        showToast("That backup is too large");
        backupInput.value = "";
        return;
      }
      var reader = new root.FileReader();
      reader.onload = function () {
        try {
          var restored = parsePrivateBackup(String(reader.result || ""));
          saveOdysseyBooks(restored.source);
          saveAnnotations(restored.annotations);
          record = restored.source;
          annotations = restored.annotations;
          renderControls();
          renderAll("book-1");
          if (hostedSync) hostedSync.sourceChanged(record);
          showToast("Private text, analysis, and rewrite edits restored");
        } catch (error) {
          showToast(error.message || "Could not restore that backup");
        }
        backupInput.value = "";
      };
      reader.onerror = function () {
        showToast("Could not read that backup");
        backupInput.value = "";
      };
      reader.readAsText(file);
    });
    remove.addEventListener("click", function () {
      if (!root.confirm("Remove all 24 private Odyssey books from this browser? Your personal analysis will be kept.")) return;
      clearOdysseyBooks();
      if (hostedSync) hostedSync.removeLocal();
      record = null;
      renderControls();
      renderAll(null);
      showToast("Odyssey text removed from this device; personal analysis kept");
    });

    if (root.WisdomOdysseySync) {
      hostedSync = root.WisdomOdysseySync.create({
        sourceApi: root.WisdomPrivateSource,
        onSource: function (restoredSource) {
          record = restoredSource;
          renderControls();
          renderAll(options.activeUnitId ? options.activeUnitId() : null);
          showToast("Odyssey restored from your encrypted library");
        },
        onMarker: function (marker) {
          if (typeof options.onMarker === "function") options.onMarker(marker);
        },
        onStatus: function (value) {
          if (value.message) status.textContent = value.message;
          sharePairing.hidden = !value.canShare;
        }
      });
      sharePairing.addEventListener("click", function () {
        hostedSync.copyDeviceLink().then(function () {
          showToast("Private device link copied");
        }).catch(function (error) {
          showToast(error.message || "Could not copy the private device link");
        });
      });
      hostedSync.start();
    }

    return {
      controlCard: card,
      mount: function (unitId) {
        var mount = el("section", "privateBookMount");
        mounts[unitId] = mount;
        renderMount(unitId, false);
        return mount;
      },
      saveMarker: function (marker) {
        return hostedSync ? hostedSync.saveMarker(marker) : false;
      }
    };
  }

  root.WisdomPrivateSource = {
    STORAGE_KEY: STORAGE_KEY,
    PREVIOUS_STORAGE_KEY: PREVIOUS_STORAGE_KEY,
    LEGACY_BOOK_ONE_KEY: LEGACY_BOOK_ONE_KEY,
    ANNOTATIONS_KEY: ANNOTATIONS_KEY,
    MAX_SOURCE_CHARS: MAX_SOURCE_CHARS,
    BOOK_TITLES: BOOK_TITLES.slice(),
    TERM_GLOSSES: TERM_GLOSSES.map(function (entry) { return entry.slice(); }),
    extractOdysseyBooks: extractOdysseyBooks,
    loadOdysseyBooks: loadOdysseyBooks,
    saveOdysseyBooks: saveOdysseyBooks,
    clearOdysseyBooks: clearOdysseyBooks,
    emptyAnnotations: emptyAnnotations,
    loadAnnotations: loadAnnotations,
    saveAnnotations: saveAnnotations,
    normalizedBookText: normalizedBookText,
    buildReadingUnits: buildReadingUnits,
    buildReadingPassages: buildReadingPassages,
    coverageReport: coverageReport,
    createPrivateBackup: createPrivateBackup,
    parsePrivateBackup: parsePrivateBackup,
    createOdysseyBookController: createOdysseyBookController
  };
})(typeof window !== "undefined" ? window : globalThis);
