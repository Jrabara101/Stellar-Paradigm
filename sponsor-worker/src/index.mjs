// ============================================================================
// Word Scramble — sponsor Worker
//
// Holds the fee-sponsorship keypair so mainnet players never need to own XLM.
// Two jobs, both driven by the SPONSOR_SECRET_KEY secret (never in client
// code or git — set via `wrangler secret put SPONSOR_SECRET_KEY`):
//
//   GET  /sponsor/create-account/prepare?address=G...
//     -> unsigned XDR for a 3-op sponsored-account-creation transaction.
//        Player signs it client-side (their wallet), then:
//   POST /sponsor/create-account/submit   { signedXdr }
//     -> sponsor co-signs + submits. Creates the player's mainnet account
//        with the sponsor covering both base reserves.
//
//   POST /sponsor/fee-bump   { signedXdr }
//     -> wraps the player's already-signed inner transaction (e.g.
//        submit_score) in a FeeBumpTransaction paid by the sponsor, signs,
//        and submits. The player never pays a network fee.
//
// This worker is deliberately separate from word-scramble-words (the word
// curation service) — a bug there should never be able to touch a key that
// holds real mainnet XLM.
//
// Dev:    wrangler dev
// Deploy: wrangler deploy   (needs SPONSOR_SECRET_KEY set first)
// ============================================================================

import * as StellarSdk from '@stellar/stellar-sdk';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS },
    });
}

function isValidStellarAddress(addr) {
    try {
        StellarSdk.StrKey.decodeEd25519PublicKey(addr);
        return true;
    } catch {
        return false;
    }
}

async function accountExists(horizonUrl, address) {
    const res = await fetch(`${horizonUrl}/accounts/${address}`);
    return res.status === 200;
}

// Sponsor account is rate-limited by its own reserve budget in practice, but
// we also cap how much XLM one prepare call will ever commit to reserving,
// so a malformed/malicious address can't be used to drain the sponsor via
// repeated prepares (each prepare is free to request — cost only lands on
// the /submit call, which requires the sponsor's real co-signature to a
// specific address, so this is a defence-in-depth budget line, not the
// only control).
const MAX_STARTING_BALANCE_STROOPS = '0'; // sponsor pays reserves via sponsorship, not a balance gift

async function prepareCreateAccount(env, address) {
    if (!isValidStellarAddress(address)) {
        throw Object.assign(new Error('invalid_address'), { status: 400 });
    }
    if (await accountExists(env.HORIZON_URL, address)) {
        throw Object.assign(new Error('account_already_exists'), { status: 409 });
    }

    const sponsorKeypair = StellarSdk.Keypair.fromSecret(env.SPONSOR_SECRET_KEY);
    const rpc = new StellarSdk.rpc.Server(env.RPC_URL);
    const sponsorAccount = await rpc.getAccount(sponsorKeypair.publicKey());

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
            startingBalance: MAX_STARTING_BALANCE_STROOPS,
            source: sponsorKeypair.publicKey(),
        }))
        .addOperation(StellarSdk.Operation.endSponsoringFutureReserves({
            source: address,
        }))
        .setTimeout(300)
        .build();

    // Sponsor signs its two operations now. The player still needs to add
    // their own signature (for the endSponsoringFutureReserves op sourced
    // from their address) before this can submit — CAP-33 requires it even
    // though the account doesn't exist yet.
    tx.sign(sponsorKeypair);

    return tx.toXDR();
}

async function submitCreateAccount(env, signedXdr) {
    const rpc = new StellarSdk.rpc.Server(env.RPC_URL);
    const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, env.NETWORK_PASSPHRASE);

    const response = await rpc.sendTransaction(tx);
    if (response.status === 'ERROR') {
        throw Object.assign(new Error('submission_failed'), { status: 502, detail: response.errorResult });
    }

    let result = await rpc.getTransaction(response.hash);
    let attempts = 0;
    while (result.status === 'NOT_FOUND' && attempts < 20) {
        await new Promise((r) => setTimeout(r, 1000));
        result = await rpc.getTransaction(response.hash);
        attempts++;
    }

    if (result.status !== 'SUCCESS') {
        throw Object.assign(new Error('transaction_failed'), { status: 502, detail: result.status });
    }
    return response.hash;
}

// Sanity-check the inner transaction before the sponsor ever signs a fee
// bump for it, so the sponsor account can't be tricked into paying fees
// for an arbitrary transaction someone else crafted. We only fee-bump
// contract calls targeting our own leaderboard contract.
function assertFeeBumpEligible(env, innerTx) {
    if (innerTx.operations.length !== 1) {
        throw Object.assign(new Error('unsupported_operation_count'), { status: 400 });
    }
    const op = innerTx.operations[0];
    if (op.type !== 'invokeHostFunction') {
        throw Object.assign(new Error('unsupported_operation_type'), { status: 400 });
    }
    const invocation = op.func?.invokeContract?.();
    const contractId = invocation
        ? StellarSdk.Address.fromScAddress(invocation.contractAddress()).toString()
        : null;
    if (contractId !== env.LEADERBOARD_CONTRACT_ID) {
        throw Object.assign(new Error('unsupported_contract'), { status: 400 });
    }
    const fnName = invocation.functionName().toString();
    if (fnName !== 'submit_score') {
        throw Object.assign(new Error('unsupported_function'), { status: 400 });
    }
}

async function feeBumpAndSubmit(env, signedXdr) {
    const sponsorKeypair = StellarSdk.Keypair.fromSecret(env.SPONSOR_SECRET_KEY);
    const rpc = new StellarSdk.rpc.Server(env.RPC_URL);

    const innerTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, env.NETWORK_PASSPHRASE);
    assertFeeBumpEligible(env, innerTx);

    const feeBumpTx = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
        sponsorKeypair,
        StellarSdk.BASE_FEE,
        innerTx,
        env.NETWORK_PASSPHRASE
    );
    feeBumpTx.sign(sponsorKeypair);

    const response = await rpc.sendTransaction(feeBumpTx);
    if (response.status === 'ERROR') {
        throw Object.assign(new Error('submission_failed'), { status: 502, detail: response.errorResult });
    }

    let result = await rpc.getTransaction(response.hash);
    let attempts = 0;
    while (result.status === 'NOT_FOUND' && attempts < 20) {
        await new Promise((r) => setTimeout(r, 1000));
        result = await rpc.getTransaction(response.hash);
        attempts++;
    }

    if (result.status !== 'SUCCESS') {
        throw Object.assign(new Error('transaction_failed'), { status: 502, detail: result.status });
    }
    return response.hash;
}

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

        const url = new URL(request.url);
        const path = url.pathname.replace(/\/+$/, '') || '/';

        if (path === '/health' || path === '/') return json({ ok: true });

        try {
            if (path === '/sponsor/create-account/prepare' && request.method === 'GET') {
                const address = url.searchParams.get('address');
                if (!address) return json({ error: 'missing_address' }, 400);
                const xdr = await prepareCreateAccount(env, address);
                return json({ xdr });
            }

            if (path === '/sponsor/create-account/submit' && request.method === 'POST') {
                const body = await request.json();
                if (!body.signedXdr) return json({ error: 'missing_signedXdr' }, 400);
                const hash = await submitCreateAccount(env, body.signedXdr);
                return json({ hash });
            }

            if (path === '/sponsor/fee-bump' && request.method === 'POST') {
                const body = await request.json();
                if (!body.signedXdr) return json({ error: 'missing_signedXdr' }, 400);
                const hash = await feeBumpAndSubmit(env, body.signedXdr);
                return json({ hash });
            }
        } catch (err) {
            const status = err.status || 500;
            return json({ error: err.message, detail: err.detail }, status);
        }

        return json({ error: 'not_found', path }, 404);
    },
};
