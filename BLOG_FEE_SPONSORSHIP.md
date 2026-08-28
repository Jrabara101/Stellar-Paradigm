# Gasless Onboarding on Stellar: What CAP-33 and Fee Bumps Actually Cost

*How 19 players with no XLM, no faucet, and no exchange account got their scores onto Soroban — and the two bugs that nearly stopped it.*

**Published:** 2026-08-26 · **Author:** Jeric Rabara · **Repo:** [github.com/Jrabara101/Stellar-Paradigm](https://github.com/Jrabara101/Stellar-Paradigm)

---

## The 90 seconds where you lose everyone

I built a word game where your score is written to a Soroban smart contract. The game is easy to explain. Onboarding is where people leave.

The default Web3 flow asks a new player to install a wallet extension, fund it, buy XLM from an exchange, wait for it to arrive, and come back. That's four steps before the first round, and three of them involve money. Most people never reach step three.

Stellar has the primitives to remove all of it. This post covers what I actually built, what it cost on mainnet, and the two problems that don't show up in the documentation.

---

## The two primitives

**CAP-33 sponsored reserves** let one account pay another account's minimum balance requirement. The sponsor's XLM is *locked*, not spent — it comes back if the account is ever merged. This is what lets a brand-new account exist without its owner funding it.

**Fee-bump transactions** wrap an already-signed transaction in an outer transaction that pays the fee. Once fee-bumped, the inner transaction's own fee is treated as zero on-chain. The player signs; the sponsor pays.

Together they cover both costs of being on Stellar: existing, and doing things.

---

## Gotcha #1: signing for an account that doesn't exist yet

Sponsored account creation is three operations in one transaction:

```javascript
const tx = new StellarSdk.TransactionBuilder(sponsorAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: env.NETWORK_PASSPHRASE,
})
    .addOperation(StellarSdk.Operation.beginSponsoringFutureReserves({
        sponsoredId: address,
        source: sponsorKeypair.publicKey(),
    }))
    .addOperation(StellarSdk.Operation.createAccount({
        destination: address,
        startingBalance: STARTING_BALANCE_STROOPS,
        source: sponsorKeypair.publicKey(),
    }))
    .addOperation(StellarSdk.Operation.endSponsoringFutureReserves({
        source: address,          // <-- the new account, not the sponsor
    }))
    .setTimeout(300)
    .build();
```

Look at that third operation's `source`. It's the account being created — an account that does not exist on the ledger yet. CAP-33 requires the sponsored account to signal consent by signing for `endSponsoringFutureReserves` itself.

That single line breaks the obvious architecture. You cannot have your server create accounts for players in one call, because your server doesn't hold their key. The flow has to be:

1. **`GET /sponsor/create-account/prepare?address=G…`** — server builds the transaction, signs its own two operations, returns the XDR
2. **Client** — player's wallet signs the XDR (one approval popup, first connect only)
3. **`POST /sponsor/create-account/submit`** — server submits the fully-signed transaction

I want to flag how I got this wrong first. My initial research — a documentation summary rather than the spec — told me the sponsor could do this alone. That was wrong, and I only caught it by reading the actual CAP-33 text. **When a protocol behaviour surprises you, go to the CAP, not the summary.**

---

## Gotcha #2: the wallet blocks you before the chain sees it

With sponsored creation working, I set `startingBalance` to `0`. The reasoning seemed airtight: the sponsor covers the reserve, and fee bumps mean the player never pays a fee, so why give them XLM at all?

The account was created correctly — `num_sponsored: 2`, sponsor set, everything right.

Then the first real tester hit **"Insufficient funds for fee"** in Freighter, and never reached my code.

The cause is a layer above the protocol. **Freighter validates that an account can afford its own declared fee before signing** — and it has no way to know your app will wrap that signed transaction in a fee bump afterward. On-chain the transaction would cost the player nothing. The wallet refuses to sign it first.

The fix is almost silly:

```javascript
const STARTING_BALANCE_STROOPS = '0.5';
```

0.5 XLM — comfortably above the highest `submit_score` resource fee I've observed (~0.055 XLM), and **never actually spent**, because every submission gets fee-bumped. It exists purely so the wallet's pre-flight check passes.

The general lesson: **protocol-correct isn't the same as wallet-compatible.** Test through a real wallet UI, not just scripts. My script tests all passed.

---

## Don't let the sponsor sign anything it's asked to

A public endpoint that fee-bumps whatever you send it is an open invitation to drain the sponsor. So the inner transaction is validated before the sponsor key touches it:

```javascript
function assertFeeBumpEligible(env, innerTx) {
    if (innerTx.operations.length !== 1) throw new Error('unsupported_operation_count');

    const op = innerTx.operations[0];
    if (op.type !== 'invokeHostFunction') throw new Error('unsupported_operation_type');

    const invocation = op.func?.invokeContract?.();
    const contractId = invocation
        ? StellarSdk.Address.fromScAddress(invocation.contractAddress()).toString()
        : null;
    if (contractId !== env.LEADERBOARD_CONTRACT_ID) throw new Error('unsupported_contract');

    if (invocation.functionName().toString() !== 'submit_score') throw new Error('unsupported_function');
}
```

Exactly one operation, of one type, against one contract, calling one function. Anything else is rejected before signing.

The sponsor also runs as a **separate Cloudflare Worker** from the rest of the backend. A bug in unrelated code cannot reach the key that holds real money.

---

## Gotcha #3: a transaction that "failed" but didn't

Late in testing, submissions started reporting `transaction_failed` — and then I'd check the chain and find the score had landed. Sequence number advanced, correct value stored.

It wasn't failure. It was **confirmation latency**. The RPC accepted the transaction and returned `PENDING`; it just took longer than my 15–20s poll window to appear in a ledger.

My first fix was to retry by resubmitting. That was the wrong fix — it duplicated transactions that were going to land anyway. The right fix was to wait longer:

```javascript
async function submitAndConfirm(rpc, tx) {
    const response = await rpc.sendTransaction(tx);
    if (response.status === 'ERROR') throw new Error('submission_failed');

    let result = await rpc.getTransaction(response.hash);
    let polls = 0;
    while (result.status === 'NOT_FOUND' && polls < 38) {
        await new Promise((r) => setTimeout(r, 1000));
        result = await rpc.getTransaction(response.hash);
        polls++;
    }

    if (result.status === 'SUCCESS') return response.hash;
    throw new Error('transaction_failed');
}
```

38 seconds, single pass, no resubmission. On Cloudflare's free tier this is safe — wall-clock time spent awaiting `fetch` doesn't count against the 10ms CPU limit.

A caveat worth stating plainly: an *earlier* RPC provider I used genuinely did drop transactions — accepted as `PENDING`, never included, sequence never advanced. That's a different failure and needs a different response. **Before concluding a transaction failed, check the account's sequence number and the contract's stored state.** Roughly 1 in 4–5 of my submissions needed more than 15 seconds to confirm.

---

## What it actually costs

Real mainnet numbers, as of 2026-08-26:

| Metric | Value |
|---|---|
| Players with on-chain scores | 20 |
| Gasless `submit_score` transactions | 50 |
| **Total sponsor fees for all 50** | **1.33 XLM** |
| Average per submission | ~0.027 XLM |
| Locked reserve per new player | ~2 XLM |
| One-time contract deployment | 30.49 XLM |

Two things stand out.

**Ongoing cost is negligible.** Fifty real transactions cost about a third of a dollar. Fee sponsorship is not the expensive part of running this.

**Deployment dominates.** 30.49 XLM to deploy three contracts, and **99.7% of that was uploading WASM bytecode** — 30.37 XLM. Instantiating and wiring the contracts came to about 0.12 XLM. If you're budgeting a Soroban launch, budget for bytecode size. Redeploying one contract after a security fix cost 8.35 XLM on its own.

The reserves are the real per-user cost, and they're *locked*, not spent — recoverable only by merging an account, which you won't do for a real player. Treat ~2 XLM per user as spent.

---

## Verify all of this yourself

Every number above is on the public ledger. Read the full leaderboard without submitting a transaction or paying a fee:

```bash
stellar contract invoke \
  --id CA37MRPVFGLRRENBW75CYZVBZPWZIS2FJQDMUFYU7MSLUNKFIDV2ZCQS \
  --source-account <any-funded-account> \
  --network mainnet-rpc --send=no \
  -- get_leaderboard
```

List every account the sponsor has funded:

```bash
curl -s "https://horizon.stellar.org/accounts/GAI5U6DXRP4XO5TGD3JQETOA6YJTGXYQII2IBIAJFHAA4B5ILWYW3AGI/payments?order=asc&limit=200"
```

Filter for `create_account` where `funder` is the sponsor.

A genuine sponsored player shows `sponsor` set to the sponsor account, `num_sponsored: 2`, an advanced sequence number, and `invoke_host_function` operations.

Full methodology, including which entries are my own test keys and why they're excluded: [`WALLET_VERIFICATION_MAINNET.md`](WALLET_VERIFICATION_MAINNET.md).

---

## If you're building this

1. **Read the CAP, not a summary of it.** CAP-33's co-signing requirement is easy to miss and shapes your entire architecture.
2. **Give sponsored accounts a small non-zero balance.** Not because the protocol needs it — because wallets pre-check affordability before signing.
3. **Validate before you sign.** One operation, one contract, one function. Never fee-bump arbitrary transactions.
4. **Isolate the key.** A separate worker for anything holding real money.
5. **Poll longer than feels necessary**, and check on-chain state before declaring failure.
6. **Test through a real wallet.** Script tests pass right up until a wallet's own validation stops you.

---

*Word Scramble is open source: [github.com/Jrabara101/Stellar-Paradigm](https://github.com/Jrabara101/Stellar-Paradigm). The sponsorship worker is in [`sponsor-worker/`](sponsor-worker/); the security review is in [`SECURITY.md`](SECURITY.md). Play it at [word-scramble-v1.surge.sh](https://word-scramble-v1.surge.sh/?network=mainnet) — you won't need any XLM.*
