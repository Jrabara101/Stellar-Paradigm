# 🎤 Word Scramble — Pitch Deck Script (Level 5)

A slide-by-slide script for presenting the **Word Scramble** pitch deck.

- **Total runtime:** ~5 minutes (fits a 5–7 min pitch slot)
- **How to use:** Each slide below has three parts — **ON SLIDE** (what the audience sees), **SAY** (word-for-word narration; paste into Canva speaker notes), and **⏱ TIME** (target duration). Read the SAY text in a natural, conversational tone — don't rush the numbers.
- **Golden rule:** The deck sells the *idea*; the demo video proves it *works*. Keep the deck tight and let the demo carry the proof.

---

## Slide 1 — Title / Hook

**⏱ TIME:** 0:00–0:25 (25s)

**ON SLIDE:**
- Word Scramble — Gamified Web3 Onboarding on Stellar
- A retro word puzzle with a real on-chain leaderboard & badge system
- Live: word-scramble-v1.surge.sh
- Rise In Level 5 Submission

**SAY:**
> "Hi, I'm [NAME]. What if the very first blockchain transaction someone ever makes wasn't a scary DeFi swap — but solving a word puzzle? This is Word Scramble: a retro word game where every score you earn is a real transaction on the Stellar blockchain. It's live right now, anyone can play it in a browser, and today I'll show you how it turns casual gamers into on-chain users."

**Delivery tip:** Open with energy. The "what if" question is your hook — pause for a beat after it before answering.

---

## Slide 2 — Problem

**⏱ TIME:** 0:25–1:05 (40s)

**ON SLIDE:**
- Web3 onboarding is a wall: wallets, seed phrases, gas, faucets
- Web3 education is passive — docs and videos, never a real first transaction
- Casual word games have massive daily-habit appeal — but none touch the chain
- Result: high drop-off in onboarding funnels; huge game audiences never try Web3

**SAY:**
> "Here's the problem. Getting a normal person onto a blockchain is hard — wallets, seed phrases, gas fees, testnet faucets. Every one of those is a place people quit. And the way we usually teach Web3 is passive: we hand people documentation and videos, but we never actually put a wallet in their hand and let them make a safe, low-stakes first transaction. Meanwhile, casual word games — think Wordle — have proven that hundreds of millions of people will happily open a word puzzle every single day. Nobody has combined that habit with a real on-chain action. So onboarding funnels leak, and massive gaming audiences never even get exposed to blockchain."

**Delivery tip:** Land "every one of those is a place people quit" slowly — it's the emotional core of the problem.

---

## Slide 3 — Solution

**⏱ TIME:** 1:05–1:55 (50s)

**ON SLIDE:**
- Solve a word → a real Soroban transaction on Stellar Testnet
- Verifiable on Stellar Expert — not simulated
- Two smart contracts: WordScramble auto-calls RewardContract to mint a badge, in one transaction
- Multi-wallet (Freighter, xBull, Albedo, Hot Wallet) + auto-funding via Friendbot
- Guided wallet walkthrough + in-game tutorial for total beginners
- Live "● LIVE" event stream shows other players in real time

**SAY:**
> "Our solution: make the blockchain invisible until the moment it delights you. You drag letter tiles, solve a word, and hit submit — and that submit is a real smart-contract call on Stellar. It's not a mockup; every score is verifiable on Stellar Expert. Under the hood there are actually two smart contracts talking to each other: when you submit a score, the leaderboard contract automatically calls a second reward contract that mints you an achievement badge — Bronze, Silver, Gold, or Legend — all in a single transaction. We support four different wallets, and brand-new accounts get auto-funded through Friendbot, so there's no faucet hunting. First-timers get a guided walkthrough that explains what a wallet even is. And a live event stream lights up whenever anyone, anywhere, submits a score."

**Delivery tip:** "Make the blockchain invisible until the moment it delights you" is your thesis sentence — say it with conviction.

---

## Slide 4 — Market Opportunity

**⏱ TIME:** 1:55–2:35 (40s)

**ON SLIDE:**
- Casual word games = a proven, massive category (Wordle, Scrabble GO, Speed Wordle)
- Stellar's mission: consumer financial inclusion & lowering the barrier for non-technical users
- We sit at the intersection: casual gamers × Web3-curious newcomers
- Expansion modes modeled on proven mechanics → de-risked growth

**SAY:**
> "Why now, and why this? Casual word games are one of the most durable categories in all of gaming — Wordle alone turned a single mechanic into a daily habit for millions, and variants like Scrabble GO and Speed Wordle keep that engagement growing. At the same time, Stellar's whole mission is consumer financial inclusion — lowering the barrier for non-technical people. Word Scramble sits exactly at that intersection: it takes an audience that already loves word games and gives them a safe on-ramp to Web3. And because our expansion modes are modeled on mechanics that have already proven themselves in the market, our growth path is de-risked — we're not inventing player behavior, we're borrowing patterns that already work."

**Delivery tip:** This is the "investable" slide. Sound confident about the category size.

---

## Slide 5 — Architecture

**⏱ TIME:** 2:35–3:20 (45s)

**ON SLIDE:**
- Fully client-side: vanilla HTML/CSS/JS, no backend, no build step — static on Surge
- `stellar.js` bridges the UI to two Soroban contracts via stellar-sdk v15 + Stellar Wallets Kit
- `submit_score(player, score, level)` → top-10 on-chain leaderboard (personal-best only) → auto-mints badge
- Live polling of `rpc.getEvents()` every 5s for cross-tab notifications
- CI/CD: GitHub Actions runs contract tests + frontend checks on every push
- Analytics: GoatCounter (wallet connects, scores, feedback) — no cookie banner

**SAY:**
> "Architecturally, this is deliberately lean. The entire front end is vanilla HTML, CSS, and JavaScript — no backend server, no build step — served as a static site. A single file, stellar.js, bridges the game to two Soroban smart contracts using the Stellar SDK and Stellar Wallets Kit. When you submit, the contract writes to a top-ten leaderboard, but only if you beat your personal best, and then it automatically mints your badge in the same flow. The front end polls the network every five seconds so every open tab sees new scores live. We run continuous integration on GitHub Actions — contract tests and front-end checks on every single push — and we track real usage with privacy-friendly analytics, no cookie banners. It's simple enough to audit in an afternoon and robust enough to run in production."

**Delivery tip:** If you have an architecture diagram, point to the two-contract flow as you describe the auto-mint. Keep it high-level — don't read every bullet.

---

## Slide 6 — Growth Strategy

**⏱ TIME:** 3:20–4:05 (45s)

**ON SLIDE:**
- Acquisition-and-verification loop: recruit → connect wallet → on-chain submit → cross-check on Horizon
- Scaled from 10 → 51 verified testnet users · 182 on-chain txns · 100% verified (not self-reported)
- Built-in feedback funnel: auto-prompt after first score + persistent button → continuous improvement
- Feedback already shipped real fixes (see next slide)
- Retention modes next: Speedrun (cheapest lift), Weekly Arena, Category Rush

**SAY:**
> "Growth is already running as a repeatable loop: we recruit a player, they connect a wallet, they submit a score on-chain, and then we independently verify that transaction against Stellar's own ledger — so our user numbers aren't self-reported, they're cryptographically backed. We've scaled that from ten verified users to fifty-one, across a hundred and eighty-two real transactions with a hundred percent verification rate. Retention is built in too: right after your first score, the game invites you to leave feedback, and that feedback loop has already produced real product fixes that shipped. Our next retention modes — a timed Speedrun, a Weekly Arena, Category Rush — reuse the systems we've already built, so each one is a cheap, fast addition rather than a rewrite."

**Delivery tip:** "Cryptographically backed, not self-reported" is a credibility flex — most hackathon projects can't say this. Emphasize it.

---

## Slide 7 — Feedback → Product → Roadmap

**⏱ TIME:** 4:05–4:40 (35s)

**ON SLIDE:**
- We listened, then shipped:
  - "The hint button is confusing" → renamed to a clear **Definition** button
  - "Not all words have definitions" → improved fallback clue coverage
  - "I want a bigger, persistent Scrabble-style board" → **shipped Scramble Board** (v2.0.0): 2–4 players, 15×15 tiles
- Next: on-chain daily leaderboard with streaks & commit-reveal, seasons, player profiles
- Long-term: badges → verifiable on-chain vocabulary credentials for schools

**SAY:**
> "This slide is my favorite, because it proves the loop actually closes. Real testers told us the hint system was confusing — so we renamed it to a clear Definition button. They said not every word had a definition — so we improved our fallback coverage. And several players asked for a bigger, persistent, Scrabble-style board — so we built exactly that: Scramble Board, a two-to-four-player fifteen-by-fifteen tile game, shipped as version two-point-oh. Looking forward, we're moving the daily leaderboard fully on-chain with streaks and fair commit-reveal, adding seasons and profiles, and long-term, evolving these badges into verifiable vocabulary credentials that schools could actually recognize."

**Delivery tip:** This is your strongest slide — it shows you build with users, not just for a hackathon. Slow down and let each fix land.

---

## Slide 8 — Demo & Traction / Close

**⏱ TIME:** 4:40–5:15 (35s)

**ON SLIDE:**
- Live: word-scramble-v1.surge.sh — playable now
- 51 verified users · 182 on-chain txns · 100% cross-checked on Stellar Horizon for a real submit_score
- 4.8/5 average rating · 51/52 (~98%) would play again
- Full walkthrough demo video: connect → play → on-chain submit → analytics → feedback
- Public GitHub repo · 50+ commits · CI passing
- "Come solve a word — and make your first blockchain transaction without realizing it."

**SAY:**
> "To wrap up: this isn't a concept, it's live. Fifty-one distinct testnet users have played, and every one of their wallets is independently verified on-chain — a hundred percent verification rate across a hundred and eighty-two transactions. Players rate it four-point-eight out of five, and fifty-one of fifty-two say they'd play again. Everything's open source, with a passing CI pipeline and a full walkthrough video that shows the entire flow end to end. So my ask is simple: go to the link, solve one word, and you'll have made your first blockchain transaction without even realizing it. That's how we onboard the next million users to Stellar. Thank you."

**Delivery tip:** End on the callback to your opening hook ("without realizing it"). Then stop talking — let "Thank you" be the last word.

---

## 📋 Presenter Cheat-Sheet

| Slide | Topic | Time | One-line goal |
|---|---|---|---|
| 1 | Title / Hook | 0:25 | Grab attention with the "what if" |
| 2 | Problem | 0:40 | Web3 onboarding leaks; games don't touch chain |
| 3 | Solution | 0:50 | Solving a word = a real Stellar transaction |
| 4 | Market | 0:40 | Word games × Web3 newcomers, on Stellar's mission |
| 5 | Architecture | 0:45 | Lean, two-contract, auditable, CI-backed |
| 6 | Growth | 0:45 | Verified loop, 10→51, feedback funnel |
| 7 | Feedback→Roadmap | 0:35 | We shipped what users asked for |
| 8 | Traction / Close | 0:35 | Live, verified, rated — callback to hook |

**If you only have 3 minutes:** keep slides 1, 3, 6, 8 at full length; compress 2, 4, 5, 7 to one sentence each.

**Before you present:**
- [ ] Update the user count on slides 6 & 8 to your real verified number.
- [ ] Have the live app open in a browser tab as backup in case the demo video won't play.
- [ ] Rehearse slide 3 (Solution) and slide 7 (Feedback) most — they carry the pitch.
