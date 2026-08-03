// Knows content — concepts (personal domain).
// Hooks are conceptual and checkable; ties to specific projects are framed as
// uses, not claims about the projects' results.
window.KNOWS_PARTS = window.KNOWS_PARTS || [];
window.KNOWS_PARTS.push([

{
  id: "ai-cv",
  domain: "personal",
  title: "Computer vision & video AI",
  blurb: "The concept layer under the tennis-CV lane, the technique library, and every 'can a model see my serve?' question.",
  items: [
    { id: "pose-estimation", kind: "concept", name: "Pose estimation",
      hook: "Models that turn a video frame into a stick figure — body joints as coordinates (COCO's 17 keypoints is the common scheme).",
      why: "The foundation of any serve-analysis or technique-comparison idea: before angles and tempo can be measured, every frame must become joints. Its failure modes — occlusion, motion blur, weird camera angles — are exactly where sports video is hardest.",
      learn: [{ label: "First Principles of Computer Vision — Shree Nayar's free lecture series (the 3B1B of CV)", url: "https://fpcv.cs.columbia.edu/" }],
      quiz: [
        { q: "The output of 2D pose estimation on one frame is—", choices: ["Pixel coordinates (and confidences) for each body joint", "A 3D mesh of the body", "A segmentation mask", "An action label"], a: 0,
          why: "Joints-with-confidence is the contract. Everything downstream — angles, tempo, comparison against a pro — is arithmetic on those points, which is why joint quality caps the whole pipeline." }
      ] },
    { id: "keypoint-detection", kind: "concept", name: "Keypoint detection",
      hook: "The general version of pose: find semantically meaningful points — corners of a court, racket tip, ball — and track them across frames.",
      why: "Court keypoints let you turn a phone video into court-relative coordinates (where did the serve land?), which is the difference between 'looks wide' and a measured call.",
      learn: [{ label: "Keypoint / interest point detection", url: "https://en.wikipedia.org/wiki/Interest_point_detection" }] },
    { id: "optical-flow", kind: "concept", name: "Optical flow",
      hook: "Per-pixel motion between two frames — which direction every pixel moved, and how far.",
      why: "The classical way to measure motion without recognizing anything. Racket-head speed proxies, camera-shake removal, and frame interpolation all lean on it.",
      learn: [{ label: "FPCV motion/optical-flow lectures (Nayar, free)", url: "https://fpcv.cs.columbia.edu/" }] },
    { id: "object-tracking", kind: "concept", name: "Object tracking",
      hook: "Keeping identity across frames — 'this box in frame 12 is the same ball as frame 13' — detection is per-frame, tracking is the thread through time.",
      why: "Ball and player tracking is where sports CV lives or dies; the standard failure is identity switches when players cross. If you ever evaluate a tracker, count ID switches, not just detections.",
      learn: [{ label: "Multiple object tracking", url: "https://en.wikipedia.org/wiki/Video_tracking" }],
      quiz: [
        { q: "Detection vs tracking:", choices: ["Detection finds objects per frame; tracking links them into identities over time", "They're synonyms", "Tracking runs only on the first frame", "Detection requires radar"], a: 0,
          why: "A perfect detector can still make a useless system if identities swap every rally — persistence over time is its own problem with its own metrics." }
      ] },
    { id: "action-recognition", kind: "concept", name: "Action recognition",
      hook: "Classifying what's happening in a clip — forehand vs backhand vs serve — from motion patterns, not single frames.",
      why: "The auto-labeling layer any technique library eventually wants: feed match video, get back per-shot clips. Current models are good at coarse classes and shaky at fine ones — 'slice vs flat' is much harder than 'serve vs rally.'",
      learn: [{ label: "Activity recognition", url: "https://en.wikipedia.org/wiki/Activity_recognition" }] },
    { id: "homography", kind: "concept", name: "Homography",
      hook: "The 3×3 transform mapping one plane to another — how a slanted phone view of a court becomes a top-down diagram.",
      why: "The single most useful classical-CV trick for sport: four court corners in view and every ball bounce becomes a court coordinate. No neural net required.",
      learn: [{ label: "Szeliski, Computer Vision: Algorithms and Applications — the free standard textbook", url: "https://szeliski.org/Book/" }],
      quiz: [
        { q: "To compute a court homography from one camera you need at least—", choices: ["Four point correspondences on the court plane", "A second camera", "A depth sensor", "The camera's GPS"], a: 0,
          why: "Four known points on a plane pin down the 3×3 transform (up to scale). It's why broadcast overlays existed decades before deep learning." }
      ] },
    { id: "camera-calibration", kind: "concept", name: "Camera calibration",
      hook: "Measuring a camera's intrinsics — focal length, distortion — so pixels can be converted into real-world angles and distances.",
      why: "The gap between 'the model drew a skeleton' and 'the elbow angle is 142°.' Uncalibrated single-phone setups can compare, but absolute claims need calibration — a recurring honesty line for measurement projects.",
      learn: [{ label: "Szeliski ch. on cameras + calibration (free textbook)", url: "https://szeliski.org/Book/" },
              { label: "FPCV camera lectures", url: "https://fpcv.cs.columbia.edu/" }] },
    { id: "shutter-fps", kind: "concept", name: "Frame rate vs shutter speed",
      hook: "FPS is how many frames per second; shutter is how long each frame's light is collected — 240fps with a slow shutter still gives you blurred rackets.",
      why: "The most common reason amateur technique video is unusable: motion blur from shutter, not lack of frames. Filming settings are a measurement decision, not a taste decision.",
      learn: [{ label: "Shutter speed basics", url: "https://en.wikipedia.org/wiki/Shutter_speed" }],
      quiz: [
        { q: "A 240fps clip still shows a blurred racket head because—", choices: ["Each frame's shutter stayed open too long for the motion", "The bitrate was too low", "240fps always blurs", "The lens was wide-angle"], a: 0,
          why: "Frame count and per-frame exposure are independent. For swing analysis you want fast shutter (good light helps) — more frames of blur is still blur." }
      ] },
    { id: "transformers-attention", kind: "concept", name: "Transformers & attention",
      hook: "The 2017 architecture where every token can look at every other token and decide what matters — the design under essentially all current frontier models.",
      why: "Explains model behavior you see daily: why context is quadratic-expensive, why order matters less than prominence, why 'put the important thing where attention finds it' is real prompt advice.",
      learn: [{ label: "3Blue1Brown's neural-network series — the visual route", url: "https://www.3blue1brown.com/topics/neural-networks" },
              { label: "Attention Is All You Need (the 2017 paper)", url: "https://arxiv.org/abs/1706.03762" }],
      quiz: [
        { q: "'Attention' in a transformer means—", choices: ["Each token computes weighted relevance over other tokens when building its representation", "The model's focus mode setting", "Human review of outputs", "Attention-grabbing training data"], a: 0,
          why: "It replaced recurrence: relevance is computed pairwise, in parallel. That's the source of both the power and the quadratic context cost you pay in tokens." }
      ] },
    { id: "embeddings", kind: "concept", name: "Embeddings",
      hook: "Text, images, or audio mapped to vectors where distance ≈ similarity — the data structure behind search, RAG, clustering, and 'find clips like this one.'",
      why: "The technique library's future search box ('show me high-elbow serves') is an embedding query. Also how speaker-ID pipelines compare voices: distance in voiceprint space.",
      learn: [{ label: "Karpathy's Zero to Hero — build embeddings from scratch (free course)", url: "https://karpathy.ai/zero-to-hero.html" }],
      quiz: [
        { q: "The property that makes embeddings useful is—", choices: ["Semantic similarity becomes geometric closeness", "They compress files losslessly", "They're human-readable", "They encrypt content"], a: 0,
          why: "Once meaning is geometry, search is nearest-neighbor math. Every 'semantic search' product is this one property, productized." }
      ] },
    { id: "diffusion-models", kind: "concept", name: "Diffusion models",
      hook: "Generate images/video by learning to reverse noise — start from static, denoise toward the prompt, step by step.",
      why: "The generative side of your visual lanes (and the reason 'AI motion' video tools exist). Knowing the mechanism explains their tells: coherent texture, struggling hands, drifting identity over long video.",
      learn: [{ label: "Lilian Weng — What Are Diffusion Models? (the canonical explainer)", url: "https://lilianweng.github.io/posts/2021-07-11-diffusion-models/" }] },
    { id: "finetune-vs-rag", kind: "concept", name: "Fine-tuning vs RAG",
      hook: "Two ways to make a model know your stuff: change the weights (fine-tune) or retrieve documents into context at ask time (RAG).",
      why: "The decision you actually face with corpora like the Choe archive: RAG for facts that change and need citations; fine-tuning for style, format, and behavior. Voiceprint speaker-ID, notably, is neither — it's embeddings.",
      learn: [{ label: "Retrieval-augmented generation", url: "https://en.wikipedia.org/wiki/Retrieval-augmented_generation" }],
      quiz: [
        { q: "You want an assistant to cite exact lines from a changing document set. Better fit:", choices: ["RAG — retrieve current documents into context", "Fine-tuning on the documents", "Bigger batch size", "Lower temperature only"], a: 0,
          why: "Weights are a bad database: expensive to update, can't cite, will approximate. Retrieval keeps facts fresh and attributable; tune weights for behavior, not facts." }
      ] },
    { id: "distillation", kind: "concept", name: "Distillation",
      hook: "Training a small model to imitate a big one's outputs — most 'fast' and 'mini' models are distilled students of a larger teacher.",
      why: "Explains the tier menus every provider sells and why small models feel like compressed impressions of big ones. Also the economics: distillation is how frontier capability trickles into affordable tiers.",
      learn: [{ label: "Hinton et al., Distilling the Knowledge in a Neural Network (the origin paper)", url: "https://arxiv.org/abs/1503.02531" }] },
    { id: "quantization", kind: "concept", name: "Quantization",
      hook: "Storing model weights in fewer bits (16 → 8 → 4) to cut memory and speed up inference, trading a little quality for a lot of feasibility.",
      why: "The single trick that decides what runs on your 24GB Mac: a 70B model at 4-bit fits where full precision never could. When a local model seems slightly dumber than its benchmark, quantization is often the reason.",
      learn: [{ label: "llama.cpp — where quantization practice actually lives", url: "https://github.com/ggml-org/llama.cpp" }],
      quiz: [
        { q: "Quantizing a model 16-bit → 4-bit roughly—", choices: ["Quarters the memory footprint with modest quality loss", "Quarters the parameter count", "Doubles training speed only", "Changes nothing but file format"], a: 0,
          why: "Same weights, fewer bits each. It's a memory/quality dial — and the reason local-model culture talks in bits as much as parameters." }
      ] }
  ]
},

{
  id: "compute-hardware",
  domain: "personal",
  title: "Compute & hardware",
  blurb: "CUDA, VRAM, unified memory — the vocabulary under every 'can my machine run it?' question.",
  items: [
    { id: "cpu-vs-gpu", kind: "concept", name: "CPU vs GPU",
      hook: "CPUs: a few fast cores for sequential logic. GPUs: thousands of slow cores for identical parallel math — which is what neural nets are.",
      why: "The first sorting question of all AI infrastructure. Matrix multiply is embarrassingly parallel, so models live on GPUs; orchestration, parsing, and everything agentic stays CPU.",
      learn: [{ label: "GPU computing", url: "https://en.wikipedia.org/wiki/Graphics_processing_unit" }],
      quiz: [
        { q: "Neural nets run on GPUs because—", choices: ["Their core op — matrix multiply — parallelizes across thousands of simple cores", "GPUs have more total transistors", "CPUs can't do floating point", "GPUs have faster clock speeds"], a: 0,
          why: "It's shape-of-work, not raw speed: many identical independent multiplications. Anything sequential and branchy still favors the CPU." }
      ] },
    { id: "cuda", kind: "concept", name: "CUDA",
      hook: "NVIDIA's programming platform for its GPUs — and the ecosystem lock-in that makes NVIDIA the sport's only referee.",
      why: "Why 'works on NVIDIA' is the default and everything else is a port: fifteen years of libraries target CUDA. Your Mac sidesteps it entirely via Apple's Metal/MLX — a different, smaller, but real ecosystem.",
      learn: [{ label: "An Even Easier Introduction to CUDA (NVIDIA's own on-ramp)", url: "https://developer.nvidia.com/blog/even-easier-introduction-cuda/" }],
      quiz: [
        { q: "CUDA is best described as—", choices: ["NVIDIA's proprietary GPU computing platform the ML ecosystem standardized on", "A neural network architecture", "An open GPU standard all vendors share", "A cloud provider"], a: 0,
          why: "The moat isn't the silicon alone — it's the software gravity. That's why AMD/Apple alternatives fight an ecosystem, not a chip." }
      ] },
    { id: "vram-unified", kind: "concept", name: "VRAM vs unified memory",
      hook: "Discrete GPUs have separate fast memory (VRAM) that caps model size; Apple Silicon shares one pool between CPU and GPU — your 24GB is both.",
      why: "The reason a MacBook can run models that choke a gaming PC with 8GB VRAM, and the reason 'how many GB is the model?' is the first local-AI question. Weights must fit in whatever the GPU can address.",
      learn: [{ label: "MLX — Apple's ML framework for unified memory (your machine's native stack)", url: "https://github.com/ml-explore/mlx" }],
      quiz: [
        { q: "A model 'fits' on a machine when—", choices: ["Its (quantized) weights + working memory fit in GPU-addressable memory", "The CPU is fast enough", "The SSD is large enough", "It has internet access"], a: 0,
          why: "Storage holds the file; memory runs the model. Unified memory is why Mac local-AI is a thing — one 24GB pool instead of a small VRAM island." }
      ] },
    { id: "memory-bandwidth", kind: "concept", name: "Memory bandwidth",
      hook: "How fast weights stream from memory to compute — for LLM inference this, not raw FLOPs, usually sets tokens-per-second.",
      why: "Explains the counterintuitive spec sheets: generation speed tracks GB/s more than TFLOPs because each token touches every weight. It's why M-series chips punch above their compute class.",
      learn: [{ label: "Memory bandwidth", url: "https://en.wikipedia.org/wiki/Memory_bandwidth" }] },
    { id: "precision-formats", kind: "concept", name: "Precision (FP32/FP16/INT8)",
      hook: "How many bits each number gets — training mostly runs 16-bit, inference tolerates 8 or 4; fewer bits = faster, smaller, slightly noisier.",
      why: "The vocabulary connecting quantization to hardware: chips advertise separate speeds per precision, and 'it runs at INT8' is a claim about both quality and feasibility.",
      learn: [{ label: "Floating point precision", url: "https://en.wikipedia.org/wiki/Floating-point_arithmetic" }] },
    { id: "training-vs-inference", kind: "concept", name: "Training vs inference",
      hook: "Training changes weights (gradients, giant clusters, months); inference just runs them (your every API call). Wildly different economics.",
      why: "Sorts most AI news instantly: 'built a training cluster' vs 'serves inference cheaply' are different businesses. Everything you personally run — agents, local models, quizzes — is inference.",
      learn: [{ label: "Training vs inference", url: "https://en.wikipedia.org/wiki/Deep_learning" }],
      quiz: [
        { q: "Which is which:", choices: ["Training updates weights from data; inference runs frozen weights on new inputs", "Inference updates weights", "They're the same process at different speeds", "Training happens on every API call"], a: 0,
          why: "The split is the industry's cost structure: training is capex-like and rare; inference is the per-call cost that pricing pages, caching, and quantization all fight over." }
      ] },
    { id: "batching-throughput", kind: "concept", name: "Batching & throughput",
      hook: "Serving many requests together to keep the GPU fed — great for provider economics, source of your latency variance.",
      why: "Why the same model is cheap on one endpoint and fast on another, and why 'tokens/sec' quotes differ from your experience: batch size trades individual latency for fleet throughput.",
      learn: [{ label: "Inference serving basics", url: "https://en.wikipedia.org/wiki/Inference_engine" }] },
    { id: "local-vs-cloud", kind: "concept", name: "Local vs cloud models",
      hook: "Run weights on your own machine (Ollama, MLX, llama.cpp) or rent frontier ones by the token — privacy and cost-floor vs capability ceiling.",
      why: "The standing decision in your stack: transcription and speaker-ID already run local; reasoning runs on subscriptions. The frontier moves, so the split point deserves re-checking every few months — not assumptions.",
      learn: [{ label: "Local LLM ecosystem (llama.cpp)", url: "https://en.wikipedia.org/wiki/Llama.cpp" }] }
  ]
},

{
  id: "ai-landscape",
  domain: "personal",
  title: "The current AI stack",
  blurb: "The keywords in your own setup — OpenRouter, Hermes, harnesses, MCP — as concepts, not brand loyalty.",
  items: [
    { id: "openrouter", kind: "concept", name: "OpenRouter",
      hook: "One API that fronts many model providers — one key, per-token billing, hot-swappable models, no subscriptions.",
      why: "The escape valve in your setup: when a subscription's weekly limit dies, per-token routing continues at cost. Also the neutral place to A/B models without new accounts — pay-as-you-go is its whole identity.",
      learn: [{ label: "OpenRouter docs", url: "https://openrouter.ai/docs" }],
      quiz: [
        { q: "OpenRouter's role in a stack is—", choices: ["A model-agnostic gateway: one API, many providers, per-token billing", "A local model runner", "A fine-tuning service", "An agent framework"], a: 0,
          why: "It abstracts the vendor: same request shape, swap the model string. That's what makes side-by-side comparisons and overflow routing cheap to set up." }
      ] },
    { id: "hermes-agent", kind: "concept", name: "Hermes (agent)",
      hook: "An open-source autonomous agent CLI that plugs into your existing model subscriptions or API keys and runs multi-step work headlessly.",
      why: "Installed on your machine, running against the work Codex plan. The concept to hold: the agent layer and the model layer are separate purchases — harness choice and model choice can be mixed.",
      learn: [{ label: "Your live install: ~/.hermes — SOUL.md + config.yaml are the real docs" }] },
    { id: "harness", kind: "concept", name: "Harness",
      hook: "The scaffolding around a model — tools, permissions, retries, memory, loops. Claude Code and Codex CLI are harnesses; the model is the engine inside.",
      why: "The word that dissolves most 'Claude vs Codex' confusion: many observed differences are harness differences (tools, context management, agents), not model differences. Compare engines and scaffolding separately or the comparison lies.",
      learn: [{ label: "Agentic scaffolding (survey)", url: "https://en.wikipedia.org/wiki/Autonomous_agent" }],
      quiz: [
        { q: "Two products use the same underlying model but behave differently. First suspect:", choices: ["The harness — tools, prompts, context strategy around the model", "One is lying about the model", "Random seed", "Internet speed"], a: 0,
          why: "Same engine, different car. Tool access, system prompts, and context management routinely swing results more than model choice within a tier." }
      ] },
    { id: "mcp", kind: "concept", name: "MCP (Model Context Protocol)",
      hook: "An open standard for plugging tools and data sources into AI apps — write a server once, any MCP-speaking assistant can use it.",
      why: "Why your Gmail, browser, and scheduler connect to agents without bespoke integrations each time. The strategic point: protocols commoditize integrations, which shifts value to whoever owns the workflow.",
      learn: [{ label: "MCP specification", url: "https://modelcontextprotocol.io/" }] },
    { id: "subagents", kind: "concept", name: "Subagents & orchestration",
      hook: "A lead agent spawning scoped workers — parallel readers, verifiers, judges — each with fresh context, reporting back up.",
      why: "The pattern behind your marathon token days: each worker re-reads context, so cost scales with agent-count × context-size. Power and bill grow together; bounded fan-out is the discipline.",
      learn: [{ label: "Multi-agent systems", url: "https://en.wikipedia.org/wiki/Multi-agent_system" }] },
    { id: "prompt-caching", kind: "concept", name: "Prompt caching",
      hook: "Providers re-serve an unchanged context prefix at a fraction of the price — long sessions become mostly discounted 'cache read' tokens.",
      why: "The literal top line of your usage audit: cache reads dominating total tokens is what long agentic sessions look like. Cheap per token, but volume still counts against limits — the discount is not immunity.",
      learn: [{ label: "Prompt caching (Anthropic docs)", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching" }],
      quiz: [
        { q: "Cache reads dominate an agentic session's tokens because—", choices: ["Every turn re-sends the long shared prefix, which the provider re-serves from cache", "The model memorizes your data", "Caching duplicates your files", "Errors force resends"], a: 0,
          why: "The context rides along on every call; caching makes that cheap-not-free. It's why session length and fan-out — not output — drive most of the bill." }
      ] },
    { id: "context-window", kind: "concept", name: "Context window",
      hook: "The model's working memory per request, priced per token — everything it 'knows' right now must fit or be retrieved in.",
      why: "The budget under every design choice you make: what agents re-read, what memory files hold, when a session should be split. 'Context engineering' is just economics inside this box.",
      learn: [{ label: "Context windows explained", url: "https://en.wikipedia.org/wiki/Large_language_model" }] },
    { id: "evals", kind: "concept", name: "Evals",
      hook: "Structured tests for model/agent behavior — golden sets, rubrics, LLM-judges — the difference between 'feels better' and 'is better.'",
      why: "The missing instrument in most Claude-vs-Codex debates, including yours: without a task set and rubric, comparisons collapse into vibes and recency. Ten fixed personal tasks would settle more than a month of impressions.",
      learn: [{ label: "Hamel Husain — Your AI Product Needs Evals (the practitioner canon)", url: "https://hamel.dev/blog/posts/evals/" }],
      quiz: [
        { q: "A fair personal Claude-vs-Codex comparison minimally needs—", choices: ["The same fixed tasks, run on both, scored by a rubric decided in advance", "A week of casual use of each", "Reading both changelogs", "Comparing token prices"], a: 0,
          why: "Pre-registered tasks and criteria are what stop the comparison from becoming a mood diary. Anything less measures your week, not the models." }
      ] },
    { id: "rlhf", kind: "concept", name: "RLHF / post-training",
      hook: "After pretraining on text, models are shaped by human (and AI) preference feedback — this stage, not raw data, sets tone, refusals, and helpfulness.",
      why: "Explains model 'personality' differences at equal intelligence, and why the same base capability can ship as different characters. Most complaints about a model are complaints about its post-training.",
      learn: [{ label: "RLHF", url: "https://en.wikipedia.org/wiki/Reinforcement_learning_from_human_feedback" }] },
    { id: "rate-limit-economics", kind: "concept", name: "Subscription vs API economics",
      hook: "Subscriptions sell capped access at flat price; APIs sell uncapped tokens at cost. Heavy users arbitrage: subscription until the cap, API overflow after.",
      why: "This week's problem in one card. A $200 plan consumed in two days means usage belongs (partly) on per-token or on a second plan — a routing decision, not a mystery. The audit numbers live in the private repo; the concept lives here.",
      learn: [{ label: "OpenRouter pricing model (example)", url: "https://openrouter.ai/docs#pricing" }] }
  ]
},

{
  id: "startup-education",
  domain: "personal",
  title: "Startup & education-business concepts",
  blurb: "General-understanding level — with the 3Blue1Brown-of-tennis route treated as seriously as the SaaS route.",
  items: [
    { id: "distribution-first", kind: "concept", name: "Distribution beats product",
      hook: "The recurring startup lesson: a good-enough product with a repeatable way to reach people beats a great product without one.",
      why: "The uncomfortable question for every build-first instinct (yours included): 'who sees this, through what channel, repeatably?' A tennis-education idea lives or dies here, not in the code.",
      learn: [{ label: "Distribution channels overview", url: "https://en.wikipedia.org/wiki/Distribution_(marketing)" }],
      quiz: [
        { q: "'Distribution-first' thinking asks, before building—", choices: ["What repeatable channel reaches the audience, and can we own it?", "Which framework to use", "How to price the premium tier", "When to raise funding"], a: 0,
          why: "Products are copied; owned channels compound. It's why creators with audiences launch products more successfully than products hunting audiences." }
      ] },
    { id: "thousand-true-fans", kind: "concept", name: "1,000 True Fans",
      hook: "Kevin Kelly's 2008 essay: a creator needs ~1,000 people paying ~$100/yr — not millions of viewers — to make a living.",
      why: "The founding math of the creator economy and the honest sizing tool for a niche education product: is there a path to 1,000 people who'd pay for tennis understanding? That's a knowable number.",
      learn: [{ label: "1,000 True Fans (original essay)", url: "https://kk.org/thetechnium/1000-true-fans/" }],
      quiz: [
        { q: "The essay's core claim is—", choices: ["~1,000 direct-paying true fans can sustain a creator — reach matters less than relationship", "You need a million followers", "Ads are the only creator revenue", "Virality is predictable"], a: 0,
          why: "It reframed audience-building from mass to depth, and it's the quiet business model of most sustainable niche educators — including the maths-video tier." }
      ] },
    { id: "niche-down", kind: "concept", name: "Niching down",
      hook: "Serving a narrow audience so well that you're their obvious choice — the counterintuitive route to eventually being big.",
      why: "Your own taste already runs this way (niche > big, original footage > aggregators). The business version: 'serve analysis for 4.0–5.0 adult rec players' beats 'tennis content' as a starting wedge.",
      learn: [{ label: "Niche market strategy", url: "https://en.wikipedia.org/wiki/Niche_market" }] },
    { id: "cac-ltv", kind: "concept", name: "CAC & LTV",
      hook: "Customer acquisition cost vs lifetime value — the ratio that decides whether growth is a business or a bonfire.",
      why: "The two numbers that discipline every 'we'll get users somehow' plan. Creator-education businesses are attractive precisely because content makes CAC trend toward zero while trust makes LTV long.",
      learn: [{ label: "Customer lifetime value", url: "https://en.wikipedia.org/wiki/Customer_lifetime_value" }],
      quiz: [
        { q: "A healthy simple heuristic is—", choices: ["LTV meaningfully above CAC with payback inside months, not years", "Any growth at any cost", "CAC above LTV early is always fine", "The ratio doesn't matter pre-revenue"], a: 0,
          why: "The ratio (often quoted as 3:1+) and the payback window are the whole solvency story of a growth plan — everything else is narrative." }
      ] },
    { id: "retention-churn", kind: "concept", name: "Retention & churn",
      hook: "Do people come back? The metric that separates products from launches — retention curves flatten for keepers and decay to zero for toys.",
      why: "The first question to ask of your own apps (chess trainer, health log): who'd notice if it vanished? A flattening curve, even tiny, is worth more than a spike.",
      learn: [{ label: "Churn rate", url: "https://en.wikipedia.org/wiki/Churn_rate" }] },
    { id: "moat", kind: "concept", name: "Moats",
      hook: "Structural reasons a lead persists — network effects, switching costs, brand, proprietary data — as opposed to just being early.",
      why: "The sorting question for AI-era ideas, where features are cloned in weeks: a tennis-education moat would be trust + a corpus of measured analysis nobody else has bothered to build — data and voice, not code.",
      learn: [{ label: "Economic moat", url: "https://en.wikipedia.org/wiki/Economic_moat" }],
      quiz: [
        { q: "Which is a real moat, versus a head start?", choices: ["Accumulated proprietary data plus audience trust", "Being first to launch", "A nicer UI", "A cheaper price this quarter"], a: 0,
          why: "Anything a competitor replicates with money and months is a head start. Moats are what get harder to cross as you grow — data, network, trust." }
      ] },
    { id: "positioning", kind: "concept", name: "Positioning",
      hook: "Deliberately choosing the mental slot you occupy — what you're the best at, for whom, instead of what — before any marketing happens.",
      why: "Why '3Blue1Brown of tennis' is already strong positioning: it names the audience (people who want understanding, not tips), the standard (visual, measured), and the competitor set (not YouTube tip channels).",
      learn: [{ label: "April Dunford — Obviously Awesome (the working method)", url: "https://www.aprildunford.com/" }] },
    { id: "productized-service", kind: "concept", name: "Productized service",
      hook: "A service with fixed scope and price — 'serve analysis, $X, 48 hours' — the middle rung between freelancing and software.",
      why: "The lowest-risk test of the tennis-education idea: sell ten analyses before building any platform. Demand proof first is the whole idea; software comes after strangers pay.",
      learn: [{ label: "Productized services explained", url: "https://en.wikipedia.org/wiki/Service_(economics)" }] },
    { id: "creator-economics", kind: "concept", name: "Creator economics (the 3B1B model)",
      hook: "Grant Sanderson's actual model: free YouTube lessons at the highest quality bar, funded by Patreon patrons and lesson sponsorship — no course paywall.",
      why: "The documented version of the route you keep circling: the free artifact IS the marketing and the moat; direct patronage converts a sliver of a large grateful audience. Study the mechanism, not the persona.",
      learn: [{ label: "3blue1brown.com/about — the model described by its owner", url: "https://www.3blue1brown.com/about" }],
      quiz: [
        { q: "3Blue1Brown's revenue model is essentially—", choices: ["Free top-quality lessons + direct patronage/sponsorship", "A paid course platform", "University licensing", "Ad-revenue-only scale"], a: 0,
          why: "The lesson for a tennis version: monetize gratitude from a free audience rather than gating the education — the free work compounds into distribution." }
      ] },
    { id: "build-in-public", kind: "concept", name: "Build in public",
      hook: "Sharing the process — metrics, failures, decisions — as content while building, converting the journey itself into distribution.",
      why: "Fits your existing journaling habit almost exactly; the delta is audience. Honest caveat: it selects for legible progress and can bend work toward what performs — the same trap your taste notes flag in creators.",
      learn: [{ label: "Working in public", url: "https://en.wikipedia.org/wiki/Open_notebook_science" }] }
  ]
}

]);
