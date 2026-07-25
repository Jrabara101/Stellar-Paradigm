var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.mjs
var LEVEL_LENGTHS = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8 };
var MAX_POOL = 120;
var DEFAULT_COUNT = 25;
var MAX_COUNT = 100;
var POOL_TTL = 86400;
var MIN_FREQ_TOPICAL = 0.15;
var MIN_FREQ_GENERAL = 1;
var CATEGORY_SEEDS = {
  science: [
    "science",
    "biology",
    "chemistry",
    "physics",
    "energy",
    "atom",
    "planet",
    "organism",
    "molecule",
    "gravity",
    "experiment",
    "element",
    "nature",
    "disease",
    "mineral"
  ],
  math: [
    "mathematics",
    "algebra",
    "geometry",
    "number",
    "equation",
    "angle",
    "calculus",
    "fraction",
    "arithmetic",
    "measure",
    "shape",
    "quantity",
    "formula",
    "logic",
    "ratio"
  ],
  history: [
    "history",
    "empire",
    "ancient",
    "battle",
    "kingdom",
    "revolution",
    "dynasty",
    "medieval",
    "conquest",
    "treaty",
    "monarchy",
    "colony",
    "warrior",
    "ruler",
    "nation"
  ],
  technology: [
    "technology",
    "computer",
    "software",
    "internet",
    "machine",
    "digital",
    "network",
    "robot",
    "electronic",
    "program",
    "device",
    "circuit",
    "engine",
    "signal",
    "system"
  ],
  novel: [
    "novel",
    "literature",
    "story",
    "author",
    "fiction",
    "poetry",
    "drama",
    "narrative",
    "character",
    "chapter",
    "legend",
    "romance",
    "tragedy",
    "writer",
    "reader"
  ]
};
var SUPPORTED = /* @__PURE__ */ new Set(["general", ...Object.keys(CATEGORY_SEEDS)]);
var BAD_DEF_PREFIXES = [
  "plural of",
  "past tense of",
  "simple past",
  "present participle",
  "past participle",
  "alternative spelling",
  "alternative form",
  "misspelling",
  "initialism of",
  "abbreviation of",
  "obsolete",
  "archaic form",
  "inflection of",
  "third-person singular",
  "comparative form",
  "superlative form",
  "acronym of",
  "synonym of",
  "ellipsis of"
];
var BLOCKLIST = /* @__PURE__ */ new Set([
  "damn",
  "crap",
  "arse",
  "slut",
  "turd",
  "dick",
  "cock",
  "piss",
  "shit",
  "fuck",
  "hell",
  "nazi",
  "porn",
  "rape",
  "anus",
  "butt"
]);
var GENERIC_STOPLIST = /* @__PURE__ */ new Set([
  "also",
  "such",
  "said",
  "same",
  "some",
  "what",
  "that",
  "than",
  "then",
  "they",
  "them",
  "this",
  "these",
  "those",
  "there",
  "their",
  "with",
  "from",
  "have",
  "will",
  "been",
  "were",
  "would",
  "could",
  "should",
  "shall",
  "about",
  "after",
  "prior",
  "other",
  "another",
  "thing",
  "things",
  "stuff",
  "means",
  "again",
  "apart",
  "aware",
  "seem",
  "very",
  "much",
  "many",
  "most",
  "more",
  "well",
  "unto",
  "upon",
  "onto",
  "into",
  "over",
  "under",
  "within",
  "without",
  "whom",
  "whose",
  "which",
  "while",
  "whilst",
  "where",
  "when",
  "because",
  "since",
  "until",
  "unless",
  "although",
  "though",
  "however",
  "therefore",
  "hence",
  "thus",
  "else",
  "being",
  "doing",
  "having",
  "cannot",
  "toward",
  "towards",
  "among",
  "amongst",
  "amid",
  "amidst",
  "despite",
  "kind",
  "sort",
  "item",
  "monde",
  "mong"
]);
var POS_MAP = { n: "noun", v: "verb", adj: "adjective", adv: "adverb", u: "" };
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
function freqOf(entry) {
  const f = (entry.tags || []).find((t) => t.startsWith("f:"));
  return f ? parseFloat(f.slice(2)) : 0;
}
__name(freqOf, "freqOf");
function acceptWord(word) {
  if (!/^[a-z]+$/.test(word)) return false;
  if (word.length < 4 || word.length > 8) return false;
  if (BLOCKLIST.has(word)) return false;
  if (GENERIC_STOPLIST.has(word)) return false;
  return true;
}
__name(acceptWord, "acceptWord");
function cleanDef(entry) {
  if (!entry.defs || !entry.defs.length) return null;
  const tags = entry.tags || [];
  const posTag = tags.find((t) => !t.startsWith("f:"));
  const pos = POS_MAP[posTag] ?? "";
  const selfRe = new RegExp("\\b" + entry.word.toLowerCase() + "\\b", "gi");
  const usable = [];
  for (const raw of entry.defs) {
    const tabIdx = raw.indexOf("	");
    let text = (tabIdx !== -1 ? raw.slice(tabIdx + 1) : raw).trim();
    const lower = text.toLowerCase();
    if (BAD_DEF_PREFIXES.some((p) => lower.startsWith(p))) continue;
    if (text.length < 10) continue;
    text = text.replace(/\s+/g, " ");
    if (text.length > 160) text = text.slice(0, 157).replace(/\s+\S*$/, "") + "\u2026";
    usable.push(text);
  }
  if (!usable.length) return null;
  const censoredLen = /* @__PURE__ */ __name((t) => t.replace(selfRe, " ").replace(/\s+/g, " ").trim().length, "censoredLen");
  let chosen = usable[0];
  if (censoredLen(chosen) < 12) chosen = usable.find((t) => censoredLen(t) >= 12) || usable[0];
  return pos ? `[${pos}] ${chosen}` : chosen;
}
__name(cleanDef, "cleanDef");
async function datamuse(params) {
  const res = await fetch(`https://api.datamuse.com/words?${params}`, {
    cf: { cacheTtl: POOL_TTL, cacheEverything: true }
  });
  if (!res.ok) return [];
  return res.json();
}
__name(datamuse, "datamuse");
async function curateGeneral(len) {
  const rows = await datamuse(`sp=${"?".repeat(len)}&md=dpf&max=300`);
  const out = /* @__PURE__ */ new Map();
  for (const entry of rows) {
    const w = entry.word;
    if (!acceptWord(w) || w.length !== len) continue;
    const f = freqOf(entry);
    if (f < MIN_FREQ_GENERAL) continue;
    const def = cleanDef(entry);
    if (!def) continue;
    if (!out.has(w)) out.set(w, { w: w.toUpperCase(), d: def, rank: f });
  }
  return out;
}
__name(curateGeneral, "curateGeneral");
async function curateTopical(seeds, len) {
  const out = /* @__PURE__ */ new Map();
  const batches = await Promise.all(
    seeds.map((s) => datamuse(`ml=${encodeURIComponent(s)}&md=dpf&max=120`))
  );
  for (const rows of batches) {
    for (const entry of rows) {
      const w = entry.word;
      if (!acceptWord(w) || w.length !== len) continue;
      if (freqOf(entry) < MIN_FREQ_TOPICAL) continue;
      const def = cleanDef(entry);
      if (!def) continue;
      const score = entry.score || 0;
      const existing = out.get(w);
      if (!existing) out.set(w, { w: w.toUpperCase(), d: def, rank: score });
      else if (score > existing.rank) existing.rank = score;
    }
  }
  return out;
}
__name(curateTopical, "curateTopical");
async function curatePool(category, level) {
  const len = LEVEL_LENGTHS[Math.min(Math.max(level, 1), 5)];
  const map = category === "general" ? await curateGeneral(len) : await curateTopical(CATEGORY_SEEDS[category], len);
  return [...map.values()].sort((a, b) => b.rank - a.rank).slice(0, MAX_POOL).map(({ w, d }) => ({ w, d }));
}
__name(curatePool, "curatePool");
async function getPool(category, level, ctx) {
  const cache = caches.default;
  const cacheKey = new Request(`https://words-worker.internal/pool?category=${category}&level=${level}`);
  const hit = await cache.match(cacheKey);
  if (hit) return hit.json();
  const pool = await curatePool(category, level);
  if (pool.length) {
    const toCache = new Response(JSON.stringify(pool), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${POOL_TTL}` }
    });
    ctx.waitUntil(cache.put(cacheKey, toCache));
  }
  return pool;
}
__name(getPool, "getPool");
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS }
  });
}
__name(json, "json");
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
__name(shuffle, "shuffle");
function parseLevel(raw) {
  const n = parseInt(raw ?? "1", 10);
  if (Number.isNaN(n)) return 1;
  return Math.min(Math.max(n, 1), 5);
}
__name(parseLevel, "parseLevel");
var src_default = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/health" || path === "/") return json({ ok: true });
    if (path === "/words" || path === "/word") {
      const category = (url.searchParams.get("category") || "general").toLowerCase();
      const level = parseLevel(url.searchParams.get("level"));
      if (!SUPPORTED.has(category)) {
        return json({ error: "unsupported_category", category, supported: [...SUPPORTED] }, 400);
      }
      let pool;
      try {
        pool = await getPool(category, level, ctx);
      } catch (err) {
        return json({ error: "upstream_failed", detail: String(err) }, 502);
      }
      if (!pool.length) return json({ error: "no_words", category, level }, 502);
      const length = LEVEL_LENGTHS[level];
      if (path === "/word") {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        return json({ category, level, word: pick.w, def: pick.d });
      }
      let count = parseInt(url.searchParams.get("count") ?? String(DEFAULT_COUNT), 10);
      if (Number.isNaN(count)) count = DEFAULT_COUNT;
      count = Math.min(Math.max(count, 1), MAX_COUNT);
      const words = shuffle(pool).slice(0, count);
      return json({ category, level, length, count: words.length, words });
    }
    return json({ error: "not_found", path }, 404);
  }
};

// ../../CONFIG~1/herd/bin/nvm/v24.11.1/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../CONFIG~1/herd/bin/nvm/v24.11.1/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-iDh7X7/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../CONFIG~1/herd/bin/nvm/v24.11.1/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-iDh7X7/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
