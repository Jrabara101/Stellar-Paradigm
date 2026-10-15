// Redirects legacy surfaces that have been ported to React. Each override
// replaces an instance method, so every existing caller — inline onclick
// handlers in index.html, the entrance-load sequence in runLoadingScreen(),
// other legacy scripts — reaches the React version automatically.
import type { LegacyGame } from './bridge';
import { ui } from '../store/ui';

export function installOverrides(game: LegacyGame) {
    // Changelog modal (Stage 1 pilot port).
    game.openChangelogModal = () => {
        game.sound.play('select');
        ui.open('changelog');
    };
    game.closeChangelogModal = () => {
        ui.close('changelog');
    };
}
