// Native (Capacitor / Android) integration. Everything here is a no-op on
// the web build; plugins are imported lazily so the web bundle stays lean.
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { callLegacy, whenGameReady, type LegacyGame } from '../legacy/bridge';
import { ui } from '../store/ui';

export const isNative = Capacitor.isNativePlatform();

const noop = () => {};

export async function initNative() {
    if (!isNative) return;
    document.documentElement.dataset.native = Capacitor.getPlatform();

    const { SplashScreen } = await import('@capacitor/splash-screen');
    // launchAutoHide is off (no flash of an unstyled page), so the splash
    // MUST come down even if something below throws or the game never boots.
    const fallback = window.setTimeout(() => SplashScreen.hide().catch(noop), 6000);
    try {
        await setUp();
    } finally {
        window.clearTimeout(fallback);
        await SplashScreen.hide({ fadeOutDuration: 250 }).catch(noop);
    }
}

async function setUp() {
    const [{ App }, { Haptics, ImpactStyle, NotificationType }] = await Promise.all([
        import('@capacitor/app'),
        import('@capacitor/haptics'),
    ]);

    const game = await whenGameReady();

    // ── Haptics: route the legacy navigator.vibrate() calls through the
    // native engine (navigator.vibrate is unreliable inside Android WebViews).
    // Short pulses become a light impact; patterns (win) a success notification.
    game._vibrate = (pattern) => {
        if (!game.effectsSettings.haptics) return;
        const pulse = Array.isArray(pattern)
            ? Haptics.notification({ type: NotificationType.Success })
            : Haptics.impact({ style: pattern >= 20 ? ImpactStyle.Medium : ImpactStyle.Light });
        pulse.catch(noop);
    };

    // ── System bars: the app is edge-to-edge (enforced from Android 16), so
    // the native bar can't be coloured. A fixed strip painted with the active
    // theme's --teak-dark sits under it instead (see .rx-statusbar-scrim in
    // react.css), with light icons on top.
    const scrim = document.createElement('div');
    scrim.className = 'rx-statusbar-scrim';
    document.body.appendChild(scrim);
    SystemBars.setStyle({ style: SystemBarsStyle.Dark }).catch(noop);

    // ── Android back button: peel back one layer at a time, then background the app.
    App.addListener('backButton', () => {
        if (!handleBack(game)) App.minimizeApp().catch(noop);
    }).catch(noop);

    // Dev-only hook so the back-button chain can be exercised from a browser
    // (tree-shaken out of production builds).
    if (import.meta.env.DEV) {
        (window as unknown as { __wsBack: () => boolean }).__wsBack = () => handleBack(game);
    }
}

/** Closes the top-most open layer. Returns false when there was nothing to close. */
function handleBack(game: LegacyGame): boolean {
    // 1. React-owned modals.
    if (ui.closeTop()) return true;

    // 2. Header ☰ menu dropdown.
    const menu = document.getElementById('menu-dropdown');
    if (menu?.classList.contains('open')) {
        document.getElementById('menu-toggle-btn')?.click();
        return true;
    }

    // 3. Wallet guide overlay.
    const guide = document.getElementById('wallet-guide-modal');
    if (guide?.classList.contains('wallet-guide-overlay--open')) {
        guide.querySelector<HTMLElement>('.wallet-guide-close')?.click();
        return true;
    }

    // 4. Scramble Board: info sheets first, then exit the mode.
    for (const [backdrop, closeBtn] of [['scr-dict-backdrop', 'scr-dict-close'], ['scr-rules-backdrop', 'scr-rules-close']]) {
        if (document.getElementById(backdrop)?.classList.contains('active')) {
            document.getElementById(closeBtn)?.click();
            return true;
        }
    }
    if (document.getElementById('scr-setup-backdrop')?.classList.contains('active')) {
        document.getElementById('scr-setup-cancel')?.click();
        return true;
    }
    if (document.getElementById('scramble-overlay')?.classList.contains('active')) {
        document.getElementById('scr-exit-btn')?.click();
        return true;
    }

    // 5. Legacy .modal-backdrop modals — the last one in the DOM is on top.
    //    "<name>-modal-backdrop" maps to game.close<Name>Modal(null).
    const open = [...document.querySelectorAll<HTMLElement>('.modal-backdrop.active:not(.rx-backdrop)')];
    const top = open[open.length - 1];
    if (top) {
        const name = top.id.replace(/-modal-backdrop$/, '');
        const method = name === 'onboarding' ? 'dismissOnboarding' : `close${pascal(name)}Modal`;
        if (!callLegacy(game, method, null)) top.classList.remove('active');
        return true;
    }

    // 6. Daily Challenge → back to classic play.
    if (game.isDailyChallenge) {
        game.exitDailyChallenge();
        return true;
    }
    return false;
}

const pascal = (s: string) => s.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());
