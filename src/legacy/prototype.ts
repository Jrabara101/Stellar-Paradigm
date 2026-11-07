// Prototype-level overrides: for legacy methods the TeakScrambleGame
// constructor itself calls, so they must be in place before the instance
// exists (instance overrides in overrides.ts land after construction).
// script.js (deferred) runs before this bundle and builds the game on
// DOMContentLoaded, which fires after both.
import { loading } from '../store/loading';
import type { LegacyGame } from './bridge';

declare global {
    interface Window {
        TeakScrambleGame?: { prototype: LegacyGame };
    }
}

export function patchLegacyPrototype() {
    const proto = window.TeakScrambleGame?.prototype;
    if (!proto) {
        console.error('TeakScrambleGame not found; legacy loading screen left unpatched');
        return;
    }

    // Loading overlay is React-owned (components/LoadingScreen.tsx).
    proto.runLoadingScreen = async function (this: LegacyGame, task: Promise<unknown>) {
        loading.start();
        try {
            await task;
        } catch (e) {
            console.error('Task failed during loading', e);
        } finally {
            loading.finish();
            setTimeout(() => {
                loading.hide();
                if (this.isEntranceLoad) {
                    this.isEntranceLoad = false;
                    setTimeout(() => {
                        // True first-time visitors see a quick welcome card
                        // instead of (and then before) the changelog.
                        if (!localStorage.getItem('ws_onboarding_seen')) {
                            (this.showOnboarding as () => void).call(this);
                        } else {
                            this.openChangelogModal();
                        }
                    }, 400);
                }
            }, 300);
        }
    };
}
