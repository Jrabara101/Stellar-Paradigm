# 🔒 Security Review — Word Scramble

This is a self-conducted security review of the three Soroban contracts and the
fee-sponsorship worker that make up Word Scramble's on-chain layer, written for
the Stellar Builders Level 6 "Security" requirement. It is not a third-party
audit — it's an honest internal review: what's checked, what was found and
fixed before mainnet deploy, and what's knowingly left as a low-severity,
documented tradeoff rather than a paid audit engagement.

**Scope:** `leaderboard-contract`, `reward-contract`, `credential-contract`
(all three deployed to Stellar mainnet — see [README.md](README.md) for
contract addresses), and `sponsor-worker/` (the fee-sponsorship Cloudflare
Worker introduced for the Level 6 Black Belt feature).

**Reviewed by:** the project's own maintainer/team, 2026-08-22. Not reviewed
by an external auditor or mentor panel — see the note at the bottom on how
that satisfies this requirement's "OR" clause.

---

## ✅ Authorization checks already in place

Every state-changing entry point that should be restricted to a specific
caller uses Soroban's `require_auth()`, cross-checked against a stored
`Admin`/authorized-caller address where relevant:

| Contract | Function | Who must authorize |
|---|---|---|
| `leaderboard-contract` | `submit_score` | The player (`player.require_auth()`) — a player can only ever write their own score |
| `leaderboard-contract` | `reset_score` | The player (`player.require_auth()`) — a player can only reset their own score |
| `leaderboard-contract` | `set_reward_contract` | The stored admin |
| `leaderboard-contract` | `admin_seed_score` | The stored admin |
| `leaderboard-contract` | `reset_leaderboard` | The stored admin |
| `reward-contract` | `mint_badge` | The stored authorized caller (in practice, only `leaderboard-contract` itself — see below) |
| `credential-contract` | `issue_credential` | The stored admin |
| `credential-contract` | `transfer` | Always rejects — credentials are intentionally soulbound, so there is nothing to authorize |

The workspace also builds with `overflow-checks = true` and `panic = "abort"`
(`word-scramble-contract/Cargo.toml`), so an arithmetic overflow anywhere in
these contracts halts the transaction instead of silently wrapping.

---

## 🛠 Gaps found and fixed before mainnet deploy

Two real access-control gaps were found while preparing the mainnet deploy
(2026-08-20) and fixed before any contract with the bug went live:

### 1. `reward-contract.mint_badge` had no caller restriction

Originally `mint_badge` could be called directly by anyone, bypassing
`submit_score` entirely and letting an attacker mint themselves any badge for
free. Fixed by storing the authorized caller's address at `init` time and
requiring `authorized_caller.require_auth()` inside `mint_badge` — because
Soroban's `require_auth()` on a contract address only succeeds when that
contract is the actual, current invoker (no signature can forge this), this
restricts `mint_badge` to genuinely only be reachable via a real
`leaderboard-contract.submit_score` call. Covered by
`test_mint_badge_rejects_direct_call_from_non_registered_caller`.

### 2. `leaderboard-contract.set_reward_contract` had no auth check at all

Found while re-wiring the contracts for mainnet: `set_reward_contract` took no
`admin` parameter and called no `require_auth()`, meaning literally anyone
could call it on mainnet and repoint the leaderboard at a malicious
"reward contract" address, hijacking every future `submit_score`'s
inter-contract call. Fixed by adding an `admin: Address` parameter with the
same require-and-check-against-stored-admin pattern already used by
`admin_seed_score` and `reset_leaderboard`. Covered by
`test_set_reward_contract_rejects_non_admin`. This changed the function's
signature, so the mainnet contract ID reflects the fixed version — the
original vulnerable deployment was replaced before any real user interacted
with it.

Both fixes shipped with `#[should_panic]` regression tests, and all 22 tests
in the contract workspace pass (`cargo test --workspace`).

---

## ⚠️ Known, accepted limitations

These were considered and deliberately left as-is rather than fixed, because
fixing them now would mean a costly mainnet redeploy (new contract IDs) for a
low practical severity. Documented here rather than silently left unmentioned:

- **`init_admin` (leaderboard-contract, credential-contract) and `init`
  (reward-contract) have no `require_auth()`.** Each has a set-once guard
  (`init_admin` panics if an admin is already stored) or is idempotent by
  design, but nothing stops *anyone* from calling it first, in the narrow
  window between contract deploy and the legitimate admin's own init call —
  a classic "init front-running" pattern. In practice this window was
  seconds on a deploy the attacker would have had to be actively watching
  the mempool for, and no unauthorized init has occurred (verified: the
  stored admin on every deployed contract matches the intended deploy
  key). The realistic worst case for `reward-contract.init` specifically is
  low-severity even if it did happen: badges gate only cosmetic UI (a tile
  font picker), never funds or credentials, so a re-pointed authorized
  caller could at most let someone mint themselves a cosmetic badge.
- **`admin_seed_score` is a permanent admin backdoor** that can write any
  score for any player, bypassing the normal proof-of-play flow entirely.
  This is intentional — its only real use is migrating already-proven scores
  forward if the contract is ever redeployed — but it does mean the admin
  key is a single point of trust for leaderboard integrity. The admin key
  (`GBEKJPCB3IPPVWSYXLRBOSWJ3L4JKFGXEGZRDFIIY2H2OQQK7LEYLRFV`) is a
  dedicated, freshly generated CLI keypair, not derived from or shared with
  any personal wallet.

---

## 🔑 Fee-sponsorship worker trust model

The Level 6 Black Belt feature (`sponsor-worker/`) introduces a Cloudflare
Worker holding a real, XLM-funded Stellar keypair — this is the highest-value
target in the whole system, so it gets its own section.

- **Key isolation:** the sponsor key lives in its own Worker
  (`word-scramble-sponsor`), deliberately separate from `word-scramble-words`
  (the word-curation service). A bug or future change in word-curation code
  has no code path that can ever reach the sponsor key. The secret is stored
  only via `wrangler secret put SPONSOR_SECRET_KEY` — never in source, never
  in client code, never logged.
- **What the sponsor key can be tricked into paying for, by design:**
  - *Account creation* (`/sponsor/create-account/*`): the sponsor signs a
    `beginSponsoringFutureReserves` + `createAccount` + `endSponsoringFutureReserves`
    transaction for any address a caller requests. Per Stellar's own CAP-33
    design, the sponsored account must independently co-sign the
    `endSponsoringFutureReserves` operation before the transaction is valid —
    so an attacker requesting sponsorship for an address they don't control
    literally cannot produce a submittable transaction; they'd only be
    getting the sponsor's *offer* to sponsor an account, which does nothing
    without that account's own signature. The worst a malicious caller can
    do is call `/prepare` repeatedly for real addresses to generate wasted
    (but free — `/prepare` costs the sponsor nothing until `/submit`
    actually lands) unsigned XDRs.
  - *Fee bumps* (`/sponsor/fee-bump`): before ever co-signing, the worker
    inspects the inner transaction and rejects anything that isn't exactly
    one `invokeHostFunction` operation calling `submit_score` on this
    project's own deployed `leaderboard-contract` ID
    (`assertFeeBumpEligible` in `sponsor-worker/src/index.mjs`). The sponsor
    key can never be used to pay fees for an arbitrary transaction someone
    else crafted.
- **What the sponsor key is *not* exposed to:** it never touches player
  funds, never has authority over the leaderboard/reward/credential
  contracts' admin functions, and a compromise of it would only let an
  attacker drain the sponsor's own XLM balance (bounded by however much is
  funded into it at any time) — not player accounts, not contract state.
- Both routes were tested end-to-end against real mainnet transactions before
  being wired into the live app (2026-08-21): sponsored account creation and
  a fee-bumped `submit_score` call both confirmed on-chain.

---

## How this satisfies the Level 6 requirement

Level 6 asks for "a smart contract audit OR a security review approved by
mentors/team." This document is the latter: a documented, honest internal
review covering what's protected, what was found and fixed pre-launch, and
what's knowingly left as a low-severity tradeoff — not a claim of a
professional third-party audit.
