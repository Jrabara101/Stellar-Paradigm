// Reading legacy game state from React. The engine mutates plain fields on
// `window.game`, so React re-reads them whenever something bumps the version:
// every React-initiated action (via `act`), and the legacy events that change
// what a menu shows (wallet connect/badges, theme quick-toggle, …).
import { useEffect, useState, useSyncExternalStore } from 'react';
import { whenGameReady, type LegacyGame } from './bridge';

let version = 0;
const listeners = new Set<() => void>();

/** Tells React the game state changed. */
export function bumpGame() {
    version++;
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** The game instance once script.js has built it (null before that). */
export function useGameInstance(): LegacyGame | null {
    const [game, setGame] = useState<LegacyGame | null>(() => window.game ?? null);
    useEffect(() => {
        if (!game) void whenGameReady().then(setGame);
    }, [game]);
    return game;
}

/** Subscribes the component to game-state bumps; returns the game. */
export function useGame(): LegacyGame | null {
    useSyncExternalStore(subscribe, () => version);
    return useGameInstance();
}

/** Runs a legacy action, then re-renders anything reading game state. */
export function act<T>(fn: () => T): T {
    try {
        return fn();
    } finally {
        bumpGame();
    }
}
