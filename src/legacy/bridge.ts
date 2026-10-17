// Typed bridge to the legacy TeakScrambleGame instance (public/script.js).
//
// During the staged port the legacy engine still owns the board, drag/drop,
// scoring and wallet flow. React takes over one surface at a time by
// overriding the matching instance methods (see overrides.ts), so every
// legacy caller (inline onclick="game.x()", the entrance-load sequence,
// wallet-guide.js…) is redirected to React without touching script.js.

export interface LegacySound {
    play(type: string, opt?: unknown): void;
    musicEnabled: boolean;
    sfxEnabled: boolean;
    musicVolumePct: number;
    sfxVolumePct: number;
    setMusicEnabled(enabled: boolean): void;
    setSfxEnabled(enabled: boolean): void;
    setMusicVolume(pct: number): void;
    setSfxVolume(pct: number): void;
}

export interface ApiSettings {
    wordsEnabled: boolean;
    wordsKey: string;
    wordnikEnabled: boolean;
    wordnikKey: string;
}

export interface LegacyGame {
    sound: LegacySound;
    effectsSettings: Record<string, boolean>;
    apiSettings: ApiSettings;
    isDailyChallenge: boolean;
    currentTheme: string;
    currentChipMaterial: string;
    currentTileFont: string;
    currentTileEffect: string;
    currentCategory: string;
    score: number;
    level: number;
    prefetchedData: unknown;

    openChangelogModal(): void;
    closeChangelogModal(event?: Event | null): void;
    dismissOnboarding(event?: Event | null): void;
    exitDailyChallenge(): void;
    applyTheme(themeId: string, animate?: boolean): void;
    switchTheme(themeId: string): void;
    switchChipMaterial(materialId: string): void;
    switchTileFont(fontId: string): void;
    switchTileEffect(effectId: string): void;
    switchCategory(category: string): Promise<void>;
    openCategoryModal(fromOnboarding?: boolean): void;
    openTileEffectsModal(): void;
    toggleEffect(key: string): void;
    previewVictoryEffect(type: string): void;
    confirmSelfReset(): void;
    confirmAdminReset(): void;
    isCosmeticUnlocked(): boolean;
    isLegendCosmeticUnlocked(): boolean;
    isTileFontUnlocked(): boolean;
    _ensureLazyThemeCSS(): void;
    _ensureLazyTileFonts(): void;
    _ensureQRCodeLib(): Promise<void>;
    _pbKey(addr: string | null): string;
    _pbLevelKey(addr: string | null): string;
    _vibrate(pattern: number | number[]): void;

    // Any other legacy method, looked up dynamically (e.g. close<Name>Modal).
    [method: string]: unknown;
}

export interface LeaderboardEntry {
    rank: number;
    address: string;
    score: number;
    level: number;
}

export interface Credential {
    id: string;
    cefrLevel: string;
    subject: string;
    score: number;
    timestamp: number;
}

export interface StellarWalletInstance {
    address: string | null;
    connected: boolean;
    cachedBadges: string[];
    fetchLeaderboard(): Promise<LeaderboardEntry[]>;
    fetchCredentials(): Promise<Credential[]>;
    _short(address: string): string;
    _showStatus(message: string, kind: 'info' | 'success' | 'error'): void;
}

declare global {
    interface Window {
        game?: LegacyGame;
        stellarWallet?: StellarWalletInstance;
        StellarWallet?: {
            getWalletMap(): Record<string, string>;
            walletLabel(walletId: string): string;
        };
        STELLAR_CONFIG?: { rpcUrl?: string; credentialContractId?: string };
        showWalletGuide?: (manualOpen?: boolean) => void;
        qrcode?: (typeNumber: number, level: string) => {
            addData(data: string): void;
            make(): void;
            getModuleCount(): number;
            isDark(row: number, col: number): boolean;
        };
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
