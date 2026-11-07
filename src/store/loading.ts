// Loading overlay state (Stage 3). The legacy runLoadingScreen(task) is
// replaced on the game's prototype (legacy/prototype.ts) and only reports
// start / finish here; LoadingScreen.tsx animates the progress itself.
import { useSyncExternalStore } from 'react';

interface LoadingState {
    active: boolean;
    done: boolean;
    /** Bumped on every start so the progress restarts from 0. */
    seq: number;
}

// Starts active: the TeakScrambleGame constructor always ends by running the
// entrance load, and starting covered keeps the bare board out of the very
// first paint (React renders before DOMContentLoaded builds the game).
let state: LoadingState = { active: true, done: false, seq: 0 };
let started = false;
const listeners = new Set<() => void>();

function setState(patch: Partial<LoadingState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export const loading = {
    getState: () => state,
    start: () => {
        started = true;
        setState({ active: true, done: false, seq: state.seq + 1 });
    },
    finish: () => setState({ done: true }),
    hide: () => setState({ active: false }),
};

export function useLoading(): LoadingState {
    return useSyncExternalStore(subscribe, loading.getState);
}

// Safety net: if the game never starts a load (script.js failed to build
// it), don't leave the page covered forever.
window.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => {
        if (!started) loading.hide();
    }, 8000);
});
