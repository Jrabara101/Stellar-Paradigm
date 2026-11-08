// Victory overlay state (Stage 3). script.js still decides *when* a level is
// won; it reports what to show through the overrides in legacy/overrides.ts.
import { useSyncExternalStore } from 'react';

export interface Breakdown {
    basePoints: number;
    streakBonus: number;
    combo: number;
    /** e.g. "HOT STREAK (+10/win)" — empty when there is no streak bonus. */
    streakLabel: string;
    winStreak: number;
    achievements: string[];
}

export type VictoryContent =
    | { kind: 'regular' }
    | { kind: 'daily'; title: string; subtitle: string; emojiGrid: string };

interface VictoryState {
    open: boolean;
    glow: boolean;
    content: VictoryContent;
    breakdown: Breakdown | null;
    /** Bumped on every open so the entrance sequence replays. */
    seq: number;
}

// The closed overlay starts with a representative breakdown already laid out
// (it is invisible and inert until a win). The first layout of this text in
// a session is ~25x slower than later ones (font + text-shaping caches); doing
// it at startup, behind the loading screen, keeps the first victory smooth.
const WARMUP_BREAKDOWN: Breakdown = {
    basePoints: 300,
    streakBonus: 10,
    combo: 3,
    streakLabel: 'HOT STREAK (+10/win)',
    winStreak: 1,
    achievements: [],
};

let state: VictoryState = { open: false, glow: false, content: { kind: 'regular' }, breakdown: WARMUP_BREAKDOWN, seq: 0 };
const listeners = new Set<() => void>();

function setState(patch: Partial<VictoryState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export const victory = {
    getState: () => state,
    show() {
        if (!state.open) setState({ open: true, seq: state.seq + 1 });
    },
    hide() {
        if (state.open) setState({ open: false });
    },
    setGlow(glow: boolean) {
        if (state.glow !== glow) setState({ glow });
    },
    // While the overlay is closed, content changes are stored without a
    // render: script.js fills them in at the moment of the win (the busiest
    // frame of the celebration) and the overlay only opens ~1.2s later.
    // show() renders with whatever is stored by then.
    setContent(content: VictoryContent) {
        if (state.open) setState({ content });
        else state = { ...state, content };
    },
    setBreakdown(breakdown: Breakdown | null) {
        if (state.open) setState({ breakdown });
        else state = { ...state, breakdown };
    },
};

/**
 * Stands in for the legacy `game.victoryScreen` element: script.js toggles
 * the overlay with classList.add/remove('active' | 'victory-glow-active').
 */
export const victoryScreenProxy = {
    classList: {
        add: (...names: string[]) => names.forEach((n) => apply(n, true)),
        remove: (...names: string[]) => names.forEach((n) => apply(n, false)),
        toggle: (name: string, force?: boolean) => {
            const on = force ?? !victoryScreenProxy.classList.contains(name);
            apply(name, on);
            return on;
        },
        contains: (name: string) => (name === 'active' ? state.open : name === 'victory-glow-active' ? state.glow : false),
    },
};

function apply(name: string, on: boolean) {
    if (name === 'active') {
        if (on) victory.show();
        else victory.hide();
    } else if (name === 'victory-glow-active') {
        victory.setGlow(on);
    }
}

export function useVictory(): VictoryState {
    return useSyncExternalStore(subscribe, victory.getState);
}
