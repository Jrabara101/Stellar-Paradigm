// ============================================================================
// build-wordbank.mjs — generates wordbank.js, a bundled bank of real words +
// verified definitions, organized by category and difficulty (easy -> hard).
//
// WHY: the game used to pull words from random-word-api and then look up their
// definitions live, which produced obscure, undefinable words (besmuts,
// pipefuls, zymurgy) and a stream of 404s. This script instead pulls
// topic-relevant words that ALREADY have a definition (via Datamuse `md=d`),
// so every bundled word is guaranteed to have a real clue and the game needs
// no network lookup at play time.
//
// Difficulty ramps by WORD LENGTH: level 1 = 4-letter words ... level 5 = 8.
// Within a level, more frequent (recognizable) words are preferred.
//
// Scope: the 6 categories that have real dictionary definitions. Anime and
// Filipino Movies are proper nouns (no dictionary entry) and stay on the
// game's existing live-Wikipedia path — they are intentionally NOT built here.
//
// Run:  node tools/build-wordbank.mjs
// ============================================================================

import { writeFile } from 'node:fs/promises';

const LEVEL_LENGTHS = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8 };
const PER_BUCKET = 34; // 6 categories * 5 levels * ~34 ~= 1000 words

// Seed words per category. Each seed is fed to Datamuse `ml=` (means-like) to
// harvest topically-related words. `general` uses no seeds — it takes the most
// common English words of each length instead (see harvestGeneral).
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

// Definitions that make poor clues (trivial morphological entries).
const BAD_DEF_PREFIXES = ['plural of', 'past tense of', 'simple past', 'present participle',
    'past participle', 'alternative spelling', 'alternative form', 'misspelling', 'initialism of',
    'abbreviation of', 'obsolete', 'archaic form', 'inflection of', 'third-person singular',
    'comparative form', 'superlative form', 'acronym of', 'synonym of', 'ellipsis of'];

const BLOCKLIST = new Set(['damn', 'crap', 'arse', 'slut', 'turd', 'dick', 'cock', 'piss',
    'shit', 'fuck', 'hell', 'nazi', 'porn', 'rape', 'anus', 'butt']);

// Generic function words / filler that make dull, non-categorical answers.
// Excluded from every category so topical picks stay recognizable and on-theme
// (e.g. no more WHAT/SUCH under Science, no ALSO/SAID under General).
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function datamuse(params) {
    const url = `https://api.datamuse.com/words?${params}`;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const res = await fetch(url);
            if (res.ok) return await res.json();
        } catch { /* retry */ }
        await sleep(400);
    }
    return [];
}

function cleanDef(entry) {
    if (!entry.defs || !entry.defs.length) return null;
    const tags = entry.tags || [];
    const posTag = tags.find((t) => !t.startsWith('f:'));
    const pos = POS_MAP[posTag] ?? '';
    const selfRe = new RegExp('\\b' + entry.word.toLowerCase() + '\\b', 'gi');

    // Datamuse def format: "pos\tdefinition text". Collect all usable defs, then
    // prefer one that does NOT contain the answer word (a self-referential clue
    // like PROGRAM -> "a computer program" is a weak hint). Fall back to a
    // leaking def only if every candidate contains the word — the game censors
    // the answer out of the clue at display time as a safety net either way.
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
    // Take the first (primary-sense) definition. Datamuse orders senses by
    // prominence, so usable[0] is the everyday meaning — MATH -> "arithmetic
    // calculations", not the archaic "a mowing". The runtime censors the answer
    // word out of the clue, so a def that mentions the word is fine. Only skip
    // to an alternative if masking the word would leave the clue near-empty
    // (a genuinely circular entry like "a laptop." -> "a ____.").
    const censoredLen = (t) => t.replace(selfRe, ' ').replace(/\s+/g, ' ').trim().length;
    let chosen = usable[0];
    if (censoredLen(chosen) < 12) {
        chosen = usable.find((t) => censoredLen(t) >= 12) || usable[0];
    }
    return pos ? `[${pos}] ${chosen}` : chosen;
}

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

// Pool candidates for a topical category from all its seeds, keyed by length.
// Ranked by Datamuse relevance `score` (NOT frequency) so topical words rise —
// frequency-sorting surfaces generic filler (what/such/work) that appears in
// every category. A light frequency floor drops foreign/ultra-rare junk
// (gabr, jabr, biologie) that slips past the definition filter.
const MIN_FREQ_TOPICAL = 0.15;
async function harvestTopical(seeds) {
    const byLen = { 4: new Map(), 5: new Map(), 6: new Map(), 7: new Map(), 8: new Map() };
    for (const seed of seeds) {
        const rows = await datamuse(`ml=${encodeURIComponent(seed)}&md=dpf&max=150`);
        for (const entry of rows) {
            const w = entry.word;
            if (!acceptWord(w)) continue;
            if (freqOf(entry) < MIN_FREQ_TOPICAL) continue;
            const def = cleanDef(entry);
            if (!def) continue;
            const bucket = byLen[w.length];
            const score = entry.score || 0;
            const existing = bucket.get(w);
            // Keep the strongest relevance score this word earned across seeds.
            if (!existing) bucket.set(w, { w: w.toUpperCase(), d: def, rank: score });
            else if (score > existing.rank) existing.rank = score;
        }
        await sleep(120);
    }
    return byLen;
}

// General = the most common English words of each length that have a good def.
async function harvestGeneral() {
    const byLen = { 4: new Map(), 5: new Map(), 6: new Map(), 7: new Map(), 8: new Map() };
    for (const len of [4, 5, 6, 7, 8]) {
        const pattern = '?'.repeat(len);
        const rows = await datamuse(`sp=${pattern}&md=dpf&max=300`);
        for (const entry of rows) {
            const w = entry.word;
            if (!acceptWord(w) || w.length !== len) continue;
            const def = cleanDef(entry);
            if (!def) continue;
            const f = freqOf(entry);
            if (f < 1.0) continue; // keep general words genuinely common
            const bucket = byLen[len];
            // General ranks by frequency (most recognizable everyday words first).
            if (!bucket.has(w)) bucket.set(w, { w: w.toUpperCase(), d: def, rank: f });
        }
        await sleep(120);
    }
    return byLen;
}

function pickTop(bucketMap, n) {
    return [...bucketMap.values()]
        .sort((a, b) => b.rank - a.rank) // general: by frequency; topical: by relevance
        .slice(0, n)
        .map(({ w, d }) => ({ w, d }));  // drop ranking metadata from the shipped bank
}

async function main() {
    const categories = ['general', 'science', 'math', 'history', 'technology', 'novel'];
    const bank = {};
    const report = [];

    for (const cat of categories) {
        process.stderr.write(`Harvesting ${cat}...\n`);
        const byLen = cat === 'general'
            ? await harvestGeneral()
            : await harvestTopical(CATEGORY_SEEDS[cat]);

        bank[cat] = {};
        for (const [level, len] of Object.entries(LEVEL_LENGTHS)) {
            const picked = pickTop(byLen[len], PER_BUCKET);
            bank[cat][level] = picked;
            report.push(`  ${cat} L${level} (${len}L): ${picked.length}`);
        }
    }

    const total = Object.values(bank)
        .flatMap((c) => Object.values(c))
        .reduce((s, arr) => s + arr.length, 0);

    const header = `// AUTO-GENERATED by tools/build-wordbank.mjs — do not edit by hand.
// ${total} verified words + definitions across ${categories.length} categories,
// difficulty by length (L1=4 letters ... L5=8). Regenerate: node tools/build-wordbank.mjs
`;
    const body = `window.WORD_BANK = ${JSON.stringify(bank)};\n`;
    await writeFile(new URL('../wordbank.js', import.meta.url), header + body, 'utf8');

    process.stderr.write(report.join('\n') + `\n\nTOTAL: ${total} words -> wordbank.js\n`);
}

main();
