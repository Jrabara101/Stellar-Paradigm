# 🎬 Word Scramble — Demo Video Walkthrough Script (Level 5)

A full production script for the required product-walkthrough / demo video.

- **Target length:** 4:00–4:30 (aim for under 5 minutes — judges watch many)
- **Format:** Screen recording with voiceover. 1080p, landscape. Record system audio for the game SFX at low volume under your narration.
- **Tools:** OBS Studio, ShareX, or the built-in Xbox Game Bar (Win+G) for capture; any editor (CapCut, Clipchamp, DaVinci Resolve) for trimming + captions.
- **How to read this:** Each scene lists **⏱ TIME**, **🎥 ON SCREEN** (what to show + actions to perform), and **🗣 SAY** (voiceover — read naturally). Durations are targets; it's fine to be ±10s.

---

## ✅ Pre-Recording Checklist

- [ ] Use a **fresh browser profile** (or clear localStorage) so the first-time onboarding + wallet guide actually appear.
- [ ] Have a **funded testnet wallet** ready in Freighter or Albedo (use one of your pre-funded wallets).
- [ ] Open these tabs in advance so switching is instant:
  1. The live app — `word-scramble-v1.surge.sh`
  2. Stellar Expert (testnet) — ready to paste a transaction hash
  3. GoatCounter analytics dashboard
  4. The GitHub repo
- [ ] Close notifications / other apps. Hide bookmarks bar. Zoom browser to ~100–110% so text is legible.
- [ ] Do one dry run of the whole flow so the on-chain submit doesn't surprise you on camera.
- [ ] Pre-solve knowledge: know the word you'll solve so you don't fumble the drag.

---

## Scene 1 — Cold Open / Hook (0:00–0:20)

**⏱ TIME:** 20s

**🎥 ON SCREEN:**
- Start on the live game already loaded — the board, tiles, and wallet bar visible.
- Slowly move the cursor over a tile; optionally drag one tile and drop it back.

**🗣 SAY:**
> "This is Word Scramble — a retro word puzzle that runs entirely in your browser. It looks like a simple game… but every score you save here is a real transaction on the Stellar blockchain. Let me show you the whole flow, from a brand-new player to a verified on-chain user."

---

## Scene 2 — First-Time Onboarding (0:20–0:45)

**⏱ TIME:** 25s

**🎥 ON SCREEN:**
- Reload with fresh storage so the **Welcome** onboarding modal appears. Show it.
- Dismiss it, then let the **wallet guide** carousel appear — click through 1–2 slides.

**🗣 SAY:**
> "The moment a new player lands, we onboard them gently. First, a welcome card that says: you don't even need a wallet to start playing — just jump in. Then, for anyone who's never touched crypto, a step-by-step wallet guide explains what a wallet is, how to install one, and what happens when you save a score. Nothing about blockchain is assumed. That's how you bring in players who've never heard of Stellar."

---

## Scene 3 — Play a Round (0:45–1:25)

**⏱ TIME:** 40s

**🎥 ON SCREEN:**
- Drag-and-drop letter tiles onto the board to unscramble the word.
- Click **Definition** to reveal the meaning (highlight that it's free).
- Optionally show the category menu (☰ Menu → Category) briefly.
- Complete the word so it's ready to submit.

**🗣 SAY:**
> "Gameplay is pure drag-and-drop. You rearrange the letter tiles to unscramble the word. Stuck? Tap 'Definition' — that's free, and it shows you what the word actually means, so you're learning vocabulary as you play. There's a paid 'Hint' too if you want a letter locked in. You can pick categories like Science, History, Anime, or Technology. I'll finish this word… and now it's ready to save."

**Note:** This scene reflects the renamed **Definition** button — a direct result of user feedback. You can mention that if you want to reinforce the "we listen to users" story.

---

## Scene 4 — Connect Wallet + Auto-Funding (1:25–2:00)

**⏱ TIME:** 35s

**🎥 ON SCREEN:**
- Click **Connect Wallet**. Show the Stellar Wallets Kit picker with multiple options (Freighter, xBull, Albedo, Hot Wallet).
- Pick your wallet, approve the connection in the extension/popup.
- Point out the wallet address + balance appearing in the top bar. If using a fresh account, show the "Funding your Testnet account…" message.

**🗣 SAY:**
> "To save a score on-chain, you connect a wallet. We support four — Freighter, xBull, Albedo, and Hot Wallet — through the Stellar Wallets Kit. I'll approve the connection… and here's the key part: if this is a brand-new testnet account, the app automatically funds it through Friendbot. No faucet websites, no copy-pasting addresses. You're funded and ready in seconds. You can see my wallet address and balance now live in the top bar."

---

## Scene 5 — Submit Score On-Chain (2:00–2:35)

**⏱ TIME:** 35s

**🎥 ON SCREEN:**
- Click **Submit**. Show the "Saving score to blockchain…" status.
- The wallet pops up to sign — approve the transaction.
- Show the success confirmation in the app.

**🗣 SAY:**
> "Now the moment that matters. I hit Submit, and the app builds a real Soroban smart-contract transaction. My wallet asks me to sign it — this is a genuine on-chain action, with a real network fee. I approve… and the score is now saved permanently on Stellar. What just happened behind the scenes is actually two smart contracts working together: the leaderboard contract saved my score, and it automatically called a second contract that mints my achievement badge — all in this one transaction."

---

## Scene 6 — Prove It's Real (Stellar Expert) (2:35–3:00)

**⏱ TIME:** 25s

**🎥 ON SCREEN:**
- Switch to the Stellar Expert tab. Paste the transaction hash (or open the contract's account page) and show the successful `invoke_host_function` / `submit_score` call.
- Highlight the "Success" status and the fee charged.

**🗣 SAY:**
> "And this isn't a simulation — let me prove it. Here's that exact transaction on Stellar Expert, the public block explorer. You can see it invoked our contract's submit_score function, it succeeded, and a real fee was charged. Every score in this game is independently verifiable on the public ledger. That's the difference between a demo and a real product."

---

## Scene 7 — Leaderboard + Live Stream + Badges (3:00–3:25)

**⏱ TIME:** 25s

**🎥 ON SCREEN:**
- Back in the app, open the Leaderboard. Show the top-10 with wallet badges.
- Point out the **● LIVE** indicator if it flashes; mention cross-tab real-time updates.
- Show the earned badge (Bronze/Silver/Gold/Legend) in the wallet bar.

**🗣 SAY:**
> "The result shows up on a top-ten on-chain leaderboard, tagged with which wallet each player used. When anyone in the world submits a score, every open tab flashes this 'LIVE' indicator in real time. And here's the badge that second contract minted for me — a permanent, on-chain achievement that's provably mine."

---

## Scene 8 — Scramble Board (New v2.0.0 Feature) (3:25–3:55)

**⏱ TIME:** 30s

**🎥 ON SCREEN:**
- Open ☰ Menu → **🎲 Scramble Board**. Show the setup modal (2–4 players, Easy/Med/Hard, target score).
- Start a match; show the 15×15 board and place one word with tap-to-place.
- Briefly show an AI opponent taking a turn.

**🗣 SAY:**
> "And this is brand new — Scramble Board, our version-two release. Players told us they wanted a bigger, persistent, Scrabble-style board, so we built it: a full fifteen-by-fifteen tile game for two to four players, with race-to-target scoring. Your opponents here are actually drawn from the on-chain leaderboard wallets — a stepping stone toward real multiplayer. This shipped because our users asked for it."

**Note:** If Scramble Board isn't finalized in your deployed build yet, either (a) deploy it first, or (b) skip this scene and add 10s each to Scenes 3 and 7. Don't demo something that isn't live.

---

## Scene 9 — Analytics + Feedback Loop (3:55–4:15)

**⏱ TIME:** 20s

**🎥 ON SCREEN:**
- Show the GoatCounter analytics dashboard: real `wallet_connect`, `score_submitted`, `feedback_opened` events.
- Switch back to the app; click the **Feedback** button to show the Google Form.

**🗣 SAY:**
> "We measure everything with privacy-friendly analytics — real wallet connections, score submissions, and feedback events from real testers. And this feedback button feeds a Google Form that's already driven real product changes, like the fixes and the new board mode you just saw. This is a live loop, not a one-time build."

---

## Scene 10 — Proof of Users + Close (4:15–4:30)

**⏱ TIME:** 15s

**🎥 ON SCREEN:**
- Briefly show `WALLET_VERIFICATION.md` (or the GitHub repo) with the verified user table.
- End on the live app URL, held on screen.

**🗣 SAY:**
> "Every user is cross-checked on-chain and documented in our public repo. This is Word Scramble — live, open source, and verified. Come solve a word, and make your first blockchain transaction without even realizing it. Thanks for watching."

---

## 🎞 Timeline Summary

| Scene | Content | Start | Duration |
|---|---|---|---|
| 1 | Cold open / hook | 0:00 | 0:20 |
| 2 | First-time onboarding | 0:20 | 0:25 |
| 3 | Play a round | 0:45 | 0:40 |
| 4 | Connect wallet + auto-fund | 1:25 | 0:35 |
| 5 | Submit score on-chain | 2:00 | 0:35 |
| 6 | Prove it's real (Stellar Expert) | 2:35 | 0:25 |
| 7 | Leaderboard + live + badges | 3:00 | 0:25 |
| 8 | Scramble Board (v2.0.0) | 3:25 | 0:30 |
| 9 | Analytics + feedback loop | 3:55 | 0:20 |
| 10 | Proof of users + close | 4:15 | 0:15 |
| — | **Total** | — | **~4:30** |

---

## 🎯 Production Tips

- **Record scenes separately**, then stitch them — far easier than one perfect take. If you flub a line, just re-record that scene.
- **Voiceover after capture:** record clean gameplay first (no talking), then narrate over it in your editor. Your narration will be smoother and you won't rush the gameplay.
- **Add captions/subtitles** — many judges watch muted. CapCut and Clipchamp auto-generate them.
- **Zoom in on key moments** — the wallet signature popup, the Stellar Expert "Success", the badge. Post-crop or use a zoom effect so small UI is readable.
- **Keep the on-chain submit un-cut** — showing the real wallet signature and the real explorer confirmation, unedited, is your credibility proof. Don't speed it up.
- **Title card (optional):** a 3s intro card with the game name + "Rise In Level 5" and a matching 3s outro with the live URL and repo link.
- **Music:** if you add background music, keep it under -20dB so narration stays clear. Use royalty-free tracks only.
- **Upload** to YouTube (unlisted or public) or Google Drive, then paste the link into the README's demo-video section.

---

## 📝 Where to put the finished video

1. Upload to YouTube (recommended — best playback for judges) or Google Drive.
2. Add the link to `README.md` under a "Level 5 — Full Product Walkthrough" heading.
3. Tell me the link and I'll wire it into the README alongside the pitch deck and Excel export in the final assembly pass.
