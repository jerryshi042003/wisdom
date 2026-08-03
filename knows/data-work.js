// Knows content — work domain, rebuilt against the ACTUAL stack (2026-08-02).
// Learn links point to the real study routes: internal Confluence pages
// (auth-walled) and private-wiki file paths (cited as text). Card text stays
// free of credentials, hostnames, IDs, people, and dollar figures — the page
// is public; the sources it points to are not.
window.KNOWS_PARTS = window.KNOWS_PARTS || [];
window.KNOWS_PARTS.push([

{
  id: "stack-systems",
  domain: "work",
  title: "The stack, as it actually is",
  blurb: "Not vendor brochures — the systems as they exist in this warehouse, with the real docs to study.",
  items: [
    { id: "old-dwh-synapse", kind: "concept", name: "Old DWH (Synapse)",
      hook: "The legacy warehouse is Azure Synapse / SQL, loaded by Data Factory and stored procs — home of the veritix.* and sas.* schemas, still feeding a long tail of production Power BI.",
      why: ["Retirement is blocked by real dependents: over a hundred Power BI datasource references, the partnerships media schema, legacy demographics. 'Old is unused' is false, and acting on it would break live reporting.",
            "Its signature failure is false-green: frozen tables under reports that keep refreshing successfully. The freshness of the SOURCE, not the run status, is the health check."],
      learn: [
        { label: "Confluence: Sales Rep Tag Validation — Old DWH Fanout", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/157024257" },
        { label: "Wiki: access.md § Legacy Warehouse / Old Platform (+ VPN preflight)" },
        { label: "Wiki: tasks/current/data-platform-cost-techdebt-audit-2026-06-11.md — findings #1/#5" }
      ],
      quiz: [
        { q: "The old DWH's technology and its signature failure mode are—", choices: ["Azure Synapse/SQL; false-green — frozen source tables under reports that refresh successfully", "Databricks; cluster overruns", "Oracle; license expiry", "Access databases; file locks"], a: 0,
          why: "A stored-proc output frozen for months while dashboards refresh green is the canonical incident shape here — and why source freshness, not run status, is the real health check." }
      ] },
    { id: "new-dwh-databricks", kind: "concept", name: "New DWH (Databricks)",
      hook: "Six layer catalogs with the environment in the catalog name (prod bronze is bare `bronze`); bronze/silver schemas named by SOURCE, gold schemas named by BUSINESS DOMAIN; deployed as Asset Bundles on merge.",
      why: ["The naming convention IS the architecture: `bronze.axs_vs_ticketing` tells you provenance, `prod_gold.ticketing` tells you purpose. Knowing which half you're querying answers most 'where should this logic live' questions.",
            "The operating rule to memorize: code moves on merge, data moves on run — definition, runtime, data, and consumer are four independent states, and most confusion is two of them being conflated."],
      learn: [
        { label: "Wiki: aeg-sports-databricks/docs/guide/ — README → platform.md → runtime.md (the best curriculum in the workspace)" },
        { label: "Confluence: Silver Layer QA and Validation Notes", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/117407750" },
        { label: "Confluence: Gold Layer QA and Validation", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/118194177" }
      ],
      quiz: [
        { q: "Bronze/silver vs gold schema naming follows—", choices: ["Source-named bronze/silver (axs_vs_ticketing, dynamics_365), business-named gold (ticketing, crm, sfmc, identity)", "Alphabetical naming everywhere", "Team-named schemas", "Random legacy names"], a: 0,
          why: "Provenance below, purpose above. It's why a question about a weird value goes to the source-named layer and a question about a business definition goes to gold." },
        { q: "'Code moves on merge, data moves on run' means—", choices: ["Merging deploys definitions; only job/pipeline runs actually move data — deploy ≠ done", "Merges trigger full reloads", "Data changes require commits", "Runs deploy code"], a: 0,
          why: "The four-state model (definition/runtime/data/consumer) explains most 'but I merged it' surprises: acceptance is a separate act from deployment." }
      ] },
    { id: "axs-ticketing-real", kind: "concept", name: "AXS + Flash, as built",
      hook: "AXS is primary ticketing; Flash (ex-Flash Seats) is secondary/transfer/scans. Landed by Fivetran from an AXS-side Snowflake share; the primary fact is one row per order item, built over an INNER join to the product mapping.",
      why: ["That inner join is the #1 cause of 'a real sale is missing from reporting': an unmapped product silently drops its sales. The manual season manifest control table drives the event/season/product dims — reporting correctness is downstream of a spreadsheet-grade control surface.",
            "AXS Back Office is order-level operational truth only; analytics truth is the warehouse. Keeping those roles straight prevents a whole genre of mismatch tickets."],
      learn: [
        { label: "Wiki: aeg-sports-databricks/docs/guide/ticketing.md (+ docs/manual/new_season.md)" },
        { label: "Confluence: Evaluation and Answers for the Ticketing Datamodel", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/98533377" },
        { label: "Confluence: Galaxy Ticketing Validation hub", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/156958721" }
      ],
      quiz: [
        { q: "A real ticket sale is missing from gold reporting. The #1 structural suspect:", choices: ["The inner join to the product mapping — an unmapped product drops its sales silently", "AXS lost the order", "The report cache", "A timezone shift"], a: 0,
          why: "Grain is one row per order item, but only for items that map. Unmapped product → invisible revenue → 'the numbers are wrong.' Check the mapping control table first." }
      ] },
    { id: "veritix-legacy", kind: "concept", name: "Veritix (the legacy name)",
      hook: "Veritix is the legacy name of the same AXS/Flash family — and in this stack it exists only as old-Synapse schemas whose loads have decayed.",
      why: "The archaeology rule made concrete: a frozen legacy payments table quietly became the root cause of stale commission reports. Same business domain as new gold ticketing, not byte-for-byte identical — validation must reconcile meaning, not just counts.",
      learn: [
        { label: "Wiki: source-catalog.md — the Veritix naming note" },
        { label: "Wiki: tasks/current/commissions-kings-validation-surface.md — old-vs-new lineage" }
      ] },
    { id: "dynamics-crm-real", kind: "concept", name: "Dynamics CRM, as wired",
      hook: "System of record for sales workflow (opportunities, contacts, campaigns, reps). One delegated-OAuth Fivetran connector is the sole writer into bronze; CRM↔SFMC is an Azure Function webhook lane — no native connector.",
      why: ["The single-writer fact is the operational key: when CRM data is stale, the connector's auth is the first suspect (delegated OAuth breaks when its human's session does).",
            "Knowing the SFMC link is a custom webhook — not a product integration — sets correct expectations about what it can and can't sync."],
      learn: [
        { label: "Confluence: CRM — Dynamics — Overview", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/12189779" },
        { label: "Wiki: progress/crm-progress.md — the delegated-OAuth outage writeup (how it actually breaks)" },
        { label: "Wiki: aeg-sports-databricks/docs/guide/customer-identity.md § Dynamics CRM" }
      ],
      quiz: [
        { q: "Dynamics data reaches the warehouse via—", choices: ["A single Fivetran connector with delegated OAuth — the sole writer of the bronze schema", "Nightly CSV exports", "Marketing Cloud Connect", "Direct database replication"], a: 0,
          why: "One connector, one auth chain: CRM staleness debugging starts at the connector, and delegated OAuth means a human identity is load-bearing." }
      ] },
    { id: "sfmc-real", kind: "concept", name: "SFMC, as built",
      hook: "One business unit per franchise plus a shared parent. Integration is files over SFTP into Automation Studio imports — there is NO Marketing Cloud Connect anywhere in this stack.",
      why: ["The whole outbound design is desired-state views compared against snapshots, exporting daily deltas keyed by hashed email (customers), ticket+event (tickets), event (events). Deltas never emit deletions, and snapshots advance only after transfer success — failures retry instead of losing rows.",
            "You built and reconciled this; it's pre-marked. It's in the deck because it anchors the quiz bank other people's questions come from."],
      learn: [
        { label: "Wiki: workstreams/sfmc.md — Durable Operating Model + the 7-step validation ladder" },
        { label: "Wiki: aeg-sports-databricks/docs/guide/activation-privacy.md — delivery keys, delta/retry semantics" },
        { label: "Wiki: aeg-sports-data-docs/docs/sfmc/ — object map + which-object-do-I-query" }
      ],
      preVerdict: "know", evidence: "you built the feed design and its validation ladder",
      quiz: [
        { q: "The warehouse↔SFMC integration mechanism is—", choices: ["Delta CSV files over SFTP triggering Automation Studio imports — no Marketing Cloud Connect exists here", "Marketing Cloud Connect", "Direct API writes to Data Extensions", "A Kafka stream"], a: 0,
          why: "Searched corpus-wide: no MC Connect. File-drop + import definitions is the actual contract — which is why header rows, file prefixes, and import mappings are load-bearing objects." },
        { q: "The customers feed's delivery key is—", choices: ["Hashed email (email_sha)", "Plain email address", "A numeric customer id", "Name + zip"], a: 0,
          why: "Identity travels hashed; tickets key on (ticket_id, event_id), events on event_id. Knowing the keys is knowing what a duplicate or a miss even means per feed." }
      ] },
    { id: "stellaralgo-real", kind: "concept", name: "StellarAlgo, as used",
      hook: "The CDP / single-customer-view vendor: pushes SCV parquet batches in, receives the CCPA suppression drop out. Explicitly a customer-enrichment lane — not social, not ads.",
      why: ["Two directions matter: inbound SCV entities become the identity gold (fans, email-to-accounts), and outbound it's a compliance TARGET — admitted privacy requests must reach its suppression files.",
            "Current honest limitation recorded in the canon: promoted identity gold is hardcoded to one franchise — files landing in storage does not make a lane cross-franchise."],
      learn: [
        { label: "Wiki: source-catalog.md § Identity / StellarAlgo — the dated evidence trail" },
        { label: "Wiki: aeg-sports-databricks/docs/guide/customer-identity.md § StellarAlgo identity — the selection contract" },
        { label: "Confluence: AEG Sports Data Warehouse — CCPA Flow and New-Source Controls", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/169377794" }
      ],
      quiz: [
        { q: "StellarAlgo's role in this stack is—", choices: ["CDP/single-customer-view: SCV data in, CCPA suppression outputs back out", "Social media analytics", "A ticketing system", "An email sending engine"], a: 0,
          why: "It's the identity/enrichment lane and a privacy-compliance endpoint at once — which is why it appears in both the identity gold and the CCPA flow." }
      ] },
    { id: "fanrally-real", kind: "concept", name: "FanRally, as used",
      hook: "The membership/subscription platform: flex voucher plans, credit banks, monthly memberships. Sales land daily from its API; commissions for one franchise are computed from its product families.",
      why: "The transactions-to-memberships shift wearing this stack's clothes — and a timezone landmine: its timestamps are Pacific tenant-local wall clock, not UTC, which matters every time its revenue is joined to anything else.",
      learn: [
        { label: "Wiki: aeg-sports-databricks/docs/guide/source-feeds.md — the contract table" },
        { label: "Wiki: today/2026-07-07 — the Reign commissions rules meeting transcript (the business rules, verbatim from the owner)" }
      ] },
    { id: "acxiom-two-lanes", kind: "concept", name: "Acxiom — two different lanes",
      hook: "Legacy demographics live only in old Synapse (never migrated, materially better coverage); the current lane arrives via AXS into identity gold. Same vendor name, two unrelated pipelines.",
      why: "The trap is treating them as one thing: the old lane is richer but frozen and unmigrated by explicit decision; the new lane is production-accepted but for internal analyst reporting only pending contract confirmation. Which lane a question means changes the answer.",
      learn: [
        { label: "Wiki: tasks/current/cross-franchise-demographics-migration-gap.md — the source-decision ledger" },
        { label: "Wiki: source-catalog.md § Legacy Acxiom / Demographics Enrichment" }
      ] },
    { id: "powerbi-real", kind: "concept", name: "Power BI, as governed",
      hook: "Two workspaces that matter (production + TEST). The repo stores PBIP/TMDL text only — never PBIX; the pipeline validates but NEVER publishes (publishing is a manual Desktop act); Fabric Git integration is workspace-level and destructive.",
      why: ["The commissions lesson generalized: production reports carry saved report-side filters, so presentation truth ≠ data truth — a report can disagree with its own dataset by design.",
            "Three copies of every report exist (repo / desktop file / published item). Most Power BI confusion is two copies being mistaken for each other."],
      learn: [
        { label: "Wiki: engineering-map.md § Power BI Artifact Model (PBIP / Fabric) — the model in one screen" },
        { label: "Wiki: aeg-sports-powerbi README — operating model + analyst branch workflow" },
        { label: "Wiki: tasks/current/powerbi-report-logic-governance-audit.md — the report-local SQL/DAX sprawl" }
      ],
      quiz: [
        { q: "A published report disagrees with its own semantic model's numbers. Likely by design, because—", choices: ["Saved report-side filters shape what renders — presentation truth ≠ data truth", "Power BI caches forever", "The model is corrupt", "RLS always hides rows"], a: 0,
          why: "Production reports here carry saved filters (active reps only, exclusions). Any validation that queries the model but ignores report-side filters will 'find' discrepancies that are configuration." }
      ] }
  ]
},

{
  id: "flows-contracts",
  domain: "work",
  title: "Flows & contracts",
  blurb: "How data actually moves — the feeds, returns, consent chains, and the clock rules under all of it.",
  items: [
    { id: "feed-trio", kind: "concept", name: "The Customer/Ticket/Event feed trio",
      hook: "Per franchise: desired-state views in gold, compared against snapshot tables, emitting daily-delta CSVs to SFMC. Snapshots advance only on transfer success; deltas never emit deletions.",
      why: "The design encodes its failure semantics: a failed transfer is retried (not lost), and absence of a row means 'no change,' never 'delete.' Most feed questions dissolve once those two properties are held.",
      learn: [
        { label: "Wiki: aeg-sports-databricks/docs/guide/activation-privacy.md — the daily sequence" },
        { label: "Wiki: aeg-sports-data-docs/docs/sfmc/lak-customer-feed-flow.md" }
      ],
      preVerdict: "know", evidence: "you designed the delta/snapshot semantics" },
    { id: "engagement-return", kind: "concept", name: "The engagement return lane",
      hook: "SFMC tracking extracts (sends, opens, clicks, bounces, unsubscribes) come back over SFTP through a function app into bronze, becoming the email-marketing gold that attribution joins against ticketing orders.",
      why: "Marketing measurement is this loop closing: outbound feeds make audiences, the return lane proves engagement, and attribution is clicks × orders. When an attribution number looks wrong, walk this lane before doubting the model.",
      learn: [
        { label: "Confluence: Email Marketing Pipeline Overview", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/89784322" },
        { label: "Wiki: engineering-map.md § SFMC Inbound Engagement To DWH" }
      ] },
    { id: "optin-consent-lane", kind: "concept", name: "The opt-in/consent lane",
      hook: "Opt-in status extracts flow back from SFMC into delta and master tables; consent precedence is enforced in code; discrepancies get adjudicated case-by-case against the warehouse.",
      why: "Consent is the fail-closed table of the whole system — and the place where DWH↔SFMC disagreements are most consequential. The adjudication transcript is the best training document for how to think when the two systems disagree about a human.",
      learn: [
        { label: "Wiki: today/2026-07-23 — Galaxy customer-feed opt-in discrepancies, cleaned transcript" },
        { label: "Wiki: aeg-sports-databricks/docs/guide/activation-privacy.md — consent precedence" }
      ] },
    { id: "ccpa-chain", kind: "concept", name: "The CCPA chain",
      hook: "Admitted OneTrust privacy requests update franchise consent records and produce the StellarAlgo suppression outputs — deletion/opt-out as a pipeline with proof, not a promise.",
      why: "The concrete answer to 'delete this customer everywhere': a request travels intake → consent records → partner suppression files. New sources are onboarded only through controls that keep this chain closable.",
      learn: [
        { label: "Confluence: AEG Sports Data Warehouse — CCPA Flow and New-Source Controls (you wrote it)", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/169377794" }
      ],
      preVerdict: "know", evidence: "you authored the CCPA flow page",
      quiz: [
        { q: "The CCPA request chain runs—", choices: ["OneTrust admitted requests → franchise consent records → StellarAlgo suppression outputs", "Email inbox → manual spreadsheet → annual cleanup", "SFMC → CRM → warehouse", "Legal team → DBA → backup deletion"], a: 0,
          why: "Privacy as data engineering: intake tool, canonical consent state, partner-facing suppression artifact. Every new source must be attachable to this chain before onboarding." }
      ] },
    { id: "commissions-engine", kind: "concept", name: "The commissions engine",
      hook: "A shared replacement fact — one row per payment distribution unit across all three franchises — while legacy reports remain in production use and replacements prove themselves in TEST.",
      why: ["Grain discipline at its most consequential: commissions disputes are paychecks, so the fact's grain (payment distribution) and the mapping workbook that classifies products are the two objects worth knowing cold.",
            "Operational surprise worth keeping: the mapping workbook reaches the platform via a Logic App copy, not the data factory — the one mover that isn't where movers usually live."],
      learn: [
        { label: "Confluence: Commission reporting (the contract page — you wrote it)", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/168230913" },
        { label: "Wiki: tasks/current/commissions-kings-validation-surface.md + commissions-reign-validation-surface.md" }
      ],
      preVerdict: "know", evidence: "you built the replacement fact + validation surfaces",
      quiz: [
        { q: "The replacement commissions fact's grain is—", choices: ["One row per payment distribution unit", "One row per ticket", "One row per rep per month", "One row per event"], a: 0,
          why: "Commissions are computed on payment distributions, not tickets — refunds, splits, and plans all resolve at that grain, which is why it was chosen as the shared fact." }
      ] },
    { id: "timezone-contracts", kind: "concept", name: "The timezone contracts",
      hook: "Per-domain clock truths: AXS transactions are Central wall clock, AXS event starts Pacific, Flash scans UTC but Flash creation Pacific, SFMC engagement fixed CST with no DST, FanRally Pacific tenant-local. A trailing Z proves nothing.",
      why: "The single best 'how this stack really behaves' document — because every cross-source join crosses at least one clock boundary, and attribution was nearly promoted on top of a mixed-clock join. The audit's rule: source-clock evidence beats developer assumption, every time.",
      learn: [
        { label: "Wiki: tasks/current/dwh-timezone-contract-audit.md — the canonical audit" }
      ],
      quiz: [
        { q: "SFMC engagement timestamps in this stack are—", choices: ["Fixed CST (UTC-6) with no daylight saving — permanently offset from Pacific reality", "UTC", "Pacific local", "Whatever the browser was set to"], a: 0,
          why: "A fixed-offset clock that ignores DST: naive joins to Pacific ticketing drift by one or two hours seasonally — precisely the kind of error that corrupts attribution silently." },
        { q: "'The column type is TIMESTAMP and ends in Z, so it's UTC' —", choices: ["Proves nothing; only source-clock evidence (offsets, raw distributions, cross-table event order) establishes the contract", "Is a safe assumption", "Is guaranteed by Spark", "Is true for all vendors"], a: 0,
          why: "The audit's core rule: storage format is not semantics. Several sources here store local wall clock inside UTC-shaped types — the type system is lying to you." }
      ] },
    { id: "table-update-triggers", kind: "concept", name: "Table-update triggers over crons",
      hook: "The critical paths don't run on schedules — they run when their source bronze table actually updates, with settle windows and minimum intervals; freshness evidence is the Delta commit, not the connector's sync column.",
      why: "The design answer to 'the source was late so downstream ran on nothing': trigger on data arrival rather than clock time. And the audit habit it implies — prove a table changed by its commit history, not by a timestamp column someone might backfill.",
      learn: [
        { label: "Wiki: aeg-sports-databricks/docs/guide/platform.md + runtime.md — trigger inventory" }
      ] },
    { id: "fanout-lesson", kind: "concept", name: "The fanout lesson",
      hook: "Old DWH counted the same tickets multiple times through sales-rep tag attribution; the new warehouse's LOWER counts were the correct ones. Disagreement with legacy is not evidence of new-system error.",
      why: "The migration's best epistemics case study: validation that treats the legacy number as truth will 'fix' the new system into repeating old mistakes. Reconciliation must explain the DELTA, not chase equality.",
      learn: [
        { label: "Confluence: Sales Rep Tag Validation — Old DWH Fanout (the writeup)", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/157024257" }
      ],
      quiz: [
        { q: "New DWH shows fewer tickets than old DWH for rep-tagged sales. The fanout finding says—", choices: ["Old was double-counting via rep-tag joins; the lower new count is correct", "New DWH is dropping tickets", "Both are wrong", "The difference is timezone drift"], a: 0,
          why: "A join that fans out inflates legacy counts. The validation lesson: explain the difference mechanically before assuming the new system is broken — sometimes migration is the audit legacy never got." }
      ] }
  ]
},

{
  id: "platform-craft",
  domain: "work",
  title: "Working the platform",
  blurb: "The operating patterns — governance, monitoring, permissions, and the modeling fundamentals that survive contact with this stack.",
  items: [
    { id: "deploy-vs-run", kind: "concept", name: "Deploy vs run vs accept",
      hook: "Asset Bundles deploy definitions on merge; runs move data; acceptance is a third, separate act. Four independent states: definition, runtime, data, consumer.",
      why: "The mental model that dissolves most platform confusion — 'it merged' answers a definition question, 'it ran' answers a runtime question, and neither answers whether the consumer sees correct data.",
      learn: [
        { label: "Wiki: engineering-map.md § Deploy vs Run + § Databricks Vocabulary" },
        { label: "Wiki: aeg-sports-databricks/docs/guide/platform.md — 'deploy, run, and acceptance are separate'" }
      ] },
    { id: "uc-three-layers", kind: "concept", name: "The three permission layers",
      hook: "Unity Catalog grants, workspace permissions, and account-level roles are three different systems — most stuck access requests are a grant made at the wrong layer.",
      why: "Why 'I gave X access and it still fails' recurs: data (UC), compute/workspace, and account identities each gate different acts. Diagnosing which layer denied is the whole skill.",
      learn: [
        { label: "Wiki: access.md § Unity Catalog vs Workspace vs Account Permissions" }
      ],
      quiz: [
        { q: "Access was granted but the query still fails. First diagnostic question:", choices: ["Which of the three layers (UC grant / workspace / account) actually denied it", "Whether to escalate to the vendor", "Whether the cluster is too small", "Whether the table is corrupt"], a: 0,
          why: "Three independent gatekeepers: a UC SELECT grant doesn't confer workspace access to compute, and neither confers account-level identity. Most dead-ends are a right grant at the wrong layer." }
      ] },
    { id: "dlt-monitoring-framework", kind: "concept", name: "The DLT monitoring framework",
      hook: "Pipeline observability as tables: run durations, record counts, null checks, update percentages, success/failure, all stored queryably per stage and source.",
      why: "The house pattern for 'is the pipeline actually healthy': metrics land in tables you can query and alert on, instead of vibes and green checkmarks — the antidote to the old DWH's false-green disease, built into the new one.",
      learn: [
        { label: "Confluence: Monitoring Implementation (the DLT framework guide)", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/111673371" },
        { label: "Confluence: Monitoring Guidelines", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/111345685" }
      ] },
    { id: "new-source-onboarding", kind: "concept", name: "New-source onboarding",
      hook: "A decision framework (managed connector vs custom ingestion) plus a security checklist: PII classification, masking, naming conventions, ownership — before any data lands.",
      why: "The governance philosophy is explicitly 'minimum viable governance': only the controls that keep analytics shippable and the CCPA chain closable. The checklist exists so onboarding decisions are made once, deliberately, instead of rediscovered per source.",
      learn: [
        { label: "Confluence: New Source Guidelines — Data Platform Standards", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/86736897" },
        { label: "Confluence: Security Checklist — New Data Source Onboarding", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/111345665" },
        { label: "Confluence: Data Governance Guidelines (MVG)", url: "https://lakings.atlassian.net/wiki/spaces/SPORT/pages/111083523" }
      ] },
    { id: "star-schema", kind: "concept", name: "Star schema & grain",
      hook: "Facts are events at a declared grain; dimensions are context. 'What does one row represent?' resolves most metric disputes before they start.",
      why: "The house examples make it concrete: the ticketing fact is one row per order item, commissions one per payment distribution. Sum a metric across mismatched grains and you double-count silently — half of all 'numbers don't match' incidents.",
      learn: [
        { label: "Star schema (Kimball pattern)", url: "https://en.wikipedia.org/wiki/Star_schema" },
        { label: "Wiki: the _d/_f suffix conventions across gold schemas" }
      ],
      quiz: [
        { q: "'Grain' of a fact table means—", choices: ["What one row represents — one order item, one payment distribution, one scan", "Its storage format", "Its refresh frequency", "Its owner"], a: 0,
          why: "Declared grain is the contract every aggregation depends on. The stack's two money facts (order items, payment distributions) are deliberate, different grains — confusing them miscounts revenue or pay." }
      ] },
    { id: "scd-history", kind: "concept", name: "Slowly changing dimensions",
      hook: "Type 1 overwrites; Type 2 versions rows with effective dates. The stack's identity and CRM guides carry explicit row-survival contracts for exactly this reason.",
      why: "Every 'as-of' question — what plan was this account on when it renewed — is an SCD question. Choosing overwrite where history was needed is unrecoverable data loss disguised as simplicity.",
      learn: [
        { label: "Wiki: aeg-sports-databricks/docs/guide/customer-identity.md — the SCD/row-survival contracts" },
        { label: "Slowly changing dimension (background)", url: "https://en.wikipedia.org/wiki/Slowly_changing_dimension" }
      ] },
    { id: "idempotency-backfill", kind: "concept", name: "Idempotency & backfills",
      hook: "A pipeline is idempotent when rerunning it lands the same result — merge/upsert by key, or overwrite-partition, never blind append.",
      why: "The property that makes recovery boring: the feed snapshots advance only on success, the append endpoints dedupe by id, and reruns are safe by construction. Pipelines without it turn every retry into a potential double-count incident.",
      learn: [
        { label: "Idempotence (background)", url: "https://en.wikipedia.org/wiki/Idempotence" },
        { label: "Wiki: the delta/snapshot retry semantics in guide/activation-privacy.md" }
      ] },
    { id: "dbu-cost-attribution", kind: "concept", name: "Compute economics & cost attribution",
      hook: "Two bills (platform units + cloud VMs); serverless pipelines and auto-stop warehouses are the levers; per-job attribution comes from the platform's own system billing tables — a standing query, not an invoice archaeology project.",
      why: "The cost work's real shape: idle and oversized compute dominate, storage is a rounding error, and a credible cost dashboard is system tables joined to job metadata plus scheduled cloud cost exports — no AI required to operate once built.",
      learn: [
        { label: "Databricks system tables (billing/usage) docs", url: "https://docs.databricks.com/en/administration-guide/system-tables/index.html" },
        { label: "Wiki: tasks/current/data-platform-cost-techdebt-audit-2026-06-11.md — the house method" }
      ] }
  ]
}

]);
