/* ============================================================
   FRAMEMINT — AI VIDEO TERMINAL · interactions
   ============================================================ */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ---------- ticker: duplicate content for seamless loop ---------- */
const tickerTrack = $("#tickerTrack");
tickerTrack.innerHTML += tickerTrack.innerHTML;

/* ---------- hero typewriter ---------- */
const typerPhrases = [
  "rendering: cyberpunk city at night, neon reflections on wet asphalt, drone dive shot...",
  "rendering: minimalist smartwatch ad, sunlit kitchen, slow push-in, cinematic grade...",
  "rendering: AI avatar explainer, keyword captions, tight 3-second pacing...",
  "rendering: island travel film, golden-hour silhouettes, film emulation grade..."
];
const typerText = $("#typerText");
let typerIdx = 0;

function typePhrase(phrase, done) {
  let i = 0;
  const tick = () => {
    typerText.textContent = phrase.slice(0, ++i);
    if (i < phrase.length) setTimeout(tick, 32 + Math.random() * 36);
    else setTimeout(done, 2200);
  };
  tick();
}
function erasePhrase(done) {
  const tick = () => {
    typerText.textContent = typerText.textContent.slice(0, -2);
    if (typerText.textContent) setTimeout(tick, 10);
    else done();
  };
  tick();
}
(function typerLoop() {
  typePhrase(typerPhrases[typerIdx % typerPhrases.length], () =>
    erasePhrase(() => {
      typerIdx++;
      typerLoop();
    })
  );
})();

/* ---------- hero stats count-up ---------- */
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    statsObserver.unobserve(el);
    const target = Number(el.dataset.count);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 900, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
});
$$("[data-count]").forEach((el) => statsObserver.observe(el));

/* ---------- generator console ---------- */
const form = $("#generatorForm");
const promptInput = $("#prompt");
const promptLabel = $("#promptLabel");
const uploadZone = $("#uploadZone");
const fileInput = $("#imageUpload");
const fileName = $("#fileName");
const sysStatus = $("#sysStatus");
const termLog = $("#termLog");
const progressBlocks = $("#progressBlocks");
const progressPct = $("#progressPct");
const costEstimate = $("#costEstimate");
const creditBalance = $("#creditBalance");
const generateButton = $("#generateButton");
const outputStrip = $("#outputStrip");
const outputName = $("#outputName");
const outputSpec = $("#outputSpec");

const MODE_CONFIG = {
  text: {
    label: "PROMPT // DESCRIBE YOUR VIDEO",
    placeholder: "A minimalist smartwatch in a sunlit kitchen, slow push-in, heart-rate UI glowing, cinematic grade…",
    upload: false
  },
  image: {
    label: "PROMPT // DESCRIBE THE MOTION",
    placeholder: "Bring the product shot to life: slow orbit, drifting bokeh, highlight sweep across the surface…",
    upload: true
  },
  script: {
    label: "SCRIPT // PASTE YOUR SCRIPT",
    placeholder: "Paste a full voiceover or shot-by-shot script — each beat becomes a rendered scene with captions…",
    upload: false
  },
  avatar: {
    label: "SCRIPT // WHAT SHOULD THE AVATAR SAY",
    placeholder: "Type the lines, pick a face and a voice — lip-sync is handled for you…",
    upload: true
  }
};

let currentMode = "text";

$$(".mode-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".mode-tab").forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    currentMode = tab.dataset.mode;
    const cfg = MODE_CONFIG[currentMode];
    promptLabel.textContent = cfg.label;
    promptInput.placeholder = cfg.placeholder;
    uploadZone.hidden = !cfg.upload;
    logLine(`$ mode --set ${currentMode}`, "dim");
  });
});

/* prompt chips */
const CHIP_PROMPTS = {
  "Product ad": "Wireless earbuds launch ad, dark studio 360 orbit, metallic highlights, benefit captions popping per beat, electronic track",
  "Tutorial intro": "Software tutorial opener, UI elements flying into a clean layout, key features zoom-highlighted, crisp tech aesthetic",
  "Travel film": "Island travel montage, drone opener, golden-hour backlit silhouettes, film emulation grade, mellow piano score",
  "Cyber city": "Cyberpunk city at night, rain-slick neon reflections, drone dive between towers, steam and holographic billboards"
};
$("#promptChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  promptInput.value = CHIP_PROMPTS[chip.textContent] || chip.textContent;
  promptInput.focus();
});

/* file upload */
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  fileName.textContent = file ? `loaded ${file.name}` : "PNG · JPG · WEBP — drives the first frame";
});

/* ---------- cost estimate ---------- */
const RES_MULTIPLIER = { 720: 0.8, 1080: 1, "4k": 1.6 };
let modelCost = 8;
let modelName = "AUTO";

function updateEstimate() {
  const duration = Number($("#duration").value);
  const res = $("#resolution").value;
  const cost = Math.max(1, Math.round(modelCost * (duration / 5) * RES_MULTIPLIER[res]));
  costEstimate.textContent = cost;
  return cost;
}

$("#modelGrid").addEventListener("click", (e) => {
  const cell = e.target.closest(".model-cell");
  if (!cell) return;
  $$(".model-cell").forEach((c) => c.classList.remove("active"));
  cell.classList.add("active");
  modelCost = Number(cell.dataset.cost);
  modelName = cell.querySelector("strong").textContent;
  updateEstimate();
  logLine(`$ model --select ${cell.dataset.model}`, "dim");
});

$("#duration").addEventListener("change", updateEstimate);
$("#resolution").addEventListener("change", updateEstimate);
updateEstimate();

/* ---------- terminal log ---------- */
function logLine(text, tone = "") {
  const p = document.createElement("p");
  p.className = `log-line ${tone}`;
  p.textContent = text;
  termLog.appendChild(p);
  while (termLog.children.length > 30) termLog.firstChild.remove();
  termLog.scrollTop = termLog.scrollHeight;
}

/* ---------- progress bar (block characters) ---------- */
const BLOCK_COUNT = 24;
function renderProgress(pct) {
  const filled = Math.round((pct / 100) * BLOCK_COUNT);
  progressBlocks.textContent = "▓".repeat(filled) + "░".repeat(BLOCK_COUNT - filled);
  progressPct.textContent = `${Math.round(pct)}%`;
}

/* ---------- fake render pipeline ---------- */
let rendering = false;
let credits = 1200;
let jobCount = 0;

const PIPELINE = [
  { at: 4, msg: "$ framemint render --queue ... job accepted", tone: "dim" },
  { at: 12, msg: "[ROUTE] scoring engines by load + success rate ...", tone: "amber" },
  { at: 22, msg: "[ROUTE] dispatched -> {MODEL} · link stable", tone: "" },
  { at: 38, msg: "[GEN ] parsing prompt -> shot plan (3 shots)", tone: "" },
  { at: 56, msg: "[GEN ] diffusion sampling ... denoise step 32/48", tone: "" },
  { at: 70, msg: "[AUD ] voiceover synth + timecode alignment", tone: "" },
  { at: 82, msg: "[SUB ] word-level captions · en-US", tone: "" },
  { at: 93, msg: "[ENC ] H.264 encode + metadata", tone: "" },
  { at: 100, msg: "[DONE] render complete ✔ output ready", tone: "" }
];

/* Everything the backend needs for one render job, in one object. */
function buildJobPayload() {
  return {
    mode: currentMode,                                  // text | image | script | avatar
    prompt: promptInput.value.trim(),
    model: $(".model-cell.active").dataset.model,       // auto | sora2 | veo31 | kling21 | luma | wan22
    ratio: $("#ratio").value,                           // "9:16" | "16:9" | "1:1" | "4:5"
    duration: Number($("#duration").value),             // seconds
    resolution: $("#resolution").value,                 // "720" | "1080" | "4k"
    options: {
      captions: form.elements.captions.checked,
      voiceover: form.elements.voiceover.checked,
      music: form.elements.music.checked,
      enhance: form.elements.enhance.checked
    },
    referenceImage: fileInput.files?.[0] ?? null,       // File — send as multipart or pre-upload
    estimatedCost: updateEstimate()
  };
}

/* ============================================================
   API INTEGRATION POINT
   Replace simulateRender() with the real call, e.g.:

     async function submitRender(payload, hooks) {
       const res = await fetch(`${API_BASE}/v1/jobs`, { method: "POST", body: toFormData(payload) });
       const { jobId } = await res.json();
       // poll GET /v1/jobs/:id -> { status, progress, logs[], videoUrl, cost }
       // forward progress -> hooks.onProgress(pct), log lines -> hooks.onLog(line)
       // resolve with { videoUrl, cost } and call hooks.onDone(result)
     }

   The UI contract is just these three hooks:
     onLog(text, tone)  -> terminal log line
     onProgress(pct)    -> progress bar 0-100
     onDone({videoUrl, cost}) -> output strip + credits
   ============================================================ */
function simulateRender(payload, { onLog, onProgress, onDone }) {
  let stepIdx = 0;
  const totalMs = 6500;
  const start = performance.now();

  const tick = (now) => {
    const t = Math.min((now - start) / totalMs, 1);
    const pct = Math.round(t * 100);
    onProgress(pct);

    while (stepIdx < PIPELINE.length && PIPELINE[stepIdx].at <= pct) {
      const step = PIPELINE[stepIdx];
      onLog(step.msg.replace("{MODEL}", modelName), step.tone);
      stepIdx++;
    }

    if (t < 1) requestAnimationFrame(tick);
    else onDone({
      videoUrl: SAMPLE_VIDEOS[jobCount % SAMPLE_VIDEOS.length],
      cost: payload.estimatedCost
    });
  };
  requestAnimationFrame(tick);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (rendering) return;

  const payload = buildJobPayload();
  if (!payload.prompt) {
    promptInput.focus();
    logLine("[ERR ] empty prompt — tell me what to render", "err");
    return;
  }
  if (payload.estimatedCost > credits) {
    logLine("[ERR ] not enough credits — upgrade your plan", "err");
    return;
  }

  rendering = true;
  generateButton.disabled = true;
  generateButton.textContent = "■ RENDERING...";
  sysStatus.textContent = "SYS:BUSY";
  outputStrip.hidden = true;

  logLine(`$ framemint render --model ${modelName} --ratio ${payload.ratio} --t ${payload.duration}s`, "amber");

  simulateRender(payload, {
    onLog: logLine,
    onProgress: renderProgress,
    onDone: (result) => finishRender(result, payload)
  });
});

const SAMPLE_VIDEOS = ["assets/video-1.mp4", "assets/video-2.mp4"];
const outputPlayer = $("#outputPlayer");
const outputVideo = $("#outputVideo");

function finishRender(result, payload) {
  rendering = false;
  generateButton.disabled = false;
  generateButton.textContent = "▶ RENDER";
  sysStatus.textContent = "SYS:READY";

  credits -= result.cost;
  creditBalance.textContent = credits.toLocaleString();

  jobCount++;
  const res = payload.resolution === "4k" ? "4K" : `${payload.resolution}P`;
  outputName.textContent = `output_${String(jobCount).padStart(3, "0")}.mp4`;
  outputSpec.textContent = `${modelName} · ${payload.ratio} · ${payload.duration}S · ${res} · -${result.cost} CR`;
  outputStrip.hidden = false;
  outputVideo.src = result.videoUrl;
  outputPlayer.hidden = true;
}

/* play the finished render inline */
$("#outputPlayBtn").addEventListener("click", () => {
  if (outputPlayer.hidden) {
    outputPlayer.hidden = false;
    outputVideo.play();
    logLine(`$ play ${outputName.textContent}`, "dim");
  } else {
    outputVideo.pause();
    outputPlayer.hidden = true;
  }
});

/* ---------- sample gallery: hover or click to play ---------- */
$$(".sample-frame").forEach((frame) => {
  const video = frame.querySelector("video");
  const playBtn = frame.querySelector(".sample-play");
  const setPlaying = (on) => frame.classList.toggle("playing", on);

  playBtn.addEventListener("click", () => {
    video.paused ? video.play() : video.pause();
  });
  frame.addEventListener("mouseenter", () => video.play());
  frame.addEventListener("mouseleave", () => video.pause());
  video.addEventListener("play", () => setPlaying(true));
  video.addEventListener("pause", () => setPlaying(false));
  video.addEventListener("click", () => video.paused ? video.play() : video.pause());
});

/* ---------- template cards ---------- */
$$(".tpl-use").forEach((btn) => {
  btn.addEventListener("click", () => {
    promptInput.value = btn.dataset.prompt;
    document.querySelector("#console").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => promptInput.focus(), 600);
  });
});

/* template filters */
$("#templateFilters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  $$("#templateFilters .chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  const filter = chip.dataset.filter;
  $$("#templateGrid .tpl-card").forEach((card) => {
    card.classList.toggle("hide", filter !== "all" && card.dataset.cat !== filter);
  });
});

/* ---------- FAQ: close others when opening one ---------- */
$$(".faq-item summary").forEach((summary) => {
  summary.addEventListener("click", () => {
    const current = summary.parentElement;
    $$(".faq-item").forEach((d) => {
      if (d !== current) d.removeAttribute("open");
    });
  });
});

/* ---------- hero background: rotate between sample outputs ---------- */
const heroBgVideo = $("#heroBgVideo");
const heroSampleName = $("#heroSampleName");
const HERO_SAMPLES = [
  { src: "assets/video-1.mp4", name: "output_088.mp4" },
  { src: "assets/video-2.mp4", name: "output_091.mp4" }
];
let heroSampleIdx = 0;
setInterval(() => {
  heroSampleIdx = (heroSampleIdx + 1) % HERO_SAMPLES.length;
  const s = HERO_SAMPLES[heroSampleIdx];
  heroBgVideo.src = s.src;
  heroSampleName.textContent = s.name;
  heroBgVideo.play().catch(() => {});
}, 9000);

/* ---------- boot message ---------- */
logLine("$ framemint --boot v2.0 ... OK", "dim");
logLine("$ 12 models linked · 40 voices loaded · standby_", "dim");
