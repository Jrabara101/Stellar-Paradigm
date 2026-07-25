// ============================================================================
// Word Scramble — words Worker
//
// A Cloudflare Worker that proxies, curates, and caches Datamuse so the game
// can pull effectively unlimited words + real definitions without bundling
// them or hammering the upstream API. Serves clean JSON:
//
//   GET /words?category=science&level=3[&count=25]
//     -> { category, level, length, count, words: [{ w, d }, ...] }
//   GET /word?category=science&level=3
//     -> { category, level, word, def }
//   GET /health -> { ok: true }
//
// Curation logic mirrors tools/build-wordbank.mjs so results match the bundled
// bank in quality (real definition required, topical ranking, filler removed).
// Difficulty ramps by length: level 1 = 4 letters ... level 5+ = 8.
//
// Proper-noun categories (anime, filipino-movies) are intentionally NOT served
// here — they have no dictionary definition and stay on the game's Wikipedia
// path. Requests for them return 400.
//
// Dev:    wrangler dev      (local, no login needed)
// Deploy: wrangler deploy   (needs `wrangler login` once)
// ============================================================================

const LEVEL_LENGTHS = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8 };
const MAX_POOL = 120;      // words curated + cached per (category, level)
const DEFAULT_COUNT = 25;
const MAX_COUNT = 100;
const POOL_TTL = 86400;    // cache curated pools for 24h
const MIN_FREQ_TOPICAL = 0.15;
const MIN_FREQ_GENERAL = 1.0;

const CATEGORY_SEEDS = {
    science: ['science', 'biology', 'chemistry', 'physics', 'energy', 'atom', 'planet',
        'organism', 'molecule', 'gravity', 'experiment', 'element', 'nature', 'disease', 'mineral'],
    math: ['mathematics', 'algebra', 'geometry', 'number', 'equation', 'angle', 'calculus',
        'fraction', 'arithmetic', 'measure', 'shape', 'quantity', 'formula', 'logic', 'ratio'],
    history: ['history', 'empire', 'ancient', 'battle', 'kingdom', 'revolution', 'dynasty',
        'medieval', 'conquest', 'treaty', 'monarchy', 'colony', 'warrior', 'ruler', 'nation'],
    technology: ['technology', 'computer', 'software', 'internet', 'machine', 'digital', 'network',
        'robot', 'electronic', 'program', 'device', 'circuit', 'engine', 'signal', 'system'],
    novel: ['novel', 'literature', 'story', 'author', 'fiction', 'poetry', 'drama', 'narrative',
        'character', 'chapter', 'legend', 'romance', 'tragedy', 'writer', 'reader'],
};
const SUPPORTED = new Set(['general', ...Object.keys(CATEGORY_SEEDS)]);

const BAD_DEF_PREFIXES = ['plural of', 'past tense of', 'simple past', 'present participle',
    'past participle', 'alternative spelling', 'alternative form', 'misspelling', 'initialism of',
    'abbreviation of', 'obsolete', 'archaic form', 'inflection of', 'third-person singular',
    'comparative form', 'superlative form', 'acronym of', 'synonym of', 'ellipsis of'];

const BLOCKLIST = new Set(['damn', 'crap', 'arse', 'slut', 'turd', 'dick', 'cock', 'piss',
    'shit', 'fuck', 'hell', 'nazi', 'porn', 'rape', 'anus', 'butt']);

const GENERIC_STOPLIST = new Set([
    'also', 'such', 'said', 'same', 'some', 'what', 'that', 'than', 'then', 'they', 'them',
    'this', 'these', 'those', 'there', 'their', 'with', 'from', 'have', 'will', 'been', 'were',
    'would', 'could', 'should', 'shall', 'about', 'after', 'prior', 'other', 'another', 'thing',
    'things', 'stuff', 'means', 'again', 'apart', 'aware', 'seem', 'very', 'much', 'many', 'most',
    'more', 'well', 'unto', 'upon', 'onto', 'into', 'over', 'under', 'within', 'without', 'whom',
    'whose', 'which', 'while', 'whilst', 'where', 'when', 'because', 'since', 'until', 'unless',
    'although', 'though', 'however', 'therefore', 'hence', 'thus', 'else', 'being', 'doing',
    'having', 'cannot', 'toward', 'towards', 'among', 'amongst', 'amid', 'amidst', 'despite',
    'kind', 'sort', 'item', 'monde', 'mong',
]);

const POS_MAP = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb', u: '' };

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// --- curation (mirrors tools/build-wordbank.mjs) ----------------------------

function freqOf(entry) {
    const f = (entry.tags || []).find((t) => t.startsWith('f:'));
    return f ? parseFloat(f.slice(2)) : 0;
}

function acceptWord(word) {
    if (!/^[a-z]+$/.test(word)) return false;
    if (word.length < 4 || word.length > 8) return false;
    if (BLOCKLIST.has(word)) return false;
    if (GENERIC_STOPLIST.has(word)) return false;
    return true;
}

function cleanDef(entry) {
    if (!entry.defs || !entry.defs.length) return null;
    const tags = entry.tags || [];
    const posTag = tags.find((t) => !t.startsWith('f:'));
    const pos = POS_MAP[posTag] ?? '';
    const selfRe = new RegExp('\\b' + entry.word.toLowerCase() + '\\b', 'gi');

    const usable = [];
    for (const raw of entry.defs) {
        const tabIdx = raw.indexOf('\t');
        let text = (tabIdx !== -1 ? raw.slice(tabIdx + 1) : raw).trim();
        const lower = text.toLowerCase();
        if (BAD_DEF_PREFIXES.some((p) => lower.startsWith(p))) continue;
        if (text.length < 10) continue;
        text = text.replace(/\s+/g, ' ');
        if (text.length > 160) text = text.slice(0, 157).replace(/\s+\S*$/, '') + '…';
        usable.push(text);
    }
    if (!usable.length) return null;

    // Primary sense first; only skip to an alternative if masking the answer
    // word would leave the clue near-empty (a circular entry like "a laptop.").
    const censoredLen = (t) => t.replace(selfRe, ' ').replace(/\s+/g, ' ').trim().length;
    let chosen = usable[0];
    if (censoredLen(chosen) < 12) chosen = usable.find((t) => censoredLen(t) >= 12) || usable[0];
    return pos ? `[${pos}] ${chosen}` : chosen;
}

async function datamuse(params) {
    const res = await fetch(`https://api.datamuse.com/words?${params}`, {
        cf: { cacheTtl: POOL_TTL, cacheEverything: true },
    });
    if (!res.ok) return [];
    return res.json();
}

// General = most common English words of the target length that have a good def.
async function curateGeneral(len) {
    const rows = await datamuse(`sp=${'?'.repeat(len)}&md=dpf&max=300`);
    const out = new Map();
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

// Topical = words related to the category seeds, ranked by relevance score.
async function curateTopical(seeds, len) {
    const out = new Map();
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

async function curatePool(category, level) {
    const len = LEVEL_LENGTHS[Math.min(Math.max(level, 1), 5)];
    const map = category === 'general'
        ? await curateGeneral(len)
        : await curateTopical(CATEGORY_SEEDS[category], len);
    return [...map.values()]
        .sort((a, b) => b.rank - a.rank)
        .slice(0, MAX_POOL)
        .map(({ w, d }) => ({ w, d }));
}

// Curated pools are cached in the edge cache keyed by (category, level).
async function getPool(category, level, ctx) {
    const cache = caches.default;
    const cacheKey = new Request(`https://words-worker.internal/pool?category=${category}&level=${level}`);
    const hit = await cache.match(cacheKey);
    if (hit) return hit.json();

    const pool = await curatePool(category, level);
    if (pool.length) {
        const toCache = new Response(JSON.stringify(pool), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${POOL_TTL}` },
        });
        ctx.waitUntil(cache.put(cacheKey, toCache));
    }
    return pool;
}

// --- helpers ----------------------------------------------------------------

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS },
    });
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function parseLevel(raw) {
    const n = parseInt(raw ?? '1', 10);
    if (Number.isNaN(n)) return 1;
    return Math.min(Math.max(n, 1), 5);
}

// --- request handling -------------------------------------------------------

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
        if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);

        const url = new URL(request.url);
        const path = url.pathname.replace(/\/+$/, '') || '/';

        if (path === '/health' || path === '/') return json({ ok: true });

        if (path === '/words' || path === '/word') {
            const category = (url.searchParams.get('category') || 'general').toLowerCase();
            const level = parseLevel(url.searchParams.get('level'));
            if (!SUPPORTED.has(category)) {
                return json({ error: 'unsupported_category', category, supported: [...SUPPORTED] }, 400);
            }

            let pool;
            try {
                pool = await getPool(category, level, ctx);
            } catch (err) {
                return json({ error: 'upstream_failed', detail: String(err) }, 502);
            }
            if (!pool.length) return json({ error: 'no_words', category, level }, 502);

            const length = LEVEL_LENGTHS[level];
            if (path === '/word') {
                const pick = pool[Math.floor(Math.random() * pool.length)];
                return json({ category, level, word: pick.w, def: pick.d });
            }
            let count = parseInt(url.searchParams.get('count') ?? String(DEFAULT_COUNT), 10);
            if (Number.isNaN(count)) count = DEFAULT_COUNT;
            count = Math.min(Math.max(count, 1), MAX_COUNT);
            const words = shuffle(pool).slice(0, count);
            return json({ category, level, length, count: words.length, words });
        }

        return json({ error: 'not_found', path }, 404);
    },
};
