import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { header, useHeader, type PanelId } from '../store/header';
import { bumpGame, useGame } from '../legacy/useGame';
import { CATEGORIES } from '../modals/CategoryModal';
import type { LegacyGame } from '../legacy/bridge';

interface MenuItem {
    id: string;
    label: string;
    run: (game: LegacyGame) => void;
    disabled?: boolean;
}

const call = (name: string) => (game: LegacyGame) => (game[name] as () => void).call(game);
const shownLabel = (shown: boolean) => (shown ? 'Shown' : 'Hidden');

/**
 * The ☰ Menu dropdown under the title. Rendered into the #rx-header-menu
 * slot that index.html leaves in the legacy header, so the header's layout
 * and theme styling (.menu-dropdown / .menu-panel / .menu-item) are unchanged.
 */
export function HeaderMenu() {
    const [slot] = useState(() => document.getElementById('rx-header-menu'));
    if (!slot) return null;
    return createPortal(<Menu slot={slot} />, slot);
}

function Menu({ slot }: { slot: HTMLElement }) {
    const game = useGame();
    const { menuOpen, panels, scrambleLoading } = useHeader();
    const rootRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    // The header grows a menu-open class (raises it above the board on phones).
    useEffect(() => {
        slot.closest('.header-container')?.classList.toggle('menu-open', menuOpen);
    }, [slot, menuOpen]);

    // Click anywhere outside, or Escape, closes the menu.
    useEffect(() => {
        if (!menuOpen) return;
        const onPointer = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) header.setMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                header.setMenuOpen(false);
                toggleRef.current?.focus();
            }
        };
        document.addEventListener('pointerdown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    const category = CATEGORIES.find((c) => c.id === game?.currentCategory)?.name ?? game?.currentCategory ?? 'General';
    const toggle = (panel: PanelId, method: string) => (g: LegacyGame) => (g[method] as (s: boolean) => void).call(g, !panels[panel]);

    const items: MenuItem[] = [
        { id: 'daily-challenge-btn', label: '📅 Daily Challenge', run: call('startDailyChallenge') },
        {
            id: 'scramble-board-btn',
            label: scrambleLoading ? '🎲 Loading…' : '🎲 Scramble Board',
            run: call('startScrambleBoard'),
            disabled: scrambleLoading,
        },
        { id: 'category-tag-btn', label: `Category: ${category}`, run: (g) => g.openCategoryModal() },
        { id: 'customize-tag-btn', label: 'Customize Board', run: call('openThemeModal') },
        { id: 'customize-chips-btn', label: 'Customize Chips', run: call('openChipModal') },
        { id: 'menu-toggle-instructions-btn', label: `📖 How to Play: ${shownLabel(panels.instructions)}`, run: toggle('instructions', 'toggleInstructions') },
        { id: 'menu-toggle-hints-btn', label: `💡 Hint Guide: ${shownLabel(panels.hints)}`, run: toggle('hints', 'toggleHintGuide') },
        { id: 'menu-toggle-stats-btn', label: `📊 Score Bubbles: ${shownLabel(panels.stats)}`, run: toggle('stats', 'toggleStats') },
        { id: 'leaderboard-btn', label: 'Leaderboard', run: call('openLeaderboardModal') },
        { id: 'credentials-btn', label: '🎓 My Credentials', run: call('openCredentialsModal') },
        { id: 'effects-btn', label: 'Effects', run: call('openEffectsModal') },
        { id: 'audio-settings-btn', label: '🔊 Audio', run: call('openAudioModal') },
        { id: 'api-settings-btn', label: '⚙️ API Settings', run: call('openApiSettingsModal') },
        { id: 'get-app-btn', label: '📱 Get Android App', run: call('openGetAppModal') },
    ];

    const onToggle = () => {
        // Re-read labels that legacy code changes without telling React
        // (e.g. the category restored from saved progress).
        if (!menuOpen) bumpGame();
        header.setMenuOpen(!menuOpen);
    };

    return (
        <div ref={rootRef} className={`menu-dropdown${menuOpen ? ' open' : ''}`}>
            <button
                ref={toggleRef}
                type="button"
                className="menu-toggle-btn"
                id="menu-toggle-btn"
                onClick={onToggle}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-controls="menu-panel"
            >
                ☰ Menu <span className="menu-caret">▾</span>
            </button>
            <div className="menu-panel" id="menu-panel" role="menu">
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className="menu-item"
                        data-menu={item.id}
                        role="menuitem"
                        disabled={item.disabled}
                        onClick={() => {
                            header.setMenuOpen(false);
                            if (game) item.run(game);
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
