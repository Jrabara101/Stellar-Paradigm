# 🗺️ Word Scramble — Product Roadmap

**Live app:** https://word-scramble-v1.surge.sh
**Network:** Stellar Testnet (mainnet migration planned — see Phase 4 below)

This roadmap tracks Word Scramble's key feature milestones, launch timeline, and future development goals, from initial MVP through mainnet launch and long-term platform goals.

---

## ✅ Shipped

| Phase | Milestone | Status |
|---|---|---|
| **Level 3** | Core gameplay: drag-and-drop word scramble, on-chain leaderboard, badge rewards via two communicating Soroban contracts (WordScramble + RewardContract), multi-wallet support (Freighter, Albedo, xBull, LOBSTR, Hana) | Shipped, live demo |
| **Level 4** | On-Chain Vocabulary Credential System idea submission; event streaming (live "●" indicator across tabs), auto-funded testnet accounts via Friendbot | Shipped |
| **Level 5** | 51 verified testnet users, feedback loop wired to a real Google Form, pitch deck (Problem → Solution → Market → Architecture → Growth → Future Roadmap), Level 5 full walkthrough video | Shipped |
| **Phase 1 (Polish)** | 1,174-word daily pool, Autumn Harvest theme, near-miss feedback, score odometer, streak glow, new SFX | Shipped |
| **Phase 2A–2C (Polish)** | 8 total board themes (incl. dark mode + Stellar Cosmos + Art Deco Lounge), fluid responsive board sizing, achievement badge-stamp toasts, per-channel audio mixer, mobile bottom-sheet modals, haptics | Shipped |
| **v2.0.0 — Scramble Board** | New 2–4 player, 15×15 persistent tile board mode (Scrabble-style), shipped directly in response to user feedback ("I want a bigger, persistent board") | Shipped |
| **Bundled word bank** | 1,020 verified word+definition pairs across 6 categories × 5 levels, replacing flaky third-party dictionary/random-word APIs | Shipped |

---

## 🚧 In Progress — Level 6 (Mainnet Launch + Security + Adoption)

| Milestone | Target |
|---|---|
| Mainnet contract deployment (`stellar.js` + both Soroban contracts moved off testnet) | Next |
| 20+ verified **mainnet** users with real on-chain transaction activity | Pending mainnet deploy |
| Security review or third-party contract audit | Pending |
| Marketing: Twitter/X launch post/thread + demo/showcase content | Pending |
| Ecosystem contribution (technical blog, workshop, tutorial, or open-source contribution) | Pending |
| Rebuilt onboarding Google Form (adds email field) + Excel export of responses | Pending |

---

## 🔭 Planned — Phase 3: On-Chain Progression ("Season 1")

- On-chain daily leaderboard with streak tracking
- Commit-reveal scheme for fair daily-word submission
- Seasons (rotating leaderboard resets, season badges)
- Player profiles (on-chain history, badge showcase)

*Requires one additional contract redeploy; scoped but not yet started.*

## 🔭 Planned — Gameplay Expansion

- **Speedrun mode:** timed word-scramble runs with a time-bank formula; reuses the existing word pool + scoring engine, only new surface is a clock. Recommended as the next mode to ship (cheapest lift, highest expected value).
- **Weekly Arena:** recurring competitive window, config-only on top of the existing leaderboard system.
- **Category Rush:** config-only on top of the existing category system.
- **Streak Freeze:** one miss doesn't reset your win streak — targets the most common complaint about Wordle-style streak mechanics (no partial credit).
- **Scrabble Duel:** 2-player persistent-board mode with a full turn engine, evolving toward a 4-player 15×15 board (requested by users; scoped as a follow-on to the already-shipped Scramble Board)
- Looser/less-worked-out ideas: Boss Word, Co-op Relay, Themed Weekends
- Manual difficulty selector (currently auto-scales with level; deferred pending its own UI/state design)

## 🔭 Ideas Under Consideration (concept stage, not yet scoped)

**Social & multiplayer**
- **Challenge a Friend** — shareable link/code with a pre-seeded puzzle; friend plays the same board, results compared side-by-side
- **Ghost Replay** — translucent "ghost" of your best-ever (or a friend's) tile placements racing alongside you, Mario Kart-style
- **Guild/Clan leaderboards** — small wallet groups (3-10) with a combined weekly score, layered on the existing leaderboard contract

**Retention**
- **Comeback bonus** — small score multiplier for returning after 3+ days away
- **Daily quest chips** — 2-3 rotating micro-goals granting cosmetic currency, reusing the existing badge/chip system
- **Puzzle calendar / monthly recap** — Wordle-style shareable grid image, generated client-side

**Accessibility & UX**
- **Colorblind-safe tile-effect mode** — alt-palette for effects (aurora, holographic, volcanic, neon) that currently rely on color-only cues
- **One-handed / large-tap mode** — accessibility toggle building on the existing fluid board-sizing system
- **Practice mode** — play with no score/streak risk, for nervous new players

**Monetization-adjacent (non-pay-to-win)**
- **Cosmetic marketplace via NFT badges** — trade/gift on-chain badges between wallets, turning a static reward into a tradeable collectible
- **Sponsor-a-category** — partner-branded category/theme skin, without touching core gameplay fairness

**Content depth**
- **User-submitted word packs** — moderated community word lists, extending the existing bundled word-bank pipeline
- **Localization** — full language toggle (UI + word banks), building on the existing cultural word-pack precedent (anime/filipino)

## 🔭 Long-Term — On-Chain Vocabulary Credentials

Extending the existing badge system (BRONZE/SILVER/GOLD/LEGEND) into verifiable on-chain vocabulary credentials that schools and learners can use as portable, tamper-proof proof of achievement — the long-term vision first outlined in the Level 4 idea submission ([`IDEA_2_SUBMISSION.md`](Idea%20Submissions/IDEA_2_SUBMISSION.md)).

---

## Sources

- Pitch deck, Slide 7 — "Feedback → Product → Roadmap" ([Pitch Deck/](Pitch%20Deck/))
- [README.md](README.md) — feedback-to-roadmap table, submission checklists
- [`IDEA_2_SUBMISSION.md`](Idea%20Submissions/IDEA_2_SUBMISSION.md) — original 4-phase credential-system roadmap
