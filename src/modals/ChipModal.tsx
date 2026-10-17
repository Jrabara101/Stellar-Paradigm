import { useEffect } from 'react';
import { Modal } from '../components/Modal';
import { PickerGrid } from '../components/PickerGrid';
import { CHIP_MATERIALS, TILE_FONTS } from '../data/pickers';
import { ui, useModalOpen } from '../store/ui';
import { act, useGame } from '../legacy/useGame';
import { playSound } from '../legacy/sound';

/** Premium tile fonts, unlocked by a GOLD or LEGEND leaderboard badge. */
const PREMIUM_FONTS = ['bungee', 'pressstart'];

export function ChipModal() {
    const game = useGame();
    const open = useModalOpen('chip');
    const fontsUnlocked = game?.isTileFontUnlocked() ?? false;

    // Accessibility + premium fonts are lazy; load them so previews render.
    useEffect(() => {
        if (open) game?._ensureLazyTileFonts();
    }, [open, game]);

    const pickMaterial = (id: string) => {
        if (!game) return;
        act(() => game.switchChipMaterial(id));
        ui.close('chip');
    };

    const pickFont = (id: string) => {
        if (!game) return;
        const locked = PREMIUM_FONTS.includes(id) && !fontsUnlocked;
        // A locked pick shows the "earn GOLD" status message and stays open.
        act(() => game.switchTileFont(id));
        if (!locked) ui.close('chip');
    };

    return (
        <Modal id="chip" panelClassName="theme-modal" labelledBy="rx-chip-title">
            <h3 id="rx-chip-title">Select Custom Chip Material</h3>
            <PickerGrid items={CHIP_MATERIALS} currentId={game?.currentChipMaterial ?? ''} onPick={pickMaterial} />
            <h3 className="rx-subheading">Select Tile Font</h3>
            <PickerGrid
                items={TILE_FONTS}
                currentId={game?.currentTileFont ?? 'jost'}
                isLocked={(id) => PREMIUM_FONTS.includes(id) && !fontsUnlocked}
                onPick={pickFont}
                delay={0.15}
            />
            <button
                type="button"
                className="theme-close-btn"
                onClick={() => {
                    playSound('select');
                    ui.close('chip');
                }}
            >
                Close Menu
            </button>
        </Modal>
    );
}
