# Word Scramble — words Worker

A Cloudflare Worker that **proxies, curates, and caches** [Datamuse](https://www.datamuse.com/api/)
into clean `{ word, def }` JSON. It gives the game effectively **unlimited**
words + real definitions without bundling them or hammering the upstream API.

The curation logic mirrors [`tools/build-wordbank.mjs`](../tools/build-wordbank.mjs)
so results match the bundled `wordbank.js` in quality: every word has a real
definition, topical categories are ranked by relevance, generic filler is
stripped, and difficulty ramps by length (level 1 = 4 letters … level 5+ = 8).

## Endpoints

| Method / path | Returns |
|---|---|
| `GET /words?category=science&level=3&count=25` | `{ category, level, length, count, words: [{ w, d }] }` |
| `GET /word?category=science&level=3` | `{ category, level, word, def }` |
| `GET /health` | `{ ok: true }` |

- **Categories:** `general`, `science`, `math`, `history`, `technology`, `novel`.
  Proper-noun categories (`anime`, `filipino-movies`) are **not** served here —
  they have no dictionary definition and stay on the game's Wikipedia path.
  Requesting them returns `400 unsupported_category`.
- `level` is clamped to 1–5. `count` defaults to 25, max 100.
- CORS is open (`Access-Control-Allow-Origin: *`) so the browser app can call it.

Example:

```bash
curl "https://<your-worker>.workers.dev/words?category=science&level=3&count=5"
```

## Caching

Curated pools (up to 120 words per `category`+`level`) are stored in the edge
cache (`caches.default`) for 24h, so only the first request per bucket per POP
hits Datamuse — subsequent requests are served from cache (~10× faster locally).
The upstream Datamuse fetches also set `cf: { cacheEverything, cacheTtl }` as a
second cache layer once deployed.

No KV/D1 binding is required. To use KV for longer-lived, globally-consistent
pools instead, add a `[[kv_namespaces]]` binding in `wrangler.toml` and store
pools there in `getPool()`.

## Develop

```bash
cd worker
wrangler dev            # local, no login required -> http://127.0.0.1:8787
```

## Deploy

```bash
cd worker
wrangler login          # one-time, opens a browser
wrangler deploy         # publishes to https://word-scramble-words.<subdomain>.workers.dev
```

After deploying, note the `*.workers.dev` URL (or attach a custom route/domain).
The game reads clean JSON from it — see the client wiring in `script.js`
(`pickFromBank` / the Datamuse-extender path) for how to point the app at it.

### Optional: Wordnik instead of / alongside Datamuse

Datamuse needs no key. To add Wordnik as a source (random words with richer
definitions), set a secret and branch inside the curation functions:

```bash
wrangler secret put WORDNIK_KEY
```

Then read `env.WORDNIK_KEY` in `fetch()` and call
`https://api.wordnik.com/v4/...` as a fallback/primary as desired.
