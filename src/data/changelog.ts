// Extracted from the legacy #changelog-modal-backdrop markup (Stage 1 of the React port).
// `*text*` marks an emphasised span.
export interface ChangelogItem { label: string; text: string }
export interface ChangelogVersion { version: string; title: string; items: ChangelogItem[] }

export const CHANGELOG: ChangelogVersion[] = [
    {
        "version": "v2.0.0",
        "title": "Scramble Board, New Themes & Big Polish Update 🎲✨",
        "items": [
            {
                "label": "New Game Mode",
                "text": "Open ☰ Menu → *Scramble Board* for a full 15×15 tile-laying board game — a fresh way to play, separate from the classic word scramble."
            },
            {
                "label": "Colored Premium Board",
                "text": "A proper 15×15 board with Triple/Double Word and Triple/Double Letter squares and a ★ center start — build words across the grid for big scores."
            },
            {
                "label": "2–4 Players",
                "text": "Play against 1, 2, or 3 opponents, and choose Easy, Medium, or Hard before each match."
            },
            {
                "label": "Roll the Dice",
                "text": "Every match opens with a dice roll to decide turn order — highest roll plays first."
            },
            {
                "label": "Opponents From the Leaderboard",
                "text": "Your AI rivals are drawn from real wallets on the on-chain leaderboard (practice bots fill in as a fallback). Their racks stay hidden — you never see an opponent's letters."
            },
            {
                "label": "Real Word Validation",
                "text": "Every word you play is checked against a 168,000-word dictionary built right into the game, so it works fully offline once loaded."
            },
            {
                "label": "Race to Win",
                "text": "First player to reach the target score wins. Land all 7 tiles in one turn for a +50 *bingo* bonus."
            },
            {
                "label": "In-Game Dictionary",
                "text": "Look up any word from inside a match — instantly see whether it's playable and read its definition."
            },
            {
                "label": "Word Finder Helper",
                "text": "Stuck? Tap *Find Word* to highlight the best play your rack and the board can make — three hints per match."
            },
            {
                "label": "Dark Mode",
                "text": "A new Midnight Walnut theme, a header sun/moon quick-toggle, and a smart first-visit default that follows your device's dark mode setting."
            },
            {
                "label": "Stellar Cosmos Theme",
                "text": "A deep-space navy board with a nebula wash, a star-dot field, and glowing turquoise-accented tiles."
            },
            {
                "label": "Art Deco Lounge Theme",
                "text": "Emerald felt with a brass fan-ray motif and cream tiles trimmed in gold."
            },
            {
                "label": "Terrazzo & Cork Chips",
                "text": "Two new chip materials join the Customize Chips menu."
            },
            {
                "label": "Aurora Tile Effect",
                "text": "A shimmering northern-lights ribbon sweep — the game's first LEGEND-exclusive premium effect, unlocked at 1000+ points on the leaderboard."
            },
            {
                "label": "Streak Escalation",
                "text": "Hit a 10+ win streak and a warm ember glow spreads across the screen edges."
            },
            {
                "label": "Idle Tile Shimmer",
                "text": "A gentle light sweep across your rack after a short pause nudges you toward your next move."
            },
            {
                "label": "Drop Preview",
                "text": "See a faint letter preview in the slot you're dragging a tile toward before you let go."
            },
            {
                "label": "Achievement Badge Stamps",
                "text": "Unlocking an achievement now stamps a proper badge onto the screen instead of a plain status message."
            },
            {
                "label": "Smoother Board Scaling",
                "text": "The board and tiles now resize fluidly to fit your screen, from desktop down to the smallest phones."
            },
            {
                "label": "Audio Settings",
                "text": "A new Audio menu with independent Music and Sound Effects toggles and volume sliders."
            },
            {
                "label": "Redesigned Mobile Menus",
                "text": "On phones, menus now slide up from the bottom edge for easier one-handed reach."
            },
            {
                "label": "Haptic Feedback",
                "text": "A short vibration on tile placement and on winning, on supported devices (toggle in the Effects menu)."
            }
        ]
    },
    {
        "version": "v1.11.0",
        "title": "Autumn Theme, New Chips & Smarter Feedback",
        "items": [
            {
                "label": "Autumn Harvest Theme",
                "text": "A warm burnt-orange board with amber tiles joins the theme collection."
            },
            {
                "label": "New Chip Materials",
                "text": "Brass, Jade, and Mother-of-Pearl chips are now available in the Customize Chips menu."
            },
            {
                "label": "Bigger Daily Challenge",
                "text": "The daily word pool grew from 33 to over 1,100 curated words — years of dailies with no repeats."
            },
            {
                "label": "Near-Miss Feedback",
                "text": "Wrong guesses now flash correctly-placed letters amber (with a gentler sound) so you know what to keep."
            },
            {
                "label": "Golden Cascade",
                "text": "Solving a word sends a golden ripple across the board cells under the bouncing tiles."
            },
            {
                "label": "Score Odometer",
                "text": "Points now count up with a satisfying pulse instead of snapping to the new total."
            },
            {
                "label": "Streak Glow Tiers",
                "text": "The streak bubble now glows mustard at 3 wins, orange at 7, and catches fire at 10."
            },
            {
                "label": "New Sounds",
                "text": "Combo blips that rise with your multiplier, an achievement fanfare, and a daily-streak bell."
            },
            {
                "label": "Offline Fix",
                "text": "The Rustic theme no longer depends on remote images — every theme now works fully offline."
            }
        ]
    },
    {
        "version": "v1.10.0",
        "title": "Visual Polish, Achievements & Combo Scoring",
        "items": [
            {
                "label": "Tile Settle Physics",
                "text": "Tiles now bounce gently into place when dropped onto the board or rack."
            },
            {
                "label": "Premium Tile Effects",
                "text": "Volcanic Forge, Holographic, Ice Crystal, and Stained Glass tile effects are now unlockable for players holding a GOLD or LEGEND badge — None and Neon Arcade stay free."
            },
            {
                "label": "Shareable Victory Card",
                "text": "Turn any win — regular or Daily Challenge — into a shareable image with your word, score, streak, and badge tier."
            },
            {
                "label": "Ambient Backgrounds",
                "text": "Each board theme now has a subtle drifting glow behind the board (respects Performance Mode and reduced-motion settings)."
            },
            {
                "label": "Achievements",
                "text": "Earn one-time achievements for a no-hint solve and a sub-10-second solve, shown in the victory score breakdown."
            },
            {
                "label": "Combo Multiplier",
                "text": "Win two scrambles within 60 seconds of each other to build up to a 3x combo on your base score."
            }
        ]
    },
    {
        "version": "v1.9.0",
        "title": "Daily Challenge, Performance Mode & Onboarding",
        "items": [
            {
                "label": "Daily Challenge",
                "text": "A new word every day, the same for every player — accessible from ☰ Menu. Solve it, then share your result with a Wordle-style emoji grid showing how many hints you needed."
            },
            {
                "label": "Daily Streak",
                "text": "Come back each day to build a streak, shown right in the header while a Daily Challenge is active."
            },
            {
                "label": "Performance Mode",
                "text": "A new toggle in the Effects menu strips heavy shadows and blur for smoother play on slower devices."
            },
            {
                "label": "Welcome Onboarding",
                "text": "First-time visitors now see a quick \"how to play\" card explaining drag-and-drop and that a wallet is optional — connect anytime to save your score on-chain."
            }
        ]
    },
    {
        "version": "v1.8.2",
        "title": "Tile Font Picker",
        "items": [
            {
                "label": "Tile Font Picker",
                "text": "Choose your letter tile font in the Customize Chips menu — Classic (Jost), Typewriter (Courier Prime), Grotesk (Space Grotesk), and Modern Bold (Montserrat) are free and available immediately."
            },
            {
                "label": "Easy Read Font",
                "text": "Added OpenDyslexic as an accessibility-focused tile font option."
            },
            {
                "label": "Premium Fonts",
                "text": "Arcade (Bungee) and Retro Pixel (Press Start 2P) are unlockable tile fonts for players holding a GOLD or LEGEND badge on the on-chain leaderboard."
            },
            {
                "label": "Lazy Font Loading",
                "text": "Accessibility and premium fonts only download when you open Customize Chips or have one already selected — the initial page load stays untouched."
            }
        ]
    },
    {
        "version": "v1.8.1",
        "title": "Speed & Performance Update",
        "items": [
            {
                "label": "Installable App (PWA)",
                "text": "Word Scramble can now be installed to your home screen or desktop, with instant repeat loads and an offline game shell via a service worker."
            },
            {
                "label": "Smarter Live Updates",
                "text": "The on-chain event stream now polls every 5s only while the tab is visible, slows to 30s in background tabs, catches up instantly when you return, and stays fully paused until a wallet connects."
            },
            {
                "label": "Leaderboard Cache",
                "text": "Leaderboard reads are cached for 15 seconds and refresh automatically the moment any player submits a new score — reopening the leaderboard is now instant."
            },
            {
                "label": "Faster Wallet Connect",
                "text": "The connection to the wallet SDK's CDN is pre-warmed at page load, so the first \"Connect Wallet\" click resolves quicker."
            }
        ]
    },
    {
        "version": "v1.8.0",
        "title": "Interface Overhaul & Performance Update",
        "items": [
            {
                "label": "Header Menu Dropdown",
                "text": "The five header buttons (Category, Customize Board, Customize Chips, Leaderboard, Effects) are now collapsed into a single *☰ Menu* dropdown on all screen sizes, freeing up space above the board."
            },
            {
                "label": "Title & Navbar Fix",
                "text": "The page now grows and scrolls instead of clipping — the Word Scramble title no longer hides underneath the fixed wallet bar on any screen size."
            },
            {
                "label": "Clue Panel Overflow Fix",
                "text": "Long dictionary definitions wrap inside the clue card (matched to the board width) and scroll internally past 150px, instead of stretching the whole board sideways."
            },
            {
                "label": "Letter Rack Relocated",
                "text": "The tile rack moved from the bottom-right corner to sit centered directly below the board, with tiles enlarged from 38px to 52px (and bigger letters on mobile too)."
            },
            {
                "label": "Readable Side Panels",
                "text": "\"How to Play\" and \"Hint Guide\" cards widened to 340px with larger text (0.95rem), bigger headings, and larger step badges for readability."
            },
            {
                "label": "Smoother Touch & Drag",
                "text": "Touch listeners now attach only while dragging a tile (fixing a page-wide scroll-blocking violation), and drag snap-targets are measured once per drag instead of on every mouse move."
            },
            {
                "label": "Leaner Deployment",
                "text": "~87MB of non-runtime files (videos, documents, screenshots) are excluded from the live site deploy."
            }
        ]
    },
    {
        "version": "v1.7.0",
        "title": "Hybrid Save System",
        "items": [
            {
                "label": "Address-Keyed Autosave",
                "text": "In-progress game state (score, level, category, streak) is now saved to localStorage under your wallet address after every correct answer — no fee, instant."
            },
            {
                "label": "Session Resume",
                "text": "Reconnecting your wallet automatically restores your last in-progress level and score."
            },
            {
                "label": "On-Chain Source of Truth",
                "text": "Your all-time best score remains on the Soroban leaderboard; the personal best panel now uses the on-chain entry as an authoritative baseline."
            },
            {
                "label": "No Wallet, No Problem",
                "text": "Anonymous players still get local best-score tracking under a shared anonymous key."
            }
        ]
    },
    {
        "version": "v1.6.1",
        "title": "Sound Icon Alignment",
        "items": [
            {
                "label": "Sound Toggle Offset",
                "text": "Adjusted the fixed mute button down to top: 48px, ensuring it is no longer covered by the Stellar Wallet bar."
            }
        ]
    },
    {
        "version": "v1.6.0",
        "title": "Atomic Leaderboards & Personal Best Tracker",
        "items": [
            {
                "label": "On-Chain Leaderboard UI",
                "text": "View and fetch real-time player high scores directly from the Stellar Testnet (Soroban) smart contract."
            },
            {
                "label": "Personal Best Storage",
                "text": "Saves your highest score and maximum level locally using browser localStorage, integrating seamlessly with your connected on-chain identity."
            },
            {
                "label": "Mock Fallback Mechanics",
                "text": "Provides high-fidelity local high score rankings if the blockchain ledger is unreachable or empty."
            },
            {
                "label": "Metallic Rank Badges",
                "text": "Styled custom gold, silver, and bronze badges to highlight the top three leaderboard performers."
            }
        ]
    },
    {
        "version": "v1.5.0",
        "title": "Custom Chips, Background Music & Alignment Fixes",
        "items": [
            {
                "label": "8 Skeuomorphic Chip Materials",
                "text": "Customize your tiles via the new \"Customize Chips\" menu. Choose from Bone, Acrylic, Aluminum, Mahogany, Ebony, Vibrant Amber, Malachite, and Smoked Glass!"
            },
            {
                "label": "Dynamic Jazz Loop",
                "text": "A relaxing, dynamic bossa nova loop synthesized directly in your browser using the Web Audio API, controllable via the mute toggle."
            },
            {
                "label": "Tile Alignment Fix",
                "text": "Absolute coordinates are now calculated relative to the main body element, resolving the drift/alignment bug of letters on the board."
            },
            {
                "label": "Layout Stability",
                "text": "Fixed the clue panel height to prevent layout shifts when clues change or grow."
            }
        ]
    },
    {
        "version": "v1.4.0",
        "title": "Progressive Clue & Letter Lock System",
        "items": [
            {
                "label": "3-Stage Clue System",
                "text": "Definitions are now active by default as Clue 1. Progress to Clue 2 (first letter lock) and Clue 3 (Trump Card - first & last letter lock) on wrong guesses or hint clicks."
            },
            {
                "label": "Retro HUD Indicator Dots",
                "text": "3 visual glow indicators (green, amber, red/gold with pulse) show active clue levels in the monitored HUD panel."
            },
            {
                "label": "Point/Streak Mechanics",
                "text": "Requesting hints costs 10 pts but preserves win streaks. Wrong guesses lock letters for free but reset streaks."
            },
            {
                "label": "Definition Toggle",
                "text": "Clicking \"Word Hint\" toggles the display back to the definition at any time."
            }
        ]
    },
    {
        "version": "v1.3.0",
        "title": "Customizable Board & Wallpaper Themes",
        "items": [
            {
                "label": "Custom Board Themes",
                "text": "Open the \"Customize Board\" menu in the header to pick between 5 stunning aesthetics: Mid-Century Teak, Nordic Oak, Rustic Reclaimed, Vintage Parchment, and Coastal Driftwood."
            },
            {
                "label": "Complete Theme Overrides",
                "text": "Overrides page background wallpapers, board designs, grid cells, locked tiles, and button finishes to match the theme."
            },
            {
                "label": "Image Previews",
                "text": "Preview cards with screenshots to preview the design before activating."
            },
            {
                "label": "Persistent Styling",
                "text": "The custom board choice is saved in local browser storage to persist across sessions!"
            }
        ]
    },
    {
        "version": "v1.2.0",
        "title": "Win Streak Update",
        "items": [
            {
                "label": "Win Streak Counter",
                "text": "A new Streak bubble in the header tracks your consecutive correct answers."
            },
            {
                "label": "Tiered Streak Bonuses",
                "text": "Win multiple rounds without a mistake to earn bonus points per solve — +10 (1–5), +20 (6–10), +30 (11–15), +50 (16+ wins)."
            },
            {
                "label": "Score Breakdown",
                "text": "The victory screen now shows a detailed breakdown of base points, streak tier, and total earned per round."
            },
            {
                "label": "Streak Reset",
                "text": "A wrong answer resets your streak. Switching category also resets it."
            }
        ]
    },
    {
        "version": "v1.1.0",
        "title": "Challenge & Hints Update",
        "items": [
            {
                "label": "First Letter Hint Lock",
                "text": "The Hint button now only reveals and locks the first letter to maintain a healthy puzzle challenge."
            },
            {
                "label": "Persistent Hints",
                "text": "Correctly placed hints stay locked on the board even if you submit an incorrect word or press Reset."
            },
            {
                "label": "Hint Guide Sidebar",
                "text": "A new desktop sidebar detailing point costs and hint rules."
            },
            {
                "label": "Interactive Changelog",
                "text": "Added this updates log to keep players informed of new features!"
            }
        ]
    },
    {
        "version": "v1.0.0",
        "title": "Teak Cabinet Launch",
        "items": [
            {
                "label": "Retro Teak Aesthetic",
                "text": "Beautiful Mid-Century Modern graphics with starburst pattern and brass accents."
            },
            {
                "label": "Web Audio Synthesizer",
                "text": "Immersive retro sounds generated dynamically in your browser."
            },
            {
                "label": "Canvas Particle Burst",
                "text": "Spectacular physics explosions on victory."
            },
            {
                "label": "Categories & APIs",
                "text": "Wikipedia and Dictionary APIs feed categories like Anime, Novels, and Filipino Movies."
            }
        ]
    }
];
