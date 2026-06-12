/* ============================================================
   FRAMEMINT — AI VIDEO TERMINAL · interactions
   ============================================================ */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ---------- Supabase auth ---------- */
const SUPA_URL = "https://ghmigcdqggaksksnxkav.supabase.co";
const SUPA_KEY = "sb_publishable_4uuO1uBClB73dfpcj3oi2Q_4PY1K9YM"; // publishable — safe in the client
const sb = window.supabase ? window.supabase.createClient(SUPA_URL, SUPA_KEY) : null;
let authSession = null;

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

$$(".mode-tab[data-mode]").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".mode-tab[data-mode]").forEach((t) => {
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

/* ---------- render pipeline state ---------- */
let rendering = false;
let credits = 1200; // demo balance; replaced by the server balance after login
let jobCount = 0;

function showCredits(value) {
  credits = value;
  creditBalance.textContent = Number(value).toLocaleString();
}

async function fetchCredits() {
  if (!sb || !authSession) return;
  const { data, error } = await sb.from("profiles").select("credits").single();
  if (!error && data) showCredits(data.credits);
  else logLine("[SYS ] could not load balance — run supabase-setup.sql?", "dim");
}

/* ---------- auth UI ---------- */
const authModal = $("#authModal");
const authButton = $("#authButton");
const topUpButton = $("#topUpButton");
const authError = $("#authError");
const authNote = $("#authNote");
const authSubmit = $("#authSubmit");
let authTab = "login";

function updateAuthUI() {
  if (authSession) {
    const email = authSession.user.email || "user";
    authButton.textContent = `⏻ ${email.length > 18 ? email.slice(0, 15) + "…" : email}`;
    authButton.title = "Sign out";
    topUpButton.hidden = false;
  } else {
    authButton.textContent = "LOGIN";
    authButton.title = "Sign in";
    topUpButton.hidden = true;
    credits = 1200; // internal value for degraded demo mode only
    creditBalance.textContent = "--"; // no fake balance for visitors
  }
}

function openAuthModal() {
  authError.hidden = true;
  authModal.hidden = false;
  $("#authEmail").focus();
}

authButton.addEventListener("click", async () => {
  if (!sb) return logLine("[ERR ] auth unavailable — supabase script blocked", "err");
  if (authSession) {
    await sb.auth.signOut();
    logLine("$ auth --logout ... done", "dim");
  } else {
    openAuthModal();
  }
});

$("#authClose").addEventListener("click", () => (authModal.hidden = true));
authModal.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.hidden = true;
});

$$("[data-auth-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$("[data-auth-tab]").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    authTab = tab.dataset.authTab;
    authSubmit.textContent = authTab === "login" ? "▶ LOGIN" : "▶ CREATE ACCOUNT";
    authNote.innerHTML =
      authTab === "login"
        ? "&gt; welcome back_"
        : "&gt; new accounts get <strong>100 free credits</strong>_";
    authError.hidden = true;
  });
});

$("#authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!sb) return;
  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value;
  authSubmit.disabled = true;
  authError.hidden = true;
  try {
    if (authTab === "register") {
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.session) {
        authNote.innerHTML = "&gt; confirmation email sent — verify, then log in_";
        return;
      }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
    authModal.hidden = true;
  } catch (err) {
    authError.textContent = `[ERR ] ${err.message}`;
    authError.hidden = false;
  } finally {
    authSubmit.disabled = false;
  }
});

if (sb) {
  sb.auth.onAuthStateChange((_event, session) => {
    authSession = session;
    updateAuthUI();
    // defer queries out of the callback — supabase-js holds an internal
    // auth lock here and a direct query can deadlock
    if (session) {
      setTimeout(() => {
        logLine(`$ auth --login ${session.user.email} ... OK`, "dim");
        fetchCredits();
      }, 0);
    }
  });
}

/* ---------- recharge UI ---------- */
const rechargeModal = $("#rechargeModal");
const rechargeError = $("#rechargeError");

topUpButton.addEventListener("click", () => {
  rechargeError.hidden = true;
  rechargeModal.hidden = false;
});
$("#rechargeClose").addEventListener("click", () => (rechargeModal.hidden = true));
rechargeModal.addEventListener("click", (e) => {
  if (e.target === rechargeModal) rechargeModal.hidden = true;
});

$$(".pack").forEach((pack) => {
  pack.addEventListener("click", async () => {
    if (!authSession) return openAuthModal();
    pack.disabled = true;
    rechargeError.hidden = true;
    try {
      const res = await fetch("/api/recharge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({ pack: pack.dataset.pack })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `recharge ${res.status}`);
      showCredits(j.balance);
      logLine(`[PAY ] +${j.credits} credits · balance ${j.balance}`, "amber");
      rechargeModal.hidden = true;
    } catch (err) {
      rechargeError.textContent = `[ERR ] ${err.message}`;
      rechargeError.hidden = false;
    } finally {
      pack.disabled = false;
    }
  });
});

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

/* Live path: POST /api/render then poll /api/job (Seedance via Volcano Ark,
   Kling via its open platform — keys live server-side). Falls back to the
   demo pipeline when the proxy or its keys are not deployed. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function submitRender(payload, hooks) {
  let created;
  try {
    const headers = { "Content-Type": "application/json" };
    if (authSession) headers.Authorization = `Bearer ${authSession.access_token}`;
    const res = await fetch("/api/render", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payload, referenceImage: undefined })
    });
    if (res.status === 501 || res.status === 404 || res.status === 405) {
      hooks.onLog("[SYS ] live engine keys not configured — demo mode", "dim");
      return simulateRender(payload, hooks);
    }
    if (res.status === 401) {
      hooks.onFail("sign in for live renders");
      return openAuthModal();
    }
    if (res.status === 402) {
      hooks.onFail("insufficient credits");
      rechargeModal.hidden = false;
      return;
    }
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `api ${res.status}`);
    created = await res.json();
    if (typeof created.balance === "number") showCredits(created.balance);
  } catch (e) {
    if (e instanceof TypeError) {
      // network error: no backend here (file:// or plain static server)
      hooks.onLog("[SYS ] no render backend reachable — demo mode", "dim");
      return simulateRender(payload, hooks);
    }
    return hooks.onFail(e.message);
  }

  if (created.note) hooks.onLog(`[ROUTE] ${created.note}`, "amber");
  hooks.onLog(`[API ] job ${created.jobId} accepted by ${created.engine}`, "amber");
  let pct = 6;
  hooks.onProgress(pct);
  try {
    for (;;) {
      await sleep(4000);
      const j = await (await fetch(`/api/job?id=${encodeURIComponent(created.jobId)}&engine=${created.engine}`)).json();
      if (j.status === "succeeded" && j.videoUrl) {
        hooks.onProgress(100);
        hooks.onLog("[DONE] render complete ✔ output ready", "");
        return hooks.onDone({ videoUrl: j.videoUrl, cost: created.cost ?? payload.estimatedCost, live: true });
      }
      if (j.status === "failed") {
        if (j.refunded) {
          hooks.onLog("[PAY ] credits refunded", "amber");
          fetchCredits();
        }
        return hooks.onFail(j.error || "upstream render failed");
      }
      pct = Math.min(pct + 6, 92);
      hooks.onProgress(pct);
      hooks.onLog(`[GEN ] upstream status: ${j.status} ...`, "dim");
    }
  } catch (e) {
    return hooks.onFail(e.message);
  }
}

function failRender(message) {
  rendering = false;
  generateButton.disabled = false;
  generateButton.textContent = "▶ RENDER";
  sysStatus.textContent = "SYS:READY";
  renderProgress(0);
  logLine(`[ERR ] ${message} — no credits charged`, "err");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (rendering) return;

  // rendering requires an account — credits are tracked server-side
  if (sb && !authSession) {
    logLine("[ERR ] sign in to render — new accounts get 100 free credits", "err");
    openAuthModal();
    return;
  }

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

  submitRender(payload, {
    onLog: logLine,
    onProgress: renderProgress,
    onDone: (result) => finishRender(result, payload),
    onFail: failRender
  });
});

const SAMPLE_VIDEOS = ["assets/video-1.mp4", "assets/video-2.mp4"];
const outputPlayer = $("#outputPlayer");
const outputVideo = $("#outputVideo");
let currentOutput = null; // { url, name, live } — what the ⇩ MP4 button downloads

function finishRender(result, payload) {
  rendering = false;
  generateButton.disabled = false;
  generateButton.textContent = "▶ RENDER";
  sysStatus.textContent = "SYS:READY";

  if (result.live) {
    fetchCredits(); // server already deducted at submit time — just resync
  } else {
    showCredits(credits - result.cost);
  }

  jobCount++;
  const res = payload.resolution === "4k" ? "4K" : `${payload.resolution}P`;
  const fileName = `output_${String(jobCount).padStart(3, "0")}.mp4`;
  outputName.textContent = fileName;
  outputSpec.textContent = `${modelName} · ${payload.ratio} · ${payload.duration}S · ${res} · -${result.cost} CR`;
  outputStrip.hidden = false;
  outputVideo.src = result.videoUrl;
  outputPlayer.hidden = true;
  currentOutput = { url: result.videoUrl, name: `framemint-${fileName}`, live: Boolean(result.live) };
}

/* download the finished render — live renders stream through /api/download
   because the engine CDNs don't allow cross-origin downloads */
$("#downloadButton").addEventListener("click", () => {
  if (!currentOutput) {
    logLine("[ERR ] nothing to download — render something first", "err");
    return;
  }
  const a = document.createElement("a");
  if (currentOutput.live) {
    a.href = `/api/download?url=${encodeURIComponent(currentOutput.url)}&name=${encodeURIComponent(currentOutput.name)}`;
  } else {
    a.href = currentOutput.url;
    a.download = currentOutput.name;
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
  logLine(`$ download ${currentOutput.name} ... started`, "dim");
});

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
if (!sb) creditBalance.textContent = "--"; // auth script blocked — sign-in unavailable
logLine("$ framemint --boot v2.0 ... OK", "dim");
logLine("$ 2 engines linked · auto-routing armed · standby_", "dim");
