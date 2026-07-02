# 🎯 Word Scramble — On-Chain Leaderboard (Stellar)

A retro, mid-century-themed word puzzle game with an **on-chain leaderboard** and **badge reward system** powered by the **Stellar blockchain** and two communicating Soroban smart contracts. Players unscramble words to earn points, save scores on-chain, and earn achievement badges minted automatically via inter-contract calls.

**🔗 Live demo:** https://word-scramble-v1.surge.sh

**🎬 Demo video:** [Video/Word Scramble Video.mp4](Video/Word%20Scramble%20Video.mp4)

**📄 Level 4 Idea Submission:** 
- **Word Document:** [IDEA_2_SUBMISSION.docx](IDEA_2_SUBMISSION.docx) ⬅️ **Download this for submission**
- Markdown: [IDEA_2_SUBMISSION.md](IDEA_2_SUBMISSION.md)
- HTML: [IDEA_2_SUBMISSION.html](IDEA_2_SUBMISSION.html)

---

## 🔌 Frontend ↔ Smart Contract Integration

**Integration file:** [`stellar.js`](stellar.js) (575 lines) — this is the file that connects the browser UI to the Soroban contracts. It is committed at the repo root and has been present since the very first commit ([`8f324d5`](https://github.com/Jrabara101/Stellar-Paradigm/commit/8f324d5)).

| Requirement | Where it's implemented in `stellar.js` |
|---|---|
| **Wallet connection** | [`StellarWallet.connect()`](stellar.js#L76-L121) opens the Stellar Wallets Kit modal, retrieves the selected wallet's address via `kit.getAddress()`, and stores the session (supports Freighter, xBull, Albedo, LOBSTR, Hana, and more) |
| **Contract initialization** | [`new sdk.Contract(STELLAR_CONFIG.contractId)`](stellar.js#L145) and [`new sdk.Contract(STELLAR_CONFIG.rewardContractId)`](stellar.js#L333) instantiate the two deployed Soroban contracts using the SDK loaded in [`_getSDK()`](stellar.js#L55-L60) |
| **Transaction building** | [`submitScore()`](stellar.js#L133-L209) builds a transaction with `TransactionBuilder` → `simulateTransaction` → `assembleTransaction` → wallet `signTransaction` → `sendTransaction`, then polls `getTransaction` for confirmation. The same pattern repeats in [`resetScore()`](stellar.js#L354-L415) and [`resetLeaderboard()`](stellar.js#L418-L478) |
| **Function matching** | Every `contract.call(...)` name matches an exported `pub fn` in the Rust contracts: `submit_score`, `get_leaderboard`, `get_score`, `reset_score`, `reset_leaderboard` in [`word-scramble-contract/contracts/hello-world/src/lib.rs`](word-scramble-contract/contracts/hello-world/src/lib.rs), and `get_badges` in the RewardContract |

CI also enforces that `stellar.js` exists on every push — see [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and the "Frontend File Check" step referenced in the [CI/CD Pipeline](#️-cicd-pipeline) section below.

---

## 📖 Project Description

Word Scramble is a fully client-side browser game (no backend) that integrates Web3 wallet connectivity and smart-contract calls directly from the frontend:

- **Gameplay:** Drag-and-drop letter tiles to solve scrambled words across multiple categories (Science, History, Anime, Technology, and more), with progressive hints, win streaks, custom board themes, and synthesized retro audio.
- **Blockchain:** When you solve a word, your score is submitted to a Soroban smart contract on **Stellar Testnet**. The contract maintains a top-10 leaderboard, only updating an entry when you beat your previous best.
- **Inter-contract calls:** `submit_score` automatically calls the **RewardContract** to mint a badge (BRONZE / SILVER / GOLD / LEGEND) when a score milestone is hit — no extra transaction needed.
- **Event streaming:** The frontend polls `rpc.getEvents()` every 5 seconds. When any player submits a score, all connected tabs flash a **● LIVE** indicator in real time.
- **Multi-wallet:** Connect with any Stellar wallet (Freighter, Albedo, xBull, LOBSTR, Hana, and more) through Stellar Wallets Kit. The leaderboard shows which wallet each player used.
- **Auto-funding:** New Testnet accounts are automatically funded via Friendbot on connect, so anyone can play immediately.

---

## 🏗️ Smart Contracts

### WordScramble Contract
**Contract ID (Testnet):** `CBU2ZJVRKYZCUFGUCMHXEK7S4V6HK3ZP47WXJEXIP4VTUGLLRNJ2MIEE`

| Function | Description |
|---|---|
| `submit_score(player, score, level)` | Saves a score; only overwrites if higher. Emits a `score/saved` event and calls RewardContract to mint a badge. |
| `get_leaderboard()` | Returns the top-10 leaderboard (read-only) |
| `get_score(player)` | Returns a single player's best score |
| `set_reward_contract(reward_contract_id)` | Wires the RewardContract address for inter-contract calls |

### RewardContract
**Contract ID (Testnet):** `CDXIWPK4YYUTZPSXEBLELBBQIJ6X3UKJSDO4CJIH2KZXFWCBH6KXLIOQ`

| Function | Description |
|---|---|
| `init(word_contract_id)` | Authorises the WordScramble contract as the only caller allowed to mint badges |
| `mint_badge(player, badge)` | Mints a badge for the player (idempotent — same badge is never minted twice) |
| `get_badges(player)` | Returns all badges earned by a player |
| `has_badge(player, badge)` | Returns `true` if the player holds the given badge |

### Badge Tiers
| Badge | Score threshold |
|---|---|
| 🥉 BRONZE | 100+ |
| 🥈 SILVER | 300+ |
| 🥇 GOLD | 500+ |
| ⭐ LEGEND | 1000+ |

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML / CSS / JavaScript (no framework, no build step)
- **Blockchain SDK:** [`@stellar/stellar-sdk`](https://github.com/stellar/js-stellar-sdk) v15 (loaded via esm.sh CDN)
- **Wallets:** [`@creit.tech/stellar-wallets-kit`](https://github.com/Creit-Tech/Stellar-Wallets-Kit) (multi-wallet)
- **Smart contracts:** Soroban (Rust, `soroban-sdk` 26) — two contracts with inter-contract communication
- **CI/CD:** GitHub Actions — contract unit tests + frontend file check on every push
- **Network:** Stellar Testnet (Protocol 26)
- **Hosting:** Surge (static)

---

## 🚀 Setup — Run Locally

Because the app uses ES modules (`<script type="module">`), it **must be served over HTTP(S)** — opening `index.html` directly as a `file://` URL will not work.

### Prerequisites
- A Stellar wallet browser extension such as [Freighter](https://www.freighter.app/), **or** use the web-based [Albedo](https://albedo.link/) (no install needed)
- Set your wallet's network to **Testnet**
- Node.js 20+ (only if you want to use a Node-based local server)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Jrabara101/Stellar-Paradigm.git
cd Stellar-Paradigm

# 2. Start any static server, e.g.:
npx serve .
#   or:  python -m http.server 8080
#   or:  VS Code "Live Server" extension

# 3. Open the served URL in your browser (e.g. http://localhost:3000)
```

### How to play + save a score
1. Click **Connect Wallet** and pick your wallet from the modal.
2. Your address, **XLM balance**, and any earned **badge** appear in the top bar.
3. Solve a scramble and click **Submit**.
4. Approve the transaction in your wallet.
5. You'll see **"Score saved on-chain!"** with the transaction hash.
6. If you hit a score milestone (100 / 300 / 500 / 1000), a badge is automatically minted via the RewardContract.

> **Smart contract development** (optional): contracts live in `word-scramble-contract/`. Build and deploy with the [Stellar CLI](https://developers.stellar.org/docs/tools/cli):
> ```bash
> cd word-scramble-contract
> stellar contract build
> stellar contract deploy --wasm target/wasm32v1-none/release/hello_world.wasm --network testnet --source <your-key>
> stellar contract deploy --wasm target/wasm32v1-none/release/reward_contract.wasm --network testnet --source <your-key>
> ```
> Then update `contractId` and `rewardContractId` in `stellar.js`.

---

## 🎬 Demo Video

A full walkthrough of the app end to end — wallet connection, solving a word, on-chain score submission, inter-contract badge minting, real-time event streaming across two tabs, leaderboard with wallet type badges, and CI/CD pipeline passing on GitHub Actions.

📁 **File:** [Video/Word Scramble Video.mp4](Video/Word%20Scramble%20Video.mp4)

> **What the video covers:**
> 1. Opening the live URL at `word-scramble-v1.surge.sh`
> 2. Multi-wallet connect modal (Stellar Wallets Kit)
> 3. Solving a word → Submit → Freighter approval → "Score saved on-chain!"
> 4. Tab 2 live event stream flash (● LIVE indicator via `rpc.getEvents`)
> 5. Leaderboard showing scores, badges, and wallet type per player
> 6. GitHub Actions CI — contract tests + frontend check passing

---

## 📸 Screenshots

### 1. Wallet Connected (Multi-Wallet)
The multi-wallet picker (Stellar Wallets Kit) lets players choose any supported wallet, then authorize the app. Works with both browser-extension wallets (Freighter) and web wallets (Albedo):

![Wallet picker](screenshots/wallet-picker.png)
![Freighter connection request](screenshots/wallet-approval-freighter.png)
![Albedo authorization](screenshots/wallet-approval.png)

### 2. Balance Displayed
The connected wallet's XLM balance, and the same balances verified on Stellar Expert (Testnet):

![In-wallet balance](screenshots/wallet-balance.png)
![Balance on Stellar Expert](screenshots/balance-displayed.png)
![Balance on Stellar Expert 2](screenshots/balance-displayed-2.png)

### 3. Successful Testnet Transaction
`submit_score` transactions confirmed on Testnet (with fees charged), viewed on Stellar Expert:

**Verified transaction hash (Testnet):** `04fe1fd8a82ef7a7237ccd5a2079ea66898dfc0f4adaf80bd13a7ef6dde5815f`
[View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/04fe1fd8a82ef7a7237ccd5a2079ea66898dfc0f4adaf80bd13a7ef6dde5815f)

> `submit_score(GAOPKW...3K4MZJ, 550, 5)` — Status: Successful — Ledger 3129587 — 2026-06-17 01:48:57 UTC

![Successful transaction](screenshots/successful-transaction.png)
![Successful transaction 2](screenshots/successful-transaction-2.png)

### 4. Transaction Result Shown to the User
The on-chain result — the contract's invocation history and the player's account activity on Stellar Expert:

![Transaction result — contract](screenshots/transaction-result.png)
![Transaction result — account](screenshots/transaction-result-2.png)

### 5. Inter-Contract Communication (Badge Minting)
`submit_score` on WordScramble automatically calls `mint_badge` on RewardContract in the same transaction. Visible on Stellar Expert as a nested contract invocation:

![Inter-contract transaction](screenshots/successful-transaction-2.png)

---

## ⚙️ CI/CD Pipeline

GitHub Actions runs automatically on every push to `main`:

1. **Soroban Contract Tests** — builds both contracts targeting `wasm32v1-none` and runs all 6 unit tests with `cargo test`
2. **Frontend File Check** — verifies `index.html`, `style.css`, `script.js`, and `stellar.js` are present

[![CI](https://github.com/Jrabara101/Stellar-Paradigm/actions/workflows/ci.yml/badge.svg)](https://github.com/Jrabara101/Stellar-Paradigm/actions/workflows/ci.yml)

**11 workflow runs — 10 passing ✅ | 1 fixed early failure (wasm32 target, resolved in Run #2)**

| Run | Commit | Result |
|---|---|---|
| #11 | Add demo video and update README | ✅ 35s |
| #10 | Line tile visuals | ✅ 25s |
| #9 | Redeploy Leaderboards | ✅ 1m 0s |
| #8 | Effects on Tile and Visual Effects | ✅ 24s |
| #7 | Add wallet type badges on leaderboard | ✅ 34s |
| #6 | Add event streaming with real-time updates | ✅ 34s |
| #5 | Add badge display in wallet bar | ✅ 21s |
| #4 | Deploy RewardContract and update contract IDs | ✅ 21s |
| #3 | Add RewardContract with inter-contract badge minting | ✅ 55s |
| #2 | Fix CI: use wasm32v1-none target for Rust 1.82+ | ✅ 1m 54s |
| #1 | Add CI/CD pipeline and 5 contract unit tests | ❌ Fixed in #2 |

🔗 [View all workflow runs](https://github.com/Jrabara101/Stellar-Paradigm/actions)

![GitHub Actions CI — all runs passing](screenshots/github-actions.png)

---

## 📂 Project Structure

```
.
├── index.html                          # Game markup + wallet bar
├── style.css                           # Mid-century styling, themes, responsive
├── script.js                           # Game logic (tiles, scoring, leaderboard UI)
├── stellar.js                          # Wallet connection + Soroban calls + event stream
├── word-scramble-contract/
│   ├── contracts/
│   │   ├── hello-world/src/lib.rs      # WordScramble contract (leaderboard + events)
│   │   └── reward-contract/src/lib.rs  # RewardContract (badge minting)
│   └── Cargo.toml
├── .github/workflows/ci.yml            # CI/CD pipeline
└── screenshots/                        # Submission screenshots
```

---

## 📝 Level 4 Submission

The complete **Level 4 Idea Submission** for the **On-Chain Vocabulary Credential System** is available in multiple formats:

### View the Submission

1. **📥 Word Document (.docx):** [IDEA_2_SUBMISSION.docx](IDEA_2_SUBMISSION.docx) — **Click to download and submit**
2. **HTML (Formatted):** [IDEA_2_SUBMISSION.html](IDEA_2_SUBMISSION.html) — Open in any browser
3. **Markdown (GitHub):** [IDEA_2_SUBMISSION.md](IDEA_2_SUBMISSION.md) — Full text version

### Sections Included

- ✅ Problem Statement (1.5B learners lack verifiable credentials)
- ✅ Why Stellar? (asset tokenization, micro-payments, financial inclusion)
- ✅ Target Users (9 distinct user groups with personas)
- ✅ Technical Architecture (CredentialContract, schema, data flow)
- ✅ Complexity Evaluation (8 technical challenges + estimated time)
- ✅ Complete 4-Phase Roadmap (MVP → partnerships → mainnet → scale)
- ✅ Stellar Ecosystem Alignment (resources + partnership opportunities)
- ✅ Success Metrics (Week 2 through Month 6 targets)

### Ready to Submit

✅ **Word document is ready:** [IDEA_2_SUBMISSION.docx](IDEA_2_SUBMISSION.docx)

The `.docx` file has been automatically generated from the HTML submission with all formatting preserved:
- Professional header and styling
- Formatted tables and sections
- Color-coded difficulty badges and checklists
- Ready to submit directly to Rise In

**To open/edit:**
- Download the file and open in Microsoft Word
- Or open directly in Google Docs, LibreOffice, etc.

**Alternative formats** (if needed):
- [IDEA_2_SUBMISSION.html](IDEA_2_SUBMISSION.html) — Open in browser or Word
- [IDEA_2_SUBMISSION.md](IDEA_2_SUBMISSION.md) — Plain text markdown version

---

## 🔗 Stellar Integration

### Why Built on Stellar

This application leverages Stellar's core strengths:

- **Low-Cost Asset Tokenization** — Badges and future credentials are tokenized assets on-chain, aligned with [Stellar's asset tokenization framework](https://stellar.org/use-cases/tokenization)
- **Micro-Payment Infrastructure** — Badge minting and credential issuance use micro-payments (0.5 XLM per credential) that are only economically viable on Stellar
- **Global Accessibility** — Players and institutions worldwide can access the app via Stellar Anchors for on/off-ramp conversions
- **Fast Finality** — 5-second settlement ensures leaderboard updates and badge mints are verifiable immediately
- **Financial Inclusion** — Aligns with Stellar's mission: expanding access to financial services by making Web3 approachable for non-technical users

### Resources

- [Stellar Anchors](https://stellar.org/learn/anchor-basics) — On/off-ramp infrastructure for global access
- [Asset Tokenization](https://stellar.org/use-cases/tokenization) — Badge and credential tokenization model
- [Payments](https://stellar.org/use-cases/payments) — Micro-payment infrastructure for badges
- [On/Off Ramps](https://stellar.org/use-cases/ramps) — Institutional fiat conversion
- [Stellar Ecosystem](https://stellar.org/ecosystem) — Partnership opportunities with wallets, identity providers, DeFi

### Future Stellar Integration

- **DeFi:** Credentials as collateral for education loans and work advances
- **Wallets:** Credential display and sharing in Freighter, Lobstr, and other Stellar wallets
- **Identity:** Integration with Stellar identity providers for institutional verification
- **Payments:** Direct fiat-to-XLM conversion for schools and institutions via Stellar Anchors

---

## 📜 License

MIT
