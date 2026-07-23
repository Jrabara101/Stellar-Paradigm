// Every contract.call('fn_name', ...) in stellar.js must correspond to a
// pub fn in one of the Soroban contracts. This only checks that direction —
// not every contract fn needs to be called from the frontend (e.g. get_score
// is a valid contract fn the frontend doesn't happen to call directly).
const fs = require('fs');

const stellarSrc = fs.readFileSync('stellar.js', 'utf8');
const calls = new Set();
const callRe = /\.call\(\s*['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]/g;
let m;
while ((m = callRe.exec(stellarSrc))) calls.add(m[1]);

const contractSrc = [
    'word-scramble-contract/contracts/leaderboard-contract/src/lib.rs',
    'word-scramble-contract/contracts/reward-contract/src/lib.rs',
].map((f) => fs.readFileSync(f, 'utf8')).join('\n');

let failed = false;
for (const fn of [...calls].sort()) {
    const ok = new RegExp(`pub fn ${fn}\\b`).test(contractSrc);
    console.log(`${ok ? '✅' : '❌'} ${fn}${ok ? '' : ' NOT FOUND in any contract'}`);
    if (!ok) failed = true;
}

if (calls.size === 0) {
    console.log('❌ No contract.call(...) sites found in stellar.js — check the pattern');
    failed = true;
}

if (failed) process.exit(1);
