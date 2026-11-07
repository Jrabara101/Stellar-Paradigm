// Redirects legacy surfaces that have been ported to React. Each override
// replaces an instance method, so every existing caller — inline onclick
// handlers in index.html (the ☰ menu items), the entrance-load sequence in
// runLoadingScreen(), other legacy methods — reaches the React version.
import { flushSync } from 'react-dom';
import type { LegacyGame } from './bridge';
import { bumpGame } from './useGame';
import { ui, type ModalId } from '../store/ui';
import { requestRefresh } from '../store/refresh';
import { header, type PanelId } from '../store/header';
import { victory, victoryScreenProxy } from '../store/victory';

/** Legacy open<Name>Modal / close<Name>Modal pairs and the React modal each now opens. */
const MODALS: [legacyName: string, id: ModalId][] = [
    ['Changelog', 'changelog'],
    ['Category', 'category'],
    ['Theme', 'theme'],
    ['Chip', 'chip'],
    ['TileEffects', 'tileEffects'],
    ['ApiSettings', 'apiSettings'],
    ['Leaderboard', 'leaderboard'],
    ['Credentials', 'credentials'],
    ['GetApp', 'getApp'],
    ['Effects', 'effects'],
    ['Audio', 'audio'],
];

export function installOverrides(game: LegacyGame) {
    const g = game as unknown as Record<string, unknown>;

    for (const [name, id] of MODALS) {
        g[`open${name}Modal`] = (payload?: unknown) => {
            game.sound.play('select');
            bumpGame(); // re-read wallet badges, current theme, etc.
            ui.open(id, payload);
        };
        // Legacy callers pass a click event (backdrop) or null (button);
        // React handles its own backdrop, so any call means "close".
        g[`close${name}Modal`] = () => ui.dismiss(id);
    }

    // Onboarding (first visit) — its dismissal chains into the category picker.
    game.showOnboarding = () => ui.open('onboarding');
    game.dismissOnboarding = () => ui.dismiss('onboarding');

    // The category picker shows a "you can change this later" subtitle when
    // it is opened by the onboarding hand-off.
    game.openCategoryModal = (fromOnboarding = false) => {
        game.sound.play('select');
        bumpGame();
        ui.open('category', fromOnboarding === true);
    };

    // Header ☰ menu + guide panels (Stage 3) read panel visibility from the
    // header store. The How to Play / Hint Guide panels are React-owned, so
    // only the stat bubbles still need the legacy DOM update. flushSync makes
    // the panels re-render before the caller re-measures tile positions.
    header.syncFromStorage();
    const applyPanelVisibility = game.applyPanelVisibility as (panel: PanelId, show: boolean) => void;
    g.applyPanelVisibility = (panel: PanelId, show: boolean) => {
        if (panel === 'stats') applyPanelVisibility.call(game, panel, show);
        flushSync(() => header.setPanel(panel, show));
    };
    // The legacy toggles read the panels' hidden-panel class; use the store.
    const togglePanel = (panel: PanelId, storageKey: string) => (forceState?: boolean) => {
        const next = typeof forceState === 'boolean' ? forceState : !header.getState().panels[panel];
        (g.applyPanelVisibility as (p: PanelId, s: boolean) => void)(panel, next);
        localStorage.setItem(storageKey, String(next));
        game.sound?.play('select');
        (g.syncViewPositions as (animate: boolean) => void).call(game, false);
        (g.checkViewportFit as () => void).call(game);
    };
    g.toggleInstructions = togglePanel('instructions', 'scramble_show_instructions');
    g.toggleHintGuide = togglePanel('hints', 'scramble_show_hints');
    const startScrambleBoard = game.startScrambleBoard as () => Promise<void>;
    g.startScrambleBoard = async () => {
        header.setScrambleLoading(true);
        try {
            await startScrambleBoard.call(game);
        } finally {
            header.setScrambleLoading(false);
        }
    };

    installVictoryOverrides(game, g);

    // Data views now fetch and render in React.
    game.refreshLeaderboard = () => requestRefresh('leaderboard');
    game.refreshCredentials = () => requestRefresh('credentials');

    // Legacy UI-sync helpers for markup that no longer exists; their state
    // changes still need to reach React.
    for (const name of ['updateTileFontModalUI', 'updateTileEffectsModalHighlight', '_updateResetUI']) {
        g[name] = bumpGame;
    }
}

interface DailyResult {
    dayIndex: number;
    word: string;
    hintsUsed: number;
    streak: number;
}

/**
 * Victory overlay (Stage 3). script.js keeps the win logic; the overlay's
 * content moves to the victory store. completeDailyChallenge and
 * showDailyAlreadyCompleted wrote straight into the old markup, so they are
 * re-implemented here line for line (minus the DOM writes).
 */
function installVictoryOverrides(game: LegacyGame, g: Record<string, unknown>) {
    const fn = <A extends unknown[], R>(name: string) => (...args: A) => (g[name] as (...a: A) => R).call(game, ...args);
    const regular = () => victory.setContent({ kind: 'regular' });
    const addrKey = fn<[], string>('_addrKey');
    const emojiGrid = fn<[number], string>('buildDailyEmojiGrid');
    const updateDailyBanner = fn<[], void>('updateDailyBanner');

    g.victoryScreen = victoryScreenProxy;
    g.resetVictoryScreenUI = regular;
    g.updateVictoryBreakdown = (basePoints: number, streakBonus: number, combo = 1, achievements: { label: string }[] = []) => {
        const winStreak = g.winStreak as number;
        victory.setBreakdown({
            basePoints,
            streakBonus,
            combo,
            streakLabel: fn<[number], string>('getStreakTierLabel')(winStreak),
            winStreak,
            achievements: achievements.map((a) => a.label),
        });
    };

    g.completeDailyChallenge = () => {
        const hintsUsed = Math.min(2, Math.max(0, (g.clueLevel as number) - 1));
        const key = addrKey();
        const dayIndex = g.dailyDayIndex as number;

        const streakData = JSON.parse(localStorage.getItem(`ws_daily_streak_${key}`) || 'null') || { count: 0, lastDayIndex: -1 };
        if (streakData.lastDayIndex === dayIndex - 1) {
            streakData.count += 1;
        } else if (streakData.lastDayIndex !== dayIndex) {
            streakData.count = 1;
        }
        streakData.lastDayIndex = dayIndex;
        localStorage.setItem(`ws_daily_streak_${key}`, JSON.stringify(streakData));
        g.dailyStreak = streakData.count;

        const result: DailyResult = { dayIndex, word: g.targetWord as string, hintsUsed, streak: streakData.count };
        localStorage.setItem(`ws_daily_result_${key}`, JSON.stringify(result));
        g._lastDailyResult = result;

        // Streak bell after the win arpeggio rings out
        setTimeout(() => game.sound.play('chime'), 800);

        victory.setContent({
            kind: 'daily',
            title: 'Daily Challenge Complete!',
            subtitle: `You solved Day #${result.dayIndex} — "${result.word}"`,
            emojiGrid: emojiGrid(hintsUsed),
        });
        updateDailyBanner();
    };

    g.showDailyAlreadyCompleted = (stored: DailyResult) => {
        g.dailyStreak = stored.streak;
        g._lastDailyResult = stored;
        victory.setContent({
            kind: 'daily',
            title: 'Already Solved Today!',
            subtitle: `Day #${stored.dayIndex} — "${stored.word}" · Come back tomorrow for a new word.`,
            emojiGrid: emojiGrid(stored.hintsUsed),
        });
        victory.show();
        updateDailyBanner();
    };
}
