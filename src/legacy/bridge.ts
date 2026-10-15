// Typed bridge to the legacy TeakScrambleGame instance (public/script.js).
//
// During the staged port the legacy engine still owns the board, drag/drop,
// scoring and wallet flow. React takes over one surface at a time by
// overriding the matching instance methods here, so every legacy caller
// (inline onclick="game.x()", entrance-load sequence, wallet-guide.js…) is
// redirected to React without touching script.js.

export interface LegacyGame {
    sound: { play(type: string, opt?: unknown): void };
    effectsSettings: { haptics: boolean; [key: string]: unknown };
    isDailyChallenge: boolean;
    currentTheme?: string;

    openChangelogModal(): void;
    closeChangelogModal(event?: Event | null): void;
    dismissOnboarding(event?: Event | null): void;
    exitDailyChallenge(): void;
    applyTheme(themeId: string, animate?: boolean): void;
    _vibrate(pattern: number | number[]): void;

    // Any other legacy method, looked up dynamically (e.g. close<Name>Modal).
    [method: string]: unknown;
}

declare global {
    interface Window {
        game?: LegacyGame;
        showWalletGuide?: (manualOpen?: boolean) => void;
    }
}

let readyPromise: Promise<LegacyGame> | null = null;

/** Resolves once script.js has constructed `window.game` (on DOMContentLoaded). */
export function whenGameReady(): Promise<LegacyGame> {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise((resolve) => {
        const check = () => {
            if (window.game) {
                resolve(window.game);
                return true;
            }
            return false;
        };
        if (check()) return;
        // script.js instantiates in its own DOMContentLoaded listener, which
        // was registered before ours, so by the time ours fires it exists.
        // The interval is a fallback for dev-server HMR reloads.
        document.addEventListener('DOMContentLoaded', () => { check(); }, { once: true });
        const timer = window.setInterval(() => {
            if (check()) window.clearInterval(timer);
        }, 50);
    });
    return readyPromise;
}

/** Calls a legacy method by name if it exists. Returns true when it was called. */
export function callLegacy(game: LegacyGame, method: string, ...args: unknown[]): boolean {
    const fn = game[method];
    if (typeof fn !== 'function') return false;
    (fn as (...a: unknown[]) => unknown).apply(game, args);
    return true;
}
