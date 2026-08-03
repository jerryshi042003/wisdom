// Hand-authored editorial layer. Population and concentration numbers are NOT
// stored here — they are read from stats.json (ACS 2020–2024 5-year) at runtime,
// so the prose can never drift from the data it describes.
//
// Each `spots` entry must state a *checkable* reason. "Popular" and "highly
// rated" are not reasons. The fields are deliberately narrow:
//   why    — the single specific thing this place does that its competitors do not
//   proof  — how you would verify that claim without trusting anyone's stars
//   since  — year established, where known (longevity is evidence, not proof)
//   new    — true only for places open <= ~2 years that already clear the bar

export const NEIGHBORHOOD = {
  "90005": "Koreatown", "90020": "Wilshire Center / Koreatown",
  "90006": "Pico-Union / Koreatown", "90019": "Arlington Heights / Mid-City",
  "90004": "Virgil Village / Koreatown North", "90010": "Wilshire Center",
  "90057": "Westlake / MacArthur Park", "90026": "Echo Park",
  "90027": "Los Feliz / Thai Town", "90029": "East Hollywood / Little Armenia",
  "90028": "Hollywood", "90036": "Fairfax / Little Ethiopia",
  "90035": "Pico-Robertson", "90048": "Beverly Grove",
  "90024": "Westwood", "90025": "West L.A. / Sawtelle",
  "90064": "West L.A.", "90034": "Palms", "90066": "Mar Vista",
  "90008": "Baldwin Hills / Leimert Park", "90043": "Hyde Park / View Park",
  "90047": "Vermont Knolls", "90044": "Vermont-Slauson",
  "90037": "Exposition Park", "90011": "Historic South Central",
  "90003": "South Los Angeles", "90016": "West Adams",
  "90018": "Jefferson Park", "90007": "University Park / USC",
  "90033": "Boyle Heights / Lincoln Heights", "90063": "City Terrace",
  "90023": "Boyle Heights", "90031": "Lincoln Heights", "90032": "El Sereno",
  "90042": "Highland Park", "90041": "Eagle Rock", "90065": "Glassell Park",
  "90012": "Chinatown / Little Tokyo", "90013": "Downtown",
  "90017": "Westlake / Downtown", "90021": "Arts District",
  "90046": "West Hollywood / Hollywood Hills", "90049": "Brentwood",
  "90210": "Beverly Hills", "90230": "Culver City",
  "91331": "Pacoima", "91342": "Sylmar", "91340": "San Fernando",
  "91405": "Van Nuys", "91402": "Panorama City", "91352": "Sun Valley",
  "91042": "Tujunga", "91344": "Granada Hills", "91367": "Woodland Hills",
  "91316": "Encino", "91356": "Tarzana", "91436": "Encino Hills",
  "91423": "Sherman Oaks", "91604": "Studio City", "91607": "Valley Village",
  "90502": "West Carson", "90247": "Gardena", "90248": "Gardena",
  "90503": "Torrance (west)", "90504": "North Torrance",
  "90505": "South Torrance", "90501": "Old Torrance",
  "90805": "North Long Beach", "90813": "Central Long Beach / Cambodia Town",
  "90806": "Long Beach (Wrigley)", "90804": "East Long Beach",
  "90810": "West Long Beach", "90745": "Carson", "90746": "Carson (north)",
  "91770": "Rosemead", "91801": "Alhambra", "91803": "Alhambra (south)",
  "91748": "Rowland Heights", "91789": "Walnut", "91776": "San Gabriel",
  "91780": "Temple City", "91755": "Monterey Park (east)",
  "91754": "Monterey Park", "91765": "Diamond Bar",
  "91006": "Arcadia", "91007": "Arcadia (south)",
  "91732": "El Monte", "91733": "South El Monte",
  "91745": "Hacienda Heights", "91744": "La Puente", "91792": "West Covina",
  "91205": "Glendale (south)", "91206": "Glendale (east)",
  "91201": "Glendale (Grand Central)", "91202": "Glendale (northwest)",
  "91203": "Downtown Glendale", "91204": "Glendale (Tropico)",
  "91208": "Glendale (Verdugo Woodlands)", "91214": "La Crescenta",
  "90280": "South Gate", "90201": "Bell Gardens", "90255": "Huntington Park",
  "90022": "East Los Angeles", "90650": "Norwalk", "90220": "Compton",
  "90250": "Hawthorne", "90701": "Artesia", "90703": "Cerritos",
  "90715": "Lakewood", "90638": "La Mirada", "91381": "Stevenson Ranch",
  "92683": "Westminster", "92843": "Garden Grove (west)",
  "92840": "Garden Grove", "92844": "Garden Grove (south)",
  "92845": "Garden Grove (Stanton edge)", "92708": "Fountain Valley",
  "92703": "Santa Ana (west)", "92704": "Santa Ana (south)",
  "92804": "Anaheim (west) / Little Arabia", "92802": "Anaheim (south)",
  "92833": "Fullerton (west)", "90621": "Buena Park", "90630": "Cypress",
  "92620": "Irvine (Northwood)", "92618": "Irvine (Woodbridge)",
  "92602": "Irvine (Tustin Ranch)", "92612": "Irvine (University)"
};

export const COMMUNITIES = [
  {
    key: "mexican", name: "Mexican", tone: "#B2432E",
    endonym: "mexicano/a",
    gate: "scale + place (majority rule)",
    region: "The Eastside and the southeast corridor",
    regionNote:
      "This is the one community the concentration test could not measure the normal way. " +
      "At roughly a third of the county, a Mexican ZIP code cannot be three times the county " +
      "average — that would require more than 100% of its residents. It qualifies on the " +
      "majority rule instead, and it clears it by a mile: East Los Angeles (90022) is 87% " +
      "Mexican, South Gate 79%, Huntington Park 77%. Fifty-five ZIP codes pass. No other " +
      "group in this atlas passes more than 24.",
    districts: [
      { name: "East Los Angeles", z: "90022" },
      { name: "Boyle Heights", z: "90033" },
      { name: "Huntington Park / South Gate", z: "90255" },
      { name: "Pacoima / Sylmar", z: "91331" }
    ],
    subnote:
      "Inside this number are communities the census does not separate. The Zapotec and Mixtec " +
      "population from Oaxaca — 'Oaxacalifornia' — is concentrated in Koreatown, Pico-Union and " +
      "mid-Wilshire, not on the Eastside, and it has its own restaurants, brass bands and " +
      "basketball tournaments. It is a distinct culture wearing a census category's clothes.",
    spots: [
      {
        source: "found",
        name: "Birrieria Chalio", place: "Boyle Heights / East L.A. \u00b7 3580 E 1st St",
        slot: "dish",
        z: "90063", img: "carnitas", dish: "Goat birria",
        cosign: "Anthony Bourdain ate here on No Reservations in 2007, in a booth with three mariachis, over a plate of roasted goat birria.",
        why: "Roasted goat birria on a four-generation recipe, from a family that started as a street stand in the 1980s and took a building in 1987. They go through roughly 10,000 lb of goat every three days and will sell you any cut \u2014 or the whole animal.",
        proof: "Ask for a part most places do not offer. A kitchen butchering at that volume can hand you the head, the ribs or the whole thing; a birria shop buying pre-cooked meat can only give you \u201cbirria\u201d. Then judge the consom\u00e9 on its own, without a tortilla.",
        since: 1987,
        checked: "2026-08"
      },
      {
        name: "Mariscos Jalisco", place: "Boyle Heights · 3040 E Olympic Blvd (truck)",
        slot: "dish",
        z: "90023", img: "taco-camaron", dish: "Taco de camarón",
        why: "One dish, done to a standard nobody has matched in twenty years: the taco de camarón — a corn tortilla filled with shrimp, folded and deep-fried, then topped with avocado and a thin tomato salsa. Raúl Ortega brought the format from Nayarit and it is now copied across the county.",
        proof: "Judge it on the shell: it must shatter, not bend, and the tortilla has to be fried to order. If there is a tray of pre-fried tacos waiting, you are not at the original.",
        since: 2001
      },
      {
        name: "Carnitas El Momo", place: "Boyle Heights · 2411 Fairmount St (10.30am–4.30pm)",
        slot: "dish",
        z: "90033", img: "carnitas", dish: "Carnitas",
        why: "Michoacán carnitas cooked in a copper cazo over live fire, whole animal, with the cuts kept separate — buche, cuerito, nana, surtido — instead of shredded into one anonymous pile.",
        proof: "Ask for surtido. A kitchen that can name and portion five distinct cuts is butchering whole hogs; one that only offers 'carnitas' is not.",
        since: 2011
      },
      {
        name: "La Casita Mexicana", place: "Bell · 4030 E Gage Ave",
        slot: "occasion",
        z: "90201", img: "mole-poblano", dish: "Mole poblano",
        why: "Ramiro Arvizu and Jaime Martín del Campo cook the labor-intensive interior repertoire — mole poblano, chiles en nogada in season, cochinita pibil — in a working-class suburb rather than a downtown dining room.",
        proof: "Moles are a labor tell. Count the distinct moles on the menu and ask which are made in-house; jarred mole tastes of chocolate and little else.",
        since: 1999
      },
      {
        name: "Holbox", place: "Historic South Central · Mercado La Paloma, 3655 S Grand Ave",
        slot: "occasion",
        z: "90007", img: "aguachile", dish: "Aguachile / tostadas",
        why: "Yucatecan seafood — Gilberto Cetina's kanpachi tostadas, octopus, and the pescado zarandeado — run out of a stall in a community food hall, not a restaurant.",
        proof: "It holds a Michelin star while operating from a counter with plastic trays. That combination is the argument: the accolade attached to the cooking, not the room.",
        since: 2017
      },
      {
        name: "Tire Shop Taqueria", place: "South Central · 4077 S Avalon Blvd (evenings)", checked: "2026-08",
        z: "90011", img: "asada", dish: "Tijuana-style asada",
        slot: "value",
        why: "A taqueria that grills in the lot of a working tire shop and is repeatedly named the best Tijuana-style asada in the city by people who eat tacos for a living. At LA TACO\u2019s Taco Madness it drew the flat verdict: \u201cThis is what a taco is about. No notes.\u201d",
        proof: "Asada with nothing to hide behind \u2014 no birria, no novelty. Judge the char on the beef and the tortilla, which is the whole dish.",
        since: null
      },
      {
        name: "Casa Del Tarasco", place: "South Park · 56th at Paloma (weekends only)", checked: "2026-08",
        z: "90011", img: "carnitas-michoacan", dish: "Michoacán carnitas, mixtas",
        slot: "dish",
        why: "A home kitchen that sells Michoacán carnitas out of a South Central house on weekends. Not a restaurant, not a truck \u2014 a family cooking one thing two days a week, with handmade tortillas.",
        proof: "Order mixtas so you get several cuts. And note the format: a weekend home kitchen is the deepest end of this city\u2019s food economy, and it is where the cooking is least compromised.",
        since: null
      },
      {
        name: "La Azteca Tortilleria", place: "East L.A. · 4538 E César E Chávez Ave",
        z: "90022", img: "tortilleria", dish: "Flour tortillas, chile relleno burrito",
        slot: "market",
        why: "A tortilleria first: they make the flour tortillas on site, and the chile relleno burrito wrapped in one is widely held to be the best flour-tortilla burrito in Los Angeles.",
        proof: "Buy a dozen tortillas to take home, warm, and judge them on their own. A tortilleria that sells to households is the supply chain, not a restaurant.",
        since: 1950
      },
      {
        name: "Komal", place: "Historic South Central · Mercado La Paloma, 3655 S Grand Ave",
        slot: "new",
        z: "90007", img: "nixtamal-tortilla", dish: "Masa from heirloom corn",
        why: "Fátima Juárez and Conrado Rivera nixtamalize and grind a dozen-plus heirloom corn varieties on site at their own molino, then build the antojitos on that masa. Almost every 'handmade tortilla' in Los Angeles starts from bagged masa harina; this one does not.",
        proof: "Ask which corn variety and which state in Mexico it came from. A real molino answers with both. The corroboration is unusually strong for a stall: Michelin Bib Gourmand, and Juárez a 2026 James Beard semifinalist for Emerging Chef.",
        new: true
      }
    ]
  },

  {
    key: "blacknh", name: "Black Los Angeles", tone: "#7A4B9C",
    endonym: "Black American",
    gate: "scale + place",
    region: "The Crenshaw corridor, Leimert Park, Baldwin Hills, Inglewood, Compton, Carson",
    regionNote:
      "Eighteen ZIP codes qualify, and the core of them are among the few places in Los Angeles " +
      "where a single community is an outright majority: 90008 (Baldwin Hills/Leimert Park) is " +
      "60%, 90746 (north Carson) 58%, 90043 (Hyde Park/View Park) 55%. This is also the only " +
      "region in the atlas whose shape was drawn by law — racially restrictive covenants and " +
      "redlining fixed its boundaries long before anyone chose to live inside them.",
    districts: [
      { name: "Leimert Park Village", z: "90008" },
      { name: "Hyde Park / View Park", z: "90043" },
      { name: "Vermont Knolls", z: "90047" },
      { name: "Carson", z: "90746" }
    ],
    subnote:
      "Leimert Park is the cultural centre rather than the population centre: the World Stage " +
      "(founded by drummer Billy Higgins and poet Kamau Daáood) and the surrounding blocks are " +
      "the reason people drive here from the whole basin.",
    spots: [
      {
        source: "curator",
        via: { who: "Roy Choi", handle: "Broken Bread (KCET/Tastemade, PBS SoCal)", cred: "his own LA series, about other people\u2019s food rather than his restaurants \u2014 two seasons, award-winning", when: "season 1" },
        name: "S\u00dcPRMARKT", place: "Hyde Park \u00b7 3256 W Slauson Ave",
        slot: "market",
        z: "90043", img: "smoothie", dish: "Affordable organic produce",
        cosign: "Roy Choi profiled founder Olympia Auset on Broken Bread. She started it because getting groceries meant a two-hour bus round trip.",
        why: "An organic grocery built specifically for South L.A., in a part of the county where the nearest full produce section can be a bus transfer away. It began as a weekly Leimert Park pop-up in 2016 and took a building on Slauson.",
        proof: "Compare the produce prices against a Westside organic market rather than against the corner store. Undercutting the Westside on organics in 90043 is the entire claim, and it is checkable in about a minute.",
        since: 2016,
        checked: "2026-08"
      },
      {
        name: "Harold & Belle's", place: "Jefferson Park · 2920 W Jefferson Blvd",
        slot: "occasion",
        z: "90018", img: "gumbo", dish: "Creole gumbo",
        why: "Creole, not generic soul food — gumbo, étouffée, and a distinction between the two that most kitchens blur. Family-run and specific to the Louisiana migration that built this part of the city.",
        proof: "Taste the roux. A Creole gumbo is built on a dark roux made in-house; if it arrives thin and tomato-forward, it is a stew wearing the name.",
        since: 1969
      },
      {
        name: "Tam's Burgers No. 21", place: "Compton · 1246 W Rosecrans Ave",
        z: "90222", img: "tams", dish: "Bacon cheeseburger",
        slot: "value",
        cosign: "Kendrick Lamar, Complex, 2012: \u201cEverybody loves In-N-Out, but it\u2019s a very clean-cut burger. Tam\u2019s is street-sloppy, burgers and shakes. It\u2019s a chain, but it\u2019s still hood.\u201d",
        why: "A Compton burger stand on Rosecrans that Kendrick Lamar has named since 2012 and then put in the \u201cNot Like Us\u201d video. Muralist Mike Norice painted him on the wall afterwards; business rose 30\u201340%, and the owner gave him a lifetime free pass.",
        proof: "This is the rare case where the endorsement is the documented fact \u2014 an interview quote, a video, a mural, a sales figure. Order the bacon cheeseburger he named and judge it as a burger; \u201cstreet-sloppy\u201d was his description, not a criticism.",
        since: null
      },
      {
        name: "Hilltop Coffee + Kitchen", place: "Inglewood · 4427 W Slauson Ave",
        z: "90043", img: "hilltop", dish: "Coffee, breakfast",
        slot: "sweet",
        cosign: "Issa Rae is a co-owner, not a customer \u2014 she grew up in Inglewood and opened it with local entrepreneurs Ajay Relan and Yonnie Hagos.",
        why: "A coffee shop built as neighbourhood infrastructure rather than as an amenity that arrived with new money: Black-owned, Inglewood-founded in 2018, and busy with people working in it all day.",
        proof: "Ownership is the evidence. An outside operator opening on Slauson is a different thing from three people from the neighbourhood opening on Slauson, and the room reflects which one it is.",
        since: 2018
      },
      {
        source: "jerry", name: "Dulan's on Crenshaw", place: "Crenshaw · 4859 Crenshaw Blvd",
        slot: "everyday",
        z: "90043", img: "soul-food-plate", dish: "Fried chicken plate",
        why: "The Dulan family's cafeteria line is the closest thing the corridor has to a civic institution — measured by whether the same dishes are right every single day, which is harder than being right once. Greg Dulan closed and reopened it rather than let the corridor lose it.",
        proof: "Go on a weekday at 1pm and look at who is in line. This is a consistency test, not a destination test.",
        since: 1975
      },
      {
        name: "Hawkins House of Burgers", place: "Watts · 11603 Slater St",
        slot: "value",
        z: "90059", img: "burger", dish: "Charcoal burger",
        why: "A charcoal-grilled burger counter the Hawkins family has run in Watts since 1939, now by Cynthia Hawkins. Eighty-seven years in one neighbourhood, through everything that happened to it, is the qualification.",
        proof: "Order the Whipper. It is large enough to be a stunt and is not one — judge whether the patty is actually griddled to order and the bacon actually cooked, which is where volume shops fail.",
        since: 1939
      },
      {
        name: "The World Stage", place: "Leimert Park · 4321 Degnan Blvd",
        slot: "civic",
        z: "90008", img: "jazz", dish: "Live jazz workshop",
        why: "Not a restaurant. A performance and workshop space for jazz — founded by Billy Higgins, one of the most recorded drummers in the music — that has run open workshops for three decades.",
        proof: "Attend a Thursday workshop rather than a ticketed show. The workshops are the institution; the shows are the output.",
        since: 1989
      },
      {
        source: "jerry", name: "Simply Wholesome", place: "View Park · 4508 W Slauson Ave",
        z: "90043", img: "smoothie", dish: "Patties, smoothies, veggie plates",
        slot: "everyday",
        why: "Percell Keeling has run this since 1984 out of the Wich Stand — a preserved 1957 Googie drive-in with a 35-foot spire — in View Park, the largest African American National Register historic district in the country. Health food, Caribbean-leaning, and a neighbourhood fixture for four decades.",
        proof: "The building is the evidence: a landmarked mid-century drive-in kept in continuous Black ownership as a health-food business, in a 74%-Black neighbourhood. Nothing else in Los Angeles is that.",
        since: 1984
      },
      {
        source: "jerry", name: "Stevie's Creole Café", place: "Mid-City · 5545 W Pico Blvd",
        z: "90019", img: "gumbo-dark", dish: "Seafood gumbo",
        slot: "dish",
        why: "Jonathan Gold called the gumbo here \u201cthe best gumbo this side of New Orleans.\u201d Stephen Perry opened Stevie\u2019s on the Strip at Crenshaw and Jefferson in 1986; his daughters grew up in the business and run it now.",
        proof: "The gumbo should be dark and thick enough to coat the spoon, with andouille, shrimp, chicken and crab in the same bowl. If it is thin or tomato-red, it is not this.",
        since: 1986
      },
      {
        name: "StormBurger", place: "Inglewood · 1116 S La Brea Ave",
        z: "90301", img: "smashburger", dish: "Double classic, under $10",
        slot: "value",
        why: "Scratch-made, heavy-crust smashburger in Inglewood at a price nothing else touches. It won a reader-built \u201cbest burgers under $10\u201d bracket on r/FoodLosAngeles whose stated rule was to exclude anything already on a best-of list or a TikTok reel.",
        proof: "The selection method is the point: a list assembled specifically to avoid places that were already famous. Order the double and judge the crust, which is where a scratch patty shows.",
        since: null
      },
      {
        source: "jerry", name: "Ackee Bamboo", place: "Leimert Park · 4305 Degnan Blvd",
        z: "90008", img: "oxtail", dish: "Oxtail, curry goat, ackee and saltfish",
        slot: "occasion",
        why: "Jamaican, not soul food \u2014 the Wright family have cooked oxtail, curry goat and ackee and saltfish on Degnan for nearly two decades, in the same block as the World Stage.",
        proof: "Ackee and saltfish is the test: it is Jamaica\u2019s national dish, it is fiddly, and kitchens cooking for a general audience quietly leave it off. Note the census caveat \u2014 Jamaican Los Angeles is about 15,000 people and does not clear this atlas\u2019s gates, so this sits inside Black Los Angeles rather than as its own region.",
        since: 2005
      },
      {
        name: "Alta West Adams", place: "West Adams \u00b7 5359 W Adams Blvd",
        slot: "occasion",
        z: "90016", img: "collard-greens", dish: "Oxtails, greens, fried chicken",
        why: "Keith Corbin cooks the Great Migration repertoire \u2014 oxtails, greens, red beans \u2014 as a working California restaurant rather than a heritage re-enactment, with West African and Californian technique folded in where it earns its place.",
        proof: "Order the oxtails and taste the braise: soy, ginger and miso are in there, which is the argument the kitchen is making. A soul-food menu that never moves is preserving a format; this one cooks.",
        since: 2018,
        checked: "2026-08"
      }
    ]
  },

  {
    key: "salvadoran", name: "Salvadoran", tone: "#2E7D8F",
    endonym: "salvadoreño/a, guanaco/a",
    gate: "scale + place",
    region: "Westlake, Pico-Union, South Los Angeles, Van Nuys",
    regionNote:
      "Los Angeles holds the largest Salvadoran population of any city outside El Salvador. " +
      "Seven ZIP codes qualify and they split into two clusters: the historic Westlake/Pico-Union " +
      "core, where the wartime migration of the 1980s landed, and a second, newer concentration " +
      "in the east San Fernando Valley around Van Nuys and Panorama City.",
    districts: [
      { name: "Westlake / MacArthur Park", z: "90057" },
      { name: "Vermont-Slauson", z: "90044" },
      { name: "Exposition Park", z: "90037" },
      { name: "Van Nuys", z: "91405" }
    ],
    spots: [
      {
        name: "Deliciosas Pupusas", place: "El Sereno · 5509 Alhambra Ave, inside the car wash", checked: "2026-08",
        z: "90032", img: "pupusa-carwash", dish: "Pupusas, $3, made to order",
        slot: "value",
        why: "A pupuseria operating inside a working car wash. Three dollars each, made to order, cash or Zelle. This is the format most of Salvadoran Los Angeles actually eats in and almost none of it appears on a list.",
        proof: "The location is the proof. Nobody sets up in a car wash bay to attract a food crowd; they set up there because it is cheap and the neighbourhood is already walking past.",
        since: null
      },
      {
        name: "Sarita's Pupusería", place: "Downtown · Grand Central Market, 317 S Broadway",
        slot: "dish",
        z: "90013", img: "pupusa", dish: "Pupusas with loroco",
        why: "Sara Clark presses pupusas to order from family recipes, across dozens of fillings including loroco — the edible flower bud that marks a Salvadoran kitchen rather than a generic Central American one — plus yuca con chicharrón and the stews.",
        proof: "If loroco is not on the board, the kitchen is cooking to an American palate. Then check the curtido: it should be sharp and fermented, not fresh-shredded cabbage.",
        since: 2004
      },
      {
        name: "Liborio Markets", place: "Westlake · 864 S Vermont Ave",
        z: "90005", img: "latmarket", dish: "The market",
        slot: "market",
        why: "A Central American grocery rather than a Mexican one \u2014 Salvadoran crema and queso duro, loroco, plantains, and the masa for pupusas, sold to people making them at home.",
        proof: "Look for loroco and queso duro blando in the refrigerated case. A market stocking those is supplying Salvadoran kitchens specifically.",
        since: null
      },
      {
        name: "El Mercadito Salvadoreño", place: "Koreatown · Two Guys Plaza, 3006 W 8th St",
        slot: "value",
        z: "90005", img: "curtido", dish: "Curtido and pupusas",
        why: "A cluster of separate vendors inside one plaza rather than a single restaurant — the closest thing in the city to a Salvadoran market food court, which means specialists instead of one kitchen covering everything.",
        proof: "Count the stalls. Specialisation is the signal: one vendor for pupusas, another for mariscos, another for pan dulce.",
        since: null
      }
    ]
  },

  {
    key: "chinese", name: "Chinese", tone: "#C1462F",
    endonym: "華人 / 华人",
    gate: "scale + place",
    region: "The San Gabriel Valley",
    regionNote:
      "Twenty-two ZIP codes qualify, and they form one continuous belt running east from " +
      "Alhambra through Monterey Park, San Gabriel, Rosemead and Temple City out to Hacienda " +
      "Heights, Rowland Heights, Walnut and Diamond Bar. Monterey Park's 91755 is 53% Chinese. " +
      "This is not a Chinatown: it is a suburban region of roughly half a million people, the " +
      "first place in the mainland United States where Chinese immigrants settled directly into " +
      "middle-class suburbs rather than an inner-city enclave.",
    districts: [
      { name: "Monterey Park", z: "91755" },
      { name: "Alhambra", z: "91801" },
      { name: "San Gabriel", z: "91776" },
      { name: "Rowland Heights", z: "91748" }
    ],
    subnote:
      "Taiwanese is counted separately by the census and qualifies on its own: about 41,600 in " +
      "the county, concentrated a few miles north in Arcadia and Temple City — the reason SGV " +
      "Taiwanese breakfast is a distinct thing from SGV Chinese breakfast.",
    spots: [
      {
        source: "friend", who: "Kevin Wang",
        name: "Seoraksan Charcoal BBQ", place: "Monterey Park \u00b7 1790 W Garvey Ave #A, Casuda Canyon Plaza",
        slot: "value",
        z: "91754", img: "galbi", dish: "\u4e1c\u5317 charcoal barbecue, all you can eat",
        cosign: "Kevin Wang, who named it as the only all-you-can-eat barbecue he knows in that area.",
        why: "Read the name and you expect Korean; the grill is actually Dongbei \u2014 northeastern Chinese \u2014 which is a different tradition that happens to share charcoal and cut meat. That is the reason to go, and it is why it gets filed under Chinese here rather than Korean.",
        proof: "Look for the tells that separate Dongbei from Korean barbecue: cumin and chilli dry-rub rather than a soy-sugar marinade, skewers alongside the grill, and the cold dressed vegetables (\u5c0f\u62cc\u83dc) instead of a banchan spread.",
        since: null,
        checked: "2026-08"
      },
      {
        source: "curator",
        via: { who: "David R. Chan", handle: "@chandavkl", cred: "8,000+ Chinese restaurants logged in a spreadsheet since the 1970s; has a Wikipedia page for it", when: "31 July 2026" },
        name: "New Feitengyuxiang", place: "San Gabriel \u00b7 newly opened",
        slot: "new",
        z: "91776", img: "shuizhuyu", dish: "Sichuan boiling fish",
        cosign: "David R. Chan, 31 July 2026: \u201can awesomely decorated Sichuan boiled fish specialist that just opened in San Gabriel \u2026 besides the boiling fish dishes they serve drypots with other kinds of meat, including live bullfrog.\u201d",
        why: "A boiling-fish specialist rather than a Sichuan restaurant with boiling fish on the menu \u2014 the distinction the SGV rewards. It is the first branch of an award-decorated mainland chain, which is why it is \u201cNew\u201d.",
        proof: "Order the fish and check that it arrives in the pot still boiling, and that you chose the fish. A specialist fillets to order; a generalist ladles from a batch.",
        new: true,
        since: 2026,
        checked: "2026-08"
      },
      {
        source: "curator",
        via: { who: "David R. Chan", handle: "@chandavkl", cred: "8,000+ Chinese restaurants logged in a spreadsheet since the 1970s; has a Wikipedia page for it", when: "2 August 2026" },
        name: "Mian, Sawtelle", place: "Sawtelle Japantown \u00b7 replacing Dong Ting Hunan",
        slot: "new",
        z: "90025", img: "biangbiang", dish: "Chongqing noodles",
        cosign: "David R. Chan, 2 August 2026, on the new branch \u2014 and on a Sawtelle he had not walked in two years: \u201cthere are so many new businesses there.\u201d",
        why: "Chongqing noodles from the Sichuan Impression group, opened on the west side rather than in the San Gabriel Valley \u2014 which is the whole point if you are not driving east for dinner.",
        proof: "Judge it against the Alhambra original on the same bowl, not on the room. A branch that holds the numbing heat at distance from the commissary is cooking; one that softens it for the neighbourhood is not.",
        new: true,
        since: 2026,
        checked: "2026-08"
      },
      {
        source: "jerry",
        name: "99 Ranch Market, Harbor Gateway", place: "Harbor Gateway \u00b7 Western Ave at 190th",
        slot: "everyday",
        z: "90501", img: "cgrocery", dish: "Hot counter, by the item",
        jerryOrder: "Shumai, or a la carte: rice plus a vegetable plus pork, fish or a Chinese green.",
        why: "The South Bay branch is the closest a Chinese hot-food counter gets to Jerry\u2019s side of the county \u2014 twenty-plus miles from the San Gabriel Valley \u2014 and it is priced by the item, so a full plate of rice, a green and a protein stays cheap.",
        proof: "Buy by the item rather than the combo and watch the turnover at the steam table. A counter feeding a full grocery replaces trays constantly; one feeding a lunch rush only is coasting by 2pm.",
        since: null,
        checked: "2026-08"
      },
      {
        source: "friend", who: "Kevin Wang",
        name: "Array 36", place: "San Gabriel \u00b7 the high end of the SGV",
        slot: "occasion",
        z: "91776", img: "shuizhuyu", dish: "Tasting-menu Chinese",
        why: "The one recent San Gabriel Valley opening operating at Bistro Na\u2019s price and ambition, and the SGV\u2019s live contender to bring a Michelin star back to Chinese cooking in Los Angeles \u2014 a thing the county has not had since 2022.",
        proof: "This is the top of the market, so judge it as such: ask what is sourced live and what is cooked to order. At this price the answer should be most of it.",
        since: 2024,
        checked: "2026-08"
      },
      {
        source: "friend", who: "Kevin Wang",
        name: "Bistro Na\u2019s", place: "Temple City \u00b7 9055 E Las Tunas Dr #105",
        slot: "occasion",
        z: "91780", img: "biangbiang", dish: "Imperial Beijing cuisine",
        why: "Imperial-court Beijing cooking \u2014 a restrained, technique-led register almost nothing else in the county attempts. It held a Michelin star until December 2022 and was, while it had one, the only starred Chinese restaurant in Los Angeles.",
        proof: "Order something that is plainly about knife work or stock rather than heat and chilli. Imperial cooking is judged on precision; if the kitchen can only do bold, it is cooking a different cuisine under the name.",
        since: 2017,
        checked: "2026-08"
      },
      {
        source: "friend", who: "Kevin Wang",
        name: "Grab a Crab", place: "Monterey Park & Hacienda Heights",
        slot: "everyday",
        z: "91754", img: "lobster", dish: "Cajun seafood boil",
        cosign: "Kevin Wang, direct: \u201cgrab a crab is better than boiling crab.\u201d",
        why: "A Cajun boil built for the SGV rather than imported into it \u2014 you pick seafood, seasoning and heat separately instead of taking a house blend, which is the whole difference from the chain it is usually compared to.",
        proof: "Order the same shellfish at two heat levels. A kitchen mixing sauce per order can actually deliver the gap; one ladling from a single pot cannot.",
        since: null,
        checked: "2026-08"
      },
      {
        name: "Sea Harbour", place: "Rosemead · 3939 Rosemead Blvd",
        slot: "occasion",
        z: "91770", img: "har-gow", dish: "Har gow, steamed to order",
        why: "Hong Kong-style dim sum ordered from a paper sheet, not a cart — which means each item is steamed on demand. The seafood-forward items (scallop dumplings, crab claw) are the reason to come.",
        proof: "Carts mean food that has been circulating. A written order sheet and a wait for har gow is the quality signal, and it is visible before you order anything. Michelin Guide listed.",
        since: 2003
      },
      {
        name: "Chengdu Taste", place: "Alhambra · 828 W Valley Blvd",
        slot: "dish",
        z: "91803", img: "shuizhuyu", dish: "Boiled fish in chilli oil",
        why: "The restaurant that reset Sichuan cooking in Los Angeles in 2013 — toothpick lamb, boiled fish in chili oil, and a willingness to serve real málà rather than a dialled-back version.",
        proof: "Order the toothpick lamb. The cumin and the numbing peppercorn should both be present; if the dish is only hot, the Sichuan peppercorn is stale or absent.",
        since: 2013
      },
      {
        name: "Newport Seafood", place: "San Gabriel · 518 W Las Tunas Dr",
        slot: "occasion",
        z: "91776", img: "lobster", dish: "House special lobster",
        why: "The 'house special lobster' — a Chinese-Vietnamese-Chiu Chow dish of wok-fried lobster with garlic, jalapeño, butter and black pepper — invented in this restaurant's own lineage and now copied region-wide.",
        proof: "This is a rare case where the dish's origin is local and traceable. Every 'house special lobster' elsewhere in the SGV is downstream of it.",
        since: 1991
      },
      {
        source: "jerry", name: "Tasty Choice \u7f8e\u5473\u5c4b", place: "San Gabriel · 200 S San Gabriel Blvd (8am\u20132am, closed Mon)",
        z: "91776", img: "chachaanteng", dish: "Hong Kong café, to 2am",
        slot: "late",
        why: "A Hong Kong-style cha chaan teng running from 8am to 2am since 1998 \u2014 Hainan chicken, baked rice, curry beef stew, macaroni soup. The cha chaan teng is a specific institution: a Hong Kong diner built for shift workers and long hours, and this is the San Gabriel Valley\u2019s version of it.",
        proof: "Go after midnight. The whole point of a cha chaan teng is that it is open when nothing else is, and a room full of people at 1am is the format working as intended.",
        since: 1998
      },
      {
        name: "Huge Tree Pastry", place: "Monterey Park · 423 N Atlantic Blvd (7am–3pm, closed Wed)",
        slot: "everyday",
        z: "91754", img: "dan-bing", dish: "Taiwanese breakfast",
        why: "Taiwanese breakfast: dan bing, fan tuan, savoury soy milk (xian dou jiang), fried crullers. A meal category, not a menu section — and a distinct cuisine from the Chinese kitchens around it.",
        proof: "Xian dou jiang is the test. It must be curdled at the table by hot soy milk hitting vinegar; if it arrives already set, it was made in a batch.",
        since: 1996
      },
      {
        name: "Meet Qin Noodle", place: "Alhambra · 108 W Main St",
        z: "91801", img: "biangbiang", dish: "Shaanxi hand-pulled noodles",
        slot: "value",
        why: "Shaanxi noodles \u2014 hand-pulled, wide, with cumin lamb or the cold liangpi \u2014 in a small Main Street room. It is the name that keeps coming up on Food Talk Central\u2019s long-running \u201cunder the radar SGV\u201d thread, whose posters had already exhausted the famous places.",
        proof: "Watch the noodles being pulled. Shaanxi noodles are made to order or they are not Shaanxi noodles, and the width should be irregular.",
        since: null
      },
      {
        name: "99 Ranch Market", place: "San Gabriel · 140 W Valley Blvd",
        z: "91776", img: "cgrocery", dish: "The market",
        slot: "market",
        why: "The anchor grocery of the San Gabriel Valley: live tanks, a full butcher, and the regional pantry goods that let half a million people cook at home rather than eat out.",
        proof: "The live seafood tanks. A market that sells fish still swimming is stocking for cooks, and the rest of the store follows from that.",
        since: null
      },
      {
        name: "Sichuan Impression", place: "Alhambra · 1900 W Valley Blvd",
        slot: "dish",
        z: "91803", img: "sichuan-cold", dish: "Sichuan cold dishes",
        why: "Offal, cold dishes and regional Sichuan specificity — the parts of the cuisine that most American Sichuan restaurants quietly drop.",
        proof: "Look for the cold appetiser section and whether it includes tripe, tongue or rabbit. That section is the honest measure of who the restaurant is cooking for.",
        since: 2014
      }
    ]
  },

  {
    key: "filipino", name: "Filipino", tone: "#1F7A5C",
    endonym: "Pilipino/a",
    gate: "scale + place",
    region: "Carson, Historic Filipinotown, West Covina, Eagle Rock, Cerritos",
    regionNote:
      "The third-largest community in the county by population, and the one whose map looks " +
      "least like an enclave. Carson's 90745 is 30% Filipino — the single densest ZIP — but " +
      "the qualifying areas are scattered from the harbour to the eastern San Gabriel Valley to " +
      "Eagle Rock. Historic Filipinotown, the officially designated district near Echo Park, is " +
      "the ceremonial centre and no longer the demographic one.",
    districts: [
      { name: "Carson", z: "90745" },
      { name: "Historic Filipinotown", z: "90026" },
      { name: "Eagle Rock", z: "90041" },
      { name: "West Covina", z: "91792" }
    ],
    spots: [
      {
        name: "Kuya Lord", place: "Melrose Hill · 5003 Melrose Ave",
        slot: "occasion",
        z: "90029", img: "lechon-kawali", dish: "Lechon kawali",
        why: "Lord Maynard Llera cooks Southern Tagalog food with fine-dining technique and no apology or translation. He won the 2024 James Beard Award for Best Chef: California doing it — the strongest single credential any kitchen in this atlas holds.",
        proof: "The bagoong is the test. If the shrimp paste has been toned down for the room, the kitchen has made a decision about who it is cooking for.",
        since: 2020
      },
      {
        name: "L.A. Rose Cafe", place: "East Hollywood · 4749 Fountain Ave",
        slot: "everyday",
        z: "90029", img: "kamayan", dish: "Kamayan on banana leaf",
        why: "Lemuel Balagot has run this all-day Filipino cafe in the same room on Fountain since 1982 — lechon, dinuguan, and kamayan (hands, banana leaf, no cutlery) taken as a booking rather than a gimmick.",
        proof: "Kamayan has to be reserved for six or more, which is the tell that it is cooked for the table rather than plated from a line. Forty-four years in one address is the other one.",
        since: 1982
      },
      {
        name: "Seafood City", place: "Carson · 1720 E Carson St",
        z: "90745", img: "fgrocery", dish: "The market",
        slot: "market",
        why: "The Filipino supermarket in the densest Filipino ZIP code in the county, with a Grill City counter, a bakery, and the frozen and dried goods a Filipino kitchen runs on.",
        proof: "The whole fish and the bangus selection. Also look at who is shopping on a Sunday after church \u2014 that is the test of a community grocery.",
        since: null
      },
      {
        name: "Dollar Hits", place: "Historic Filipinotown · 2432 W Temple St", checked: "2026-08",
        slot: "value",
        z: "90026", img: "isaw", dish: "Street skewers, incl. isaw",
        why: "Street-style skewers — including isaw, betamax, adidas, the offal cuts that are the actual canon of Filipino street food — that you grill yourself over charcoal.",
        proof: "The offal names on the board. A Filipino skewer stand that sells only chicken and pork belly has edited itself for outsiders.",
        since: 2011
      },
      {
        name: "The Park's Finest", place: "Historic Filipinotown · 1267 W Temple St (closed Mon)",
        slot: "everyday",
        z: "90026", img: "bbq-ribs", dish: "Filipino-Southern barbecue",
        why: "Filipino barbecue crossed with Southern American smoking technique, run by a family from the neighbourhood — a genuinely Angeleno hybrid rather than an imported one. Catering from 2009, brick-and-mortar since 2012.",
        proof: "The coconut-milk cornbread and the 'tsismis' beef ribs are the hybrid made literal. Judge whether they read as a coherent dish or as a novelty; that is the whole risk of the format.",
        since: 2012
      }
    ]
  },

  {
    key: "guatemalan", name: "Guatemalan", tone: "#8F6B2E",
    endonym: "guatemalteco/a, chapín/a",
    gate: "scale + place",
    region: "Westlake, Pico-Union, South Los Angeles",
    regionNote:
      "Twelve ZIP codes qualify, tightest at 90057 (Westlake), where Guatemalans are nearly " +
      "eight times their county share and make up 23% of residents. Los Angeles has the largest " +
      "Guatemalan population in the United States, and it overlaps almost exactly with the " +
      "Salvadoran map — same blocks, different country, routinely collapsed into one label.",
    districts: [
      { name: "Westlake / MacArthur Park", z: "90057" },
      { name: "Pico-Union", z: "90006" },
      { name: "Vermont-Slauson", z: "90044" },
      { name: "Historic South Central", z: "90011" }
    ],
    spots: [
      {
        name: "The Bonnie Brae & 6th St carts", place: "Westlake · Bonnie Brae St at W 6th St, evenings",
        slot: "value",
        z: "90057", img: "garnachas", dish: "Garnachas and chuchitos",
        why: "An unlicensed, self-organised Guatemalan street-food market that assembles most evenings — garnachas, chuchitos, tostadas, atol. There is no restaurant equivalent of it in the county.",
        proof: "This is the rare case where the informal version is the authoritative one. Go after 5pm; if it is empty, come back another day rather than substituting a restaurant.",
        since: null
      },
      {
        name: "Amalia's Restaurant", place: "Koreatown · 3819 W 6th St",
        slot: "everyday",
        z: "90020", img: "chuchito", dish: "Chuchitos, chipilín tamal",
        why: "An antojitos plate that puts garnachas, enchiladas guatemaltecas, chuchitos and a chipilín tamal on one plate — chipilín being the herb that separates a Guatemalan tamal from a Mexican one.",
        proof: "Chipilín. If the tamales are only masa and meat, the kitchen is cooking Mexican-adjacent food under a Guatemalan sign.",
        since: null
      },
      {
        name: "Puchica", place: "Sherman Oaks · 4523 Sepulveda Blvd",
        slot: "occasion",
        z: "91403", img: "tapado", dish: "Tapado, Caribbean coast",
        why: "Ronan Lurssen, from Suchitepéquez, cooks regional Guatemalan beyond the standard menu — including tapado, the coconut-and-seafood stew from the Caribbean (Garífuna) coast, which almost nobody else in Southern California makes.",
        proof: "Tapado is the proof itself: a regional dish with no crossover appeal, so putting it on the menu is a statement about who the kitchen is for.",
        since: 2015
      }
    ]
  },

  {
    key: "korean", name: "Korean", tone: "#2F5FA8",
    endonym: "한인",
    gate: "scale + place",
    region: "Koreatown, plus Cerritos and La Mirada",
    regionNote:
      "Twenty-one ZIP codes qualify. The core is unusually tight for Los Angeles: 90005 and " +
      "90020 are each roughly 22–23% Korean at eleven times the county rate, in an area dense " +
      "enough to walk. Koreatown is also majority-Latino by headcount — the Korean concentration " +
      "is commercial and institutional as much as residential, which is exactly why it functions " +
      "as a district rather than a suburb.",
    districts: [
      { name: "Koreatown (90005)", z: "90005" },
      { name: "Wilshire Center (90020)", z: "90020" },
      { name: "Cerritos", z: "90703" },
      { name: "La Mirada", z: "90638" }
    ],
    spots: [
      {
        source: "friend", who: "Kevin Wang",
        name: "Mama Xita BBQ", place: "Temple City \u00b7 5701 Rosemead Blvd",
        slot: "new",
        z: "91780", img: "galbi", dish: "Korean BBQ, SGV side",
        why: "Korean barbecue on the Temple City side of the county rather than in Koreatown \u2014 which matters if you are already in the San Gabriel Valley and do not want to drive west for it.",
        proof: "Judge it against Koreatown on banchan count and refills, not on the meat. Outposts away from the K-Town core usually economise there first.",
        new: true,
        since: 2025,
        checked: "2026-08",
        note: "Named by Kevin Wang as \u201cMamecita\u201d; this is the restaurant he meant."
      },
      {
        source: "found",
        name: "Ham Hung", place: "Koreatown \u00b7 3109 W Olympic Blvd plaza",
        slot: "everyday",
        z: "90006", img: "seolleongtang", dish: "North Korean home cooking",
        cosign: "David Chang, Local Lens: \u201cI almost think it\u2019s like a canteen for all kinds of delicious things that my grandmother used to make. If my dad was still alive I would take him here and he\u2019d eat every meal for a solid week.\u201d",
        why: "Hamhung-style North Korean cooking \u2014 a regional repertoire that barely exists in Los Angeles \u2014 served as everyday canteen food rather than as a specialty occasion.",
        proof: "Order the naengmyeon and note that Hamhung style is the chewy, sauced one, not the cold-broth Pyongyang version. A kitchen that serves both and can tell you which is which is cooking the region, not the category.",
        since: null,
        checked: "2026-08"
      },
      {
        source: "found",
        name: "Myung In Dumplings", place: "Koreatown \u00b7 3109 W Olympic Blvd B",
        slot: "value",
        z: "90006", img: "har-gow", dish: "Chinese-style Korean dumplings",
        cosign: "David Chang, Local Lens, on the strip-mall logic: \u201cIn K-Town it\u2019s all about the strip malls and the restaurant next door to the restaurant that everyone\u2019s at.\u201d The owner is Korean but was born in China \u2014 which is the dumpling.",
        why: "Hand-folded dumplings from a Korean-Chinese kitchen, which is a specific lineage rather than a fusion: the wrapper and the fold come from northern China, the fillings and the banchan around them are Korean.",
        proof: "Get the kimchi mandu and the plain pork side by side. A folded-to-order dumpling has an uneven, thick seam; a bought one is machine-crimped and identical every time.",
        since: null,
        checked: "2026-08"
      },
      {
        name: "Soban", place: "Koreatown · 4001 W Olympic Blvd (closed Tue)",
        slot: "occasion",
        z: "90019", img: "banchan", dish: "Banchan spread",
        why: "Banchan as the point rather than the preamble — a large spread of house-made side dishes, plus ganjang gejang (raw crab cured in soy) and a galbi jjim the kitchen takes two days to make.",
        proof: "Count the banchan and note whether they change between visits. A restaurant buying banchan from a supplier serves the same eight every time.",
        since: 2009
      },
      {
        name: "Hannam Chain", place: "Koreatown · 2740 W Olympic Blvd",
        z: "90006", img: "kmarket", dish: "The market",
        slot: "market",
        why: "The Korean grocery Koreatown households actually use — banchan by weight at the counter, a butcher cutting for barbecue, and the kimchi range that makes a home kitchen possible.",
        proof: "The banchan counter. Buying side dishes by the pound is how Korean households eat on a weeknight, and a market with a real one is stocking for them rather than for visitors.",
        since: null
      },
      {
        name: "Surawon Tofu House", place: "Koreatown · 2833 W Olympic Blvd",
        z: "90006", img: "soondubu", dish: "Soondubu, house-made tofu",
        slot: "dish",
        why: "Makes its own tofu on the premises from organic soybeans, and will swap in a nuttier black-soybean tofu for a dollar. Soondubu is everywhere in Koreatown; a kitchen curdling its own custard for it is not.",
        proof: "Ask for the black soybean tofu. A restaurant that offers two of its own tofus is making them, and the difference between house tofu and delivered tofu in soondubu is not subtle.",
        since: null
      },
      {
        name: "Han Bat Sul Lung Tang", place: "Koreatown · 4163 W 5th St",
        slot: "dish",
        z: "90020", img: "seolleongtang", dish: "Seolleongtang",
        why: "One dish: seolleongtang, ox-bone broth simmered for many hours until it turns opaque white. No grill, no menu breadth, nothing to hide behind.",
        proof: "The broth must be cloudy-white and almost unsalted — you season it yourself at the table. Clear or pre-salted broth means shortcuts.",
        since: 1989
      },
      {
        name: "Park's BBQ", place: "Koreatown · 955 S Vermont Ave",
        slot: "occasion",
        z: "90006", img: "galbi", dish: "Graded galbi",
        why: "The reference point for Korean barbecue in the city because Jenee Kim buys and grades the beef herself — specific cuts, USDA Prime and above, cooked by staff rather than by you.",
        proof: "Ask what grade the galbi is. A restaurant that cannot answer is not sourcing meat as a point of difference.",
        since: 2003
      },
      {
        name: "Sun Nong Dan", place: "Koreatown · 710 S Western Ave (open 24 hours)",
        slot: "late",
        z: "90005", img: "galbijjim", dish: "Galbi jjim with cheese",
        why: "Galbi jjim finished with mozzarella and a blowtorch at the table, around the clock — the dish that defined Koreatown's late-night generation on its own terms rather than as an export.",
        proof: "Go at 3am. Whether a cuisine has a genuine late-night culture is not something a menu can fake. (The original 6th Street location closed in November 2025; Western Ave is the one still running.)",
        since: 2014
      }
    ]
  },

  {
    key: "armenian", name: "Armenian", tone: "#B5442F",
    endonym: "հայ",
    gate: "scale + place",
    region: "Glendale, Little Armenia, Tujunga, the north-east Valley",
    regionNote:
      "The most geographically concentrated large community in the atlas. Four Glendale ZIP " +
      "codes run 35–45% Armenian at 18 to 24 times the county rate — the highest concentration " +
      "multiples any group reaches here. Glendale is the largest Armenian community outside " +
      "Armenia and Russia. A second, older cluster sits in East Hollywood's officially " +
      "designated Little Armenia.",
    districts: [
      { name: "Glendale (Grand Central)", z: "91201" },
      { name: "Glendale (south)", z: "91205" },
      { name: "Little Armenia", z: "90029" },
      { name: "Tujunga", z: "91042" }
    ],
    subnote:
      "'Armenian' here is at least three migrations that do not cook alike: Western Armenian via " +
      "Lebanon and Syria (the Beirut-Armenian kitchens), Iranian-Armenian via Tehran, and " +
      "post-Soviet Armenian from the republic itself. Reading them as one cuisine is the most " +
      "common mistake visitors make.",
    spots: [
      {
        name: "Zhengyalov Hatz", place: "Glendale · 318 E Broadway",
        slot: "dish",
        z: "91205", img: "jingalov", dish: "Jingalov hats, ~15 herbs",
        why: "One flatbread from Artsakh (Nagorno-Karabakh), stuffed with around fifteen finely chopped herbs and griddled to order. It is a regional dish from a place most of its cooks can no longer return to — and it is the only Armenian restaurant in the Michelin Guide anywhere in America.",
        proof: "The herb count is the dish, not a seasoning. The filling should be dense, dark green and faintly bitter, and no two batches taste quite the same. Also on the New York Times\u2019 25 Essential Dishes to Eat in Los Angeles.",
        since: null
      },
      {
        name: "Carousel", place: "Glendale · 304 N Brand Blvd (closed Mon)",
        slot: "occasion",
        z: "91203", img: "mezze", dish: "Beirut-Armenian mezze",
        why: "Beirut-Armenian mezze at scale — soujouk, mante, muhammara, raw kibbeh — which is the Lebanese-diaspora branch of the cuisine rather than the Soviet-Armenian one.",
        proof: "Mante (baked meat dumplings under yoghurt and tomato) is the branch marker: it belongs to the Western Armenian kitchen, not the Yerevan one.",
        since: 1984
      },
      {
        name: "Super King Markets", place: "Glendale · 2701 Fletcher Dr / Glendale area",
        z: "91204", img: "amarket", dish: "The market",
        slot: "market",
        why: "The grocery the Armenian, Iranian and Levantine communities of Glendale actually shop at \u2014 bulk herbs, cheeses, olives, lavash and produce priced for households cooking every day.",
        proof: "The herb and bulk sections. A market with a wall of fresh herbs by the kilo is stocking for people who cook, not for people assembling a recipe.",
        since: null
      },
      {
        name: "Sasoun Bakery", place: "Little Armenia · 5114 Santa Monica Blvd",
        slot: "sweet",
        z: "90029", img: "lahmajun", dish: "Lahmajun by the dozen",
        why: "Lahmajun and boereg baked continuously through the day in a bakery rather than a restaurant — the everyday format the food actually exists in.",
        proof: "Buy lahmajun by the dozen at 8am like the people in front of you. A bakery that only sells to sit-down customers has repositioned itself.",
        since: 1981
      },
      {
        source: "jerry", name: "Mini Kabob", place: "Glendale · 313 Vine St",
        z: "91204", img: "minikabob", dish: "Lule, shish, lamb chops",
        slot: "everyday",
        why: "The name is about the room, not the portions \u2014 a takeout counter the size of a hallway, run by Ovakim and Alvard Martirosyan with their son Armen, turning out lamb chops, beef lule and chicken thigh on generational recipes. Platters land under $20 with rice, vegetables, hummus and pita.",
        proof: "Ask for the eggplant caviar and a tarragon soda alongside. Both are things a family cooking for Armenians puts on the menu and a kebab shop chasing a general audience does not. The corroboration is unusually heavy for a room this size: the New York Times put it on both its Top 50 Restaurants list and its 25 Essential Dishes to Eat in Los Angeles.",
        since: null
      },
      {
        source: "jerry", name: "Raffi\u2019s Place", place: "Glendale · 211 E Broadway",
        z: "91205", img: "raffis", dish: "Charcoal kebab, Persian-Armenian",
        slot: "occasion",
        why: "A Glendale institution since 1993 and the default for a large table: charcoal kebab and Persian-Armenian stews on a big patio, at the scale families actually eat in.",
        proof: "Judge it on the rice and the grill, not the room. Persian-Armenian cooking lives or dies on steamed basmati and live charcoal, and both are visible from the table.",
        since: 1993
      },
      {
        name: "Tun Lahmajo", place: "Burbank · 1215 W Magnolia Blvd",
        slot: "value",
        z: "91506", img: "lahmajun-cheese", dish: "Cheese lahmajun",
        why: "Bakes everything on site including the cheese lahmajun, and has become the reference for the form in the Glendale-Burbank corridor.",
        proof: "Watch the oven. If bread is coming out during service, the claim holds.",
        since: null
      }
    ]
  },

  {
    key: "indian", name: "Indian", tone: "#B87333",
    endonym: "देसी / Desi",
    gate: "scale + place",
    region: "Artesia's Little India, Cerritos, and the west Valley",
    regionNote:
      "Two very different geographies. Cerritos (90703) has the largest concentration at ten " +
      "times the county rate, and the adjacent Pioneer Boulevard in Artesia is the commercial " +
      "district — roughly half a mile of groceries, sari shops, jewellers and restaurants that " +
      "serves Indian communities from San Diego to Bakersfield. A second, more residential " +
      "cluster sits in Woodland Hills, Northridge and Torrance.",
    districts: [
      { name: "Cerritos", z: "90703" },
      { name: "Artesia (Pioneer Blvd)", z: "90701" },
      { name: "Woodland Hills", z: "91367" },
      { name: "Torrance", z: "90503" }
    ],
    spots: [
      {
        name: "Jay Bharat", place: "Artesia · 18701 Pioneer Blvd",
        slot: "everyday",
        z: "90701", img: "thali", dish: "Gujarati thali",
        why: "Gujarati vegetarian thali and mithai from the same counter since 1988 — a regional, caste- and community-specific kitchen rather than a pan-Indian menu.",
        proof: "The thali should include a sweet as part of the meal, not after it. That ordering is Gujarati and it is not negotiable.",
        since: 1988
      },
      {
        name: "Surati Farsan Mart", place: "Artesia · 11814 186th St",
        slot: "sweet",
        z: "90701", img: "dhokla", dish: "Farsan: dhokla, fafda",
        why: "Farsan — Gujarati savoury snacks — made as a specialty: dhokla, khaman, fafda, patra. This is an entire category of Indian food that almost never appears in American Indian restaurants.",
        proof: "If the words on the counter are unfamiliar and untranslated, you are in the right place.",
        since: 1986
      },
      {
        name: "Patel Brothers", place: "Artesia · 18626 Pioneer Blvd",
        z: "90701", img: "imarket", dish: "The market",
        slot: "market",
        why: "The grocery half of Pioneer Boulevard: lentils and rice by the sack, fresh curry leaf and drumstick, and the spice range that makes regional Indian cooking possible at home.",
        proof: "Fresh curry leaves and green chillies. Both are perishable, both are non-negotiable, and a shop that carries them fresh is serving daily cooks.",
        since: null
      },
      {
        name: "Udupi Palace", place: "Artesia · 18635 Pioneer Blvd",
        slot: "value",
        z: "90701", img: "dosa", dish: "Udupi dosa",
        why: "South Indian vegetarian — dosa, idli, uttapam — from the Udupi tradition, which is a specific temple-town cooking lineage, not a generic 'South Indian' label.",
        proof: "The sambar and the coconut chutney arrive before you order anything. That is the Udupi convention.",
        since: null
      }
    ]
  },

  {
    key: "vietnamese", name: "Vietnamese", tone: "#C7562F",
    endonym: "người Việt",
    gate: "scale + place (regional centre in Orange County)",
    region: "Little Saigon — Westminster and Garden Grove — plus the San Gabriel Valley",
    regionNote:
      "This is the atlas's clearest case of a community whose centre sits outside the county " +
      "line. Los Angeles County has about 97,500 Vietnamese residents, and they do concentrate " +
      "— strikingly, in the San Gabriel Valley alongside the Chinese community, which reflects " +
      "the Hoa (ethnic-Chinese Vietnamese) migration. But Orange County has 226,850, and " +
      "Westminster's 92683 alone holds about 40,000 at over six times the local rate. Little " +
      "Saigon is the largest Vietnamese community outside Vietnam.",
    districts: [
      { name: "Westminster", z: "92683" },
      { name: "Garden Grove (west)", z: "92843" },
      { name: "Rosemead / SGV", z: "91770" },
      { name: "El Monte", z: "91733" }
    ],
    spots: [
      {
        name: "Quán Mii", place: "Westminster · 9541 Bolsa Ave",
        slot: "dish",
        z: "92683", img: "banh-xeo", dish: "Bánh xèo",
        why: "Two dishes and no hedging: bánh xèo, and mì Quảng — the turmeric noodle bowl from Quảng Nam that is Central Vietnamese, not the Southern food dominating the American Vietnamese menu.",
        proof: "The bánh xèo has to stay crisp to the last bite. A crêpe that goes limp halfway was made with too much batter and not enough heat.",
        since: null
      },
      {
        name: "Ng\u1ef1 B\u00ecnh", place: "Westminster \u00b7 14092 Magnolia St #116 (closed Mon)",
        z: "92683", img: "bunbohue", dish: "B\u00fan b\u00f2 Hu\u1ebf, b\u00e1nh b\u00e8o, m\u00ec Qu\u1ea3ng",
        slot: "dish",
        why: "Named for the mountain above the old imperial city, and cooking that city\u2019s food: b\u00fan b\u00f2 Hu\u1ebf, b\u00e1nh b\u00e8o, b\u00e1nh b\u1ecdt l\u1ecdc, m\u00ec Qu\u1ea3ng. A strip-mall room that stays full because of the noodles rather than the address.",
        proof: "The broth should smell of m\u1eafm ru\u1ed1c before you taste it, and there should be a cube of congealed pig\u2019s blood in the bowl unless you ask otherwise. Both are omitted when a kitchen is cooking Hu\u1ebf food for a Southern palate.",
        since: null
      },
      {
        name: "Brodard", place: "Garden Grove · 9892 Westminster Ave",
        slot: "dish",
        z: "92844", img: "nem-nuong", dish: "Nem nướng cuốn",
        why: "One dish carried the restaurant for decades: nem nướng cuốn, grilled pork rolls, whose dipping sauce is a closely held recipe people drive an hour for.",
        proof: "The sauce, not the roll. If it is thin and sweet rather than thick and savoury-orange, you are somewhere else.",
        since: 1993
      },
      {
        name: "Saigon City Marketplace", place: "Westminster · 9200 Bolsa Ave",
        z: "92683", img: "vmarket", dish: "The market",
        slot: "market",
        why: "The market end of Little Saigon: herbs, live seafood, prepared food, bánh, and the stalls that sell to people cooking at home rather than eating out.",
        proof: "Look for rau răm, tía tô and the other herbs no supermarket carries. Central and Northern Vietnamese cooking is impossible without them, and a market stocking them is serving cooks.",
        since: null
      },
      {
        name: "Golden Deli", place: "San Gabriel · 815 W Las Tunas Dr (closed Wed)",
        slot: "everyday",
        z: "91776", img: "pho", dish: "Phở and chả giò",
        why: "The San Gabriel Valley's Vietnamese anchor, and the reason the SGV counts as a second Vietnamese region rather than a rounding error — chả giò and phở since the early 1980s.",
        proof: "Its longevity inside a majority-Chinese commercial district is itself the evidence of the Hoa (ethnic-Chinese Vietnamese) community's presence.",
        since: 1981
      },
      {
        name: "Thành Mỹ", place: "Westminster · 9553 Bolsa Ave",
        slot: "everyday",
        z: "92683", img: "bun", dish: "Encyclopedic menu",
        why: "One of the first Vietnamese restaurants in Orange County, opened by the Nguyen family in 1979 and still running an encyclopedic menu — the breadth is the point, and it is the breadth a community restaurant needs rather than a specialist one.",
        proof: "Order something off the far end of the menu — snails, cháo, a curry. A kitchen that only executes its greatest hits has quietly become a specialist.",
        since: 1979
      }
    ]
  },

  {
    key: "japanese", name: "Japanese", tone: "#4A6FA5",
    endonym: "日系",
    gate: "scale + place",
    region: "The South Bay — Gardena and Torrance — plus Little Tokyo and Sawtelle",
    regionNote:
      "The population map and the cultural map disagree, and both are correct. The twelve " +
      "qualifying ZIP codes are overwhelmingly in the South Bay: North Torrance (90504) is 12% " +
      "Japanese at thirteen times the county rate, and Gardena is close behind. But Little Tokyo " +
      "downtown and Sawtelle on the Westside are the two designated historic districts — a " +
      "separation that dates directly to the WWII incarceration and the postwar resettlement " +
      "that followed it.",
    districts: [
      { name: "North Torrance", z: "90504" },
      { name: "Gardena", z: "90247" },
      { name: "Little Tokyo", z: "90012" },
      { name: "Sawtelle Japantown", z: "90025" }
    ],
    subnote:
      "Little Tokyo is one of only three surviving Japantowns in the United States. The South " +
      "Bay concentration exists because postwar Japanese American families were, in effect, " +
      "resettled into the aerospace suburbs rather than back into the district they left.",
    spots: [
      {
        source: "friend", who: "York",
        name: "Gaburi Chicken", place: "Torrance \u00b7 1437 Marcelina Ave",
        slot: "new",
        z: "90501", img: "izakaya", dish: "Nagoya-style karaage",
        why: "The first U.S. location of a Nagoya karaage specialist \u2014 an izakaya built around fried chicken rather than one that happens to serve it, with bone-in chicken and garlic rice as the thing to order.",
        proof: "Karaage is a holding test: it must arrive within a minute or two of frying and the crust should still be audible. Order the bone-in and see whether the meat at the bone is still juicy \u2014 that is what separates a specialist from a menu item.",
        new: true,
        since: 2025,
        checked: "2026-08"
      },
      {
        source: "jerry", name: "Kansha Creamery", place: "Gardena · 1450 W Artesia Blvd",
        z: "90248", img: "kansha", dish: "Hand-made ice cream",
        slot: "sweet",
        why: "A brother-and-sister shop on the Gardena\u2013Torrance line making ice cream by hand every day and giving 75 cents of every scoop to charity. \u300cKansha\u300d means gratitude, and the giving is the business model rather than a marketing line.",
        proof: "Ask which charity this month\u2019s scoops are funding. A shop that can answer specifically is actually doing it; the flavours rotating with what local farms have is the other tell.",
        since: null
      },
      {
        name: "Fugetsu-Do", place: "Little Tokyo · 315 E 1st St",
        slot: "sweet",
        z: "90012", img: "mochi", dish: "Mochi and manju",
        why: "Wagashi — mochi and manju — made by the Kito family since 1903, through the incarceration that closed the shop and after it reopened. At 123 years it is the oldest continuously family-run business in Little Tokyo.",
        proof: "Buy mochi in the morning and eat it the same day; it contains no preservatives, which is both the quality claim and the constraint.",
        since: 1903
      },
      {
        name: "Tak\u2019s Coffee Shop", place: "Crenshaw · 3870 Crenshaw Blvd",
        z: "90008", img: "locomoco", dish: "Loco moco, oyako donburi, saimin",
        slot: "everyday",
        why: "After the war, Crenshaw held the largest concentration of Japanese Americans in the continental United States. Tak\u2019s opened in 1996 to keep the Holiday Bowl coffee shop\u2019s cooking alive after it closed \u2014 oyako donburi and saimin next to grits and chili \u2014 and is named for Mary Shizuru\u2019s son. It is now run by a Mexican American couple who worked at the Holiday Bowl themselves. The City of Los Angeles lists it as a Cultural Treasure of South L.A.",
        proof: "This is the one entry that belongs to two communities at once, and the menu says so out loud: order loco moco and grits at the same table. The maneki-neko shelf is not decor, it is what is left of a neighbourhood.",
        since: 1996
      },
      {
        name: "Meiji Tofu", place: "Gardena · 16440 S Western Ave (mornings only, closed Tue & Sun)",
        slot: "dish",
        z: "90247", img: "tofu", dish: "Day-made tofu",
        why: "Makes tofu and soy milk on the premises daily and sells it the same day — a product almost nobody in Los Angeles produces fresh, and one where the difference is immediately obvious.",
        proof: "The hours are the proof: it opens at 8.30am and closes at 1pm, because that is how long day-made tofu lasts. Fresh tofu is faintly sweet and collapses under a spoon; if it holds a hard cube, it was made for shelf life.",
        since: null
      },
      {
        name: "Otafuku", place: "Gardena · 16525 S Western Ave (closed Mon–Tue)",
        slot: "dish",
        z: "90247", img: "soba", dish: "Soba",
        why: "Soba cut by hand on site. Hand-cut soba has a short window between cutting and cooking, so it can only be done by a kitchen organised around it.",
        proof: "Ask for seiro (cold, on a mat). Cold soba has nothing to hide behind — texture and buckwheat aroma are the entire dish.",
        since: null
      },
      {
        source: "jerry", name: "Bistro Beaux", place: "Torrance · 21605 S Western Ave, Ste A (6pm–1am, closed Sun)",
        z: "90501", img: "izakaya", dish: "Katsu chicken, squid-ink pasta",
        slot: "late",
        why: "A Japanese-Italian izakaya in Torrance that runs to 1am \u2014 katsu fried chicken in a sweet batter, black squid-ink spaghetti with lemongrass. The hybrid is a South Bay Japanese-American idiom rather than an import.",
        proof: "The hours. A kitchen open until 1am on a Tuesday in Torrance is cooking for people who work late nearby, not for a destination crowd.",
        since: null
      },
      {
        source: "jerry", name: "Tokyo Central", place: "Torrance · 3832 W Sepulveda Blvd", jerryOrder: "Salmon belly \u2014 the best value in the case \u2014 plus miso chicken. The shumai here beats Nijiya\u2019s.",
        z: "90505", img: "jgrocery", dish: "The market",
        slot: "market",
        why: "The former Marukai, and the deepest Japanese grocery in the South Bay: a real fish counter, prepared-food and sushi sections, and the household goods a Japanese kitchen actually needs rather than an import aisle.",
        proof: "Go at 5pm on a weekday and look at the prepared-food counter being restocked for people taking dinner home. That is a grocery serving a community, not a specialty shop.",
        since: null
      },
      {
        source: "jerry", name: "Nijiya Market", place: "Torrance · Crenshaw Blvd at 192nd St", jerryOrder: "The $12 lunch set: udon or tenjiru pork soup with two onigiri.",
        z: "90501", img: "jproduce", dish: "Produce, fish, prepared food",
        slot: "market",
        why: "Smaller than Tokyo Central and better for produce, fish and the hot counter \u2014 tonkatsu, curry croquettes. The Torrance store is roomier than the chain\u2019s cramped urban branches.",
        proof: "Compare the fish case to a mainstream supermarket\u2019s: whole fish, sashimi-grade cuts, and labels that assume you know what to do with them.",
        since: null
      },
      {
        name: "Sawtelle Japantown", place: "West L.A. · Sawtelle Blvd between Olympic and Santa Monica",
        slot: "civic",
        z: "90025", img: "sawtelle", dish: "The district itself",
        why: "Included as a district, not a restaurant: the surviving commercial strip of a prewar Japanese American farming community, now a dense corridor of Japanese and broader East Asian businesses.",
        proof: "Walk it end to end and look for the nurseries — the garden businesses are the literal remnant of the prewar community.",
        since: null
      }
    ]
  },

  {
    key: "iranian", name: "Iranian", tone: "#3E7C7C",
    endonym: "ایرانی",
    gate: "scale + place",
    region: "Westwood's Persian Square, plus Encino, Tarzana and Woodland Hills",
    regionNote:
      "Fourteen ZIP codes qualify across two poles. Westwood (90024) holds 'Tehrangeles' — the " +
      "stretch of Westwood Boulevard officially designated Persian Square — while the larger " +
      "residential concentration has moved over the hill to Encino, Tarzana and Woodland Hills. " +
      "Beverly Hills (90210) shows the single highest concentration multiple in the entire " +
      "atlas: 26 times the county rate.",
    districts: [
      { name: "Westwood / Persian Square", z: "90024" },
      { name: "Encino Hills", z: "91436" },
      { name: "Tarzana", z: "91356" },
      { name: "Woodland Hills", z: "91367" }
    ],
    subnote:
      "'Iranian' in Los Angeles includes Muslim, Jewish, Armenian, Baha'i and Zoroastrian " +
      "Iranians whose institutions barely overlap. The Iranian Jewish community in particular is " +
      "large and is counted twice in this atlas — once here and once under Jewish Los Angeles.",
    spots: [
      {
        name: "Attari Sandwich Shop", place: "Westwood · 1388 Westwood Blvd (closed Mon)",
        slot: "value",
        z: "90024", img: "gondi", dish: "Gondi, Fridays only",
        why: "Persian sandwiches — kotlet, tongue — and, on Fridays only, gondi: chickpea-and-chicken dumplings in broth that are specifically an Iranian Jewish dish.",
        proof: "Gondi on Friday is the whole argument. A single-day dish exists for a community that shows up on that day.",
        since: 1993
      },
      {
        name: "Jordan Market", place: "Westwood · 1449 Westwood Blvd",
        z: "90024", img: "pmarket", dish: "The market",
        slot: "market",
        why: "A Persian grocery on the boulevard: barberries, dried limes, saffron by weight, sangak bread, and the herb bundles that ghormeh sabzi consumes by the kilo.",
        proof: "Ask for limu amani (dried limes) and check whether the saffron is sold in grams from a case rather than pre-boxed. Both are how an Iranian kitchen actually buys.",
        since: null
      },
      {
        name: "Shamshiri Grill", place: "Westwood · 1712 Westwood Blvd",
        slot: "everyday",
        z: "90024", img: "tahdig", dish: "Tahchin and tahdig",
        why: "One of the oldest restaurants on the boulevard, and the reference for tahchin — the saffron-yoghurt rice cake — rather than for kabob, which everyone does.",
        proof: "Order tahchin or ask for tahdig. Rice, not meat, is the skill in this cuisine, and it is the thing most restaurants get wrong.",
        since: 1981
      },
      {
        name: "Saffron & Rose", place: "Westwood · 1387 Westwood Blvd",
        slot: "sweet",
        z: "90024", img: "bastani", dish: "Bastani and faloodeh",
        why: "Persian ice cream — bastani with saffron, rosewater and clumps of frozen cream, plus faloodeh, the rice-noodle sorbet. Dozens of flavours that exist in no other ice cream tradition.",
        proof: "Faloodeh. If they do not make it, they are an ice cream shop with saffron, not a Persian one.",
        since: 1986
      },
      {
        name: "Taste of Tehran", place: "West L.A. · 1915 Westwood Blvd",
        slot: "dish",
        z: "90025", img: "ghormeh-sabzi", dish: "Ghormeh sabzi",
        why: "Cooks the stews — ghormeh sabzi, gheimeh — as the centre of the menu rather than a footnote to the grill, which is the reverse of how Persian restaurants usually present themselves in the U.S.",
        proof: "Ghormeh sabzi should be dark, almost black-green, and sour from dried limes. Bright green means the herbs were not cooked down long enough.",
        since: 2014
      }
    ]
  },

  {
    key: "cambodian", name: "Cambodian", tone: "#7C6A2E",
    endonym: "ខ្មែរ / Khmer",
    gate: "scale + place",
    region: "Cambodia Town, Long Beach",
    regionNote:
      "Four contiguous Long Beach ZIP codes qualify, at 13 to 21 times the county rate — the " +
      "second-highest concentration multiples in the atlas after the Armenian and Persian cores. " +
      "Long Beach holds the largest Cambodian community outside Cambodia, formed almost entirely " +
      "by refugees of the Khmer Rouge genocide. The city officially designated Cambodia Town " +
      "along Anaheim Street in 2007.",
    districts: [
      { name: "Cambodia Town (90813)", z: "90813" },
      { name: "North Long Beach", z: "90805" },
      { name: "Long Beach (Wrigley)", z: "90806" },
      { name: "East Long Beach", z: "90804" }
    ],
    spots: [
      {
        name: "Phnom Penh Noodle Shack", place: "Long Beach · 1644 Cherry Ave", checked: "2026-08",
        slot: "dish",
        z: "90813", img: "kuy-teav", dish: "Kuy teav, breakfast only",
        why: "Kuy teav — the Cambodian breakfast noodle soup — made by the same family since the 1980s, closing mid-afternoon because it is a breakfast restaurant and behaves like one.",
        proof: "The hours are the proof: 7am to 3pm. A noodle shop that keeps dinner hours is serving a different market.",
        since: 1986
      },
      {
        name: "Sophy's", place: "Long Beach · 3240 E Pacific Coast Hwy",
        slot: "everyday",
        z: "90804", img: "amok", dish: "Amok in banana leaf",
        why: "The broadest Khmer menu in the city — amok, lok lak, and Cambodian beef jerky — plus live music, which makes it the community's function room as much as its restaurant.",
        proof: "Amok should be steamed in banana leaf and set like a custard. If it arrives as a curry in a bowl, the technique has been dropped.",
        since: 2003
      },
      {
        name: "Cambodia Town, Anaheim St", place: "Long Beach · Anaheim St, Atlantic to Junipero",
        slot: "civic",
        z: "90813", img: "cambodia-town", dish: "The district itself",
        why: "Included as the district itself. The Cambodian New Year parade in April is the largest Khmer public event in the United States.",
        proof: "Go in April. Annual public ritual is the strongest available evidence that a district is a community and not a restaurant row.",
        since: 2007
      }
    ]
  },

  {
    key: "thai", districtOnly: true, name: "Thai", tone: "#A85C2E",
    endonym: "คนไทย",
    gate: "designated district (below the population threshold)",
    region: "Thai Town, East Hollywood",
    regionNote:
      "Thai is the atlas's clearest exception. At about 21,800 in the county it falls below the " +
      "25,000 population gate and no ZIP code reaches three times the county rate — the " +
      "community is residentially dispersed. It qualifies on the third gate instead: a six-block " +
      "stretch of Hollywood Boulevard was officially designated Thai Town by the City of Los " +
      "Angeles in 1999, the first in the nation, and Southern California holds the largest Thai " +
      "population outside Thailand. This is a case where a district is real and the residential " +
      "map simply does not show it.",
    districts: [
      { name: "Thai Town", z: "90027" },
      { name: "East Hollywood", z: "90029" },
      { name: "Hollywood", z: "90028" }
    ],
    spots: [
      {
        name: "Jitlada", place: "Thai Town · 5233 W Sunset Blvd",
        slot: "occasion",
        z: "90027", img: "southern-thai-curry", dish: "Southern Thai curry",
        why: "Southern Thai — the hottest and least translated regional cuisine in the country — with a menu that runs to hundreds of items and a kitchen that will cook them at Thai heat if you ask.",
        proof: "Order from the Southern section, not the front of the menu. The front page is the Thai-American menu; the Southern pages are the restaurant.",
        since: 2006
      },
      {
        name: "Silom Supermarket", place: "Thai Town · 5321 Hollywood Blvd (Thailand Plaza)",
        z: "90027", img: "tmarket", dish: "The market",
        slot: "market",
        why: "Inside Thailand Plaza, the commercial anchor of the designated district: fresh Thai herbs, curry pastes, the dessert aisle, and the frozen goods that do not exist elsewhere in the city.",
        proof: "The dessert aisle and the fresh herb case. Thai desserts are the part of the cuisine restaurants skip, so a market that stocks them is serving home kitchens.",
        since: null
      },
      {
        name: "Sapp Coffee Shop", place: "Thai Town · 5183 Hollywood Blvd",
        slot: "value",
        z: "90027", img: "boat-noodles", dish: "Boat noodles",
        why: "Boat noodles — the dark, offal-and-blood-thickened broth served in small bowls — plus jade noodles. A specialist dish in a room that looks like nothing at all.",
        proof: "Boat noodle broth must be thickened with blood, which is what gives it the near-black colour and iron depth. Brown and thin is a different soup.",
        since: 1992
      },
      {
        name: "Ruen Pair", place: "Thai Town · 5257 Hollywood Blvd (closed Wed)",
        slot: "late",
        z: "90027", img: "morning-glory", dish: "Stir-fried morning glory",
        why: "Central and north-eastern Thai cooking with a deep Thai-Chinese streak — morning glory, crispy catfish salad, the fried-egg salad — served until nearly 11pm by the same family since 1996.",
        proof: "Read past the takeout classics on the first page. The obscure Thai-Chinese dishes further in are the food of a specific community inside Thailand, not a fusion menu.",
        since: 1996
      },
      {
        source: "jerry", name: "Sweet Rice", place: "Gardena · 1630 W Redondo Beach Blvd #4",
        z: "90247", img: "jok", dish: "Jok, khao soi, Thai breakfast",
        slot: "everyday",
        why: "Thai breakfast as the main event \u2014 jok (rice congee) with pork meatballs and ginger, khao soi, duck noodle soup \u2014 in Gardena, twenty miles from the designated district. Michelin Guide listed, and part of a three-restaurant family cluster on the same street.",
        proof: "Order jok before noon. It is a breakfast food, it does not travel, and a kitchen that serves it properly is cooking for people who eat it at home.",
        since: null
      },
      {
        name: "Lacha Somtum", place: "Thai Town · 5171 Hollywood Blvd",
        z: "90027", img: "somtum", dish: "Som tum, duck larb, Esaan sausage",
        slot: "dish",
        why: "North-eastern (Isan) Thai, which is a third distinct cuisine in this neighbourhood after the Central and Southern kitchens: green papaya salad pounded to order, duck larb, Esaan sausage, and a Laos-style som tum with fermented fish.",
        proof: "Order the Laos-style papaya salad with pla ra. It is fermented, pungent and not adjusted for outsiders \u2014 kitchens cooking Isan food for a general audience serve the Thai-style sweet version instead.",
        since: null
      },
      {
        name: "Amphai Northern Thai Food", place: "Thai Town · 5301 Sunset Blvd #11",
        slot: "dish",
        z: "90027", img: "khao-soi", dish: "Khao soi gai, sai ua",
        why: "Northern (Lanna) cooking from a room the size of a garage — sai ua sausage and khao soi gai, which is a different cuisine again from both the Central and Southern menus in this neighbourhood.",
        proof: "Northern larb is bitter and herbal, not sour and limey. If it tastes like the Isan version, one dish is being sold under two names.",
        since: null
      }
    ]
  },

  {
    key: "ethiopian", districtOnly: true, name: "Ethiopian", tone: "#6E7A2E",
    endonym: "ኢትዮጵያዊ",
    gate: "designated district (below the population threshold)",
    region: "Little Ethiopia, Fairfax Avenue",
    regionNote:
      "About 10,800 people in the county — comfortably below the population gate, with no ZIP " +
      "code reaching the concentration threshold. It qualifies on the third gate: in 2002 the " +
      "City of Los Angeles designated one block of Fairfax Avenue between Olympic and Whitworth " +
      "as Little Ethiopia, the first American neighbourhood named for an African nation. The " +
      "institutional density on that single block — restaurants, markets, coffee, churches " +
      "nearby — is what a district test is for.",
    districts: [
      { name: "Little Ethiopia", z: "90036" },
      { name: "Mid-City", z: "90019" }
    ],
    spots: [
      {
        name: "Meals by Genet", place: "Little Ethiopia · 1053 S Fairfax Ave",
        slot: "occasion",
        z: "90019", img: "doro-wot", dish: "Doro wot",
        why: "Genet Agonafer cooks doro wot as a long-simmered project — the onion base is cooked down for hours before anything else goes in — and opens only a few nights a week because of it.",
        proof: "Limited hours are the evidence. A kitchen that can serve doro wot seven days a week is not making it the way she does.",
        since: 2000
      },
      {
        name: "Rahel Ethiopian Vegan Cuisine", place: "Little Ethiopia · 1047 S Fairfax Ave",
        slot: "everyday",
        z: "90019", img: "injera-beyaynetu", dish: "Fasting platter",
        why: "Fasting food — the vegan repertoire Ethiopian Orthodox observance requires for much of the year — treated as the main menu rather than a concession.",
        proof: "This is not a Western vegan menu. It exists because of the Orthodox fasting calendar, which is a religious fact, not a dietary trend.",
        since: 2003
      },
      {
        name: "Merkato", place: "Little Ethiopia · 1036 S Fairfax Ave",
        slot: "market",
        z: "90019", img: "berbere", dish: "Berbere, teff, injera",
        why: "Restaurant and grocery in one — spices, teff, berbere, and injera sold to people cooking at home, which is the part of a food culture that restaurants alone cannot show you.",
        proof: "Buy teff flour and berbere. A district with a supply chain is a community; one with only restaurants is a theme.",
        since: null
      }
    ]
  },

  {
    key: "jewish", districtOnly: true, name: "Jewish", tone: "#4C5FA8",
    endonym: "יהודי",
    gate: "outside the census — documented separately",
    noCensus: true,
    region: "Pico-Robertson, Fairfax, Valley Village, Beverlywood",
    regionNote:
      "The census is prohibited from asking about religion, so this community cannot be run " +
      "through the same three gates as the others, and it would be dishonest to pretend " +
      "otherwise. It is included because the alternative — leaving out one of the largest " +
      "Jewish populations in the world on a technicality of instrumentation — would make the " +
      "atlas less true, not more rigorous. Community survey work puts the Los Angeles Jewish " +
      "population in the range of half a million. The districts are unambiguous on the ground: " +
      "Pico-Robertson has the densest concentration of kosher establishments west of the " +
      "Mississippi, and Fairfax Avenue is the older, secular-leaning centre.",
    districts: [
      { name: "Pico-Robertson", z: "90035" },
      { name: "Fairfax", z: "90036" },
      { name: "Beverly Grove", z: "90048" },
      { name: "Valley Village", z: "91607" }
    ],
    spots: [
      {
        name: "Canter's Deli", place: "Fairfax · 419 N Fairfax Ave",
        slot: "late",
        z: "90036", img: "pastrami", dish: "Pastrami on rye",
        why: "Open essentially around the clock since the 1950s and on Fairfax since 1948 — an Ashkenazi deli that is emphatically not kosher, which is itself the history of secular Jewish Los Angeles.",
        proof: "The Reuben with pastrami and cheese on the same plate is the point: this is a deli, not a kosher restaurant, and the distinction matters.",
        since: 1931
      },
      {
        name: "Elat Market", place: "Pico-Robertson · 8730 W Pico Blvd",
        z: "90035", img: "jewmarket", dish: "The market",
        slot: "market",
        why: "A kosher grocery serving the Persian-Jewish community of Pico-Robertson: hummus made on the premises, the widest date selection in the city, herbs and produce in the quantities Persian cooking needs.",
        proof: "The hummus is made in-house and sold by weight, and the date counter runs to a dozen varieties. Both are signs of a market stocking for a specific community, not a general kosher aisle.",
        since: null
      },
      {
        name: "Schwartz Bakery", place: "Pico-Robertson · 8616 W Pico Blvd",
        slot: "sweet",
        z: "90035", img: "challah", dish: "Friday challah",
        why: "Kosher-certified bakery baking challah on the Friday schedule the community actually runs on, and closed for Shabbat.",
        proof: "Try to buy bread on a Saturday. The closure is the certification made visible.",
        since: null
      },
      {
        name: "Jeff's Gourmet Sausage Factory", place: "Pico-Robertson · 8930 W Pico Blvd",
        slot: "dish",
        z: "90035", img: "sausage", dish: "Glatt kosher sausage",
        why: "Glatt kosher sausage made in-house — a category that essentially cannot be bought, only made, because kosher supervision and charcuterie rarely coexist.",
        proof: "Look at the hours, not the menu: it shuts at 3pm on Friday and reopens an hour after Shabbat ends on Saturday night. Certification you can see in the opening times is certification that is real.",
        since: 1996
      }
    ]
  },

  {
    key: "arab", name: "Arab", tone: "#8A6A3E",
    endonym: "عربي",
    gate: "designated district (dispersed residentially)",
    districtOnly: true,
    region: "Little Arabia — Brookhurst Street, Anaheim",
    regionNote:
      "The most instructive failure in the atlas. About 80,600 people of Arab ancestry live in " +
      "Los Angeles County — well past the population gate — and not one ZIP code in either " +
      "county reaches the concentration threshold in a way that points at the district. The ZIP " +
      "code containing Little Arabia, Anaheim's 92804, is 1.8% Arab: barely above the local " +
      "average. Little Arabia is a commercial district, not a residential enclave, and the " +
      "residential map simply cannot see it. It is here on the third gate — Anaheim formally " +
      "recognised the district in 2022, the first officially designated Arab American district " +
      "in the United States — and the map shows it as an outline rather than a fill, because " +
      "colouring it in would be inventing a concentration that does not exist.",
    districts: [
      { name: "Little Arabia (Anaheim)", z: "92804" },
      { name: "Anaheim (south)", z: "92802" },
      { name: "Garden Grove", z: "92840" }
    ],
    subnote:
      "'Arab' is a language family, not a cuisine. Brookhurst holds distinct Lebanese, Syrian, " +
      "Palestinian, Egyptian and Yemeni businesses, and they do not cook the same food.",
    spots: [
      {
        name: "Forn Al Hara", place: "Anaheim · 512 S Brookhurst St",
        slot: "everyday",
        z: "92804", img: "manakish", dish: "Manaeesh from a stone oven",
        why: "Manaeesh baked to order in a stone oven — za'atar, cheese, ground meat — which is a bakery format, eaten in the morning, not a restaurant dish.",
        proof: "Go at breakfast. If the oven is cold and the manaeesh are stacked, you have arrived at the wrong hour for the right reason.",
        since: null
      },
      {
        name: "Aleppo's Kitchen", place: "Anaheim · 449 S Brookhurst St",
        slot: "occasion",
        z: "92804", img: "muhammara", dish: "Muhammara, kibbeh",
        why: "Specifically Aleppine Syrian cooking — muhammara, kibbeh, cherry kebab — opened by a family who left Aleppo. The regional claim is narrow and checkable.",
        proof: "Muhammara should be walnut-heavy and sharp with pomegranate molasses, not a red pepper dip. The nut content is the regional signature.",
        since: 2018
      },
      {
        name: "House of Mandi", place: "Anaheim · Brookhurst St",
        slot: "dish",
        z: "92804", img: "mandi", dish: "Yemeni mandi",
        why: "Yemeni mandi — rice and meat cooked over wood in a pit oven — which is a distinct cuisine from the Levantine food surrounding it on the same street.",
        proof: "Mandi rice should be smoky. If it tastes only of spice, the pit is decorative.",
        since: 2001
      },
      {
        name: "Sahara Falafel", place: "Anaheim · 590 S Brookhurst St",
        slot: "value",
        z: "92804", img: "falafel", dish: "Falafel fried to order",
        why: "Falafel fried to order and nothing else pretending to be the main event — the single-item test that most Middle Eastern restaurants fail by breadth.",
        proof: "Falafel must be green inside and served within a minute or two of frying. Anything sitting under a lamp has already lost.",
        since: null
      }
    ]
  }
];

// ---------------------------------------------------------------- cravings
//
// Places that are excellent but do NOT sit on a measured concentration, so the
// three gates cannot reach them. Turkish, Italian and Portuguese Los Angeles are
// all real and all far below the 25,000-person scale gate; conservas shops are a
// trade, not a community. Keeping these in the same list as the census-backed
// picks would have quietly broken the promise the method page makes, so they
// live here instead, clearly marked as a different kind of claim.
//
// The rule for entry is stricter than for a community pick, not looser: it has
// to be the best in Los Angeles at one nameable thing, and the reason has to be
// checkable without trusting a rating.

export const CRAVINGS = [
  {
    craving: "Hummus",
    source: "jerry",
    name: "Hummus House", place: "Hawthorne · 12211 Hawthorne Blvd (closed Sun & Mon)",
    img: "hummus", dish: "Hummus, made to order",
    why: "A family-run Turkish kitchen that started in 1998 as a halal grocery and reorganised itself around hummus in 2008. It is the rare place where hummus is the menu rather than the thing that arrives before the menu — a dozen-plus preparations, warm, not fridge-cold.",
    proof: "Order it warm and judge the texture against supermarket hummus: it should be loose and pourable, not stiff. Then check the bread arrives hot. A hummus specialist that serves cold hummus and room-temperature bread is a kebab restaurant with a long appetiser list.",
    since: 1998,
    checked: "2026-08",
    note: "Turkish, not Armenian or Arabic — worth stating because the block it sits on reads Levantine."
  },
  {
    craving: "Bread, and an Italian sandwich",
    source: "jerry",
    name: "Giuliano's Delicatessen", place: "Gardena · 1138 W Gardena Blvd",
    img: "giulianos", dish: "The torpedo sandwich",
    why: "Frances and Gaetano Giuliano opened in 1952 selling exactly one thing — the torpedo sandwich — and seventy-plus years later the bakery still bakes every loaf on site each morning: sourdough, country French rolls, walnut raisin wheat. The bread is the reason to drive, not the deli case.",
    proof: "Buy a loaf on its own and eat it with nothing on it. A deli that bakes will pass; one that buys its bread in cannot. Then order the torpedo — the sandwich the place opened with — and see whether the roll holds up under oil.",
    since: 1952,
    checked: "2026-08"
  },
  {
    craving: "Portuguese tinned fish",
    name: "Rápido", place: "Silver Lake · 3707 W Sunset Blvd",
    img: "conservas", dish: "Tricana sardines, Iberian conservas",
    why: "The closest thing Los Angeles has to a Lisbon loja das conservas: actual Portuguese labels — Tricana among them — sold as pantry stock and also opened and served as tapas, rather than stacked as gift tins.",
    proof: "Check whether the tins carry Portuguese producers or only Spanish and Italian ones. Most American 'tinned fish' shops are Iberian in branding and Spanish in fact; Portuguese conservas are a separate tradition with their own canneries.",
    since: null,
    checked: "2026-08"
  },
  {
    craving: "Tinned fish, downtown",
    name: "Kippered", place: "Downtown · Grand Central Market, 317 S Broadway #45",
    img: "tinned", dish: "Sardines, anchovies, smoked shellfish",
    why: "A small counter that treats conservas as a category with grades rather than a novelty — Matiz sardines, Olasagasti anchovies — inside a market you are probably already walking through.",
    proof: "Ask them to explain the price gap between two sardine tins. A real conservas seller will talk about catch season, hand-packing and cure time; a novelty seller will talk about the label art.",
    since: null,
    checked: "2026-08"
  },
  {
    craving: "Tinned fish, the deep end",
    name: "Saltie Girl", place: "West Hollywood · 8615 Sunset Blvd",
    img: "saltie", dish: "100+ tins, plus a raw bar",
    why: "The widest tinned-seafood list in the city by a distance — well over a hundred — which is the only reason to come. It is a restaurant with restaurant pricing, so it is the place to find out what you like before buying by the case elsewhere.",
    proof: "Order two tins of the same fish at different prices and taste them side by side. That comparison is what the list is for, and it is hard to run anywhere else in Los Angeles.",
    since: null,
    checked: "2026-08"
  }
];
