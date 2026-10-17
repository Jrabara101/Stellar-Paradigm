// Redirects legacy surfaces that have been ported to React. Each override
// replaces an instance method, so every existing caller — inline onclick
// handlers in index.html (the ☰ menu items), the entrance-load sequence in
// runLoadingScreen(), other legacy methods — reaches the React version.
import type { LegacyGame } from './bridge';
import { bumpGame } from './useGame';
import { ui, type ModalId } from '../store/ui';
import { requestRefresh } from '../store/refresh';

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

    // Data views now fetch and render in React.
    game.refreshLeaderboard = () => requestRefresh('leaderboard');
    game.refreshCredentials = () => requestRefresh('credentials');

    // Legacy UI-sync helpers for markup that no longer exists; their state
    // changes still need to reach React.
    for (const name of ['updateTileFontModalUI', 'updateTileEffectsModalHighlight', '_updateResetUI']) {
        g[name] = bumpGame;
    }
}
