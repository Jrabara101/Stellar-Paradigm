# X / Twitter Launch Post — Word Scramble Mainnet

**Status:** draft, ready to publish
**Accounts to tag:** [@StellarOrg](https://x.com/StellarOrg), [@BuildOnStellar](https://x.com/BuildOnStellar)
**Suggested hashtags:** `#Stellar` `#Soroban` `#BuildOnStellar`

Post it, then paste the URL into the README's Level 6 checklist where it says *Twitter/X launch post link — outstanding*.

---

## Option A — single post *(recommended)*

Shortest path. Everything essential, no thread to sustain.

> Word Scramble is live on Stellar **mainnet** 🎮
>
> A word game where your score is written to a Soroban smart contract — and players never touch XLM. No faucet, no exchange, no wallet funding.
>
> 20 players · 50 on-chain transactions · players paid **0**
>
> CAP-33 sponsored reserves + fee bumps. Total cost to me: 1.33 XLM for all 50.
>
> 🎮 word-scramble-v1.surge.sh/?network=mainnet
> 📂 github.com/Jrabara101/Stellar-Paradigm
>
> Built on @StellarOrg #BuildOnStellar

**Attach a screenshot of the live leaderboard, or a 10–20s clip of a round confirming on-chain.** A visual roughly doubles engagement on a post like this.

---

## Option B — 3-post thread

Use this if you want the technical detail to land. Post 2 is the one developers reply to.

**1/3**

> Word Scramble is live on Stellar **mainnet** 🎮
>
> A word game where your score is written to a Soroban smart contract — and players never touch XLM.
>
> 20 players. 50 on-chain transactions. Players paid: **0**.
>
> 🎮 word-scramble-v1.surge.sh/?network=mainnet

**2/3**

> How: CAP-33 sponsored reserves + fee-bump transactions.
>
> The gotcha that cost me a day — CAP-33 makes the *sponsored account* sign for itself, before it exists. So it's a two-step flow: server signs → player's wallet co-signs → server submits.
>
> And a 0-balance account still gets blocked: wallets pre-check fee affordability before signing, with no idea you'll fee-bump it. Fund new accounts with 0.5 XLM they never spend.

**3/3**

> Real numbers, all verifiable on-chain:
>
> • 50 gasless submissions = **1.33 XLM** total (~0.027 each)
> • ~2 XLM locked reserve per new player
>
> Open source, with the exact verification commands in the repo.
>
> 📂 github.com/Jrabara101/Stellar-Paradigm
>
> Built on @StellarOrg #BuildOnStellar

---

## Notes before posting

- **Numbers are current as of 2026-08-26.** Recruit more players first? Re-run the leaderboard check and update them.
- **"20 players" is the accurate claim** — not "20+ independent users." The full breakdown (including my own wallet and test keys, excluded) is in `WALLET_VERIFICATION_MAINNET.md`.
- **The blog post carries the depth.** Link it from a reply once published — that's your ecosystem-contribution requirement, and it does the teaching this post doesn't need to.
