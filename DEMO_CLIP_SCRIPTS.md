# 🎙️ Word Scramble — Per-Clip Voiceover Scripts (Level 5 Demo)

Narration scripts matched to the **9 recorded clips** (total ≈ 8 min 9 s). Each script is
written to fit its clip's real length and describes what's actually on screen. Read each aloud
over the matching clip (record voiceover after capture for the cleanest result), or paste into
your editor's caption track.

> Pacing note: these are timed at a natural ~2.3 words/second. If you talk faster, trim the
> optional sentences (marked ⟨optional⟩). Numbers verified against `WALLET_VERIFICATION.md`:
> **51 distinct verified users · 182 on-chain transactions · 4.8/5 · 52 form responses.**

---

## Clip 1 — Game Overview & UI Tour  ·  `1st.mp4` (~71 s)

**On screen:** the live game at `word-scramble-v1.surge.sh` in its retro mid-century theme —
board in the middle, *How to Play* and *Hint Guide* side panels, wallet bar up top (not
connected yet). You open the ☰ Menu, the Effects panel, and the on-chain leaderboard.

**Say:**
> "This is Word Scramble — a retro word puzzle that runs entirely in your browser, live at word-scramble-v1.surge.sh. The goal looks simple: rearrange the letter tiles to unscramble the hidden word. But everything here is built around a real blockchain. Let me give you a quick tour. On the left is a How-to-Play guide, on the right a Hint Guide explaining the free Definition clue and the paid letter Hint. Up here in the menu you've got Daily Challenge, the new Scramble Board mode, categories like Science and History, full board and tile customization, the leaderboard, and an Effects panel — every animation, from confetti bursts to streak fire, is toggleable. And this is the heart of it: the Atomic Leaderboard, pulled live from the Stellar blockchain. Right now I haven't connected a wallet — so let's fix that and start playing."

---

## Clip 2 — Onboarding & First-Time Wallet Guide  ·  `2nd video.mp4` (~42 s)

**On screen:** the "Game Updates" changelog modal, then the 5-slide first-time wallet-guide
carousel — "What's this?", "Connect it here" (wallet picker), "Play, then save your score" —
ending on "Got it, let's play!".

**Say:**
> "The moment a new player arrives, the game onboards them gently — most of our testers had never touched crypto before. First a changelog of what's new. Then a step-by-step wallet guide written for total beginners. It explains, in plain language, that solving a word saves your score permanently on Stellar — a tamper-proof scoreboard — and that you'll need a free digital wallet, which is basically a login that proves the score is really yours. It walks you through connecting, shows the wallet picker, and previews exactly what submitting a score looks like. Nothing about blockchain is assumed. ⟨optional⟩ That's how you bring in players who've never heard of Stellar. Now — let's actually play."

---

## Clip 3 — Customize, Connect Wallet & First On-Chain Win  ·  `3rd.mp4` (~48 s)

**On screen:** switching the board to the green felt theme; clicking Connect Wallet → the
"Testnet account funded! Ready to play" toast (auto-funding); solving a word → the
"SPECTACULAR!" victory card (+100, hot streak, no-hint bonus, +110); the "New score submitted
on-chain — leaderboard updated" toast.

**Say:**
> "First, the game is fully customizable — here's a completely different board theme in one click. Now I'll connect a wallet. Watch this: because it's a brand-new testnet account, the app automatically funds it through Friendbot — no faucet websites, no copy-pasting addresses. It says 'Testnet account funded, ready to play.' Now I solve the word… and there it is — Spectacular! A hundred points, plus a no-hint bonus. And crucially, that score wasn't just saved locally — this toast confirms it was submitted on-chain and the leaderboard updated. ⟨optional⟩ You'll also notice the game tells you when a word has no dictionary definition, naming its length and first and last letters instead — a fix that came straight from player feedback."

---

## Clip 4 — Daily Challenge + On-Chain Transaction Confirm  ·  `4th.mp4` (~33 s)

**On screen:** the Daily Challenge (Day #20661) — solving PYRAMID; the wallet "Confirm
Transaction" popup showing Network: Test Net and a real XLM fee; then "Daily Challenge Complete!"
with Share Result / Share Card.

**Say:**
> "There's also a Daily Challenge — one word a day, the same for every player. Today's is a seven-letter word: P-Y-R-A-M-I-D. When I submit, the wallet pops up to confirm a real Soroban transaction — you can see it's on Test Net, with an actual network fee, signed by me. I approve… and the daily's complete, with a shareable result card and a Wordle-style grid. Every one of these is a genuine on-chain action."

---

## Clip 5 — Scramble Board: the New v2.0.0 Mode  ·  `5th.mp4` (~101 s)

**On screen:** launching Scramble Board — a full 15×15 Scrabble-style board with premium
squares; a 2–4 player match against AI opponents; the tile rack with Submit / Recall / Shuffle
/ Exchange / Pass; the Find Word and Dictionary helper tools; words being placed and scored,
the "not in the word list" validation, and the race-to-target scoreboard.

**Say:**
> "This is our biggest new feature — Scramble Board, shipped as version two-point-oh, and it exists because players asked for it. Several testers wanted a bigger, persistent, Scrabble-style board instead of one word at a time. So we built exactly that: a full fifteen-by-fifteen board with premium squares, for two to four players. Here I'm racing against AI opponents — and those opponents aren't random bots, they're drawn from the real on-chain leaderboard wallets, a stepping stone toward true multiplayer. I place tiles from my rack onto the board, and the game validates every word against a bundled dictionary of over a hundred and sixty thousand words — if it's not a real word, it tells me. There are helper tools too: a Find Word button that highlights the best play, and an in-game Dictionary to check a word before committing. Each valid word scores by tile values and premium squares, and it's a race to the target score. ⟨optional⟩ Everything you're seeing here runs client-side, lazy-loaded so players who never open this mode never download it. It's a whole second game living inside the same app — and the same wallet identity carries across both."

---

## Clip 6 — On-Chain Proof on Stellar Expert  ·  `6th.mp4` (~27 s)

**On screen:** the player's wallet account on Stellar Expert (testnet) — a transaction history
of `submit_score` calls to contract `CDTT…LWH3` (scores 330, 220, 110) each with a fee charged,
plus the Friendbot "created account … starting balance 10,000 XLM" entry; then the wallet
extension showing the balance.

**Say:**
> "And none of this is a simulation — here's the proof on Stellar Expert, the public block explorer. This is my wallet's real history: three submit_score calls, straight to our smart contract, each a successful transaction with a fee charged. Down here you can even see the account being created and funded with ten thousand test XLM by Friendbot. Every score in this game is independently verifiable on the public ledger — that's the difference between a demo and a real product."

---

## Clip 7 — Live Analytics (GoatCounter)  ·  `7th.mp4` (~43 s)

**On screen:** the GoatCounter dashboard — custom events like `score_submitted?score=940&level=4`
and `wallet_connect?wallet=xbull`; total visits; top referrers (Facebook, Instagram, Messenger,
the GitHub repo); browsers, systems, and locations (mostly Philippines) of real players.

**Say:**
> "We measure real usage with privacy-friendly analytics — no cookie banner. These aren't page views, they're custom product events firing from the live app: every score submission tagged with score and level, every wallet connection tagged with which wallet was used. You can see the traffic sources — players came from Facebook, Messenger, Instagram, and our GitHub repo. And the audience is real and organic: real browsers, real devices, mostly here in the Philippines. ⟨optional⟩ This is live evidence of genuine players, not synthetic traffic."

---

## Clip 8 — User Feedback: Google Form → Excel  ·  `8th.mp4` (~55 s)

**On screen:** the Google Form responses — 52 responses with player names, the Stellar wallet
address field, and a summarized "Anything confusing or broken?" theme breakdown; then the linked
Google Sheet with timestamps, names, and wallet addresses (the Excel export).

**Say:**
> "Growth and product improvement run on a real feedback loop. Right after their first on-chain score, players are invited to a short form. Here are the responses — fifty-two of them, each with a name, their Stellar wallet address, a rating, and open feedback. We didn't just collect it; we acted on it. The themes here are exactly what drove our releases: players found the hint labeling confusing — so we renamed it to a clear Definition button. They wanted more consistent definitions — so we improved the fallback. And they asked for a bigger, Scrabble-style board — which became the Scramble Board mode you just saw. ⟨optional⟩ Every response is exported to this spreadsheet — which doubles as our Excel record and, because it captures wallet addresses, the raw material for on-chain verification. That's the loop: real players in, real product changes out."

---

## Clip 9 — Verified Proof of 51 Users  ·  `9th.mp4` (~69 s)

**On screen:** `WALLET_VERIFICATION.md` on GitHub — the "Verified Users (51 / 51)" table with
names, wallet addresses, verified `submit_score` counts, latest submission, contract v1/v2, and
a "View tx" proof link per user; scrolling through all 51; the Full Wallet Addresses and Data
Hygiene Notes sections.

**Say:**
> "And here's where it all comes together — our verification document, public on GitHub. Fifty-one distinct users, and this table proves every single one. We didn't take the form data at face value. For each wallet address a player submitted, we queried Stellar's own ledger, decoded the transaction, and confirmed a real, successful submit_score — not self-reported, cryptographically verified. Every row links straight to the transaction on the explorer. You can see it spans both of our contract deployments, dozens of users each with multiple submissions — a hundred and eighty-two verified transactions in total, a hundred percent verification rate. We're even transparent about data hygiene: fifty-two form responses mapped to fifty-one distinct wallets, and we disclose the one duplicate rather than inflate the count. ⟨optional⟩ This is what real, provable traction looks like on Stellar. Word Scramble — live, open source, and verified. Thanks for watching."

---

## 🎬 Assembly notes

- **Order:** 1 → 9 as above tells a complete story (overview → onboarding → play → on-chain →
  new mode → proof → analytics → feedback → verification). Total ≈ 8 min. For a tighter ~5-min
  cut, trim the ⟨optional⟩ lines and shorten Clip 5 (Scramble Board) and Clip 1.
- **Voiceover:** record narration *after* capture, over the muted clips — smoother than talking
  while playing.
- **Captions:** auto-generate them (CapCut/Clipchamp) — many judges watch muted.
- **Keep the on-chain moments uncut:** the wallet signature (Clip 4) and the Stellar Expert
  history (Clip 6) are your credibility — don't speed them up.
- **Export & link:** stitch to one MP4 (or upload the 9 in order), put it on YouTube/Drive, and
  send me the link — I'll add it to the README's Demo Video section as the Level 5 walkthrough.
