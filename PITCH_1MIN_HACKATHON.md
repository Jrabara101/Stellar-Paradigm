# 1-Minute Hackathon Pitch — Word Scramble Stellar

**Format:** mini-hackathon demo slot. Problem → Idea → Demo (live) → What worked / broke.
**Target:** ~150 words spoken ≈ 60 seconds at 145–150 wpm. Practice with a timer.

---

## The pitch (read this aloud)

> **Problem.** Web3 onboarding is a wall. Seed phrases, gas fees, faucets — every
> step is a place a newcomer quits. Meanwhile word games earn a daily habit from
> hundreds of millions of people. Nobody built the door between them.
>
> **Idea.** Word Scramble is a retro tile puzzle where your score isn't a row in
> someone's database — it's a transaction on Stellar mainnet. And you need zero
> XLM to play. Fee sponsorship covers account creation and gas, so a brand-new
> player with an empty wallet makes a real blockchain transaction without
> realizing it.
>
> **Demo.** I'll solve one word and submit. That's a live Soroban contract call —
> and the leaderboard contract auto-calls a reward contract to mint a badge, in
> the same transaction. You can verify it on stellar.expert before I sit down.
>
> **What worked.** 21 independent mainnet users, 28 gasless accounts, 55 contract
> events — all verifiable, none self-reported.
>
> **What broke.** Sponsored accounts landed with a zero balance and Freighter
> refused to sign them. Fixed by reordering the sponsorship operations. That bug
> is the whole reason the gasless flow works now.

---

## Timing breakdown

| Time | Section | What's on screen |
|---|---|---|
| 0:00–0:12 | Problem | Slide 2 — the wall |
| 0:12–0:28 | Idea | Slide 3 — gasless flow |
| 0:28–0:45 | Demo (live) | **The app** — switch away from slides |
| 0:45–0:55 | What worked | Slide 6 — verified numbers |
| 0:55–1:00 | What broke | Slide 7 — the bug |

---

## Live demo runbook (do this before you present)

The demo is the risky part. De-risk it:

1. **Open the app and connect the wallet BEFORE you start talking.** Wallet
   connection is the slowest, most failure-prone step. Never do it on stage.
2. **Have the word already scrambled and ready.** Start from a loaded round.
3. **Know your word.** Don't solve a puzzle live in front of an audience — pick
   an easy category and know the answer going in.
4. **Have stellar.expert open in a second tab**, ready to paste the tx hash.
5. **Fallback:** if the network stalls, say *"this is mainnet, it confirms in
   about five seconds — here's one I submitted earlier"* and switch to a
   pre-recorded 5-second clip or the leaderboard. Never stand in silence
   watching a spinner.

---

## Deliverables checklist

| Deliverable | Status | Link |
|---|---|---|
| GitHub repo | ✅ | https://github.com/Jrabara101/Stellar-Paradigm |
| Live link | ✅ | https://word-scramble-v1.surge.sh?network=mainnet |
| Android app (APK) | ✅ | [Download](https://github.com/Jrabara101/Stellar-Paradigm/releases/download/android-debug-v2/app-debug.apk) |
| 1-min pitch | ✅ | this file |
| README — idea | ✅ | [Project Description](README.md#-project-description) |
| README — stack | ✅ | [Tech Stack](README.md#-tech-stack) |
| README — screenshots | ✅ | [Screenshots](README.md#-screenshots) |
| README — future ideas | ✅ | [Future Ideas](README.md#-future-ideas) |

**Note on the live link:** the deliverable spec says Cloudflare. The app is
currently hosted on **Surge**, with a Cloudflare Worker serving the fee-sponsor
endpoint. If the organizers require Cloudflare Pages specifically, deploying the
static frontend there is a ~10 minute job — but the existing Surge link is live
and working right now.

---

## Q&A — likely questions

**"Is this really on mainnet?"**
Yes. Contract `CA37MRPV…IDV2ZCQS`, verifiable on stellar.expert. Not testnet.

**"Who pays the fees?"**
A sponsor account funded by us, with abuse prevention — rate limits and a
per-account cap — in an isolated Cloudflare Worker that holds the sponsor key.

**"What stops someone draining the sponsor?"**
Caps per wallet and per window. See `SECURITY.md`.

**"Why Stellar and not another chain?"**
Fee sponsorship (CAP-33) is a protocol-level primitive here, not a paid relayer
bolted on. Sub-cent fees and ~5s finality make a casual game viable.

**"Is the wordlist on-chain?"**
No — 1,020 curated words ship in the bundle. Only scores and badges are on-chain.
Putting the wordlist on-chain would cost more than it's worth and make the answers
publicly readable.
