import { Modal } from '../components/Modal';
import { PickerGrid } from '../components/PickerGrid';
import { TILE_EFFECTS } from '../data/pickers';
import { ui } from '../store/ui';
import { act, useGame } from '../legacy/useGame';
import { playSound } from '../legacy/sound';

/** GOLD-or-LEGEND tile effects, and the LEGEND-only tier above them. */
const PREMIUM_EFFECTS = ['volcanic', 'holographic', 'ice-crystal', 'stained-glass'];
const LEGEND_EFFECTS = ['aurora'];

export function TileEffectsModal() {
    const game = useGame();
    const goldUnlocked = game?.isCosmeticUnlocked() ?? false;
    const legendUnlocked = game?.isLegendCosmeticUnlocked() ?? false;

    const isLocked = (id: string) =>
        (LEGEND_EFFECTS.includes(id) && !legendUnlocked) || (PREMIUM_EFFECTS.includes(id) && !goldUnlocked);

    const pick = (id: string) => {
        if (!game) return;
        const locked = isLocked(id);
        // A locked pick shows the badge requirement and keeps the picker open.
        act(() => game.switchTileEffect(id));
        if (!locked) ui.close('tileEffects');
    };

    return (
        <Modal id="tileEffects" panelClassName="theme-modal" labelledBy="rx-tile-effects-title">
            <h3 id="rx-tile-effects-title">Select Custom Tile Effect</h3>
            <PickerGrid items={TILE_EFFECTS} currentId={game?.currentTileEffect ?? 'none'} isLocked={isLocked} onPick={pick} />
            <button
                type="button"
                className="theme-close-btn"
                style={{ marginTop: 20 }}
                onClick={() => {
                    playSound('select');
                    ui.close('tileEffects');
                }}
            >
                Close Menu
            </button>
        </Modal>
    );
}
