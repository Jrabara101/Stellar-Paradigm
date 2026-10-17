import * as m from 'motion/react-m';
import { Modal } from '../components/Modal';
import { ui, useModalPayload } from '../store/ui';
import { act, useGame } from '../legacy/useGame';

export const CATEGORIES: { id: string; name: string }[] = [
    { id: 'general', name: 'General' },
    { id: 'science', name: 'Science' },
    { id: 'math', name: 'Mathematics' },
    { id: 'history', name: 'History' },
    { id: 'anime', name: 'Anime Series' },
    { id: 'technology', name: 'Technology' },
    { id: 'programming', name: 'Programming' },
    { id: 'novel', name: 'Novels' },
    { id: 'filipino-movies', name: 'Filipino Movies' },
];

export function CategoryModal() {
    const game = useGame();
    const fromOnboarding = useModalPayload<boolean>('category') === true;
    const current = game?.currentCategory ?? 'general';

    const pick = (id: string) => {
        if (!game) return;
        ui.close('category');
        // switchCategory resets the streak and reloads the board (or does
        // nothing when re-picking the active category outside a Daily run).
        void act(() => game.switchCategory(id));
    };

    return (
        <Modal id="category" panelClassName="category-modal" labelledBy="rx-category-title">
            <h3 id="rx-category-title">Select Category</h3>
            {fromOnboarding && (
                <p className="category-modal-subtitle">
                    Pick what kind of words you&apos;d like to unscramble. You can always change this later from the ☰ Menu.
                </p>
            )}
            <div className="category-grid">
                {CATEGORIES.map((c, i) => (
                    <m.button
                        key={c.id}
                        type="button"
                        className={`category-btn${c.id === current && !game?.isDailyChallenge ? ' current' : ''}`}
                        onClick={() => pick(c.id)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.03, duration: 0.22 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        {c.name}
                    </m.button>
                ))}
            </div>
        </Modal>
    );
}
