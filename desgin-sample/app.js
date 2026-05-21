// ============================================================
// LLM 위키 — App logic (router + filters + demos)
// ============================================================

const ENTRIES = [
  { id: "tokenizer-korean", num: "01", diff: 1, status: "solved" },
  { id: "sampling-params",  num: "02", diff: 2, status: "solved" },
  { id: "self-attention",   num: "03", diff: 3, status: "wip" },
  { id: "context-window",   num: "04", diff: 2, status: "open" },
  { id: "prompt-strategy",  num: "05", diff: 2, status: "solved" },
];

// ------------------------ ROUTER ------------------------
function route() {
  const hash = location.hash || "#/";
  const isEntry = hash.startsWith("#/entry/");
  document.querySelectorAll("[data-view]").forEach(el => el.classList.remove("is-active"));
  if (isEntry) {
    const id = hash.replace("#/entry/", "");
    const el = document.querySelector(`[data-view="entry-${id}"]`);
    if (el) {
      el.classList.add("is-active");
      window.scrollTo({ top: 0, behavior: "instant" });
      initDemosFor(id);
      return;
    }
  }
  document.querySelector('[data-view="home"]').classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "instant" });
}
window.addEventListener("hashchange", route);

// ------------------------ FILTERS ------------------------
function initFilters() {
  const chips = document.querySelectorAll(".chip[data-filter]");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const group = chip.dataset.filter;
      // single-select per group
      document.querySelectorAll(`.chip[data-filter="${group}"]`).forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      applyFilters();
    });
  });
}
function applyFilters() {
  const diff = document.querySelector('.chip.is-active[data-filter="diff"]')?.dataset.value || "all";
  const status = document.querySelector('.chip.is-active[data-filter="status"]')?.dataset.value || "all";
  document.querySelectorAll(".card").forEach(card => {
    const matchDiff = diff === "all" || card.dataset.diff === diff;
    const matchStatus = status === "all" || card.dataset.status === status;
    card.style.display = (matchDiff && matchStatus) ? "" : "none";
  });
}

// ============================================================
//                    TOKENIZER DEMO
// ============================================================
// Educational simulated tokenizer.
// - "char" mode: every char is a token
// - "naive BPE" mode: applies a small fixed merge table for Korean syllables/common patterns
// Token IDs are deterministic hash-derived numbers (not real GPT IDs).

const MERGE_TABLE = [
  // English common merges
  ["▁the"], ["▁of"], ["▁to"], ["▁and"], ["▁is"], ["ing"], ["tion"], ["▁a"],
  // Korean common bigrams (낮은 정밀도지만 시뮬레이션용)
  ["안녕"], ["하세"], ["요"], ["니다"], ["습니"], ["입니"], ["한국"], ["어를"],
  ["때문"], ["이다"], ["그것"], ["우리"], ["나는"], ["많이"], ["좋아"], ["합니"],
  ["에서"], ["으로"], ["하는"], ["하고"], ["되는"], ["있다"], ["없다"], ["같은"],
  ["LLM"], ["GPT"], ["AI"], ["프롬"], ["프트"], ["모델"], ["토큰"], ["문장"],
];
const MERGE_SET = new Set(MERGE_TABLE.map(m => m[0]));

function hashId(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h % 50257; // pretend GPT-2 vocab size
}

function tokenize(text, mode) {
  if (!text) return [];
  // pre-process: spaces become ▁ markers
  const processed = text.replace(/\s+/g, " ").trim();
  const tokens = [];
  let i = 0;
  while (i < processed.length) {
    if (processed[i] === " ") { tokens.push({ text: "▁", kind: "space" }); i++; continue; }
    if (mode === "char") {
      tokens.push({ text: processed[i], kind: "char" });
      i++;
    } else {
      // try longest merge match (up to 4 chars)
      let matched = null;
      for (let len = 4; len >= 2; len--) {
        const piece = processed.slice(i, i + len);
        if (MERGE_SET.has(piece)) { matched = piece; break; }
      }
      if (matched) {
        tokens.push({ text: matched, kind: "merge" });
        i += matched.length;
      } else {
        tokens.push({ text: processed[i], kind: "char" });
        i++;
      }
    }
  }
  // assign ids
  tokens.forEach(t => { t.id = hashId(t.text); });
  return tokens;
}

function renderTokenizer() {
  const root = document.querySelector("#demo-tokenizer");
  if (!root || root.dataset.init === "1") return;
  root.dataset.init = "1";

  const input = root.querySelector(".tok-input");
  const output = root.querySelector(".tok-output");
  const stats = root.querySelector(".tok-stats");
  const modeBtns = root.querySelectorAll(".tok-mode button");
  const presets = root.querySelectorAll(".tok-preset");
  let mode = "bpe";

  const HUES = [25, 200, 145, 280, 60, 320, 180, 100];
  const colorFor = (id) => `oklch(0.88 0.06 ${HUES[id % HUES.length]})`;

  function render() {
    const text = input.value;
    const toks = tokenize(text, mode);
    output.innerHTML = "";
    toks.forEach(t => {
      const chip = document.createElement("div");
      chip.className = "tok-chip";
      chip.dataset.kind = t.kind;
      if (t.kind !== "space") chip.style.background = colorFor(t.id);
      const txt = document.createElement("span");
      txt.className = "txt";
      txt.textContent = t.text === "▁" ? "␣" : t.text;
      chip.appendChild(txt);
      if (t.kind !== "space") {
        const id = document.createElement("span");
        id.className = "id";
        id.textContent = t.id;
        chip.appendChild(id);
      }
      output.appendChild(chip);
    });
    const charCount = text.length;
    const tokCount = toks.filter(t => t.kind !== "space").length;
    const ratio = tokCount > 0 ? (charCount / tokCount).toFixed(2) : "—";
    const uniq = new Set(toks.filter(t => t.kind !== "space").map(t => t.id)).size;
    stats.innerHTML = `
      <div><b>${charCount}</b>글자</div>
      <div><b>${tokCount}</b>토큰</div>
      <div><b>${ratio}</b>글자/토큰</div>
      <div><b>${uniq}</b>고유</div>
    `;
  }

  input.addEventListener("input", render);
  modeBtns.forEach(btn => btn.addEventListener("click", () => {
    mode = btn.dataset.mode;
    modeBtns.forEach(b => b.classList.toggle("is-active", b === btn));
    render();
  }));
  presets.forEach(btn => btn.addEventListener("click", () => {
    input.value = btn.dataset.text;
    render();
  }));
  render();
}

// ============================================================
//                    SAMPLING DEMO
// ============================================================
const SAMP_CANDIDATES = [
  { word: "좋아요",    logit: 2.4 },
  { word: "흐려요",    logit: 1.6 },
  { word: "맑아요",    logit: 1.4 },
  { word: "추워요",    logit: 1.1 },
  { word: "따뜻해요",  logit: 0.8 },
  { word: "이상해요",  logit: 0.3 },
  { word: "무거워요",  logit: -0.2 },
  { word: "있어요",    logit: -0.6 },
  { word: "다르네요",  logit: -1.0 },
  { word: "엄청나요",  logit: -1.4 },
];

function renderSampling() {
  const root = document.querySelector("#demo-sampling");
  if (!root || root.dataset.init === "1") return;
  root.dataset.init = "1";

  const tempInput = root.querySelector('[data-control="temp"]');
  const tempVal = root.querySelector('[data-readout="temp"]');
  const topkInput = root.querySelector('[data-control="topk"]');
  const topkVal = root.querySelector('[data-readout="topk"]');
  const toppInput = root.querySelector('[data-control="topp"]');
  const toppVal = root.querySelector('[data-readout="topp"]');
  const distEl = root.querySelector(".samp-dist");
  const sampleBtn = root.querySelector(".samp-btn");
  const readout = root.querySelector(".samp-readout");
  const contextEl = root.querySelector(".samp-context");

  function compute() {
    const T = parseFloat(tempInput.value);
    const K = parseInt(topkInput.value, 10);
    const P = parseFloat(toppInput.value);
    tempVal.textContent = T.toFixed(2);
    topkVal.textContent = K === 0 ? "끄기" : K;
    toppVal.textContent = P >= 1 ? "끄기" : P.toFixed(2);

    // softmax with temperature
    const Tsafe = Math.max(T, 0.01);
    const exps = SAMP_CANDIDATES.map(c => Math.exp(c.logit / Tsafe));
    const sum = exps.reduce((a, b) => a + b, 0);
    let probs = SAMP_CANDIDATES.map((c, i) => ({ ...c, p: exps[i] / sum }));
    probs.sort((a, b) => b.p - a.p);

    // top-k pruning
    if (K > 0) {
      probs = probs.map((c, i) => ({ ...c, prunedK: i >= K }));
    } else {
      probs = probs.map(c => ({ ...c, prunedK: false }));
    }
    // top-p pruning (only on those not pruned by K)
    let cum = 0;
    probs = probs.map(c => {
      if (c.prunedK) return { ...c, prunedP: true };
      const wasIn = cum < P;
      cum += c.p;
      return { ...c, prunedP: !wasIn };
    });
    if (P >= 1) probs = probs.map(c => ({ ...c, prunedP: c.prunedK }));

    return probs;
  }

  function render(sampledWord) {
    const probs = compute();
    distEl.innerHTML = "";
    const max = Math.max(...probs.map(p => p.p));
    probs.forEach(c => {
      const row = document.createElement("div");
      row.className = "samp-row";
      const pruned = c.prunedK || c.prunedP;
      if (pruned) row.classList.add("is-pruned");
      if (sampledWord && c.word === sampledWord) row.classList.add("is-sampled");
      row.innerHTML = `
        <div class="word">${c.word}</div>
        <div class="bar"><div class="bar-fill" style="width:${(c.p / max * 100).toFixed(1)}%"></div></div>
        <div class="pct">${(c.p * 100).toFixed(1)}%</div>
      `;
      distEl.appendChild(row);
    });
  }

  function sample() {
    const probs = compute();
    const candidates = probs.filter(c => !c.prunedK && !c.prunedP);
    const renorm = candidates.reduce((s, c) => s + c.p, 0);
    let r = Math.random() * renorm;
    let chosen = candidates[0];
    for (const c of candidates) {
      r -= c.p;
      if (r <= 0) { chosen = c; break; }
    }
    render(chosen.word);
    readout.innerHTML = `샘플링됨 → <b>${chosen.word}</b>`;
    // update context preview
    const baseText = contextEl.dataset.base;
    contextEl.innerHTML = `${baseText} <span style="color:var(--accent)">${chosen.word}</span>`;
  }

  [tempInput, topkInput, toppInput].forEach(el => el.addEventListener("input", () => render()));
  sampleBtn.addEventListener("click", sample);
  contextEl.dataset.base = contextEl.textContent.replace(/[\u2588\u258B\u2502\|\u258A\s]*$/, "").trim();
  render();
}

// ============================================================
//                    ATTENTION DEMO
// ============================================================
// A hand-curated multi-head attention pattern for one sentence,
// designed to illustrate three classic head archetypes.
const ATT_TOKENS = ["그", "강아지", "는", "공", "을", "좋아한다", "왜냐하면", "그것", "은", "던지기", "좋기", "때문이다", "."];

// Each head: rows = query, cols = key, values are weights (sum ~1 per row)
function makeHead(kind) {
  const n = ATT_TOKENS.length;
  const w = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let q = 0; q < n; q++) {
    if (kind === "prev") {
      // attends to previous token strongly
      if (q > 0) w[q][q - 1] = 0.7;
      w[q][q] = 0.2;
      if (q > 1) w[q][q - 2] = 0.1;
    } else if (kind === "coref") {
      // "그것"(7) attends to "강아지"(1) (wrong-on-purpose anaphora) and "공"(3); show ambiguity
      for (let k = 0; k <= q; k++) w[q][k] = 0.05;
      if (q === 7) { // 그것
        for (let k = 0; k < n; k++) w[q][k] = 0;
        w[q][1] = 0.15; // 강아지
        w[q][3] = 0.60; // 공  (correct referent)
        w[q][7] = 0.15;
        w[q][q] = 0.10;
      } else if (q === 0) {
        w[q][0] = 1;
      } else {
        // soften
        const sum = w[q].reduce((a, b) => a + b, 0);
        if (sum > 0) w[q] = w[q].map(v => v / sum);
        else w[q][q] = 1;
      }
    } else if (kind === "broad") {
      // broad / content-mixing head
      for (let k = 0; k <= q; k++) {
        const dist = Math.abs(q - k);
        w[q][k] = Math.exp(-dist * 0.5);
      }
      const sum = w[q].reduce((a, b) => a + b, 0);
      w[q] = w[q].map(v => v / sum);
    }
  }
  return w;
}

const ATT_HEADS = {
  "prev":  { label: "Head 1 · 직전 토큰",      explain: "각 질의 토큰이 바로 앞 토큰에 강하게 가중치를 줍니다. 가장 흔한 패턴 중 하나로, 짧은 문맥 의존성을 형성합니다.", w: makeHead("prev") },
  "coref": { label: "Head 4 · 지시어 해소",    explain: "<b>그것</b>이라는 질의가 후보 명사들(<b>강아지</b>, <b>공</b>)을 비교 평가하는 모습이 보입니다. 모델은 \"던지기 좋다\"는 단서로 <b>공</b>을 더 강하게 가리킵니다.", w: makeHead("coref") },
  "broad": { label: "Head 7 · 광역 혼합",      explain: "거리에 따라 부드럽게 감쇠하며 넓은 문맥을 섞습니다. 의미를 풍부하게 만드는 \"콘텐츠\" 헤드 역할.", w: makeHead("broad") },
};

function renderAttention() {
  const root = document.querySelector("#demo-attention");
  if (!root || root.dataset.init === "1") return;
  root.dataset.init = "1";

  const sentenceEl = root.querySelector(".att-sentence");
  const headsEl = root.querySelector(".att-heads");
  const explainEl = root.querySelector(".att-explain");

  let head = "coref";
  let query = 7; // default to "그것"

  function render() {
    sentenceEl.innerHTML = "";
    const w = ATT_HEADS[head].w[query];
    const max = Math.max(...w, 0.001);
    ATT_TOKENS.forEach((tok, i) => {
      const el = document.createElement("button");
      el.className = "att-tok";
      el.textContent = tok;
      el.dataset.idx = i;
      if (i === query) el.classList.add("is-query");
      else {
        const intensity = w[i] / max;
        if (intensity > 0.02) {
          el.style.background = `color-mix(in oklab, var(--accent) ${(intensity * 70).toFixed(0)}%, transparent)`;
          el.style.color = intensity > 0.5 ? "white" : "var(--ink)";
        }
        el.title = `attention = ${(w[i] * 100).toFixed(1)}%`;
      }
      el.addEventListener("click", () => { query = i; render(); });
      sentenceEl.appendChild(el);
    });
    headsEl.querySelectorAll("button").forEach(b => b.classList.toggle("is-active", b.dataset.head === head));
    explainEl.innerHTML = `<b>${ATT_HEADS[head].label}</b> · ${ATT_HEADS[head].explain}`;
  }

  headsEl.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => { head = b.dataset.head; render(); });
  });
  render();
}

// ------------------------ INIT ------------------------
function initDemosFor(id) {
  if (id === "tokenizer-korean") renderTokenizer();
  if (id === "sampling-params") renderSampling();
  if (id === "self-attention") renderAttention();
}

document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  route();
});
