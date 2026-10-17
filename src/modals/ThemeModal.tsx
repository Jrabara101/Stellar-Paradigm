import { useEffect } from 'react';
import { Modal } from '../components/Modal';
import { PickerGrid } from '../components/PickerGrid';
import { THEMES } from '../data/pickers';
import { ui, useModalOpen } from '../store/ui';
import { act, useGame } from '../legacy/useGame';
import { playSound } from '../legacy/sound';

export function ThemeModal() {
    const game = useGame();
    const open = useModalOpen('theme');

    // Non-teak themes live in the lazy themes.css; load it as soon as the
    // picker opens so a pick applies without a flash of unstyled board.
    useEffect(() => {
        if (open) game?._ensureLazyThemeCSS();
    }, [open, game]);

    const pick = (id: string) => {
        if (!game) return;
        act(() => game.switchTheme(id));
        ui.close('theme');
    };

    return (
        <Modal id="theme" panelClassName="theme-modal" labelledBy="rx-theme-title">
            <h3 id="rx-theme-title">Select Custom Board Theme</h3>
            <PickerGrid items={THEMES} currentId={game?.currentTheme ?? 'teak'} onPick={pick} />
            <button
                type="button"
                className="theme-close-btn"
                onClick={() => {
                    playSound('select');
                    ui.close('theme');
                }}
            >
                Close Theme Menu
            </button>
        </Modal>
    );
}
