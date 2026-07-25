/* ============================================================================
   SCRAMBLE BOARD — Multiplayer 15x15 tile game engine (v2.0.0)
   Self-contained, lazy-loaded module. Builds its own overlay DOM so index.html
   stays minimal. Reuses the host game's sound (host.sound). Word validation +
   AI move generation are powered by window.SCRAMBLE_WORDS (ENABLE1, bundled).

   Checkpoint 1 scope: 2-player (You vs 1 AI), tap-to-place, real word
   validation, premium/bingo scoring, race-to-target win, scoreboard.
   Later checkpoints add: dice turn order, 2-4 players, leaderboard-wallet AI
   identities, Easy/Med/Hard selector, dictionary search + word-finder helper.
   ============================================================================ */
(function () {
    'use strict';

    const SIZE = 15;
    const CELLS = SIZE * SIZE;
    const CENTER = 7 * SIZE + 7; // 112

    // Standard English Scrabble tile values + 100-tile distribution ('_' = blank)
    const VALUES = { A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10,_:0 };
    const DIST   = { A:9,B:2,C:2,D:4,E:12,F:2,G:3,H:2,I:9,J:1,K:1,L:4,M:2,N:6,O:8,P:2,Q:1,R:6,S:4,T:6,U:4,V:2,W:2,X:1,Y:2,Z:1,_:2 };

    // --- Premium-square layout (standard symmetric Scrabble board) ---
    const TW = [[0,0],[0,7],[0,14],[7,0],[7,14],[14,0],[14,7],[14,14]];
    const DW = [[1,1],[2,2],[3,3],[4,4],[13,13],[12,12],[11,11],[10,10],[1,13],[2,12],[3,11],[4,10],[13,1],[12,2],[11,3],[10,4]];
    const TL = [[1,5],[1,9],[5,1],[5,5],[5,9],[5,13],[9,1],[9,5],[9,9],[9,13],[13,5],[13,9]];
    const DL = [[0,3],[0,11],[2,6],[2,8],[3,0],[3,7],[3,14],[6,2],[6,6],[6,8],[6,12],[7,3],[7,11],[8,2],[8,6],[8,8],[8,12],[11,0],[11,7],[11,14],[12,6],[12,8],[14,3],[14,11]];

    function buildPremium() {
        const p = new Array(CELLS).fill('');
        const set = (list, code) => list.forEach(([r, c]) => { p[r * SIZE + c] = code; });
        set(DL, 'DL'); set(TL, 'TL'); set(DW, 'DW'); set(TW, 'TW');
        p[CENTER] = 'CENTER'; // scored as a double-word
        return p;
    }
    const PREMIUM = buildPremium();
    const wordMultOf = (code) => (code === 'TW' ? 3 : (code === 'DW' || code === 'CENTER') ? 2 : 1);
    const letterMultOf = (code) => (code === 'TL' ? 3 : code === 'DL' ? 2 : 1);

    // --- Dictionary index (built once from window.SCRAMBLE_WORDS, cached) ---
    let DICT = null; // { has(word), byLen: Map<len, string[]>, anagram: Map<sortedKey, string[]> }
    function sortKey(s) { return s.split('').sort().join(''); }
    function buildDict() {
        if (DICT) return DICT;
        const raw = (window.SCRAMBLE_WORDS || '');
        const words = raw ? raw.split('\n') : [];
        const set = new Set(words);
        const byLen = new Map();
        const anagram = new Map();
        for (const w of words) {
            if (!byLen.has(w.length)) byLen.set(w.length, []);
            byLen.get(w.length).push(w);
            const k = sortKey(w);
            if (!anagram.has(k)) anagram.set(k, []);
            anagram.get(k).push(w);
        }
        DICT = { has: (w) => set.has(w), byLen, anagram };
        return DICT;
    }

    // Combinations of k indices from [0..n-1] (memoized — called per window)
    const _comboCache = new Map();
    function combos(n, k) {
        const ck = n + 'x' + k;
        if (_comboCache.has(ck)) return _comboCache.get(ck);
        const res = [];
        const idx = [];
        (function rec(start) {
            if (idx.length === k) { res.push(idx.slice()); return; }
            for (let i = start; i < n; i++) { idx.push(i); rec(i + 1); idx.pop(); }
        })(0);
        _comboCache.set(ck, res);
        return res;
    }

    class ScrambleBoardGame {
        constructor(host) {
            this.host = host;                 // TeakScrambleGame instance (for sound, exit)
            this.dict = buildDict();
            this.premium = PREMIUM;
            this.buildDOM();
        }

        // ---------------------------------------------------------------- DOM
        buildDOM() {
            if (document.getElementById('scramble-overlay')) {
                this.overlay = document.getElementById('scramble-overlay');
                return;
            }
            const ov = document.createElement('div');
            ov.id = 'scramble-overlay';
            ov.innerHTML = `
                <div class="scr-banner">
                    <span class="scr-banner-title">🎲 Scramble Board</span>
                    <span class="scr-banner-info" id="scr-banner-info"></span>
                    <button class="scr-exit-btn" id="scr-rules-btn" title="How to play">❔ Rules</button>
                    <button class="scr-exit-btn" id="scr-exit-btn">Exit</button>
                </div>
                <div class="scr-opponents" id="scr-opponents"></div>
                <div class="scr-board-wrap"><div class="scr-board-grid" id="scr-board-grid"></div></div>
                <div class="scr-message" id="scr-message"></div>
                <div class="scr-rack-wrap">
                    <div class="scr-helpers">
                        <button class="scr-btn ghost" id="scr-find">💡 Find Word (3)</button>
                        <button class="scr-btn ghost" id="scr-dict">📖 Dictionary</button>
                    </div>
                    <span class="scr-you-score" id="scr-you-score">Your Score: 0</span>
                    <div class="scr-rack" id="scr-rack"></div>
                    <div class="scr-actions">
                        <button class="scr-btn primary" id="scr-submit">Submit</button>
                        <button class="scr-btn" id="scr-recall">Recall</button>
                        <button class="scr-btn" id="scr-shuffle">Shuffle</button>
                        <button class="scr-btn" id="scr-exchange">Exchange</button>
                        <button class="scr-btn" id="scr-pass">Pass</button>
                    </div>
                </div>`;
            document.body.appendChild(ov);
            this.overlay = ov;

            // Scoreboard modal
            const sb = document.createElement('div');
            sb.className = 'scr-scoreboard-backdrop';
            sb.id = 'scr-scoreboard-backdrop';
            sb.innerHTML = `
                <div class="scr-scoreboard">
                    <h3>Match Over</h3>
                    <div class="scr-winner" id="scr-winner"></div>
                    <div id="scr-final-rows"></div>
                    <div class="scr-actions">
                        <button class="scr-btn primary" id="scr-again">Play Again</button>
                        <button class="scr-btn" id="scr-quit">Back to Game</button>
                    </div>
                </div>`;
            document.body.appendChild(sb);

            // Setup modal (players / difficulty / target)
            const setup = document.createElement('div');
            setup.className = 'scr-scoreboard-backdrop';
            setup.id = 'scr-setup-backdrop';
            setup.innerHTML = `
                <div class="scr-setup">
                    <h3>🎲 Scramble Board</h3>
                    <div class="sub">Set up your match</div>
                    <div class="scr-opt-label">Players</div>
                    <div class="scr-opt-group" id="scr-opt-players">
                        <button class="scr-opt sel" data-v="2">2<small>You +1</small></button>
                        <button class="scr-opt" data-v="3">3<small>You +2</small></button>
                        <button class="scr-opt" data-v="4">4<small>You +3</small></button>
                    </div>
                    <div class="scr-opt-label">Difficulty</div>
                    <div class="scr-opt-group" id="scr-opt-diff">
                        <button class="scr-opt" data-v="easy">Easy</button>
                        <button class="scr-opt sel" data-v="medium">Medium</button>
                        <button class="scr-opt" data-v="hard">Hard</button>
                    </div>
                    <div class="scr-opt-label">Win Target</div>
                    <div class="scr-opt-group" id="scr-opt-target">
                        <button class="scr-opt" data-v="100">100<small>Quick</small></button>
                        <button class="scr-opt sel" data-v="150">150<small>Normal</small></button>
                        <button class="scr-opt" data-v="250">250<small>Long</small></button>
                    </div>
                    <button class="scr-btn primary" id="scr-setup-go">Roll for Turn Order →</button>
                    <button class="scr-btn ghost" id="scr-setup-rules">📖 How to Play</button>
                    <button class="scr-btn" id="scr-setup-cancel">Cancel</button>
                </div>`;
            document.body.appendChild(setup);

            // Dice modal (turn order)
            const dice = document.createElement('div');
            dice.className = 'scr-scoreboard-backdrop';
            dice.id = 'scr-dice-backdrop';
            dice.innerHTML = `
                <div class="scr-dice">
                    <h3>Roll for Turn Order</h3>
                    <div class="sub">Highest roll plays first</div>
                    <div class="scr-dice-list" id="scr-dice-list"></div>
                    <button class="scr-btn primary" id="scr-dice-roll">Roll Dice</button>
                    <button class="scr-btn" id="scr-dice-begin" style="display:none;">Begin Match →</button>
                </div>`;
            document.body.appendChild(dice);

            // Dictionary search modal
            const dict = document.createElement('div');
            dict.className = 'scr-scoreboard-backdrop';
            dict.id = 'scr-dict-backdrop';
            dict.innerHTML = `
                <div class="scr-dict-box">
                    <h3>📖 Dictionary</h3>
                    <div class="sub">Check if a word is playable and read its meaning</div>
                    <div class="scr-dict-search">
                        <input id="scr-dict-input" placeholder="Type a word…" maxlength="15" autocomplete="off" autocapitalize="characters" spellcheck="false">
                        <button class="scr-btn primary" id="scr-dict-go">Search</button>
                    </div>
                    <div class="scr-dict-result" id="scr-dict-result"></div>
                    <button class="scr-btn" id="scr-dict-close">Close</button>
                </div>`;
            document.body.appendChild(dict);

            // Rules / How-to-Play modal
            const rules = document.createElement('div');
            rules.className = 'scr-scoreboard-backdrop';
            rules.id = 'scr-rules-backdrop';
            rules.innerHTML = `
                <div class="scr-rules-box">
                    <h3>📖 How to Play</h3>
                    <div class="scr-rules-content">
                        <div class="scr-rule-sec">
                            <h4>🎯 Goal</h4>
                            <p>Build words on the 15×15 board to score points. The <b>first player to reach the Win Target</b> (100, 150, or 250 — you pick at setup) wins the match instantly. If the tile bag runs out first, the highest score wins.</p>
                        </div>
                        <div class="scr-rule-sec">
                            <h4>🎲 Taking Turns</h4>
                            <p>Everyone rolls a die at the start — <b>highest roll goes first</b>, then play passes around. On your turn, drag letters from your rack onto the board to form a word, then <b>Submit</b>.</p>
                        </div>
                        <div class="scr-rule-sec">
                            <h4>🔤 Placing Words</h4>
                            <ul>
                                <li>Your <b>first word must cross the ★ center</b> star.</li>
                                <li>All the tiles you place in one turn must sit in a <b>single row or column</b>, with no gaps.</li>
                                <li>After the first turn, every new word must <b>connect to letters already on the board</b>.</li>
                                <li>Every word you form — across <i>and</i> down — must be a real word (checked against a 168,000-word dictionary).</li>
                            </ul>
                        </div>
                        <div class="scr-rule-sec">
                            <h4>💯 Tile Points</h4>
                            <div class="scr-points-grid">
                                <span><b>1</b> — A E I O U L N R S T</span>
                                <span><b>2</b> — D G</span>
                                <span><b>3</b> — B C M P</span>
                                <span><b>4</b> — F H V W Y</span>
                                <span><b>5</b> — K</span>
                                <span><b>8</b> — J X</span>
                                <span><b>10</b> — Q Z</span>
                                <span><b>0</b> — Blank (plays as any letter you choose)</span>
                            </div>
                        </div>
                        <div class="scr-rule-sec">
                            <h4>🎨 Premium Squares</h4>
                            <div class="scr-prem-legend">
                                <span><i class="sw dl"></i><b>DL</b> — Double Letter score</span>
                                <span><i class="sw tl"></i><b>TL</b> — Triple Letter score</span>
                                <span><i class="sw dw"></i><b>DW</b> — Double Word score</span>
                                <span><i class="sw tw"></i><b>TW</b> — Triple Word score</span>
                                <span><i class="sw ctr"></i><b>★</b> — Center (counts as Double Word)</span>
                            </div>
                            <p class="scr-rule-note">A premium only counts on the turn a tile is first placed on it.</p>
                        </div>
                        <div class="scr-rule-sec">
                            <h4>✨ Scoring a Word</h4>
                            <p>Add up each tile's points (applying any DL/TL to tiles you just placed), then multiply the whole word by any DW/TW squares it covers. Multiple word-multipliers stack. Play all <b>7 tiles in one turn for a +50 BINGO bonus</b>!</p>
                        </div>
                        <div class="scr-rule-sec">
                            <h4>🛠️ Your Buttons</h4>
                            <ul>
                                <li><b>Submit</b> — play the word you've laid down.</li>
                                <li><b>Recall</b> — take this turn's tiles back to your rack.</li>
                                <li><b>Shuffle</b> — reshuffle your rack.</li>
                                <li><b>Exchange</b> — swap your tiles for new ones (uses up your turn; needs tiles left in the bag).</li>
                                <li><b>Pass</b> — skip your turn.</li>
                            </ul>
                        </div>
                        <div class="scr-rule-sec">
                            <h4>🔍 Helpers</h4>
                            <ul>
                                <li><b>💡 Find Word</b> — highlights the best play from your rack and the board (3 uses per match).</li>
                                <li><b>📖 Dictionary</b> — check if any word is playable and read its meaning.</li>
                            </ul>
                        </div>
                        <div class="scr-rule-sec">
                            <h4>🤖 Opponents</h4>
                            <p>Your rivals are AI players drawn from real wallets on the on-chain leaderboard (with practice bots as backup). Their tile racks stay <b>hidden</b> — you'll never see an opponent's letters.</p>
                        </div>
                    </div>
                    <button class="scr-btn primary" id="scr-rules-close">Got it — Let's Play!</button>
                </div>`;
            document.body.appendChild(rules);

            // Build 225 cells once
            const grid = document.getElementById('scr-board-grid');
            const labels = { TW: 'TW', DW: 'DW', TL: 'TL', DL: 'DL', CENTER: '★' };
            for (let i = 0; i < CELLS; i++) {
                const cell = document.createElement('div');
                cell.className = 'scr-cell';
                cell.dataset.i = i;
                if (this.premium[i]) { cell.dataset.prem = this.premium[i]; cell.dataset.label = labels[this.premium[i]] || ''; }
                grid.appendChild(cell);
            }

            // Events (delegated)
            grid.addEventListener('click', (e) => {
                const cell = e.target.closest('.scr-cell');
                if (cell) this.onCellClick(Number(cell.dataset.i));
            });
            document.getElementById('scr-rack').addEventListener('click', (e) => {
                const slot = e.target.closest('.scr-rack-slot');
                if (slot) this.onRackClick(Number(slot.dataset.slot));
            });
            document.getElementById('scr-submit').onclick = () => this.submitMove();
            document.getElementById('scr-recall').onclick = () => this.recall();
            document.getElementById('scr-shuffle').onclick = () => this.shuffleRack();
            document.getElementById('scr-exchange').onclick = () => this.exchange();
            document.getElementById('scr-pass').onclick = () => this.pass();
            document.getElementById('scr-exit-btn').onclick = () => this.quit();
            document.getElementById('scr-rules-btn').onclick = () => this.openRules();
            document.getElementById('scr-setup-rules').onclick = () => this.openRules();
            document.getElementById('scr-rules-close').onclick = () => this._hideBackdrop('scr-rules-backdrop');
            document.getElementById('scr-again').onclick = () => { this.hideScoreboard(); this.openSetup(); };
            document.getElementById('scr-quit').onclick = () => { this.hideScoreboard(); this.quit(); };

            // Setup option groups (single-select toggles)
            ['scr-opt-players', 'scr-opt-diff', 'scr-opt-target'].forEach(gid => {
                document.getElementById(gid).addEventListener('click', (e) => {
                    const btn = e.target.closest('.scr-opt'); if (!btn) return;
                    document.querySelectorAll('#' + gid + ' .scr-opt').forEach(b => b.classList.remove('sel'));
                    btn.classList.add('sel');
                });
            });
            document.getElementById('scr-setup-go').onclick = () => this.confirmSetup();
            document.getElementById('scr-setup-cancel').onclick = () => { this._hideBackdrop('scr-setup-backdrop'); this.quit(); };
            document.getElementById('scr-dice-roll').onclick = () => this.rollDice();
            document.getElementById('scr-dice-begin').onclick = () => this.beginFromDice();
            document.getElementById('scr-find').onclick = () => this.findWordHelper();
            document.getElementById('scr-dict').onclick = () => this.openDictionary();
            document.getElementById('scr-dict-go').onclick = () => this.lookupWord();
            document.getElementById('scr-dict-close').onclick = () => this._hideBackdrop('scr-dict-backdrop');
            document.getElementById('scr-dict-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') this.lookupWord(); });
        }

        // ---------------------------------------------------- setup + dice (C2)
        _showBackdrop(id) { document.getElementById(id).classList.add('active'); }
        _hideBackdrop(id) { document.getElementById(id).classList.remove('active'); }
        _readOpt(groupId) { const s = document.querySelector('#' + groupId + ' .scr-opt.sel'); return s ? s.dataset.v : null; }

        openSetup() { this._showBackdrop('scr-setup-backdrop'); }

        async confirmSetup() {
            const players = parseInt(this._readOpt('scr-opt-players'), 10) || 2;
            const difficulty = this._readOpt('scr-opt-diff') || 'medium';
            const target = parseInt(this._readOpt('scr-opt-target'), 10) || 150;
            this._pendingConfig = { players, difficulty, target };

            const go = document.getElementById('scr-setup-go');
            if (go) { go.disabled = true; go.textContent = 'Finding opponents…'; }
            const opp = await this.pickOpponents(players - 1);
            if (go) { go.disabled = false; go.textContent = 'Roll for Turn Order →'; }
            this._pendingConfig.opponentNames = opp.names;
            this._pendingConfig.opponentMeta = opp.metas;

            this._hideBackdrop('scr-setup-backdrop');
            this.openDice();
        }

        shortAddr(a) { return (a && a.length > 10) ? a.slice(0, 4) + '…' + a.slice(-4) : (a || 'Player'); }

        // Opponents come from the on-chain leaderboard wallets; fall back to
        // practice bots when there's no wallet / empty board / too few entries.
        // (Placeholder for future REAL multiplayer against those wallet owners.)
        async pickOpponents(numAI) {
            let entries = [];
            try { entries = (await window.stellarWallet?.fetchLeaderboard?.()) || []; } catch (e) { entries = []; }
            const myAddr = window.stellarWallet?.address || null;
            entries = entries.filter(e => e && e.address && e.address !== myAddr);
            const botNames = ['Bot Alpha', 'Bot Bravo', 'Bot Charlie'];
            const names = [], metas = [];
            for (let i = 0; i < numAI; i++) {
                if (entries[i]) {
                    names.push(this.shortAddr(entries[i].address));
                    metas.push(`Leaderboard #${entries[i].rank} · Lvl ${entries[i].level}`);
                } else {
                    names.push(botNames[i] || `Bot ${i + 1}`);
                    metas.push('Practice bot');
                }
            }
            return { names, metas };
        }

        openDice() {
            const cfg = this._pendingConfig;
            const parts = [{ name: 'You', isYou: true, meta: '' }];
            for (let i = 0; i < cfg.players - 1; i++) parts.push({ name: cfg.opponentNames[i], isYou: false, meta: cfg.opponentMeta[i] });
            this._diceParts = parts;
            this._diceRolled = false;
            document.getElementById('scr-dice-list').innerHTML = parts.map((p, i) => `
                <div class="scr-dice-row ${p.isYou ? 'is-you' : ''}">
                    <span class="scr-die" id="scr-die-${i}">🎲</span>
                    <span class="scr-dice-name">${p.name}${p.meta ? `<span class="meta">${p.meta}</span>` : ''}</span>
                    <span class="scr-order-badge" id="scr-order-${i}"></span>
                </div>`).join('');
            const rollBtn = document.getElementById('scr-dice-roll');
            rollBtn.style.display = ''; rollBtn.disabled = false;
            document.getElementById('scr-dice-begin').style.display = 'none';
            this._showBackdrop('scr-dice-backdrop');
        }

        rollDice() {
            if (this._diceRolled) return;
            this._diceRolled = true;
            document.getElementById('scr-dice-roll').disabled = true;
            const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
            const dieEls = this._diceParts.map((_, i) => document.getElementById('scr-die-' + i));
            dieEls.forEach(el => el.classList.add('rolling'));
            const spin = setInterval(() => dieEls.forEach(el => { el.textContent = faces[Math.floor(Math.random() * 6)]; }), 90);
            setTimeout(() => {
                clearInterval(spin);
                const rolls = this._diceParts.map((_, i) => ({ i, roll: 1 + Math.floor(Math.random() * 6), tb: Math.random() }));
                rolls.forEach(r => { dieEls[r.i].classList.remove('rolling'); dieEls[r.i].textContent = faces[r.roll - 1]; });
                const order = rolls.slice().sort((a, b) => (b.roll - a.roll) || (b.tb - a.tb)).map(r => r.i);
                this._diceOrder = order;
                const ord = ['1st ▶', '2nd', '3rd', '4th'];
                order.forEach((partIdx, pos) => {
                    const badge = document.getElementById('scr-order-' + partIdx);
                    badge.textContent = ord[pos] || (pos + 1) + 'th';
                    badge.classList.add('show');
                });
                document.getElementById('scr-dice-begin').style.display = '';
                this.host?.sound?.play?.('select');
            }, 900);
        }

        beginFromDice() {
            this._hideBackdrop('scr-dice-backdrop');
            // participant index == player index (both built human-first), so the
            // dice order doubles as the player turn order.
            this.startMatch({ ...this._pendingConfig, turnOrder: (this._diceOrder || []).slice() });
        }

        // ------------------------------------------------------------- match
        startMatch(config) {
            config = config || {};
            this._lastConfig = config;
            const numPlayers = config.players || 2;
            this.difficulty = config.difficulty || 'medium';
            this.target = config.target || 150;

            // Defensively clear the setup/dice/scoreboard overlays in case
            // startMatch was reached by any path other than the normal flow.
            this._hideBackdrop('scr-setup-backdrop');
            this._hideBackdrop('scr-dice-backdrop');
            this.hideScoreboard();

            this.board = new Array(CELLS).fill(null);   // {letter,value,blank,player}|null
            this.bag = this.makeBag();
            this.pending = new Map();                    // cellIndex -> tile
            this.selectedSlot = null;
            this.consecutivePasses = 0;
            this.hintsLeft = 3;                          // Word Finder uses per match

            // Player 0 = human; the rest are AI (identities/dice come in C2).
            const aiNames = (config.opponentNames && config.opponentNames.length)
                ? config.opponentNames
                : ['Bot Alpha', 'Bot Bravo', 'Bot Charlie'];
            this.players = [{ name: 'You', isHuman: true, score: 0, rack: [], meta: '' }];
            for (let p = 1; p < numPlayers; p++) {
                this.players.push({ name: aiNames[p - 1] || `Bot ${p}`, isHuman: false, score: 0, rack: [], meta: config.opponentMeta ? config.opponentMeta[p - 1] : '' });
            }
            this.players.forEach(pl => this.refill(pl));

            // Turn order comes from the dice roll (falls back to human-first).
            this.turnOrder = (config.turnOrder && config.turnOrder.length === this.players.length)
                ? config.turnOrder.slice()
                : this.players.map((_, i) => i);
            this.turnPos = 0;

            this.overlay.classList.add('active');
            this.clearHints();
            const findBtn = document.getElementById('scr-find');
            if (findBtn) findBtn.textContent = `💡 Find Word (${this.hintsLeft})`;
            this.renderAll();
            this.beginTurn();
        }

        makeBag() {
            const bag = [];
            for (const L in DIST) {
                for (let n = 0; n < DIST[L]; n++) {
                    bag.push(L === '_' ? { letter: '', value: 0, blank: true } : { letter: L, value: VALUES[L], blank: false });
                }
            }
            for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
            return bag;
        }
        refill(pl) { while (pl.rack.length < 7 && this.bag.length) pl.rack.push(this.bag.pop()); }
        get currentPlayer() { return this.players[this.turnOrder[this.turnPos]]; }

        // -------------------------------------------------------- turn flow
        beginTurn() {
            this.selectedSlot = null;
            this.renderAll();
            const pl = this.currentPlayer;
            const humanControls = pl.isHuman;
            ['scr-submit', 'scr-recall', 'scr-shuffle', 'scr-exchange', 'scr-pass']
                .forEach(id => { const b = document.getElementById(id); if (b) b.disabled = !humanControls; });
            document.getElementById('scr-exchange').disabled = !humanControls || this.bag.length === 0;
            if (pl.isHuman) {
                const firstMove = this.board.every(c => c === null);
                this.setMessage(firstMove ? 'Your turn — the first word must cover the ★ center.' : 'Your turn — place tiles, then Submit.', 'ok');
            } else {
                this.setMessage(`${pl.name} is thinking…`);
                setTimeout(() => this.aiTurn(), 650);
            }
        }

        endTurn(scored) {
            if (scored) this.consecutivePasses = 0;
            // Win: race to target (checked after each turn).
            const winner = this.players.find(p => p.score >= this.target);
            if (winner) return this.endMatch(winner, `reached ${this.target} points`);
            // Stall guard: everyone passed in a row, or bag empty and a rack is empty.
            if (this.consecutivePasses >= this.players.length) return this.endMatch(this.leader(), 'no moves left');
            if (this.bag.length === 0 && this.players.some(p => p.rack.length === 0)) return this.endMatch(this.leader(), 'tiles ran out');
            this.turnPos = (this.turnPos + 1) % this.turnOrder.length;
            this.beginTurn();
        }

        leader() { return this.players.slice().sort((a, b) => b.score - a.score)[0]; }

        // ------------------------------------------------- human interaction
        onRackClick(slot) {
            const pl = this.currentPlayer;
            if (!pl.isHuman) return;
            if (!pl.rack[slot]) return;
            this.selectedSlot = (this.selectedSlot === slot) ? null : slot;
            this.renderRack();
            this.renderBoard();
        }

        async onCellClick(i) {
            const pl = this.currentPlayer;
            if (!pl.isHuman) return;
            this.clearHints();
            if (this.board[i]) return;                       // committed tile — locked
            if (this.pending.has(i)) {                        // pick a pending tile back up
                const tile = this.pending.get(i);
                this.pending.delete(i);
                pl.rack.push(tile.blank ? { letter: '', value: 0, blank: true } : tile);
                this.renderAll();
                return;
            }
            if (this.selectedSlot === null) return;
            const tile = pl.rack[this.selectedSlot];
            if (!tile) return;
            let placed = tile;
            if (tile.blank) {
                const chosen = await this.chooseBlankLetter();
                if (!chosen) return;
                placed = { letter: chosen, value: 0, blank: true };
            }
            pl.rack.splice(this.selectedSlot, 1);
            this.pending.set(i, placed);
            this.selectedSlot = null;
            this.host?.sound?.play?.('drop');
            this.renderAll();
            const preview = this.collectWords(this.pending);
            if (preview.ok) this.setMessage(`${preview.words.map(w => w.text).join(', ')} — ${this.scoreWords(preview.words)} pts`, 'ok');
            else this.setMessage('', '');
        }

        recall() {
            const pl = this.currentPlayer;
            for (const tile of this.pending.values()) pl.rack.push(tile.blank ? { letter: '', value: 0, blank: true } : tile);
            this.pending.clear();
            this.selectedSlot = null;
            this.clearHints();
            this.renderAll();
            this.setMessage('', '');
        }

        shuffleRack() {
            const r = this.currentPlayer.rack;
            for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
            this.renderRack();
        }

        submitMove() {
            const pl = this.currentPlayer;
            if (!pl.isHuman) return;
            if (this.pending.size === 0) { this.setMessage('Place at least one tile first.', 'err'); return; }
            const firstMove = this.board.every(c => c === null);
            const res = this.collectWords(this.pending, firstMove);
            if (!res.ok) { this.setMessage(res.reason, 'err'); this.host?.sound?.play?.('error'); return; }
            const bad = res.words.find(w => w.text.length >= 2 && !this.dict.has(w.text));
            if (bad) { this.setMessage(`"${bad.text}" isn't in the word list.`, 'err'); this.host?.sound?.play?.('error'); return; }

            const gained = this.scoreWords(res.words) + (this.pending.size === 7 ? 50 : 0);
            for (const [i, tile] of this.pending) this.board[i] = { letter: tile.letter, value: tile.value, blank: tile.blank, player: this.turnOrder[this.turnPos] };
            pl.score += gained;
            this.pending.clear();
            this.refill(pl);
            this.host?.sound?.play?.('win');
            this.setMessage(`You played ${res.words.map(w => w.text).join(', ')} for ${gained} pts${gained - this.scoreWords(res.words) === 50 ? ' (BINGO +50!)' : ''}.`, 'ok');
            this.endTurn(true);
        }

        pass() {
            this.recall();
            this.consecutivePasses++;
            this.setMessage('You passed.');
            this.endTurn(false);
        }

        exchange() {
            const pl = this.currentPlayer;
            if (this.bag.length === 0) { this.setMessage('Bag is empty — cannot exchange.', 'err'); return; }
            this.recall();
            const returned = pl.rack.splice(0, pl.rack.length);
            pl.rack = [];
            this.refill(pl);
            this.bag.push(...returned);
            for (let i = this.bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]; }
            this.consecutivePasses++;
            this.setMessage('You exchanged your tiles.');
            this.endTurn(false);
        }

        // ------------------------------------------ word extraction + scoring
        // placement: Map(cellIndex -> {letter,value,blank}). Returns
        // {ok, words:[{text, cells:[{i,letter,value,isNew}]}], reason}.
        // Used by BOTH human submit and AI candidate validation.
        collectWords(placement, firstMove) {
            const placed = [...placement.keys()];
            if (!placed.length) return { ok: false, reason: 'No tiles placed.' };
            const letterAt = (i) => placement.get(i)?.letter ?? this.board[i]?.letter ?? null;
            const valueAt = (i) => (placement.has(i) ? placement.get(i).value : this.board[i]?.value ?? 0);
            const isNew = (i) => placement.has(i);
            const rows = new Set(placed.map(i => Math.floor(i / SIZE)));
            const cols = new Set(placed.map(i => i % SIZE));

            let orient;
            if (placed.length === 1) orient = 'single';
            else if (rows.size === 1) orient = 'H';
            else if (cols.size === 1) orient = 'V';
            else return { ok: false, reason: 'Tiles must be in one row or column.' };

            // Full contiguous run of letters through startI along step (±1 or ±SIZE).
            const readWord = (startI, step) => {
                const horizontal = (step === 1);
                const sameLine = (a, b) => {
                    if (a < 0 || a >= CELLS || b < 0 || b >= CELLS) return false;
                    return horizontal ? Math.floor(a / SIZE) === Math.floor(b / SIZE) : true;
                };
                let s = startI;
                while (sameLine(s - step, s) && letterAt(s - step) !== null) s -= step;
                const cells = [];
                let cur = s;
                while (cur >= 0 && cur < CELLS && letterAt(cur) !== null) {
                    cells.push({ i: cur, letter: letterAt(cur), value: valueAt(cur), isNew: isNew(cur) });
                    if (!sameLine(cur, cur + step)) break;
                    cur += step;
                }
                return cells;
            };

            const words = [];
            const addWord = (cells, main) => {
                if (cells.length >= 2) words.push({ text: cells.map(c => c.letter).join(''), cells, main: !!main });
            };

            if (orient === 'H' || orient === 'V') {
                const step = orient === 'H' ? 1 : SIZE;
                // contiguity: no gaps across the placed span
                const coord = orient === 'H' ? (i => i % SIZE) : (i => Math.floor(i / SIZE));
                const fixedLine = orient === 'H' ? Math.floor(placed[0] / SIZE) : (placed[0] % SIZE);
                const minP = Math.min(...placed.map(coord)), maxP = Math.max(...placed.map(coord));
                for (let p = minP; p <= maxP; p++) {
                    const cell = orient === 'H' ? fixedLine * SIZE + p : p * SIZE + fixedLine;
                    if (letterAt(cell) === null) return { ok: false, reason: 'Your tiles must form an unbroken line.' };
                }
                addWord(readWord(placed[0], step), true);
                const crossStep = orient === 'H' ? SIZE : 1;
                for (const i of placed) addWord(readWord(i, crossStep), false);
            } else { // single tile — the longer run is the main word, the other a cross word
                const runH = readWord(placed[0], 1);
                const runV = readWord(placed[0], SIZE);
                if (runH.length >= runV.length) { addWord(runH, true); addWord(runV, false); }
                else { addWord(runV, true); addWord(runH, false); }
            }

            if (!words.length) return { ok: false, reason: 'Tiles must form a word of 2+ letters.' };

            if (firstMove) {
                if (!words.some(w => w.cells.some(c => c.i === CENTER))) return { ok: false, reason: 'The first word must cover the ★ center.' };
            } else {
                if (!words.some(w => w.cells.some(c => !c.isNew))) return { ok: false, reason: 'Your word must connect to tiles already on the board.' };
            }

            const seen = new Set();
            const uniq = words.filter(w => { const k = w.cells.map(c => c.i).join(','); if (seen.has(k)) return false; seen.add(k); return true; });
            return { ok: true, words: uniq, orient };
        }

        scoreWords(words) {
            let total = 0;
            for (const w of words) {
                let mult = 1, sum = 0;
                for (const c of w.cells) {
                    const prem = this.premium[c.i];
                    if (c.isNew) { sum += c.value * letterMultOf(prem); mult *= wordMultOf(prem); }
                    else sum += c.value;
                }
                total += sum * mult;
            }
            return total;
        }

        // ---------------------------------------------------------- AI turn
        aiTurn() {
            const pl = this.currentPlayer;
            const move = this.generateAIMove(pl.rack, this.board.every(c => c === null));
            if (!move) {
                // try exchanging if we have a full-ish bag, else pass
                if (this.bag.length >= 7) {
                    const returned = pl.rack.splice(0, pl.rack.length);
                    this.refill(pl);
                    this.bag.push(...returned);
                    this.setMessage(`${pl.name} exchanged tiles.`);
                    this.consecutivePasses++;
                    return this.endTurn(false);
                }
                this.setMessage(`${pl.name} passed.`);
                this.consecutivePasses++;
                return this.endTurn(false);
            }
            // Commit the AI move (move.score already includes any +50 bingo)
            const placement = new Map();
            for (const pt of move.placements) placement.set(pt.i, { letter: pt.letter, value: pt.value, blank: false });
            const gained = move.score;
            for (const [i, tile] of placement) this.board[i] = { letter: tile.letter, value: tile.value, blank: tile.blank, player: this.turnOrder[this.turnPos] };
            // remove used letters from rack
            for (const pt of move.placements) {
                const k = pl.rack.findIndex(t => !t.blank && t.letter === pt.letter);
                if (k >= 0) pl.rack.splice(k, 1);
            }
            pl.score += gained;
            this.refill(pl);
            this.host?.sound?.play?.('select');
            this.setMessage(`${pl.name} played ${move.word} for ${gained} pts.`, 'ok');
            this.endTurn(true);
        }

        // Bounded anchor/anagram move generator. Returns ALL found legal moves
        // {word, score, placements:[{i,letter,value}]} sorted best-first (or []).
        // Shared by the AI (picks one by difficulty) and the human Word-Finder
        // helper (takes the best). NOTE: blanks are treated as unusable here — a
        // small documented limitation; the human can still place blanks manually.
        findMoves(rack, firstMove) {
            const rackLetters = rack.filter(t => !t.blank).map(t => t.letter);
            if (rackLetters.length === 0) return [];
            const moves = [];
            const CAP = 60; // enough candidates to choose from; keeps turns snappy
            const pushMove = (placement) => {
                const res = this.collectWords(placement, firstMove);
                if (!res.ok) return;
                if (res.words.some(w => w.text.length >= 2 && !this.dict.has(w.text))) return;
                const score = this.scoreWords(res.words) + (placement.size === 7 ? 50 : 0);
                const main = res.words.find(w => w.main) || res.words[0];
                moves.push({ word: res.words.map(w => w.text).join('+'), score, placements: [...placement].map(([i, t]) => ({ i, letter: t.letter, value: t.value })) });
            };

            // Enumerate candidate windows on each line.
            const lines = [];
            if (firstMove) {
                lines.push({ orient: 'H', cells: Array.from({ length: SIZE }, (_, c) => 7 * SIZE + c) });
                lines.push({ orient: 'V', cells: Array.from({ length: SIZE }, (_, r) => r * SIZE + 7) });
            } else {
                for (let r = 0; r < SIZE; r++) lines.push({ orient: 'H', cells: Array.from({ length: SIZE }, (_, c) => r * SIZE + c) });
                for (let c = 0; c < SIZE; c++) lines.push({ orient: 'V', cells: Array.from({ length: SIZE }, (_, r) => r * SIZE + c) });
            }

            outer:
            for (const line of lines) {
                const L = line.cells;
                for (let start = 0; start < SIZE; start++) {
                    for (let end = start + 1; end < SIZE; end++) {
                        const len = end - start + 1;
                        if (len < 2 || len > 8) continue;
                        // boundaries must be empty/edge to be a maximal word
                        if (start > 0 && this.board[L[start - 1]]) continue;
                        if (end < SIZE - 1 && this.board[L[end + 1]]) continue;
                        // gather fixed (existing) + empty offsets within window
                        const fixed = []; const empties = [];
                        for (let o = start; o <= end; o++) {
                            const cell = L[o];
                            if (this.board[cell]) fixed.push({ off: o - start, letter: this.board[cell].letter });
                            else empties.push({ off: o - start, cell });
                        }
                        if (empties.length === 0) continue;                       // nothing to place
                        if (empties.length > rackLetters.length) continue;        // not enough tiles
                        // connectivity: first move must cover center; else window must contain a fixed tile
                        if (firstMove) { if (!(L[start] <= CENTER && CENTER <= L[end] && line.cells.includes(CENTER))) continue; }
                        else if (fixed.length === 0) continue;                     // hook plays only (C1)

                        // pick which rack letters go into the empties (combinations)
                        const need = empties.length;
                        const idxCombos = combos(rackLetters.length, need);
                        for (const comb of idxCombos) {
                            const chosen = comb.map(x => rackLetters[x]);
                            const key = sortKey(fixed.map(f => f.letter).concat(chosen).join(''));
                            const cands = this.dict.anagram.get(key);
                            if (!cands) continue;
                            for (const w of cands) {
                                if (w.length !== len) continue;
                                if (!fixed.every(f => w[f.off] === f.letter)) continue;
                                // build placement for the empties, assigning chosen letters to match w
                                const placement = new Map();
                                const pool = chosen.slice();
                                let ok = true;
                                for (const e of empties) {
                                    const needL = w[e.off];
                                    const pi = pool.indexOf(needL);
                                    if (pi < 0) { ok = false; break; }
                                    pool.splice(pi, 1);
                                    placement.set(e.cell, { letter: needL, value: VALUES[needL], blank: false });
                                }
                                if (!ok) continue;
                                pushMove(placement);
                                if (moves.length >= CAP) break outer;
                            }
                        }
                    }
                }
            }

            moves.sort((a, b) => b.score - a.score);
            return moves;
        }

        // Picks one move by difficulty: Easy = low-scoring, Medium = mid, Hard = best.
        generateAIMove(rack, firstMove) {
            const moves = this.findMoves(rack, firstMove);
            if (!moves.length) return null;
            if (this.difficulty === 'hard') return moves[0];
            if (this.difficulty === 'easy') {
                const low = moves.filter(m => m.score <= 12);
                const pick = low.length ? low : moves.slice(-3);
                return pick[Math.floor(Math.random() * pick.length)];
            }
            return moves[Math.floor(moves.length * 0.4)] || moves[0];
        }

        // ------------------------------------------------- helpers (C3)
        // Word Finder: highlights the best word your rack + the board can make.
        // Reuses the same move generator the AI uses. Limited per match so it
        // stays a nudge, not an auto-solver.
        findWordHelper() {
            const pl = this.currentPlayer;
            if (!pl.isHuman) { this.setMessage('Wait for your turn to use Find Word.', 'err'); return; }
            if (this.hintsLeft <= 0) { this.setMessage('No Find Word hints left this match.', 'err'); return; }
            this.clearHints();
            const firstMove = this.board.every(c => c === null);
            const moves = this.findMoves(this.players[0].rack, firstMove);
            if (!moves.length) { this.setMessage('No playable word found with your tiles — try Exchange.', 'err'); return; }
            const best = moves[0];
            const grid = document.getElementById('scr-board-grid');
            best.placements.forEach(p => grid.children[p.i].classList.add('legal-hint'));
            // highlight the rack tiles that would be used
            const usedCopy = best.placements.map(p => p.letter);
            Array.from(document.querySelectorAll('#scr-rack .scr-rack-slot')).forEach((slot, s) => {
                const t = this.players[0].rack[s];
                const tileEl = slot.querySelector('.scr-tile');
                if (t && tileEl) { const k = usedCopy.indexOf(t.letter); if (k >= 0) { usedCopy.splice(k, 1); tileEl.classList.add('hint-tile'); } }
            });
            this.hintsLeft--;
            const btn = document.getElementById('scr-find');
            if (btn) btn.textContent = `💡 Find Word (${this.hintsLeft})`;
            this.setMessage(`Hint: try ${best.word.replace(/\+/g, ' / ')} for ${best.score} pts (highlighted).`, 'ok');
            this.host?.sound?.play?.('select');
            if (this._hintTimer) clearTimeout(this._hintTimer);
            this._hintTimer = setTimeout(() => this.clearHints(), 6000);
        }

        clearHints() {
            document.querySelectorAll('.scr-cell.legal-hint').forEach(c => c.classList.remove('legal-hint'));
            document.querySelectorAll('.scr-tile.hint-tile').forEach(t => t.classList.remove('hint-tile'));
        }

        openRules() {
            const content = document.querySelector('#scr-rules-backdrop .scr-rules-content');
            if (content) content.scrollTop = 0; // always open at the top
            this._showBackdrop('scr-rules-backdrop');
        }

        openDictionary() {
            const out = document.getElementById('scr-dict-result'); if (out) out.innerHTML = '';
            const inp = document.getElementById('scr-dict-input'); if (inp) inp.value = '';
            this._showBackdrop('scr-dict-backdrop');
            setTimeout(() => inp && inp.focus(), 50);
        }

        async lookupWord() {
            const inp = document.getElementById('scr-dict-input');
            const out = document.getElementById('scr-dict-result');
            const word = (inp.value || '').trim().toUpperCase();
            if (!/^[A-Z]{1,15}$/.test(word)) { out.innerHTML = '<div class="scr-dict-def">Enter a word (letters only).</div>'; return; }
            const playable = this.dict.has(word);
            const badge = playable ? '<span class="scr-badge ok">✓ Playable</span>' : '<span class="scr-badge no">✕ Not in word list</span>';
            out.innerHTML = `<div class="scr-dict-word">${word} ${badge}</div><div class="scr-dict-def">Looking up definition…</div>`;
            const defEl = out.querySelector('.scr-dict-def');
            try {
                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
                if (!res.ok) { defEl.textContent = playable ? 'A valid word to play — no dictionary definition available.' : 'No definition found.'; return; }
                const data = await res.json();
                const defs = [];
                for (const entry of (data || [])) {
                    for (const m of (entry.meanings || [])) {
                        const d = m.definitions && m.definitions[0] && m.definitions[0].definition;
                        if (d) defs.push(`<b>(${m.partOfSpeech || '—'})</b> ${d}`);
                        if (defs.length >= 3) break;
                    }
                    if (defs.length >= 3) break;
                }
                defEl.innerHTML = defs.length ? defs.join('<br><br>') : 'No definition found.';
            } catch (e) {
                defEl.textContent = 'Offline — definitions need a connection. (The Playable check above works offline.)';
            }
        }

        // ------------------------------------------------------- rendering
        renderAll() { this.renderBoard(); this.renderRack(); this.renderOpponents(); this.updateBanner(); }

        renderBoard() {
            const grid = document.getElementById('scr-board-grid');
            grid.classList.toggle('placing', this.selectedSlot !== null);
            for (let i = 0; i < CELLS; i++) {
                const cell = grid.children[i];
                const committed = this.board[i];
                const pend = this.pending.get(i);
                cell.classList.toggle('filled', !!(committed || pend));
                const existing = cell.querySelector('.scr-tile');
                if (existing) existing.remove();
                cell.querySelector('.scr-prem-label')?.remove();
                if (committed || pend) {
                    const t = committed || pend;
                    const el = document.createElement('div');
                    el.className = 'scr-tile' + (pend ? ' pending just-placed' : '') + (t.blank ? ' blank' : '');
                    el.innerHTML = `${t.letter}<span class="scr-tile-pts">${t.value || ''}</span>`;
                    cell.appendChild(el);
                } else if (cell.dataset.label) {
                    const lab = document.createElement('span');
                    lab.className = 'scr-prem-label';
                    lab.textContent = cell.dataset.label;
                    lab.style.pointerEvents = 'none';
                    cell.appendChild(lab);
                }
            }
        }

        renderRack() {
            const rackEl = document.getElementById('scr-rack');
            // The human is always player 0; their rack stays visible on every
            // turn (opponents' racks are confidential and never rendered here).
            // Interaction is still gated to the human's turn via the click guards.
            const rack = this.players[0].rack;
            rackEl.innerHTML = '';
            for (let s = 0; s < 7; s++) {
                const slot = document.createElement('div');
                slot.className = 'scr-rack-slot';
                slot.dataset.slot = s;
                const t = rack[s];
                if (t) {
                    const el = document.createElement('div');
                    el.className = 'scr-tile' + (this.selectedSlot === s ? ' selected' : '') + (t.blank ? ' blank' : '');
                    el.innerHTML = `${t.blank ? '&nbsp;' : t.letter}<span class="scr-tile-pts">${t.value || ''}</span>`;
                    slot.appendChild(el);
                }
                rackEl.appendChild(slot);
            }
            document.getElementById('scr-you-score').textContent = `Your Score: ${this.players[0].score}`;
        }

        renderOpponents() {
            const wrap = document.getElementById('scr-opponents');
            wrap.innerHTML = '';
            this.players.forEach((pl, idx) => {
                if (pl.isHuman) return;
                const panel = document.createElement('div');
                panel.className = 'scr-opp-panel' + (this.turnOrder[this.turnPos] === idx ? ' active-turn' : '');
                const backs = Array.from({ length: pl.rack.length }, () => '<span class="scr-tileback"></span>').join('');
                panel.innerHTML = `
                    <span class="scr-opp-name" title="${pl.name}">${pl.name}</span>
                    ${pl.meta ? `<span class="scr-opp-meta">${pl.meta}</span>` : ''}
                    <span class="scr-opp-score">${pl.score}</span>
                    <span class="scr-opp-tiles">${backs}</span>`;
                wrap.appendChild(panel);
            });
        }

        updateBanner() {
            const pl = this.currentPlayer;
            document.getElementById('scr-banner-info').innerHTML =
                `Turn: <b>${pl.name}</b> · Target: <b>${this.target}</b> · Bag: <b>${this.bag.length}</b>`;
        }

        setMessage(text, cls) {
            const m = document.getElementById('scr-message');
            m.textContent = text || '';
            m.className = 'scr-message' + (cls ? ' ' + cls : '');
        }

        // Minimal blank-letter chooser (Playwright-friendly; no native prompt).
        chooseBlankLetter() {
            return new Promise((resolve) => {
                const back = document.createElement('div');
                back.className = 'scr-scoreboard-backdrop active';
                back.style.zIndex = 1700;
                const box = document.createElement('div');
                box.className = 'scr-scoreboard';
                box.style.maxWidth = '320px';
                box.innerHTML = '<h3>Choose a letter</h3>';
                const grid = document.createElement('div');
                grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px;';
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(L => {
                    const b = document.createElement('button');
                    b.className = 'scr-btn'; b.textContent = L; b.style.padding = '8px 0';
                    b.onclick = () => { document.body.removeChild(back); resolve(L); };
                    grid.appendChild(b);
                });
                box.appendChild(grid);
                const cancel = document.createElement('button');
                cancel.className = 'scr-btn'; cancel.textContent = 'Cancel'; cancel.style.marginTop = '10px';
                cancel.onclick = () => { document.body.removeChild(back); resolve(null); };
                box.appendChild(cancel);
                back.appendChild(box);
                document.body.appendChild(back);
            });
        }

        // ----------------------------------------------------------- end
        endMatch(winner, reason) {
            document.getElementById('scr-winner').textContent = `${winner.name} wins — ${reason}!`;
            const rows = document.getElementById('scr-final-rows');
            rows.innerHTML = '';
            this.players.slice().sort((a, b) => b.score - a.score).forEach(pl => {
                const row = document.createElement('div');
                row.className = 'scr-final-row' + (pl === winner ? ' win' : '');
                row.innerHTML = `<span class="nm">${pl.name}</span><span>${pl.score}</span>`;
                rows.appendChild(row);
            });
            this.host?.sound?.play?.('fanfare');
            document.getElementById('scr-scoreboard-backdrop').classList.add('active');
        }
        hideScoreboard() { document.getElementById('scr-scoreboard-backdrop').classList.remove('active'); }

        quit() {
            this.overlay.classList.remove('active');
            this.hideScoreboard();
            if (this.host && typeof this.host.exitScrambleBoard === 'function') this.host.exitScrambleBoard();
        }
    }

    window.ScrambleBoardGame = ScrambleBoardGame;
})();
