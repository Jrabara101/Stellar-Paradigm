// Header state owned by React since Stage 3: the ☰ menu's open flag, which
// side panels / stat bubbles are shown, and whether Scramble Board is still
// lazy-loading. The legacy engine reports panel changes through
// applyPanelVisibility (overridden in legacy/overrides.ts).
import { useSyncExternalStore } from 'react';

export type PanelId = 'instructions' | 'hints' | 'stats';

interface HeaderState {
    menuOpen: boolean;
    panels: Record<PanelId, boolean>;
    scrambleLoading: boolean;
}

// script.js applies the saved visibility in its constructor, before the
// overrides are installed, so start from the same localStorage keys.
const saved = (key: string) => {
    try {
        return localStorage.getItem(key) === 'true';
    } catch {
        return false;
    }
};

let state: HeaderState = {
    menuOpen: false,
    panels: {
        instructions: saved('scramble_show_instructions'),
        hints: saved('scramble_show_hints'),
        stats: saved('scramble_show_stats'),
    },
    scrambleLoading: false,
};
const listeners = new Set<() => void>();

function setState(patch: Partial<HeaderState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export const header = {
    getState: () => state,
    setMenuOpen(open: boolean) {
        if (state.menuOpen !== open) setState({ menuOpen: open });
    },
    setPanel(panel: PanelId, shown: boolean) {
        if (state.panels[panel] !== shown) setState({ panels: { ...state.panels, [panel]: shown } });
    },
    /** Re-reads saved visibility after script.js's one-off defaults reset (ws_ui_defaults_v2). */
    syncFromStorage() {
        setState({
            panels: {
                instructions: saved('scramble_show_instructions'),
                hints: saved('scramble_show_hints'),
                stats: saved('scramble_show_stats'),
            },
        });
    },
    setScrambleLoading(loading: boolean) {
        setState({ scrambleLoading: loading });
    },
};

export function useHeader(): HeaderState {
    return useSyncExternalStore(subscribe, header.getState);
}
