// --- WEB AUDIO SYNTHESIZER ---
class SoundController {
    constructor() {
        this.audioCtx = null;
        this.isMuted = false;

        // Music loop states
        this.musicSchedulerId = null;
        this.nextNoteTime = 0.0;
        this.currentStep = 0; // eighth notes (0 to 63)
        this.isPlayingMusic = false;
        this.musicGainNode = null;
    }

    init() {
        if (this.audioCtx) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const toggle = document.getElementById('sound-toggle');
        if (this.isMuted) {
            toggle.classList.add('muted');
            toggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
            this.stopBackgroundMusic();
        } else {
            toggle.classList.remove('muted');
            toggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
            this.startBackgroundMusic();
        }
    }

    startBackgroundMusic() {
        this.init();
        if (!this.audioCtx || this.isMuted || this.isPlayingMusic) return;

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        if (!this.musicGainNode) {
            this.musicGainNode = this.audioCtx.createGain();
            this.musicGainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime); // Louder background music
            this.musicGainNode.connect(this.audioCtx.destination);
        }

        this.isPlayingMusic = true;
        this.nextNoteTime = this.audioCtx.currentTime + 0.1;
        this.currentStep = 0;

        this.musicSchedulerId = setInterval(() => {
            this.scheduler();
        }, 50);
    }

    stopBackgroundMusic() {
        if (!this.isPlayingMusic) return;
        this.isPlayingMusic = false;
        if (this.musicSchedulerId) {
            clearInterval(this.musicSchedulerId);
            this.musicSchedulerId = null;
        }
    }

    scheduler() {
        while (this.nextNoteTime < this.audioCtx.currentTime + 0.2) {
            this.scheduleNextNote(this.currentStep, this.nextNoteTime);
            // BPM = 90. Eighth note step = 30 / 90 = 0.3333s
            this.nextNoteTime += 0.3333;
            this.currentStep = (this.currentStep + 1) % 64;
        }
    }

    scheduleNextNote(step, time) {
        const chordIndex = Math.floor(step / 16);
        const localStep = step % 16;

        // Bossa Nova chord rhythm hits on local step: 0, 3, 6, 8, 11, 14
        const chordHits = [0, 3, 6, 8, 11, 14];
        const isChordHit = chordHits.includes(localStep);

        // Bass rhythm hits on even steps: 0, 2, 4, 6, 8, 10, 12, 14
        const isBassHit = (localStep % 2 === 0);

        const progressions = [
            // Cmaj7: C4, E4, G4, B4
            {
                bassRoot: 65.41, // C2
                bassFifth: 98.00, // G2
                chordFreqs: [261.63, 329.63, 392.00, 493.88]
            },
            // Am7: A3, C4, E4, G4
            {
                bassRoot: 55.00, // A1
                bassFifth: 82.41, // E2
                chordFreqs: [220.00, 261.63, 329.63, 392.00]
            },
            // Dm7: D4, F4, A4, C5
            {
                bassRoot: 73.42, // D2
                bassFifth: 110.00, // A2
                chordFreqs: [293.66, 349.23, 440.00, 523.25]
            },
            // G7: G3, B3, D4, F4
            {
                bassRoot: 49.00, // G1
                bassFifth: 73.42, // D2
                chordFreqs: [196.00, 246.94, 293.66, 349.23]
            }
        ];

        const currentProg = progressions[chordIndex];

        if (isChordHit) {
            currentProg.chordFreqs.forEach((freq, idx) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, time);
                
                const duration = 0.8;
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.04, time + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
                
                osc.connect(gain);
                gain.connect(this.musicGainNode);
                
                osc.start(time);
                osc.stop(time + duration);
            });
        }

        if (isBassHit) {
            const isRoot = (localStep % 4 === 0);
            const freq = isRoot ? currentProg.bassRoot : currentProg.bassFifth;
            
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            
            const duration = 0.5;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
            
            osc.connect(gain);
            gain.connect(this.musicGainNode);
            
            osc.start(time);
            osc.stop(time + duration);
        }
    }

    play(type) {
        this.init();
        if (!this.audioCtx || this.isMuted) return;

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const now = this.audioCtx.currentTime;

        if (type === 'select') {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
        } 
        else if (type === 'drop') {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
            
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        }
        else if (type === 'reset') {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(250, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        }
        else if (type === 'error') {
            const osc1 = this.audioCtx.createOscillator();
            const osc2 = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(95, now);
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(97, now);
            
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.25);
            osc2.stop(now + 0.25);
        }
        else if (type === 'win') {
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'sine';
                
                const time = now + idx * 0.08;
                osc.frequency.setValueAtTime(freq, time);
                
                gain.gain.setValueAtTime(0.15, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
                
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                
                osc.start(time);
                osc.stop(time + 0.4);
            });
        }
    }
}

// --- CANVAS ATOMIC PARTICLES SYSTEM ---
class ParticleSystem {
    constructor(canvas, isMini = false) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.active = false;
        this.isMini = isMini;

        if (!this.isMini) {
            window.addEventListener('resize', () => this.resize());
            this.resize();
        } else {
            this.resizeMini();
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    resizeMini() {
        this.canvas.width = 255;
        this.canvas.height = 220;
    }

    getColorsForTheme() {
        const tileEffect = document.body.getAttribute('data-tile-effect') || 'none';
        if (tileEffect === 'neon') {
            return ['#ff00ff', '#00ffff', '#ffff00'];
        } else if (tileEffect === 'volcanic') {
            return ['#ff4500', '#ff8c00', '#ff0000', '#262220'];
        } else if (tileEffect === 'holographic') {
            return ['#ff9a9e', '#fecfef', '#a1c4fd', '#c2e9fb', '#e0c3fc', '#fbc2eb'];
        } else if (tileEffect === 'ice-crystal') {
            return ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#ffffff'];
        } else if (tileEffect === 'stained-glass') {
            return ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];
        }

        const theme = document.body.getAttribute('data-theme') || 'teak';
        switch (theme) {
            case 'nordic':
                return ['#90a4ae', '#f9f9f9', '#b0bec5'];
            case 'rustic':
                return ['#b08d57', '#8B0000', '#dee3e4'];
            case 'parchment':
                return ['#c85a17', '#f4e8d2', '#2b1d14'];
            case 'coastal':
                return ['#b8b8b8', '#b87333', '#d2c8b8'];
            case 'teak':
            default:
                return ['#E1AD01', '#40E0D0', '#F5F5F0'];
        }
    }

    burst(x, y) {
        this.active = true;
        this.particles = this.particles.filter(p => p.alpha > 0);
        
        const colors = this.getColorsForTheme();
        const count = 120;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const Math_cos = Math.cos;
            const Math_sin = Math.sin;
            const velocity = 3 + Math.random() * 8;
            this.particles.push({
                x: x,
                y: y,
                vx: Math_cos(angle) * velocity,
                vy: Math_sin(angle) * velocity - 2,
                size: 6 + Math.random() * 12,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.015 + Math.random() * 0.015,
                rotation: Math.random() * Math.PI,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                type: Math.random() > 0.4 ? 'atom' : 'dot'
            });
        }
        this.animate();
    }

    addFloatingText(text, x, y, color, delay = 0, font = 'bold 20px Jost') {
        setTimeout(() => {
            this.active = true;
            this.particles = this.particles.filter(p => p.alpha > 0);
            
            this.particles.push({
                type: 'text',
                x: x,
                y: y,
                vy: -1.1, // Drifts upward ~60px over 900ms (1.1px * 54 frames = 59.4px)
                alpha: 1,
                decay: 1 / (900 / 16.6), // Fades out over 900ms
                color: color,
                text: text,
                font: font,
                rotation: 0
            });
            this.animate();
        }, delay);
    }

    streakEmberBurst(x, y, count) {
        this.active = true;
        this.particles = this.particles.filter(p => p.alpha > 0);
        
        const colors = ['#FF4500', '#FF8C00', '#FFA500', '#FFD700', '#FF6347'];
        
        for (let i = 0; i < count; i++) {
            const angle = Math.PI * 1.5 + (Math.random() - 0.5) * 0.4;
            const speed = 1.5 + Math.random() * 2.5;
            
            const lifetime = (80 + Math.random() * 40) / speed;
            const decay = 1 / lifetime;

            this.particles.push({
                type: 'ember',
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.5,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 2, // 3-5px
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1.0,
                decay: decay
            });
        }
        this.animate();
    }

    stop() {
        this.active = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.active) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let alive = false;

        this.particles.forEach(p => {
            if (p.type === 'text') {
                p.y += p.vy;
                p.alpha -= p.decay;
            } else if (p.type === 'ember') {
                p.x += p.vx;
                p.y += p.vy;
                p.vx += (Math.random() - 0.5) * 0.1; // slight sway
                p.alpha -= p.decay;
            } else if (p.type === 'ghost' || p.type === 'glow') {
                p.alpha -= p.decay;
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.15;
                p.alpha -= p.decay;
                p.rotation += p.rotationSpeed;
            }

            if (p.alpha > 0) {
                alive = true;
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                this.ctx.globalAlpha = p.alpha;

                if (p.type === 'text') {
                    this.ctx.font = p.font;
                    this.ctx.fillStyle = p.color;
                    this.ctx.textAlign = 'center';
                    
                    // High contrast Jost shadow
                    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    this.ctx.shadowBlur = 4;
                    this.ctx.shadowOffsetX = 1;
                    this.ctx.shadowOffsetY = 1;
                    
                    this.ctx.fillText(p.text, 0, 0);
                } else if (p.type === 'ember') {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fillStyle = p.color;
                    
                    // Ember glow
                    this.ctx.shadowColor = p.color;
                    this.ctx.shadowBlur = 6;
                    this.ctx.shadowOffsetX = 0;
                    this.ctx.shadowOffsetY = 0;
                    
                    this.ctx.fill();
                } else if (p.type === 'ghost') {
                    // Draw neon arcade ghost tile outline
                    this.ctx.beginPath();
                    const radius = 4;
                    const halfSize = p.size / 2;
                    
                    // Simple rounded rectangle path
                    this.ctx.roundRect(-halfSize, -halfSize, p.size, p.size, radius);
                    
                    this.ctx.strokeStyle = p.color;
                    this.ctx.lineWidth = 2.5;
                    
                    this.ctx.shadowColor = p.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowOffsetX = 0;
                    this.ctx.shadowOffsetY = 0;
                    this.ctx.stroke();
                    
                    // Draw the letter
                    this.ctx.font = `bold ${p.size * 0.55}px Jost`;
                    this.ctx.fillStyle = p.color;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(p.letter, 0, 0);
                } else if (p.type === 'glow') {
                    // Draw soft colored glow circle (radial gradient)
                    const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size / 2);
                    grad.addColorStop(0, p.color);
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fillStyle = grad;
                    this.ctx.fill();
                } else if (p.type === 'atom') {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 4, 0, Math.PI * 2);
                    this.ctx.fillStyle = p.color;
                    this.ctx.fill();

                    this.ctx.strokeStyle = p.color;
                    this.ctx.lineWidth = 1.5;
                    
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, p.size, p.size / 3, Math.PI / 4, 0, Math.PI * 2);
                    this.ctx.stroke();

                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, p.size, p.size / 3, -Math.PI / 4, 0, Math.PI * 2);
                    this.ctx.stroke();
                } else {
                    this.ctx.beginPath();
                    for (let j = 0; j < 4; j++) {
                        this.ctx.rotate(Math.PI / 4);
                        this.ctx.rect(-p.size / 2, -1, p.size, 2);
                        this.ctx.rect(-1, -p.size / 2, 2, p.size);
                    }
                    this.ctx.fillStyle = p.color;
                    this.ctx.fill();
                }
                this.ctx.restore();
            }
        });

        if (alive) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// --- TEAK WORD SCRAMBLE ENGINE ---
class TeakScrambleGame {
    constructor() {
        this.currentCategory = 'general';
        this.dictionary = {
            general: {
                1: ["LINE", "WOOD", "TRAY", "GLOW", "TILE", "GAME", "PLAY", "ATOM"],
                2: ["BOARD", "GRAIN", "SLOTS", "CHECK", "RESET", "VALVE", "RADIO"],
                3: ["ENGINE", "MATRIX", "VECTOR", "CANVAS", "BUFFER", "KERNEL", "ROUTER"],
                4: ["CABINET", "PARQUET", "SCRAMBLE", "DISPLAY", "SHADOWS", "INLAYS"],
                5: ["AUTOMATA", "SKEUOMOR", "MIDCENTU", "MAHOGANY", "FLUIDITY"]
            },
            science: {
                1: ["ATOM", "CELL", "GENE", "BOND", "ACID", "IONS", "WAVE", "LENS"],
                2: ["FORCE", "ORGAN", "LIGHT", "SPACE", "VIRUS", "FOSSIL", "RADAR"],
                3: ["NEURON", "PROTON", "OXYGEN", "PLASMA", "GRAVITY", "MUTATION"],
                4: ["GENETICS", "MOLECULE", "ELEMENTS", "ELECTRON", "VELOCITY", "CATALYST"],
                5: ["EVOLUTION", "CHEMISTRY", "ASTRONOMY", "TELESCOPE", "ORGANISMS"]
            },
            math: {
                1: ["LINE", "CONE", "AREA", "MATH", "SINE", "ZERO", "ROOT", "PLOTS"],
                2: ["ANGLE", "GRAPH", "RATIO", "PRIME", "LOGIC", "PROOF", "CURVE"],
                3: ["ALGEBRA", "DECIMAL", "GRIDDED", "VECTORS", "RADIUS", "INTEGER"],
                4: ["GEOMETRY", "CALCULUS", "FRACTION", "EQUATION", "DECIMALS", "THEOREM"],
                5: ["STATISTICS", "EXPONENT", "POLYGONAL", "FRACTALISM", "ALGORITHMS"]
            },
            history: {
                1: ["WARS", "KING", "ROME", "TSAR", "FORT", "CLAN", "FEUD", "HEIR"],
                2: ["RUINS", "REIGN", "EMPIRE", "COLONY", "TREATY", "CASTE", "SIEGES"],
                3: ["DYNASTY", "CRUSADE", "WARRIOR", "TEMPLAR", "KNIGHTS", "REVOLTS"],
                4: ["MONARCHS", "COLONIAL", "CONQUEST", "PAPYRIAN", "VIKINGS", "HISTORY"],
                5: ["REVOLUTION", "ARCHAEOLOG", "CIVILIZATIO", "PREHISTORIC", "FEUDALISMS"]
            },
            anime: {
                1: ["GOKU", "LIMA", "NAMI", "LUFFY", "ZORO", "MONA", "ALUC", "PONY"],
                2: ["BLEACH", "NARUTO", "CONAN", "KAGURA", "TAIGA", "BORUTO", "ASUNA"],
                3: ["GINTAMA", "DORORO", "SAILOR", "MONSTER", "INUYASHA", "DEATHNOTE"],
                4: ["CLAYMORE", "EVANGELI", "SHINGEKI", "ALCHEMIS", "PROMISED", "OVERLORD"],
                5: ["FULLMETAL", "VILANDSA", "STEINSGAT", "PSYCHOPAS", "ONEPIECE"]
            },
            technology: {
                1: ["CODE", "BYTE", "DATA", "CHIP", "DISK", "RAMS", "PORT", "TECH"],
                2: ["ROUTER", "MODEM", "PROXY", "PIXEL", "CLOUD", "ARRAY", "LOGIC"],
                3: ["DATABASE", "SOFTWARE", "HARDWARE", "NETWORK", "COMPILER", "INTERNET"],
                4: ["SECURITY", "PROTOCOL", "FIREWALL", "MONITORS", "KEYBOARD", "SYSTEMS"],
                5: ["ALGORITHM", "PROGRAMMIN", "PROCESSORS", "ENCRYPTIONS", "TELEPHONIC"]
            },
            novel: {
                1: ["PLAY", "POEM", "TALE", "PAGE", "BOOK", "PLOT", "EPIC", "CAST"],
                2: ["NOVEL", "DRAMA", "PROSE", "GENRE", "WRITE", "STORY", "FOLIO"],
                3: ["DRACULA", "ODYSSEY", "HAMLET", "MACBETH", "GATSBY", "BELOVED"],
                4: ["VOLTAIRE", "LITERARY", "CHAPTERS", "FICTIONAL", "TRAGEDIE", "ROMANCES"],
                5: ["LITERATURE", "BIBLIOGRAP", "PLAYWRIGHT", "PUBLISHERS", "BIOGRAPHIE"]
            },
            "filipino-movies": {
                1: ["METR", "GOYO", "OLIV", "BATA", "BALE", "AMIG", "KIMY", "MILO"],
                2: ["HIMALA", "DEKADA", "METRO", "TANGIN", "KUBLIS", "BAGONG", "BUYBUST"],
                3: ["HENERAL", "METROMAN", "ORAPRON", "HAPILAND", "SIGWAAN", "KAPAGAN"],
                4: ["SEKLUZYO", "LUNASING", "MINSANAN", "SISTERAK", "ENTENGAN", "KAPATIDA"],
                5: ["DEKADASETEN", "HIMALAANIS", "HENERALLUN", "TANGINGYAM", "GOYOHANGIN"]
            }
        };
        
        this.boardGrid = document.getElementById('board-grid');
        this.rackSlotsContainer = document.getElementById('rack-slots');
        this.scoreElement = document.getElementById('score-val');
        this.levelElement = document.getElementById('level-val');
        this.victoryScreen = document.getElementById('victory-screen');
        this.mainBoard = document.getElementById('main-board');
        
        this.score = 0;
        this.level = 1;
        this.winStreak = 0;
        this.tilesData = []; // Initialize to prevent TypeError before levels load
        this.prefetchedData = null; // Prefetched next level word data
        this.clueLevel = 1;
        this.clue3Exhausted = false;
        this.showingPureDefinition = false;
        
        this.sound = new SoundController();
        this.particles = new ParticleSystem(document.getElementById('effects-canvas'));
        const miniCanvas = document.getElementById('mini-effects-canvas');
        if (miniCanvas) {
            this.miniParticles = new ParticleSystem(miniCanvas, true);
        }
        this.streakElement = document.getElementById('streak-val');

        // Custom board theme initialization
        this.currentTheme = localStorage.getItem('word_scramble_theme') || 'teak';
        this.applyTheme(this.currentTheme, false);

        // Custom chip material initialization
        this.currentChipMaterial = localStorage.getItem('word_scramble_chip_material') || 'bone';
        this.applyChipMaterial(this.currentChipMaterial, false);

        // Custom tile font initialization
        this.currentTileFont = localStorage.getItem('word_scramble_tile_font') || 'jost';
        this.applyTileFont(this.currentTileFont, false);

        // Custom tile effects initialization
        this.currentTileEffect = localStorage.getItem('word_scramble_tile_effect') || 'none';
        this.applyTileEffect(this.currentTileEffect, false);

        // Customize effects initialization
        this.effectsSettings = {
            shockwave: localStorage.getItem('ws_fx_shockwave') !== 'false',
            particles: localStorage.getItem('ws_fx_particles') !== 'false',
            bounce: localStorage.getItem('ws_fx_bounce') !== 'false',
            scorePop: localStorage.getItem('ws_fx_scorePop') !== 'false',
            wave: localStorage.getItem('ws_fx_wave') !== 'false',
            streakFire: localStorage.getItem('ws_fx_streakFire') !== 'false',
            victoryGlow: localStorage.getItem('ws_fx_victoryGlow') !== 'false',
            // Unlike the effects above, Performance Mode defaults OFF —
            // it's an opt-in trade of visual polish for speed.
            performanceMode: localStorage.getItem('ws_fx_performanceMode') === 'true'
        };
        this._applyPerformanceModeAttr();

        // Initialize drag-and-drop trackers
        this.activeDragTile = null;
        this.dragOffset = { x: 0, y: 0 };
        this.dragStartRect = null;
        this.hoveredCell = null;
        
        this.buildCheckerboard();
        this.registerGlobalEvents();
        
        this.isEntranceLoad = true;

        // Start background music loop on first interaction (respecting autoplay policy)
        const startMusicOnce = () => {
            if (this.sound) {
                this.sound.startBackgroundMusic();
            }
            window.removeEventListener('click', startMusicOnce);
            window.removeEventListener('keydown', startMusicOnce);
            window.removeEventListener('touchstart', startMusicOnce);
        };
        window.addEventListener('click', startMusicOnce);
        window.addEventListener('keydown', startMusicOnce);
        window.addEventListener('touchstart', startMusicOnce);
        // Trigger initial loader
        this.runLoadingScreen(this.initLevel());
    }

    // --- Hybrid localStorage / on-chain save helpers ---
    _progressKey(addr) { return addr ? `ws_prog_${addr}` : 'ws_prog_anon'; }
    _pbKey(addr)       { return addr ? `ws_pb_${addr}` : 'word_scramble_high_score'; }
    _pbLevelKey(addr)  { return addr ? `ws_pb_level_${addr}` : 'word_scramble_max_level'; }

    saveProgress() {
        const addr = window.stellarWallet?.address || null;
        localStorage.setItem(this._progressKey(addr), JSON.stringify({
            score: this.score,
            level: this.level,
            category: this.currentCategory,
            winStreak: this.winStreak,
        }));
    }

    async onWalletConnected(address) {
        try {
            const raw = localStorage.getItem(this._progressKey(address));
            if (!raw) return;
            const progress = JSON.parse(raw);

            this.score = progress.score ?? 0;
            this.level = progress.level ?? 1;
            this.winStreak = progress.winStreak ?? 0;
            this.scoreElement.innerText = this.score.toString().padStart(3, '0');
            this.levelElement.innerText = this.level;
            if (this.streakElement) this.streakElement.innerText = this.winStreak;

            const streakBubble = document.querySelector('.streak-bubble');
            if (streakBubble) {
                if (this.winStreak >= 10) {
                    streakBubble.classList.add('streak-glow-active');
                } else {
                    streakBubble.classList.remove('streak-glow-active');
                }
            }

            if (progress.category) {
                this.currentCategory = progress.category;
                const prettyNames = { general: 'General', science: 'Science', math: 'Mathematics', history: 'History', anime: 'Anime Series', technology: 'Technology', novel: 'Novels', 'filipino-movies': 'Filipino Movies' };
                const tagBtn = document.getElementById('category-tag-btn');
                if (tagBtn) tagBtn.innerText = `Category: ${prettyNames[progress.category] || progress.category}`;
            }

            // Reset per-level state so the restored level starts clean
            this.clueLevel = 1;
            this.clue3Exhausted = false;
            this.showingPureDefinition = false;
            this.prefetchedData = null;
            this.isEntranceLoad = false;

            // Remove existing tiles and reload the board for the restored level
            this.tilesData.forEach(t => t.element.remove());
            this.tilesData = [];

            window.stellarWallet._showStatus(`Session resumed — Level ${this.level}, Score ${this.score}`, 'success');
            this.runLoadingScreen(this.initLevel());
        } catch (_) {}
    }

    buildCheckerboard() {
        this.boardGrid.innerHTML = '';
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                const cell = document.createElement('div');
                const isLight = (r + c) % 2 === 0;
                cell.className = `grid-cell`;
                cell.style.backgroundColor = isLight ? 'var(--teak-light)' : 'var(--teak-base)';
                cell.dataset.index = r * 10 + c;
                this.boardGrid.appendChild(cell);
            }
        }
    }

    async initLevel() {
        const wordLength = Math.min(3 + this.level, 8);
        this.levelElement.innerText = this.level + " ...";
        
        let word = "";
        let clue = "";
        const cat = this.currentCategory;

        // Check if we have pre-fetched data for the current level and category
        if (this.prefetchedData && this.prefetchedData.level === this.level && this.prefetchedData.category === cat) {
            word = this.prefetchedData.word;
            clue = this.prefetchedData.clue;
            this.prefetchedData = null;
            console.log("Using pre-fetched level data:", word);
        } else {
            const isOffline = (typeof navigator !== 'undefined' && !navigator.onLine);
            // To make initial load (LCP) extremely fast, we use the offline fallback on the first entrance load or when offline
            if (this.isEntranceLoad || isOffline) {
                console.log("First load or offline: using offline fallback for instant start");
            } else {
                if (cat === 'general') {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 1000);
                        const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${wordLength}`, {
                            signal: controller.signal
                        });
                        clearTimeout(timeoutId);
                        if (response.ok) {
                            const data = await response.json();
                            if (data && data[0]) {
                                word = data[0].toUpperCase();
                            }
                        }
                    } catch (err) {
                        console.log("General API word fetch failed (using offline fallback)");
                    }
                }
                else if (cat === 'science' || cat === 'math' || cat === 'history' || cat === 'technology' || cat === 'novel') {
                    const mlQueries = {
                        science: 'science',
                        math: 'mathematics',
                        history: 'history',
                        technology: 'technology',
                        novel: 'novel'
                    };
                    const query = mlQueries[cat];
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 1000);
                        const response = await fetch(`https://api.datamuse.com/words?ml=${query}&md=d&max=150`, {
                            signal: controller.signal
                        });
                        clearTimeout(timeoutId);
                        if (response.ok) {
                            const data = await response.json();
                            const candidates = data.filter(item => {
                                const w = item.word.toUpperCase();
                                return w.length === wordLength && /^[A-Z]+$/.test(w);
                            });
                            if (candidates.length > 0) {
                                const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                                word = chosen.word.toUpperCase();
                                if (chosen.defs && chosen.defs.length > 0) {
                                    const rawDef = chosen.defs[0];
                                    const tabIdx = rawDef.indexOf('\t');
                                    clue = tabIdx !== -1 ? rawDef.substring(tabIdx + 1) : rawDef;
                                }
                            }
                        }
                    } catch (err) {
                        console.log(`Datamuse API fetch failed for ${cat} (using offline fallback)`);
                    }
                }
                else if (cat === 'anime' || cat === 'filipino-movies') {
                    const categories = {
                        anime: 'Category:Anime_series',
                        'filipino-movies': 'Category:Philippine_films'
                    };
                    const cmtitle = categories[cat];
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 1200);
                        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${cmtitle}&cmlimit=250&format=json&origin=*`, {
                            signal: controller.signal
                        });
                        clearTimeout(timeoutId);
                        if (response.ok) {
                            const data = await response.json();
                            if (data && data.query && data.query.categorymembers) {
                                const members = data.query.categorymembers;
                                const candidates = [];
                                members.forEach(m => {
                                    const rawTitle = m.title;
                                    if (rawTitle.toLowerCase().startsWith('list of') || rawTitle.toLowerCase().startsWith('category:')) return;
                                    let cleanTitle = rawTitle.replace(/\s*\(.*?\)\s*/g, '');
                                    cleanTitle = cleanTitle.replace(/[^a-zA-Z]/g, '').toUpperCase();
                                    if (cleanTitle.length >= 4 && cleanTitle.length <= 8) {
                                        candidates.push({ originalTitle: rawTitle, cleanTitle: cleanTitle });
                                    }
                                });
                                let filtered = candidates.filter(c => c.cleanTitle.length === wordLength);
                                if (filtered.length === 0) filtered = candidates;
                                if (filtered.length > 0) {
                                    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
                                    word = chosen.cleanTitle;
                                    // Fetch Wikipedia summary asynchronously in background
                                    this.fetchWikipediaSummary(chosen.originalTitle, word).then(resolvedClue => {
                                        if (resolvedClue) {
                                            this.wordClue = this.censorWordInClue(resolvedClue, this.targetWord);
                                            this.updateClueUI();
                                        }
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        console.log(`Wikipedia Category fetch failed for ${cat} (using offline fallback)`);
                    }
                }
            }
        }

        // Offline Fallback
        if (!word || !/^[A-Z]+$/.test(word) || word.length < 4 || word.length > 8) {
            console.log("Using offline fallback dictionary...");
            const levelKey = Math.min(this.level, 5);
            const wordPool = (this.dictionary[cat] && this.dictionary[cat][levelKey]) 
                ? this.dictionary[cat][levelKey] 
                : this.dictionary.general[levelKey];
            word = wordPool[Math.floor(Math.random() * wordPool.length)].toUpperCase();
        }
        
        this.targetWord = word;
        
        // Fetch definition asynchronously in background if not available and online
        if (!clue) {
            const isOffline = (typeof navigator !== 'undefined' && !navigator.onLine);
            if (!isOffline) {
                this.fetchDictionaryDefinition(word).then(resolvedClue => {
                    if (resolvedClue) {
                        this.wordClue = this.censorWordInClue(resolvedClue, this.targetWord);
                        this.updateClueUI();
                    }
                });
            }
            clue = `A word starting with '${this.targetWord[0]}' and ending with '${this.targetWord[this.targetWord.length-1]}'.`;
        }
        this.wordClue = this.censorWordInClue(clue, this.targetWord);
        
        let scrambled = this.targetWord;
        let attempts = 0;
        while (scrambled === this.targetWord && attempts < 100) {
            scrambled = this.targetWord.split('').sort(() => Math.random() - 0.5).join('');
            attempts++;
        }
        this.scrambledWord = scrambled;

        this.tilesData = [];
        this.boardOccupants = Array(100).fill(null);
        this.rackSlots = Array(this.targetWord.length).fill(null);

        const isVertical = Math.random() > 0.5;
        const len = this.targetWord.length;
        
        let startRow, startCol;
        if (isVertical) {
            startRow = Math.floor(Math.random() * (10 - len));
            startCol = Math.floor(Math.random() * 10);
        } else {
            startRow = Math.floor(Math.random() * 10);
            startCol = Math.floor(Math.random() * (10 - len));
        }

        this.targetCellIndices = [];
        for (let j = 0; j < len; j++) {
            const r = isVertical ? startRow + j : startRow;
            const c = isVertical ? startCol : startCol + j;
            this.targetCellIndices.push(r * 10 + c);
        }

        this.levelElement.innerText = this.level;
        this.buildLevelArchetype();

        this.clueLevel = 1;
        this.clue3Exhausted = false;
        this.showingPureDefinition = false;
        this.updateClueUI();

        // Start pre-fetching the word for the next level asynchronously in the background
        setTimeout(() => this.prefetchNextWord(), 1500);
    }

    async prefetchNextWord() {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return; // completely silent and skip when offline
        }
        const nextLevel = this.level + 1;
        const wordLength = Math.min(3 + nextLevel, 8);
        const cat = this.currentCategory;
        
        let word = "";
        let clue = "";
        
        console.log(`Pre-fetching next word for Level ${nextLevel} in Category ${cat}...`);
        
        if (cat === 'general') {
            try {
                const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${wordLength}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data[0]) {
                        word = data[0].toUpperCase();
                    }
                }
            } catch (err) {
                console.log("Pre-fetch word failed (using offline fallback)");
            }
            if (word) {
                clue = await this.fetchDictionaryDefinition(word);
            }
        }
        else if (cat === 'science' || cat === 'math' || cat === 'history' || cat === 'technology' || cat === 'novel') {
            const mlQueries = {
                science: 'science',
                math: 'mathematics',
                history: 'history',
                technology: 'technology',
                novel: 'novel'
            };
            const query = mlQueries[cat];
            try {
                const response = await fetch(`https://api.datamuse.com/words?ml=${query}&md=d&max=150`);
                if (response.ok) {
                    const data = await response.json();
                    const candidates = data.filter(item => {
                        const w = item.word.toUpperCase();
                        return w.length === wordLength && /^[A-Z]+$/.test(w);
                    });
                    if (candidates.length > 0) {
                        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                        word = chosen.word.toUpperCase();
                        if (chosen.defs && chosen.defs.length > 0) {
                            const rawDef = chosen.defs[0];
                            const tabIdx = rawDef.indexOf('\t');
                            clue = tabIdx !== -1 ? rawDef.substring(tabIdx + 1) : rawDef;
                        }
                    }
                }
            } catch (err) {
                console.log("Pre-fetch word failed (using offline fallback)");
            }
            if (word && !clue) {
                clue = await this.fetchDictionaryDefinition(word);
            }
        }
        else if (cat === 'anime' || cat === 'filipino-movies') {
            const categories = {
                anime: 'Category:Anime_series',
                'filipino-movies': 'Category:Philippine_films'
            };
            const cmtitle = categories[cat];
            try {
                const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${cmtitle}&cmlimit=250&format=json&origin=*`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.query && data.query.categorymembers) {
                        const members = data.query.categorymembers;
                        const candidates = [];
                        members.forEach(m => {
                            const rawTitle = m.title;
                            if (rawTitle.toLowerCase().startsWith('list of') || rawTitle.toLowerCase().startsWith('category:')) return;
                            let cleanTitle = rawTitle.replace(/\s*\(.*?\)\s*/g, '');
                            cleanTitle = cleanTitle.replace(/[^a-zA-Z]/g, '').toUpperCase();
                            if (cleanTitle.length >= 4 && cleanTitle.length <= 8) {
                                candidates.push({ originalTitle: rawTitle, cleanTitle: cleanTitle });
                            }
                        });
                        let filtered = candidates.filter(c => c.cleanTitle.length === wordLength);
                        if (filtered.length === 0) filtered = candidates;
                        if (filtered.length > 0) {
                            const chosen = filtered[Math.floor(Math.random() * filtered.length)];
                            word = chosen.cleanTitle;
                            clue = await this.fetchWikipediaSummary(chosen.originalTitle, word);
                        }
                    }
                }
            } catch (err) {
                console.log("Pre-fetch word failed (using offline fallback)");
            }
        }
        
        if (word && /^[A-Z]+$/.test(word) && word.length >= 4 && word.length <= 8) {
            this.prefetchedData = {
                level: nextLevel,
                category: cat,
                word: word,
                clue: clue
            };
            console.log(`Pre-fetched word for Level ${nextLevel}: ${word}`);
        }
    }

    buildLevelArchetype() {
        // Clean out existing slot outlines and wood tiles
        document.querySelectorAll('.dashed-slot').forEach(el => el.remove());
        document.querySelectorAll('.wood-tile').forEach(el => el.remove());
        this.rackSlotsContainer.innerHTML = '';

        // Overlay target slots in the randomly chosen cell path
        this.targetCellIndices.forEach((cellIdx, i) => {
            const slot = document.createElement('div');
            slot.className = 'dashed-slot';
            slot.dataset.index = i;
            this.boardGrid.children[cellIdx].appendChild(slot);
        });

        // Create rack slots at bottom right
        for (let i = 0; i < this.targetWord.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'rack-slot';
            slot.dataset.index = i;
            this.rackSlotsContainer.appendChild(slot);
        }

        this.boardGrid.offsetHeight; // reflow

        // Instantiate wooden tiles on the rack
        this.scrambledWord.split('').forEach((char, index) => {
            const tile = document.createElement('div');
            tile.className = 'wood-tile';
            tile.innerText = char;
            
            const dataObj = {
                element: tile,
                char: char,
                currentLocation: 'rack', // 'rack' or 'board'
                slotIndex: index // index of rack (0 to L-1) or board cell (0 to 99)
            };
            
            this.tilesData.push(dataObj);
            this.rackSlots[index] = dataObj;

            // Event bindings
            tile.addEventListener('mousedown', (e) => this.dragStart(e, dataObj));
            tile.addEventListener('touchstart', (e) => this.dragStart(e, dataObj), { passive: false });
            tile.addEventListener('click', () => {
                if (this.draggedDistance > 5) return;
                this.handleTileClick(dataObj);
            });

            document.body.appendChild(tile);
        });

        this.setupTileEffectsListeners();
        this.syncViewPositions(false);
    }

    handleTileClick(tileObj) {
        if (tileObj.element.classList.contains('locked')) return;
        this.sound.play('select');

        if (tileObj.currentLocation === 'rack') {
            // Find first empty target cell in the highlighted path
            let openCellIdx = -1;
            for (let i = 0; i < this.targetCellIndices.length; i++) {
                const cellIdx = this.targetCellIndices[i];
                if (this.boardOccupants[cellIdx] === null) {
                    openCellIdx = cellIdx;
                    break;
                }
            }

            // Fallback to any empty cell on the board if target slots are full
            if (openCellIdx === -1) {
                openCellIdx = this.boardOccupants.indexOf(null);
            }

            if (openCellIdx !== -1) {
                this.moveTileTo(tileObj, 'board', openCellIdx);
            }
        } else {
            // Return from board to the rack
            const openRackIdx = this.rackSlots.indexOf(null);
            if (openRackIdx !== -1) {
                this.moveTileTo(tileObj, 'rack', openRackIdx);
            }
        }
        this.syncViewPositions(true);
    }

    moveTileTo(tileObj, destination, index) {
        // Clear previous reference
        if (tileObj.currentLocation === 'rack') {
            this.rackSlots[tileObj.slotIndex] = null;
        } else {
            this.boardOccupants[tileObj.slotIndex] = null;
        }

        // Apply new location
        tileObj.currentLocation = destination;
        tileObj.slotIndex = index;

        if (destination === 'rack') {
            this.rackSlots[index] = tileObj;
            tileObj.element.classList.remove('inlaid');
        } else {
            this.boardOccupants[index] = tileObj;
            tileObj.element.classList.add('inlaid');
        }
    }

    syncViewPositions(animate = true) {
        if (!this.tilesData || this.tilesData.length === 0) return;

        const bodyRect = document.body.getBoundingClientRect();
        // Read once per sync (not per tile) — lets the tile font picker
        // shrink wide/tall glyphs (e.g. Press Start 2P) via CSS.
        const fontScale = parseFloat(
            getComputedStyle(document.body).getPropertyValue('--tile-font-scale')
        ) || 0.55;

        this.tilesData.forEach(tileObj => {
            let targetDOM = null;
            
            if (tileObj.currentLocation === 'rack') {
                targetDOM = this.rackSlotsContainer.children[tileObj.slotIndex];
            } else {
                targetDOM = this.boardGrid.children[tileObj.slotIndex];
            }

            if (!targetDOM) return;
            const rect = targetDOM.getBoundingClientRect();

            if (!animate) tileObj.element.style.transition = 'none';

            // Calculate dynamic tile size to fit grid-cells/slots responsively
            const pad = 2;
            const tileSize = rect.width - pad;
            tileObj.element.style.width = `${tileSize}px`;
            tileObj.element.style.height = `${tileSize}px`;
            tileObj.element.style.fontSize = `${tileSize * fontScale}px`;

            const offset = pad / 2;
            
            // Absolute coordinates relative to body to prevent viewport offsets/scroll gaps
            const x = rect.left - bodyRect.left + offset;
            const y = rect.top - bodyRect.top + offset;
            
            tileObj.element.style.transform = `translate3d(${x}px, ${y}px, 0px) var(--tile-extra-transform, )`;

            if (!animate) {
                tileObj.element.offsetHeight; // flush
                tileObj.element.style.transition = '';
            }
        });
    }

    // --- DRAG AND DROP CONTROLS ---
    dragStart(e, tileObj) {
        if (tileObj.element.classList.contains('locked')) return;
        
        e.preventDefault();
        this.sound.play('select');
        this.activeDragTile = tileObj;
        this.draggedDistance = 0;
        
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
        
        const tileRect = tileObj.element.getBoundingClientRect();
        this.dragOffset.x = clientX - tileRect.left;
        this.dragOffset.y = clientY - tileRect.top;
        this.dragStartRect = tileRect;

        tileObj.element.classList.add('dragging');

        // Snapshot snap-target geometry once per drag. Layout can't change mid-drag
        // (touch scroll is prevented), so measuring every cell on every move is waste.
        this.cacheDragTargets();
        this.attachDragMoveListeners();
    }

    cacheDragTargets() {
        this._dragSnapTargets = [];

        Array.from(this.boardGrid.children).forEach(cell => {
            const rect = cell.getBoundingClientRect();
            this._dragSnapTargets.push({
                type: 'board',
                index: parseInt(cell.dataset.index),
                element: cell,
                cx: rect.left + rect.width / 2,
                cy: rect.top + rect.height / 2
            });
        });

        Array.from(this.rackSlotsContainer.children).forEach((slot, index) => {
            const rect = slot.getBoundingClientRect();
            this._dragSnapTargets.push({
                type: 'rack',
                index: index,
                element: slot,
                cx: rect.left + rect.width / 2,
                cy: rect.top + rect.height / 2
            });
        });

        this._dashedSlots = Array.from(document.querySelectorAll('.dashed-slot'));
    }

    dragMove(e) {
        if (!this.activeDragTile) return;

        // Prevent viewport scroll during drag operations on mobile
        if (e.cancelable) {
            e.preventDefault();
        }

        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

        const dx = clientX - (this.dragOffset.x + this.dragStartRect.left);
        const dy = clientY - (this.dragOffset.y + this.dragStartRect.top);
        this.draggedDistance = Math.sqrt(dx*dx + dy*dy);

        const bodyRect = document.body.getBoundingClientRect();
        const x = clientX - this.dragOffset.x - bodyRect.left;
        const y = clientY - this.dragOffset.y - bodyRect.top;
        this.activeDragTile.element.style.transform = `translate3d(${x}px, ${y}px, 0px) var(--tile-extra-transform, )`;

        // Canvas animations during drag based on effect
        if (this.currentTileEffect === 'neon') {
            const tileRect = this.activeDragTile.element.getBoundingClientRect();
            const centerX = tileRect.left + tileRect.width / 2;
            const centerY = tileRect.top + tileRect.height / 2;
            this.spawnNeonGhost(this.activeDragTile.char, centerX, centerY, tileRect.width);
        } else if (this.currentTileEffect === 'volcanic') {
            const tileRect = this.activeDragTile.element.getBoundingClientRect();
            const centerX = tileRect.left + tileRect.width / 2;
            const bottomY = tileRect.bottom;
            this.spawnDragEmber(centerX, bottomY);
        } else if (this.currentTileEffect === 'stained-glass') {
            const tileRect = this.activeDragTile.element.getBoundingClientRect();
            const centerX = tileRect.left + tileRect.width / 2;
            const centerY = tileRect.top + tileRect.height / 2;
            
            // Get background color of the tile to match its unique glass color
            const style = window.getComputedStyle(this.activeDragTile.element);
            let color = style.backgroundColor || 'rgba(59, 130, 246, 0.45)';
            // Ensure color has high visibility for the glow
            if (color.startsWith('rgba')) {
                color = color.replace(/[\d\.]+\)$/, '0.65)');
            } else if (color.startsWith('rgb(')) {
                color = color.replace('rgb(', 'rgba(').replace(')', ', 0.65)');
            }
            
            this.spawnGlassGlow(centerX, centerY, tileRect.width * 1.6, color);
        }

        const halfWidth = this.activeDragTile.element.offsetWidth / 2;
        const halfHeight = this.activeDragTile.element.offsetHeight / 2;
        this.updateDragHighlights(clientX - this.dragOffset.x + halfWidth, clientY - this.dragOffset.y + halfHeight);
    }

    dragEnd(e) {
        if (!this.activeDragTile) return;

        this.detachDragMoveListeners();

        const tileObj = this.activeDragTile;
        tileObj.element.classList.remove('dragging');
        this.activeDragTile = null;

        // Clean layout highlights
        if (this._dashedSlots) {
            this._dashedSlots.forEach(el => el.classList.remove('drag-hover'));
        }
        this._dragSnapTargets = [];
        this._dashedSlots = null;

        // Mobile touch tap detection: if dragged distance is tiny, trigger tap-to-move
        if (this.draggedDistance < 10) {
            if (e && e.type === 'touchend') {
                e.preventDefault();
                this.handleTileClick(tileObj);
            }
            this.hoveredCell = null;
            return;
        }

        if (this.hoveredCell) {
            const destType = this.hoveredCell.type; // 'board' or 'rack'
            const destIdx = this.hoveredCell.index;

            // Check occupant in destination
            let occupant = destType === 'rack' ? this.rackSlots[destIdx] : this.boardOccupants[destIdx];

            if (occupant && occupant !== tileObj) {
                // Swap layout positions
                const srcLocation = tileObj.currentLocation;
                const srcIdx = tileObj.slotIndex;

                this.moveTileTo(tileObj, destType, destIdx);
                this.moveTileTo(occupant, srcLocation, srcIdx);
                this.sound.play('drop');
            } else {
                // Clear slot and move in
                this.moveTileTo(tileObj, destType, destIdx);
                this.sound.play('drop');
            }
        } else {
            // return to start
            this.sound.play('drop');
        }

        this.hoveredCell = null;
        this.syncViewPositions(true);
    }

    updateDragHighlights(cx, cy) {
        let bestCell = null;
        let minDist = 36; // Snapping radius threshold

        // Scan cached board cells + rack slots (geometry measured once in dragStart)
        for (const target of this._dragSnapTargets) {
            const dist = Math.sqrt((cx - target.cx)**2 + (cy - target.cy)**2);
            if (dist < minDist) {
                minDist = dist;
                bestCell = target;
            }
        }

        // Highlight slot outline if dragged over target cell paths
        this._dashedSlots.forEach(el => el.classList.remove('drag-hover'));

        if (bestCell) {
            this.hoveredCell = bestCell;
            if (bestCell.type === 'board') {
                const innerSlot = bestCell.element.querySelector('.dashed-slot');
                if (innerSlot) {
                    innerSlot.classList.add('drag-hover');
                }
            }
        } else {
            this.hoveredCell = null;
        }
    }

    registerGlobalEvents() {
        // Move handlers are attached only while a drag is active (see dragStart/dragEnd).
        // A permanently registered non-passive touchmove on window blocks scroll
        // optimization for the whole page, even when nothing is being dragged.
        this._boundDragMove = (e) => this.dragMove(e);

        window.addEventListener('mouseup', (e) => this.dragEnd(e));
        window.addEventListener('touchend', (e) => this.dragEnd(e));

        window.addEventListener('resize', () => {
            this.syncViewPositions(false);
            // Re-measure snap targets if a drag is in progress (layout just changed)
            if (this.activeDragTile) this.cacheDragTargets();
        });
    }

    attachDragMoveListeners() {
        window.addEventListener('mousemove', this._boundDragMove);
        window.addEventListener('touchmove', this._boundDragMove, { passive: false });
    }

    detachDragMoveListeners() {
        window.removeEventListener('mousemove', this._boundDragMove);
        window.removeEventListener('touchmove', this._boundDragMove);
    }

    verifySolution() {
        // Read letters placed in the target cell path
        const playerWord = this.targetCellIndices.map(cellIdx => {
            const tile = this.boardOccupants[cellIdx];
            return tile ? tile.char : '';
        }).join('');

        if (playerWord === this.targetWord) {
            this.sound.play('win');
            if (this.effectsSettings.shockwave) {
                this.triggerShockwave();
            }
            this.tilesData.forEach(t => t.element.classList.add('locked'));
            
            // Trigger bounce effect sequentially on each letter from start to end
            if (this.effectsSettings.bounce) {
                this.targetCellIndices.forEach((cellIdx, i) => {
                    const tileObj = this.boardOccupants[cellIdx];
                    if (tileObj && tileObj.element) {
                        setTimeout(() => {
                            tileObj.element.classList.add('bounce-active');
                            // Remove class after animation finishes so it can be re-applied
                            tileObj.element.addEventListener('animationend', () => {
                                tileObj.element.classList.remove('bounce-active');
                            }, { once: true });
                        }, i * 100); // 100ms delay between each letter
                    }
                });
            }

            if (this.effectsSettings.particles) {
                const badge = document.querySelector('.score-bubble');
                const badgeRect = badge.getBoundingClientRect();
                this.particles.burst(badgeRect.left + 30, badgeRect.top + 30);
            }

            this.winStreak++;
            const streakBonus = this.getStreakBonus();
            this.score += 100 + streakBonus;
            this.scoreElement.innerText = this.score.toString().padStart(3, '0');
            if (this.streakElement) this.streakElement.innerText = this.winStreak;
            this.updateVictoryBreakdown(100, streakBonus);

            const streakBubble = document.querySelector('.streak-bubble');
            if (streakBubble) {
                if (this.winStreak >= 10) {
                    streakBubble.classList.add('streak-glow-active');
                } else {
                    streakBubble.classList.remove('streak-glow-active');
                }
            }

            // Streak fire effect (3+ streak only)
            if (this.winStreak >= 3 && this.effectsSettings.streakFire) {
                if (streakBubble) {
                    const rect = streakBubble.getBoundingClientRect();
                    const startX = rect.left + rect.width / 2;
                    const startY = rect.top + rect.height / 2;
                    const count = this.winStreak >= 10 ? 40 : 20;
                    this.particles.streakEmberBurst(startX, startY, count);
                }
            }

            if (this.effectsSettings.scorePop) {
                const scoreTextElem = document.getElementById('score-text');
                if (scoreTextElem) {
                    const rect = scoreTextElem.getBoundingClientRect();
                    const startX = rect.left + rect.width / 2;
                    const startY = rect.top + rect.height / 2;
                    this.particles.addFloatingText(`+100 PTS`, startX, startY, '#FFFFFF', 0, 'bold 20px Jost');
                    if (streakBonus > 0) {
                        this.particles.addFloatingText(`+${streakBonus} STREAK`, startX, startY, '#FF9A6C', 120, 'bold 20px Jost');
                    }
                }
            }

            if (this.effectsSettings.wave) {
                this.triggerGridFlashWave();
            }

            // Save personal best (address-keyed when wallet connected)
            const _pbAddr = window.stellarWallet?.address || null;
            const localPBScore = localStorage.getItem(this._pbKey(_pbAddr)) || 0;
            if (this.score > parseInt(localPBScore)) {
                localStorage.setItem(this._pbKey(_pbAddr), this.score);
                localStorage.setItem(this._pbLevelKey(_pbAddr), this.level);
            }
            // Autosave in-progress state to localStorage
            this.saveProgress();

            // Submit score to Stellar leaderboard (non-blocking)
            if (window.stellarWallet && window.stellarWallet.connected) {
                window.stellarWallet.submitScore(this.score, this.level);
            }

            // Daily Challenge gets its own victory-screen content (share
            // block, no "Next Scramble"); a regular win must restore the
            // default content in case a prior daily win left it mutated.
            if (this.isDailyChallenge) {
                this.completeDailyChallenge();
            } else {
                this.resetVictoryScreenUI();
            }

            setTimeout(() => {
                if (this.effectsSettings.victoryGlow) {
                    this.victoryScreen.classList.add('victory-glow-active');
                } else {
                    this.victoryScreen.classList.remove('victory-glow-active');
                }
                this.victoryScreen.classList.add('active');
            }, 1200); // Wait for the cascade bounce animation to finish beautifully
        } else {
            this.sound.play('error');
            this.winStreak = 0;
            if (this.streakElement) this.streakElement.innerText = this.winStreak;

            const streakBubble = document.querySelector('.streak-bubble');
            if (streakBubble) streakBubble.classList.remove('streak-glow-active');
            
            // Shake and highlight incorrect board tiles red
            this.tilesData.forEach(t => {
                if (t.currentLocation === 'board' && !t.element.classList.contains('locked')) {
                    t.element.style.transition = 'none';
                    t.element.style.backgroundColor = '#ef5350';
                    t.element.style.color = '#ffffff';
                    
                    const side = 5;
                    const tileX = parseFloat(t.element.style.transform.match(/translate3d\(([^px]+)px/)[1]);
                    const tileY = parseFloat(t.element.style.transform.match(/px, ([^px]+)px/)[1]);

                    let tick = 0;
                    const shakeInterval = setInterval(() => {
                        tick++;
                        const shakeOffset = (tick % 2 === 0 ? 1 : -1) * side;
                        t.element.style.transform = `translate3d(${tileX + shakeOffset}px, ${tileY}px, 0px)`;
                        if (tick >= 6) {
                            clearInterval(shakeInterval);
                            t.element.style.backgroundColor = '';
                            t.element.style.color = '';
                            t.element.style.transition = '';
                            this.syncViewPositions(true);
                        }
                    }, 40);
                }
            });
            
            this.mainBoard.classList.add('shake');
            setTimeout(() => this.mainBoard.classList.remove('shake'), 400);

            setTimeout(() => {
                // Progress clue level on incorrect submission
                if (this.clueLevel === 1) {
                    this.clueLevel = 2;
                    this.lockLetterAt(0); // Automatically lock first letter
                } else if (this.clueLevel === 2) {
                    this.clueLevel = 3;
                    this.clue3Exhausted = false;
                    this.lockLetterAt(this.targetWord.length - 1); // Automatically lock last letter
                } else if (this.clueLevel === 3) {
                    this.clue3Exhausted = true; // Exhausted state
                }
                this.showingPureDefinition = false;
                this.resetTray(true);
                this.updateClueUI();
            }, 500);
        }
    }

    resetTray(excludeLocked = true) {
        this.sound.play('reset');
        
        if (excludeLocked) {
            // Clear board occupants of non-locked tiles
            for (let i = 0; i < this.boardOccupants.length; i++) {
                const tileObj = this.boardOccupants[i];
                if (tileObj && !tileObj.element.classList.contains('locked')) {
                    this.boardOccupants[i] = null;
                }
            }
            
            // Reset rack slots to empty
            this.rackSlots.fill(null);
            
            // Put non-locked tiles back to rack
            let rackIdx = 0;
            this.tilesData.forEach((tileObj) => {
                if (tileObj.element.classList.contains('locked')) {
                    // It is locked, keep its board location as is
                    if (tileObj.currentLocation === 'board') {
                        this.boardOccupants[tileObj.slotIndex] = tileObj;
                    }
                } else {
                    // Not locked, send to rack
                    tileObj.currentLocation = 'rack';
                    tileObj.element.classList.remove('inlaid');
                    
                    // Find next empty rack slot
                    while (rackIdx < this.rackSlots.length && this.rackSlots[rackIdx] !== null) {
                        rackIdx++;
                    }
                    if (rackIdx < this.rackSlots.length) {
                        this.rackSlots[rackIdx] = tileObj;
                        tileObj.slotIndex = rackIdx;
                        rackIdx++;
                    }
                }
            });
        } else {
            // Full reset
            this.boardOccupants.fill(null);
            this.rackSlots.fill(null);
            this.tilesData.forEach((tileObj, index) => {
                tileObj.currentLocation = 'rack';
                tileObj.slotIndex = index;
                this.rackSlots[index] = tileObj;
                tileObj.element.classList.remove('inlaid');
                tileObj.element.classList.remove('locked');
            });
        }
        this.syncViewPositions(true);
    }

    lockLetterAt(charIndex) {
        // Return all unlocked tiles currently on the board back to the rack
        this.tilesData.forEach(tileObj => {
            if (tileObj.currentLocation === 'board' && !tileObj.element.classList.contains('locked')) {
                this.boardOccupants[tileObj.slotIndex] = null;
                tileObj.currentLocation = 'rack';
                tileObj.element.classList.remove('inlaid');
                
                const openRackIdx = this.rackSlots.indexOf(null);
                if (openRackIdx !== -1) {
                    this.rackSlots[openRackIdx] = tileObj;
                    tileObj.slotIndex = openRackIdx;
                }
            }
        });

        const targetCellIdx = this.targetCellIndices[charIndex];
        const correctChar = this.targetWord[charIndex];
        
        // 1. Kick out any incorrect tile currently sitting in that target cell
        const occupant = this.boardOccupants[targetCellIdx];
        if (occupant) {
            const openRackIdx = this.rackSlots.indexOf(null);
            if (openRackIdx !== -1) {
                this.moveTileTo(occupant, 'rack', openRackIdx);
            } else {
                const openBoardIdx = this.boardOccupants.indexOf(null);
                if (openBoardIdx !== -1) {
                    this.moveTileTo(occupant, 'board', openBoardIdx);
                }
            }
        }

        // 2. Locate the correct letter block (not currently locked)
        const correctTile = this.tilesData.find(t => t.char === correctChar && !t.element.classList.contains('locked'));
        
        if (correctTile) {
            // 3. Move correct tile to target cell
            this.moveTileTo(correctTile, 'board', targetCellIdx);
            // 4. Lock it
            correctTile.element.classList.add('locked');
            
            this.sound.play('drop');
            this.syncViewPositions(true);
            return true;
        }
        return false;
    }

    giveLetterHint() {
        if (this.clueLevel === 3) {
            this.sound.play('error');
            const panel = document.getElementById('clue-text');
            panel.innerText = "No more hints available for this scramble!";
            return;
        }

        this.sound.play('select');

        if (this.clueLevel === 1) {
            this.clueLevel = 2;
            this.lockLetterAt(0); // Reveal & lock first letter
            // Deduct 10 points
            this.score = Math.max(0, this.score - 10);
            this.scoreElement.innerText = this.score.toString().padStart(3, '0');
        } else if (this.clueLevel === 2) {
            this.clueLevel = 3;
            this.clue3Exhausted = false;
            this.lockLetterAt(this.targetWord.length - 1); // Reveal & lock last letter
            // Deduct 10 points
            this.score = Math.max(0, this.score - 10);
            this.scoreElement.innerText = this.score.toString().padStart(3, '0');
        }

        this.showingPureDefinition = false;
        this.resetTray(true);
        this.updateClueUI();
    }

    showWordClue() {
        this.sound.play('select');
        this.showingPureDefinition = !this.showingPureDefinition;
        if (this.showingPureDefinition) {
            const panel = document.getElementById('clue-text');
            panel.innerHTML = `<strong>Definition:</strong> ${this.wordClue}`;
            
            // Briefly scale the Clue 1 dot indicator
            const dot1 = document.querySelector(`.clue-dot[data-clue="1"]`);
            if (dot1) {
                dot1.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    dot1.style.transform = '';
                }, 500);
            }
        } else {
            this.updateClueUI();
        }
        this.syncViewPositions(true);
    }

    updateClueUI() {
        const panel = document.getElementById('clue-text');
        if (!panel) return;

        // Update indicator dots active class
        for (let i = 1; i <= 3; i++) {
            const dot = document.querySelector(`.clue-dot[data-clue="${i}"]`);
            if (dot) {
                if (i <= this.clueLevel) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            }
        }

        const firstChar = this.targetWord[0];
        const lastChar = this.targetWord[this.targetWord.length - 1];
        const wordLength = this.targetWord.length;

        if (this.clueLevel === 1) {
            panel.innerHTML = `<strong>Definition:</strong> ${this.wordClue || 'Fetching definition...'}`;
        } else if (this.clueLevel === 2) {
            panel.innerHTML = `🔍 <strong>Clue 2:</strong> Starts with "${firstChar}" (${wordLength} letters)<br/><strong>Definition:</strong> ${this.wordClue}`;
        } else if (this.clueLevel === 3) {
            if (this.clue3Exhausted) {
                panel.innerHTML = `🚫 <strong>No clues left!</strong> You must solve: <strong>${firstChar}${'_'.repeat(wordLength - 2)}${lastChar}</strong><br/><strong>Definition:</strong> ${this.wordClue}`;
            } else {
                panel.innerHTML = `🔥 <strong>Trump Card:</strong> Starts with "${firstChar}", Ends with "${lastChar}" (${wordLength} letters)<br/><strong>Scrambled:</strong> <span style="letter-spacing: 2px;">${this.scrambledWord}</span><br/><strong>Definition:</strong> ${this.wordClue}`;
            }
        }
        this.syncViewPositions(true);
    }

    getStreakBonus() {
        const s = this.winStreak;
        if (s >= 16) return 50;
        if (s >= 11) return 30;
        if (s >= 6) return 20;
        if (s >= 1) return 10;
        return 0;
    }

    getStreakTierLabel(streak) {
        if (streak >= 16) return 'LEGENDARY STREAK (+50/win)';
        if (streak >= 11) return 'INFERNO STREAK (+30/win)';
        if (streak >= 6) return 'BLAZING STREAK (+20/win)';
        if (streak >= 1) return 'HOT STREAK (+10/win)';
        return '';
    }

    updateVictoryBreakdown(basePoints, streakBonus) {
        const breakdown = document.getElementById('victory-breakdown');
        if (!breakdown) return;
        const total = basePoints + streakBonus;
        let html = `<div class="breakdown-row"><span>Word Solved</span><span>+${basePoints}</span></div>`;
        if (streakBonus > 0) {
            html += `<div class="breakdown-row streak-row"><span>${this.getStreakTierLabel(this.winStreak)} x${this.winStreak}</span><span>+${streakBonus}</span></div>`;
        }
        html += `<div class="breakdown-divider"></div>`;
        html += `<div class="breakdown-row total-row"><span>Points Earned</span><span>+${total}</span></div>`;
        breakdown.innerHTML = html;
    }

    async nextLevel() {
        this.victoryScreen.classList.remove('active');
        this.victoryScreen.classList.remove('victory-glow-active');
        this.particles.stop();

        this.level++;
        this.levelElement.innerText = this.level;
        this.saveProgress();
        
        document.getElementById('clue-text').innerText = "Preparing next scramble...";
        
        this.tilesData.forEach(t => t.element.remove());
        await this.runLoadingScreen(this.initLevel());
    }

    async runLoadingScreen(asyncTask) {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.getElementById('loading-progress-bar');
        const statusText = document.getElementById('loading-status-text');
        const progressPercent = document.getElementById('loading-progress-percent');

        loadingScreen.classList.add('active');
        progressBar.style.width = '0%';
        progressPercent.innerText = '0%';
        statusText.innerText = 'Initializing...';

        let progress = 0;
        let isDone = false;
        
        // Progress bar simulation
        const progressInterval = setInterval(() => {
            if (isDone) {
                progress = 100;
                progressBar.style.width = '100%';
                progressPercent.innerText = '100%';
                clearInterval(progressInterval);
            } else {
                // Slower near the end for tension
                let increment = progress > 85 ? 0.3 : 4;
                progress += Math.random() * increment;
                if (progress > 90) progress = 90;
                progressBar.style.width = `${Math.floor(progress)}%`;
                progressPercent.innerText = `${Math.floor(progress)}%`;
            }
        }, 100);

        const statusPhrases = [
            'Accessing server core...',
            'Querying word database...',
            'Retrieving definitions...',
            'Compiling board matrix...',
            'Scrambling wooden tiles...'
        ];
        let phraseIdx = 0;
        const phraseInterval = setInterval(() => {
            if (isDone) {
                statusText.innerText = 'Scramble completed!';
                clearInterval(phraseInterval);
            } else {
                statusText.innerText = statusPhrases[phraseIdx % statusPhrases.length];
                phraseIdx++;
            }
        }, 400);

        try {
            await asyncTask;
        } catch (e) {
            console.error('Task failed during loading', e);
        } finally {
            isDone = true;
            progressBar.style.width = '100%';
            progressPercent.innerText = '100%';
            statusText.innerText = 'Completed!';
            
            clearInterval(progressInterval);
            clearInterval(phraseInterval);
            
            setTimeout(() => {
                loadingScreen.classList.remove('active');
                if (this.isEntranceLoad) {
                    this.isEntranceLoad = false;
                    setTimeout(() => {
                        // True first-time visitors see a quick welcome card
                        // instead of (and then before) the changelog.
                        if (!localStorage.getItem('ws_onboarding_seen')) {
                            this.showOnboarding();
                        } else {
                            this.openChangelogModal();
                        }
                    }, 400);
                }
            }, 300);
        }
    }

    toggleSound() {
        this.sound.toggleMute();
    }

    openCategoryModal() {
        this.sound.play('select');
        document.getElementById('category-modal-backdrop').classList.add('active');
    }

    closeCategoryModal(event) {
        if (!event || event.target === document.getElementById('category-modal-backdrop')) {
            this.sound.play('select');
            document.getElementById('category-modal-backdrop').classList.remove('active');
        }
    }

    openChangelogModal() {
        this.sound.play('select');
        document.getElementById('changelog-modal-backdrop').classList.add('active');
    }

    closeChangelogModal(event) {
        if (!event || event.target === document.getElementById('changelog-modal-backdrop')) {
            this.sound.play('select');
            document.getElementById('changelog-modal-backdrop').classList.remove('active');
        }
    }

    showOnboarding() {
        document.getElementById('onboarding-modal-backdrop').classList.add('active');
    }

    dismissOnboarding(event) {
        if (event && event.target !== document.getElementById('onboarding-modal-backdrop')) return;
        this.sound.play('select');
        document.getElementById('onboarding-modal-backdrop').classList.remove('active');
        localStorage.setItem('ws_onboarding_seen', 'true');
        // Still show the changelog afterward, same as every other visit.
        setTimeout(() => this.openChangelogModal(), 300);
    }

    openThemeModal() {
        this.sound.play('select');
        document.getElementById('theme-modal-backdrop').classList.add('active');
        
        // Lazy load theme preview images on modal open
        document.querySelectorAll('.theme-modal img[data-src]').forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        });

        // Update the current selection state in the cards
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('current');
        });
        const activeCard = document.getElementById(`theme-card-${this.currentTheme}`);
        if (activeCard) activeCard.classList.add('current');
    }

    closeThemeModal(event) {
        if (!event || event.target === document.getElementById('theme-modal-backdrop')) {
            this.sound.play('select');
            document.getElementById('theme-modal-backdrop').classList.remove('active');
        }
    }

    switchTheme(themeId) {
        if (themeId === this.currentTheme) {
            document.getElementById('theme-modal-backdrop').classList.remove('active');
            return;
        }

        this.sound.play('win');
        this.currentTheme = themeId;
        localStorage.setItem('word_scramble_theme', themeId);

        // Update card highlight
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('current');
        });
        const activeCard = document.getElementById(`theme-card-${themeId}`);
        if (activeCard) activeCard.classList.add('current');

        this.applyTheme(themeId, true);
        document.getElementById('theme-modal-backdrop').classList.remove('active');
    }

    applyTheme(themeId, animate = true) {
        if (themeId === 'teak') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', themeId);
        }

        // Give the DOM a moment to adjust to theme styles, then sync wood tile positions
        setTimeout(() => {
            this.syncViewPositions(animate);
        }, 120);
    }

    openChipModal() {
        this.sound.play('select');
        document.getElementById('chip-modal-backdrop').classList.add('active');

        // Update active class on the chip cards (scoped to chip-card-* so it
        // doesn't clobber the tile font grid's own .current highlight)
        document.querySelectorAll('#chip-modal-backdrop .theme-card[id^="chip-card-"]').forEach(card => {
            card.classList.remove('current');
        });
        const activeCard = document.getElementById(`chip-card-${this.currentChipMaterial}`);
        if (activeCard) activeCard.classList.add('current');

        // Load accessibility/premium tile fonts (for previews) and refresh
        // the font grid's selection + lock state
        this._ensureLazyTileFonts();
        this.updateTileFontModalUI();
    }

    closeChipModal(event) {
        if (!event || event.target === document.getElementById('chip-modal-backdrop')) {
            this.sound.play('select');
            document.getElementById('chip-modal-backdrop').classList.remove('active');
        }
    }

    switchChipMaterial(materialId) {
        if (materialId === this.currentChipMaterial) {
            document.getElementById('chip-modal-backdrop').classList.remove('active');
            return;
        }

        this.sound.play('win');
        this.currentChipMaterial = materialId;
        localStorage.setItem('word_scramble_chip_material', materialId);

        // Update active highlight (scoped to chip-card-* — see openChipModal)
        document.querySelectorAll('#chip-modal-backdrop .theme-card[id^="chip-card-"]').forEach(card => {
            card.classList.remove('current');
        });
        const activeCard = document.getElementById(`chip-card-${materialId}`);
        if (activeCard) activeCard.classList.add('current');

        this.applyChipMaterial(materialId, true);
        document.getElementById('chip-modal-backdrop').classList.remove('active');
    }

    applyChipMaterial(materialId, animate = true) {
        document.body.setAttribute('data-chip-material', materialId);

        // Update tile positions since margins/borders might have adjusted
        setTimeout(() => {
            this.syncViewPositions(animate);
        }, 120);
    }

    // --- Tile Font Picker ---
    // IDs of tile fonts that are NOT preloaded in <head> and must be fetched
    // on demand (accessibility font is self-hosted; premium fonts are
    // Google Fonts gated behind a badge).
    static TILE_FONT_LAZY = ['dyslexic', 'bungee', 'pressstart'];
    static TILE_FONT_PREMIUM = ['bungee', 'pressstart'];

    isTileFontUnlocked() {
        const badges = (window.stellarWallet && window.stellarWallet.cachedBadges) || [];
        return badges.includes('GOLD') || badges.includes('LEGEND');
    }

    // Injects the premium Google Fonts stylesheet + the self-hosted
    // OpenDyslexic stylesheet exactly once. Called both when the modal
    // opens (so previews render correctly) and from applyTileFont() for a
    // restored lazy selection at boot (modal may never be opened).
    _ensureLazyTileFonts() {
        if (this._tileFontsInjected) return;
        this._tileFontsInjected = true;

        const googleLink = document.createElement('link');
        googleLink.rel = 'stylesheet';
        googleLink.href = 'https://fonts.googleapis.com/css2?family=Bungee&family=Press+Start+2P&display=swap';
        document.head.appendChild(googleLink);

        const localLink = document.createElement('link');
        localLink.rel = 'stylesheet';
        localLink.href = 'fonts/tile-fonts.css';
        document.head.appendChild(localLink);
    }

    updateTileFontModalUI() {
        document.querySelectorAll('#tile-font-grid .theme-card').forEach(card => {
            card.classList.remove('current');
        });
        const activeCard = document.getElementById(`font-card-${this.currentTileFont}`);
        if (activeCard) activeCard.classList.add('current');

        const unlocked = this.isTileFontUnlocked();
        TeakScrambleGame.TILE_FONT_PREMIUM.forEach(fontId => {
            const card = document.getElementById(`font-card-${fontId}`);
            if (card) card.classList.toggle('locked', !unlocked);
        });
    }

    switchTileFont(fontId) {
        const isPremium = TeakScrambleGame.TILE_FONT_PREMIUM.includes(fontId);
        if (isPremium && !this.isTileFontUnlocked()) {
            this.sound.play('select');
            if (window.stellarWallet) {
                const msg = window.stellarWallet.connected
                    ? 'Font locked — earn the GOLD badge on the leaderboard to unlock it.'
                    : 'Connect your wallet and earn the GOLD badge to unlock this font.';
                window.stellarWallet._showStatus(msg, 'error');
            }
            this.updateTileFontModalUI(); // keep lock state in sync, modal stays open
            return;
        }

        if (fontId === this.currentTileFont) {
            document.getElementById('chip-modal-backdrop').classList.remove('active');
            return;
        }

        this.sound.play('win');
        this.currentTileFont = fontId;
        localStorage.setItem('word_scramble_tile_font', fontId);
        this.updateTileFontModalUI();

        this.applyTileFont(fontId, true);
        document.getElementById('chip-modal-backdrop').classList.remove('active');
    }

    applyTileFont(fontId, animate = true) {
        if (fontId === 'jost') {
            document.body.removeAttribute('data-tile-font');
        } else {
            document.body.setAttribute('data-tile-font', fontId);
        }

        if (TeakScrambleGame.TILE_FONT_LAZY.includes(fontId)) {
            this._ensureLazyTileFonts();
        }

        // Font metrics differ, and the inline font-size scale (see
        // syncViewPositions) may have changed with the CSS variable.
        setTimeout(() => {
            this.syncViewPositions(animate);
        }, 120);
    }

    openTileEffectsModal() {
        this.sound.play('select');
        document.getElementById('tile-effects-modal-backdrop').classList.add('active');
        this.updateTileEffectsModalHighlight();
    }

    closeTileEffectsModal(event) {
        if (!event || event.target === document.getElementById('tile-effects-modal-backdrop')) {
            this.sound.play('select');
            document.getElementById('tile-effects-modal-backdrop').classList.remove('active');
        }
    }

    updateTileEffectsModalHighlight() {
        document.querySelectorAll('#tile-effects-modal-backdrop .theme-card').forEach(card => {
            card.classList.remove('current');
        });
        const activeCard = document.getElementById(`tile-effect-card-${this.currentTileEffect}`);
        if (activeCard) activeCard.classList.add('current');
    }

    switchTileEffect(effectId) {
        if (effectId === this.currentTileEffect) {
            document.getElementById('tile-effects-modal-backdrop').classList.remove('active');
            return;
        }

        this.sound.play('win');
        this.currentTileEffect = effectId;
        localStorage.setItem('word_scramble_tile_effect', effectId);

        this.updateTileEffectsModalHighlight();
        this.applyTileEffect(effectId, true);
        document.getElementById('tile-effects-modal-backdrop').classList.remove('active');
    }

    applyTileEffect(effectId, animate = true) {
        document.body.setAttribute('data-tile-effect', effectId);
        
        // Update button text in header
        const btn = document.getElementById('tile-effects-btn');
        if (btn) {
            let label = 'None';
            if (effectId === 'neon') label = 'Neon Arcade';
            if (effectId === 'volcanic') label = 'Volcanic Forge';
            if (effectId === 'holographic') label = 'Holographic';
            if (effectId === 'ice-crystal') label = 'Ice Crystal';
            if (effectId === 'stained-glass') label = 'Stained Glass';
            btn.innerText = `Tile Effect: ${label}`;
        }

        // Apply mouse tracking listeners
        this.setupTileEffectsListeners();

        setTimeout(() => {
            this.syncViewPositions(animate);
        }, 120);
    }

    setupTileEffectsListeners() {
        if (!this.tilesData) return;
        this.tilesData.forEach(tileObj => {
            const tile = tileObj.element;
            
            // Remove existing listeners to prevent duplicates
            if (tile._onMouseMove) tile.removeEventListener('mousemove', tile._onMouseMove);
            if (tile._onMouseLeave) tile.removeEventListener('mouseleave', tile._onMouseLeave);
            
            if (this.currentTileEffect === 'holographic') {
                tile._onMouseMove = (e) => {
                    const rect = tile.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const percentX = (x / rect.width) * 100;
                    const percentY = (y / rect.height) * 100;
                    tile.style.setProperty('--mouse-x', `${percentX}%`);
                    tile.style.setProperty('--mouse-y', `${percentY}%`);
                    
                    // Subtle tilt between -6deg and 6deg
                    const tiltX = ((percentY - 50) / 50) * -6;
                    const tiltY = ((percentX - 50) / 50) * 6;
                    tile.style.setProperty('--tilt-x', `${tiltX}deg`);
                    tile.style.setProperty('--tilt-y', `${tiltY}deg`);
                };
                tile._onMouseLeave = () => {
                    tile.style.removeProperty('--mouse-x');
                    tile.style.removeProperty('--mouse-y');
                    tile.style.removeProperty('--tilt-x');
                    tile.style.removeProperty('--tilt-y');
                };
                
                tile.addEventListener('mousemove', tile._onMouseMove);
                tile.addEventListener('mouseleave', tile._onMouseLeave);
            } else {
                tile.style.removeProperty('--mouse-x');
                tile.style.removeProperty('--mouse-y');
                tile.style.removeProperty('--tilt-x');
                tile.style.removeProperty('--tilt-y');
            }
        });
    }

    spawnNeonGhost(char, x, y, size) {
        if (!this.particles) return;
        this.particles.active = true;
        
        // Cycle neon colors: magenta, cyan, yellow
        const cycle = Math.floor(Date.now() / 400) % 3;
        const colors = ['#ff00ff', '#00ffff', '#ffff00'];
        const color = colors[cycle];
        
        this.particles.particles.push({
            type: 'ghost',
            x: x,
            y: y,
            letter: char,
            color: color,
            alpha: 0.4,
            decay: 0.03, // Fades out in about 13 frames (~200ms)
            size: size,
            rotation: 0
        });
        this.particles.animate();
    }

    spawnDragEmber(x, y) {
        if (!this.particles) return;
        this.particles.active = true;
        
        const colors = ['#FF4500', '#FF8C00', '#FFA500', '#FFD700', '#FF3300'];
        const angle = Math.PI * 1.5 + (Math.random() - 0.5) * 0.5; // up
        const speed = 1.0 + Math.random() * 2.0;
        
        this.particles.particles.push({
            type: 'ember',
            x: x + (Math.random() - 0.5) * 20,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1.0,
            decay: 0.02 + Math.random() * 0.02,
            rotation: 0
        });
        this.particles.animate();
    }

    spawnGlassGlow(x, y, size, color) {
        if (!this.particles) return;
        this.particles.active = true;
        
        this.particles.particles.push({
            type: 'glow',
            x: x,
            y: y,
            color: color,
            alpha: 0.7,
            decay: 0.08, // Fades out in about 9 frames (~150ms)
            size: size,
            rotation: 0
        });
        this.particles.animate();
    }

    openLeaderboardModal() {
        this.sound.play('select');
        document.getElementById('leaderboard-modal-backdrop').classList.add('active');
        this._updateResetUI();
        this.refreshLeaderboard();
    }

    _updateResetUI() {
        const wallet = window.stellarWallet;
        const connected = wallet && wallet.connected;

        const resetBtn = document.getElementById('reset-score-btn');
        const adminPanel = document.getElementById('admin-reset-panel');

        if (resetBtn) resetBtn.style.display = connected ? 'inline-block' : 'none';
        // Admin panel is always shown; contract enforces auth on the actual call
        if (adminPanel) adminPanel.style.display = 'block';
    }

    confirmSelfReset() {
        if (!confirm('Reset your score and level to 0 / Level 1 on the blockchain?\n\nThis cannot be undone.')) return;
        window.stellarWallet.resetScore().then(ok => {
            if (ok) {
                // Reset in-memory game state
                this.score = 0;
                this.level = 1;
                this.winStreak = 0;
                this.scoreElement.innerText = '000';
                this.levelElement.innerText = '1';
                if (this.streakElement) this.streakElement.innerText = '0';
                this.refreshLeaderboard();
            }
        });
    }

    confirmAdminReset() {
        if (!confirm('ADMIN: Wipe the ENTIRE leaderboard for ALL players?\n\nThis is irreversible.')) return;
        window.stellarWallet.resetLeaderboard().then(ok => {
            if (ok) this.refreshLeaderboard();
        });
    }

    closeLeaderboardModal(event) {
        if (!event || event.target === document.getElementById('leaderboard-modal-backdrop')) {
            this.sound.play('select');
            document.getElementById('leaderboard-modal-backdrop').classList.remove('active');
        }
    }

    async refreshLeaderboard() {
        // Show loading state
        const loadingEl = document.getElementById('leaderboard-loading');
        const errorEl = document.getElementById('leaderboard-error');
        const emptyEl = document.getElementById('leaderboard-empty');
        const tableWrapperEl = document.getElementById('leaderboard-table-wrapper');
        const bodyEl = document.getElementById('leaderboard-body');
        
        loadingEl.style.display = 'flex';
        errorEl.style.display = 'none';
        emptyEl.style.display = 'none';
        tableWrapperEl.style.display = 'none';
        bodyEl.innerHTML = '';

        // Update Personal Best display (address-keyed when wallet connected)
        const _pbAddr = window.stellarWallet?.address || null;
        const localScore = parseInt(localStorage.getItem(this._pbKey(_pbAddr)) || '0');
        const localLevel = parseInt(localStorage.getItem(this._pbLevelKey(_pbAddr)) || '1');

        // Use the current session score/level if they are higher than local storage
        let pbScore = Math.max(localScore, this.score);
        let pbLevel = Math.max(localLevel, this.level);
        
        document.getElementById('pb-score-val').innerText = pbScore.toString().padStart(3, '0');
        document.getElementById('pb-level-val').innerText = pbLevel;

        try {
            let entries = [];
            if (window.stellarWallet) {
                entries = await window.stellarWallet.fetchLeaderboard();
            }

            loadingEl.style.display = 'none';

            // Use on-chain entry as the authoritative PB baseline
            const _playerAddr = window.stellarWallet?.address || null;
            if (_playerAddr && entries.length > 0) {
                const onChainEntry = entries.find(e => e.address === _playerAddr);
                if (onChainEntry && onChainEntry.score > pbScore) {
                    pbScore = onChainEntry.score;
                    pbLevel = Math.max(pbLevel, onChainEntry.level);
                    document.getElementById('pb-score-val').innerText = pbScore.toString().padStart(3, '0');
                    document.getElementById('pb-level-val').innerText = pbLevel;
                }
            }

            if (!entries || entries.length === 0) {
                // Fallback local list merged with player personal best if higher than 0
                const fallbacks = [
                    { rank: 1, address: "GBX2...9P2K", score: 850, level: 9 },
                    { rank: 2, address: "GA7T...5W3M", score: 620, level: 7 },
                    { rank: 3, address: "GCT5...1V4X", score: 410, level: 5 }
                ];
                
                if (pbScore > 0) {
                    const playerAddr = window.stellarWallet && window.stellarWallet.address 
                        ? window.stellarWallet._short(window.stellarWallet.address) 
                        : "YOU (Local)";
                    
                    const playerEntry = { rank: 0, address: playerAddr, score: pbScore, level: pbLevel, isCurrentPlayer: true };
                    
                    let merged = [...fallbacks, playerEntry];
                    merged.sort((a, b) => b.score - a.score);
                    merged.forEach((item, idx) => {
                        item.rank = idx + 1;
                    });
                    this.renderLeaderboard(merged);
                } else {
                    this.renderLeaderboard(fallbacks);
                }
            } else {
                const playerAddr = window.stellarWallet && window.stellarWallet.address 
                    ? window.stellarWallet.address 
                    : null;
                
                const mappedEntries = entries.map(e => {
                    const isCurrentPlayer = playerAddr && e.address === playerAddr;
                    return {
                        rank: e.rank,
                        address: isCurrentPlayer ? "YOU (" + window.stellarWallet._short(e.address) + ")" : window.stellarWallet._short(e.address),
                        fullAddress: e.address,
                        score: e.score,
                        level: e.level,
                        isCurrentPlayer: isCurrentPlayer
                    };
                });

                if (playerAddr && pbScore > 0 && !mappedEntries.some(e => e.isCurrentPlayer)) {
                    mappedEntries.push({
                        rank: 0,
                        address: "YOU (" + window.stellarWallet._short(playerAddr) + ")",
                        fullAddress: playerAddr,
                        score: pbScore,
                        level: pbLevel,
                        isCurrentPlayer: true
                    });
                    mappedEntries.sort((a, b) => b.score - a.score);
                    mappedEntries.forEach((item, idx) => {
                        item.rank = idx + 1;
                    });
                }
                
                this.renderLeaderboard(mappedEntries);
            }
        } catch (err) {
            console.error("Error refreshing leaderboard:", err);
            loadingEl.style.display = 'none';
            errorEl.style.display = 'flex';
        }
    }

    renderLeaderboard(entries) {
        const tableWrapperEl = document.getElementById('leaderboard-table-wrapper');
        const bodyEl = document.getElementById('leaderboard-body');
        
        bodyEl.innerHTML = '';
        
        if (entries.length === 0) {
            document.getElementById('leaderboard-empty').style.display = 'flex';
            return;
        }
        
        const walletMap = StellarWallet.getWalletMap();

        entries.forEach(e => {
            const tr = document.createElement('tr');
            if (e.isCurrentPlayer) {
                tr.classList.add('current-player-row');
            }

            let rankClass = 'rank-other';
            if (e.rank === 1) rankClass = 'rank-1';
            else if (e.rank === 2) rankClass = 'rank-2';
            else if (e.rank === 3) rankClass = 'rank-3';

            const walletId = e.fullAddress ? walletMap[e.fullAddress] : null;
            const walletBadge = walletId
                ? `<span class="wallet-tag">${StellarWallet.walletLabel(walletId)}</span>`
                : '';

            tr.innerHTML = `
                <td class="${rankClass}"><span class="rank-badge">${e.rank}</span></td>
                <td><span class="player-addr">${e.address}</span>${walletBadge}</td>
                <td><span class="player-score">${e.score}</span></td>
                <td><span class="player-level">Lv ${e.level}</span></td>
            `;
            bodyEl.appendChild(tr);
        });
        
        tableWrapperEl.style.display = 'block';
    }

    async switchCategory(category) {
        // Note: even if `category` matches this.currentCategory, a real
        // switch must still happen when leaving Daily Challenge mode —
        // currentCategory is left untouched while a daily run is active.
        if (category === this.currentCategory && this.tilesData.length > 0 && !this.isDailyChallenge) {
            document.getElementById('category-modal-backdrop').classList.remove('active');
            return;
        }

        this.isDailyChallenge = false;
        this.updateDailyBanner();

        this.sound.play('select');
        document.getElementById('category-modal-backdrop').classList.remove('active');

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('current');
        });
        const btnId = `cat-btn-${category}`;
        const targetBtn = document.getElementById(btnId);
        if (targetBtn) targetBtn.classList.add('current');

        const tagBtn = document.getElementById('category-tag-btn');
        if (tagBtn) {
            const prettyNames = {
                general: 'General',
                science: 'Science',
                math: 'Mathematics',
                history: 'History',
                anime: 'Anime Series',
                technology: 'Technology',
                novel: 'Novels',
                'filipino-movies': 'Filipino Movies'
            };
            tagBtn.innerText = `Category: ${prettyNames[category] || category}`;
        }

        this.currentCategory = category;
        this.winStreak = 0;
        if (this.streakElement) this.streakElement.innerText = this.winStreak;

        const streakBubble = document.querySelector('.streak-bubble');
        if (streakBubble) streakBubble.classList.remove('streak-glow-active');

        // Clear pre-fetched data since we changed category
        this.prefetchedData = null;

        // Clean current tiles
        this.tilesData.forEach(t => t.element.remove());
        this.tilesData = [];

        await this.runLoadingScreen(this.initLevel());
    }

    // --- Daily Challenge ---
    // A deterministic word, the same for every player on a given day, drawn
    // from the existing offline `general` dictionary (no network calls —
    // instant start, no loading screen needed). Reuses buildLevelArchetype()
    // for tile/board setup exactly like a regular level does.

    _addrKey() {
        return (window.stellarWallet && window.stellarWallet.address) || 'anon';
    }

    _dailyPool() {
        if (!this._dailyWordPool) {
            // Flatten all difficulty tiers of the general dictionary into one
            // pool (33 words) so the daily word varies in length day to day
            // and the cycle is longer than any single tier alone.
            this._dailyWordPool = Object.values(this.dictionary.general).flat();
        }
        return this._dailyWordPool;
    }

    startDailyChallenge() {
        const dropdown = document.getElementById('menu-dropdown');
        dropdown?.classList.remove('open');
        dropdown?.closest('.header-container')?.classList.remove('menu-open');

        const dayIndex = Math.floor(Date.now() / 86400000);
        this.dailyDayIndex = dayIndex;
        this.isDailyChallenge = true;

        const streakData = JSON.parse(localStorage.getItem(`ws_daily_streak_${this._addrKey()}`) || 'null') || { count: 0, lastDayIndex: -1 };
        this.dailyStreak = streakData.count;

        // Already solved today — show the stored result instead of a fresh board.
        const stored = JSON.parse(localStorage.getItem(`ws_daily_result_${this._addrKey()}`) || 'null');
        if (stored && stored.dayIndex === dayIndex) {
            this.showDailyAlreadyCompleted(stored);
            return;
        }

        this.sound.play('select');

        const pool = this._dailyPool();
        const word = pool[dayIndex % pool.length].toUpperCase();
        this.targetWord = word;

        this.wordClue = `Today's Daily Challenge — a word starting with '${word[0]}' and ending with '${word[word.length - 1]}'.`;
        this.fetchDictionaryDefinition(word).then(resolvedClue => {
            if (resolvedClue && this.isDailyChallenge && this.targetWord === word) {
                this.wordClue = this.censorWordInClue(resolvedClue, this.targetWord);
                this.updateClueUI();
            }
        });

        let scrambled = word;
        let attempts = 0;
        while (scrambled === word && attempts < 100) {
            scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
            attempts++;
        }
        this.scrambledWord = scrambled;

        this.boardOccupants = Array(100).fill(null);
        this.rackSlots = Array(word.length).fill(null);

        const isVertical = Math.random() > 0.5;
        const len = word.length;
        let startRow, startCol;
        if (isVertical) {
            startRow = Math.floor(Math.random() * (10 - len));
            startCol = Math.floor(Math.random() * 10);
        } else {
            startRow = Math.floor(Math.random() * 10);
            startCol = Math.floor(Math.random() * (10 - len));
        }
        this.targetCellIndices = [];
        for (let j = 0; j < len; j++) {
            const r = isVertical ? startRow + j : startRow;
            const c = isVertical ? startCol : startCol + j;
            this.targetCellIndices.push(r * 10 + c);
        }

        this.buildLevelArchetype();

        this.clueLevel = 1;
        this.clue3Exhausted = false;
        this.showingPureDefinition = false;
        this.updateClueUI();

        this.resetVictoryScreenUI();
        this.updateDailyBanner();
    }

    exitDailyChallenge() {
        this.isDailyChallenge = false;
        this.updateDailyBanner();
        this.resetVictoryScreenUI();
        this.victoryScreen.classList.remove('active');
        this.runLoadingScreen(this.initLevel());
    }

    updateDailyBanner() {
        const banner = document.getElementById('daily-banner');
        if (!banner) return;
        if (this.isDailyChallenge) {
            banner.style.display = 'flex';
            const textEl = document.getElementById('daily-banner-text');
            if (textEl) textEl.innerText = `📅 Daily #${this.dailyDayIndex} · 🔥 ${this.dailyStreak || 0}`;
        } else {
            banner.style.display = 'none';
        }
    }

    // hintsUsed: 0, 1, or 2 (derived from clueLevel at the moment of winning)
    buildDailyEmojiGrid(hintsUsed) {
        const total = 3;
        const clean = Math.max(0, total - hintsUsed);
        return '🟩'.repeat(clean) + '🟨'.repeat(total - clean);
    }

    completeDailyChallenge() {
        const hintsUsed = Math.min(2, Math.max(0, this.clueLevel - 1));
        const addrKey = this._addrKey();

        const streakData = JSON.parse(localStorage.getItem(`ws_daily_streak_${addrKey}`) || 'null') || { count: 0, lastDayIndex: -1 };
        if (streakData.lastDayIndex === this.dailyDayIndex - 1) {
            streakData.count += 1;
        } else if (streakData.lastDayIndex !== this.dailyDayIndex) {
            streakData.count = 1;
        }
        streakData.lastDayIndex = this.dailyDayIndex;
        localStorage.setItem(`ws_daily_streak_${addrKey}`, JSON.stringify(streakData));
        this.dailyStreak = streakData.count;

        const result = { dayIndex: this.dailyDayIndex, word: this.targetWord, hintsUsed, streak: streakData.count };
        localStorage.setItem(`ws_daily_result_${addrKey}`, JSON.stringify(result));
        this._lastDailyResult = result;

        document.getElementById('victory-title').innerText = 'Daily Challenge Complete!';
        document.getElementById('victory-subtitle').innerText = `You solved Day #${result.dayIndex} — "${result.word}"`;
        document.getElementById('daily-emoji-grid').innerText = this.buildDailyEmojiGrid(hintsUsed);
        document.getElementById('daily-share-block').style.display = 'flex';
        document.getElementById('victory-next-btn').style.display = 'none';

        this.updateDailyBanner();
    }

    showDailyAlreadyCompleted(stored) {
        this.dailyStreak = stored.streak;
        this._lastDailyResult = stored;

        this.resetVictoryScreenUI();
        document.getElementById('victory-title').innerText = 'Already Solved Today!';
        document.getElementById('victory-subtitle').innerText = `Day #${stored.dayIndex} — "${stored.word}" · Come back tomorrow for a new word.`;
        document.getElementById('daily-emoji-grid').innerText = this.buildDailyEmojiGrid(stored.hintsUsed);
        document.getElementById('daily-share-block').style.display = 'flex';
        document.getElementById('victory-next-btn').style.display = 'none';

        this.victoryScreen.classList.add('active');
        this.updateDailyBanner();
    }

    shareDailyResult() {
        const result = this._lastDailyResult;
        if (!result) return;
        const grid = this.buildDailyEmojiGrid(result.hintsUsed);
        const text = `Word Scramble Daily #${result.dayIndex}\n${grid}\n🔥 Streak: ${result.streak}\n${window.location.origin}`;

        if (navigator.share) {
            navigator.share({ text }).catch(() => {});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                window.stellarWallet?._showStatus('Result copied to clipboard!', 'success');
            });
        }
    }

    // Restores the victory screen's default (non-daily) content. Called at
    // win-time for a regular solve, in case a previous Daily Challenge win
    // left it showing daily-specific text.
    resetVictoryScreenUI() {
        const titleEl = document.getElementById('victory-title');
        const subEl = document.getElementById('victory-subtitle');
        const shareBlock = document.getElementById('daily-share-block');
        const nextBtn = document.getElementById('victory-next-btn');
        if (titleEl) titleEl.innerText = 'Spectacular!';
        if (subEl) subEl.innerText = 'You have unscrambled the atomic matrix.';
        if (shareBlock) shareBlock.style.display = 'none';
        if (nextBtn) nextBtn.style.display = '';
    }

    async fetchDictionaryDefinition(word) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const defRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (defRes.ok) {
                const defData = await defRes.json();
                if (defData && defData[0] && defData[0].meanings && defData[0].meanings[0]) {
                    const firstMeaning = defData[0].meanings[0];
                    const firstDef = firstMeaning.definitions[0].definition;
                    return `[${firstMeaning.partOfSpeech}] ${firstDef}`;
                }
            }
        } catch (err) {
            console.log("Free Dictionary definition fetch failed (using fallback clue)");
        }
        return "";
    }

    async fetchWikipediaSummary(pageTitle, cleanWord) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                if (data && data.extract) {
                    return data.extract;
                }
            }
        } catch (err) {
            console.log("Wikipedia summary fetch failed (using fallback clue)");
        }
        return "";
    }

    censorWordInClue(clue, word) {
        if (!clue) return "";
        let censored = clue;
        const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regexWord = new RegExp(escapedWord, 'gi');
        censored = censored.replace(regexWord, '____');
        return censored;
    }

    triggerShockwave(force = false) {
        if (!force && !this.effectsSettings.shockwave) return;
        const board = document.getElementById('main-board');
        if (!board) return;

        const ring = document.createElement('div');
        ring.className = 'shockwave-ring';
        board.appendChild(ring);

        // Remove after animation completes (600ms)
        setTimeout(() => {
            ring.remove();
        }, 700);
    }

    openEffectsModal() {
        this.sound.play('select');
        
        // Sync toggles with current settings
        const switches = {
            shockwave: document.getElementById('fx-switch-shockwave'),
            particles: document.getElementById('fx-switch-particles'),
            bounce: document.getElementById('fx-switch-bounce'),
            scorePop: document.getElementById('fx-switch-scorePop'),
            wave: document.getElementById('fx-switch-wave'),
            streakFire: document.getElementById('fx-switch-streakFire'),
            victoryGlow: document.getElementById('fx-switch-victoryGlow')
        };
        for (const [key, element] of Object.entries(switches)) {
            if (element) {
                element.checked = this.effectsSettings[key];
            }
        }
        
        document.getElementById('effects-modal-backdrop').classList.add('active');
    }

    closeEffectsModal(event) {
        if (!event || event.target === document.getElementById('effects-modal-backdrop')) {
            this.sound.play('select');
            document.getElementById('effects-modal-backdrop').classList.remove('active');
        }
    }

    toggleEffect(effectKey) {
        this.sound.play('select');
        this.effectsSettings[effectKey] = !this.effectsSettings[effectKey];
        localStorage.setItem(`ws_fx_${effectKey}`, this.effectsSettings[effectKey]);

        const element = document.getElementById(`fx-switch-${effectKey}`);
        if (element) {
            element.checked = this.effectsSettings[effectKey];
        }

        // Performance Mode is CSS-driven (strips box-shadow/backdrop-filter
        // in bulk via style.css), unlike the other effects which are
        // JS-gated at their individual trigger sites.
        if (effectKey === 'performanceMode') {
            this._applyPerformanceModeAttr();
        }
    }

    _applyPerformanceModeAttr() {
        // setAttribute/removeAttribute (not toggleAttribute) to match the
        // convention used by theme/chip/font — and because the CSS selector
        // is body[data-performance-mode="true"], which toggleAttribute's
        // empty-string value would never match.
        if (this.effectsSettings.performanceMode) {
            document.body.setAttribute('data-performance-mode', 'true');
        } else {
            document.body.removeAttribute('data-performance-mode');
        }
    }

    previewVictoryEffect(type) {
        this.sound.play('win');

        if (type === 'shockwave' || type === 'all') {
            this.triggerShockwave(true); // force trigger
        }

        if (type === 'particles' || type === 'all') {
            const board = document.getElementById('main-board');
            if (board) {
                const rect = board.getBoundingClientRect();
                this.particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
        }

        if (type === 'streakFire' || type === 'all') {
            // Preview embers from the streak bubble
            const streakBubble = document.querySelector('.streak-bubble');
            if (streakBubble) {
                const rect = streakBubble.getBoundingClientRect();
                const startX = rect.left + rect.width / 2;
                const startY = rect.top + rect.height / 2;
                this.particles.streakEmberBurst(startX, startY, 40); // 40 embers for max streak preview

                // Temporarily add pulse glow class for 3 seconds
                streakBubble.classList.add('streak-glow-active');
                setTimeout(() => {
                    if (this.winStreak < 10) {
                        streakBubble.classList.remove('streak-glow-active');
                    }
                }, 3000);
            }
        }

        if (type === 'victoryGlow' || type === 'all') {
            // Temporarily show the main victory screen with the glowing h2 title
            if (this.victoryScreen) {
                this.victoryScreen.classList.add('victory-glow-active');
                this.victoryScreen.classList.add('active');
                setTimeout(() => {
                    this.victoryScreen.classList.remove('active');
                    this.victoryScreen.classList.remove('victory-glow-active');
                }, 3000);
            }
        }

        if (type === 'bounce' || type === 'all') {
            this.targetCellIndices.forEach((cellIdx, i) => {
                const tileObj = this.boardOccupants[cellIdx];
                if (tileObj && tileObj.element) {
                    setTimeout(() => {
                        tileObj.element.classList.add('bounce-active');
                        tileObj.element.addEventListener('animationend', () => {
                            tileObj.element.classList.remove('bounce-active');
                        }, { once: true });
                    }, i * 100);
                }
            });
        }

        if (type === 'scorePop' || type === 'all') {
            const scoreTextElem = document.getElementById('score-text');
            if (scoreTextElem) {
                const rect = scoreTextElem.getBoundingClientRect();
                const startX = rect.left + rect.width / 2;
                const startY = rect.top + rect.height / 2;
                this.particles.addFloatingText(`+100 PTS`, startX, startY, '#FFFFFF', 0, 'bold 20px Jost');
                this.particles.addFloatingText(`+20 STREAK`, startX, startY, '#FF9A6C', 120, 'bold 20px Jost');
            }
        }

        if (type === 'wave' || type === 'all') {
            this.triggerGridFlashWave();
        }

        // Trigger visual preview HUD
        if (type === 'shockwave') {
            this.showPreviewHUD('Shockwave Ring', 'shockwave');
        } else if (type === 'particles') {
            this.showPreviewHUD('Confetti Burst', 'particles');
        } else if (type === 'bounce') {
            this.showPreviewHUD('Bounce Cascade', 'bounce');
        } else if (type === 'scorePop') {
            this.showPreviewHUD('Score Pop-Up', 'scorePop');
        } else if (type === 'wave') {
            this.showPreviewHUD('Grid Flash Wave', 'wave');
        } else if (type === 'streakFire') {
            this.showPreviewHUD('Streak Fire', 'streakFire');
        } else if (type === 'victoryGlow') {
            this.showPreviewHUD('Victory Title Glow', 'victoryGlow');
        } else if (type === 'all') {
            this.showPreviewHUD('All Effects', 'all');
        }
    }

    showPreviewHUD(effectName, type) {
        const hud = document.getElementById('preview-hud');
        const title = document.getElementById('preview-hud-title');
        if (!hud || !title) return;

        title.textContent = effectName;
        hud.classList.add('active');

        // Stop any currently running mini particle animations and clear canvas
        if (this.miniParticles) {
            this.miniParticles.stop();
        }

        // Remove active class from mini victory title
        const miniTitle = document.getElementById('mini-victory-title');
        if (miniTitle) {
            miniTitle.classList.remove('active');
        }

        // Trigger corresponding mini animations based on type
        if (type === 'shockwave' || type === 'all') {
            this.triggerMiniShockwave();
        }

        if (type === 'particles' || type === 'all') {
            if (this.miniParticles) {
                this.miniParticles.burst(127.5, 110);
            }
        }

        if (type === 'streakFire' || type === 'all') {
            if (this.miniParticles) {
                this.miniParticles.streakEmberBurst(225, 30, 20);
            }
            const miniStreak = document.getElementById('mini-streak-bubble');
            if (miniStreak) {
                miniStreak.classList.add('streak-glow-active');
                setTimeout(() => miniStreak.classList.remove('streak-glow-active'), 3000);
            }
        }

        if (type === 'victoryGlow' || type === 'all') {
            if (miniTitle) {
                miniTitle.classList.add('active');
                setTimeout(() => miniTitle.classList.remove('active'), 3000);
            }
        }

        if (type === 'bounce' || type === 'all') {
            const miniRack = document.getElementById('mini-rack');
            if (miniRack) {
                Array.from(miniRack.children).forEach((tile, i) => {
                    setTimeout(() => {
                        tile.classList.add('mini-bounce-active');
                        tile.addEventListener('animationend', () => {
                            tile.classList.remove('mini-bounce-active');
                        }, { once: true });
                    }, i * 100);
                });
            }
        }

        if (type === 'scorePop' || type === 'all') {
            if (this.miniParticles) {
                this.miniParticles.addFloatingText(`+100 PTS`, 30, 30, '#FFFFFF', 0, 'bold 12px Jost');
                this.miniParticles.addFloatingText(`+20 STREAK`, 30, 30, '#FF9A6C', 120, 'bold 12px Jost');
            }
        }

        if (type === 'wave' || type === 'all') {
            const miniGrid = document.getElementById('mini-grid');
            if (miniGrid) {
                const cells = Array.from(miniGrid.children);
                const centerRow = 2;
                const centerCol = 2;
                cells.forEach((cell, idx) => {
                    const r = Math.floor(idx / 5);
                    const c = idx % 5;
                    const dist = Math.abs(r - centerRow) + Math.abs(c - centerCol);
                    const delay = (dist / 4) * 250;
                    setTimeout(() => {
                        cell.classList.add('flash-active');
                        setTimeout(() => cell.classList.remove('flash-active'), 50);
                    }, delay);
                });
            }
        }

        if (this.hudTimeout) clearTimeout(this.hudTimeout);
        this.hudTimeout = setTimeout(() => this.closePreviewHUD(), 3500);
    }

    triggerMiniShockwave() {
        const wrapper = document.querySelector('.mini-board-wrapper');
        if (!wrapper) return;
        const ring = document.createElement('div');
        ring.className = 'mini-shockwave-ring';
        wrapper.appendChild(ring);
        setTimeout(() => ring.remove(), 700);
    }

    closePreviewHUD() {
        const hud = document.getElementById('preview-hud');
        if (hud) hud.classList.remove('active');
        if (this.miniParticles) {
            this.miniParticles.stop();
        }
    }

    triggerGridFlashWave() {
        if (!this.targetCellIndices || this.targetCellIndices.length === 0) return;

        const midIdx = this.targetCellIndices[Math.floor(this.targetCellIndices.length / 2)];
        const centerRow = Math.floor(midIdx / 10);
        const centerCol = midIdx % 10;

        const cells = Array.from(this.boardGrid.children);
        const cellData = cells.map((cell, idx) => {
            const r = Math.floor(idx / 10);
            const c = idx % 10;
            const dist = Math.abs(r - centerRow) + Math.abs(c - centerCol);
            return { element: cell, dist: dist };
        });

        const maxDist = Math.max(...cellData.map(c => c.dist));

        cellData.forEach(item => {
            const delay = (item.dist / maxDist) * 350; // max delay 350ms
            setTimeout(() => {
                item.element.classList.add('flash-active');
                setTimeout(() => {
                    item.element.classList.remove('flash-active');
                }, 50);
            }, delay);
        });
    }
}

// --- Header MENU dropdown ---
function toggleHeaderMenu(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('menu-dropdown');
    const isOpen = dropdown.classList.toggle('open');
    dropdown.closest('.header-container').classList.toggle('menu-open', isOpen);
    document.getElementById('menu-toggle-btn').setAttribute('aria-expanded', isOpen);
}

// Close the menu when clicking anywhere else (menu items bubble here too,
// so picking an action closes the panel before its modal opens)
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('menu-dropdown');
    if (dropdown && dropdown.classList.contains('open') && !e.target.closest('#menu-toggle-btn')) {
        dropdown.classList.remove('open');
        dropdown.closest('.header-container').classList.remove('menu-open');
        document.getElementById('menu-toggle-btn').setAttribute('aria-expanded', 'false');
    }
});

// Instantiate game engine on DOMContentLoaded
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new TeakScrambleGame();
    // `let game` is a lexical global, not a window property — stellar.js
    // checks window.game for the wallet session-resume hook, so expose it.
    window.game = game;
});
