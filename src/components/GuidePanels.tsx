import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import * as m from 'motion/react-m';
import { useHeader } from '../store/header';
import { useGameInstance } from '../legacy/useGame';
import type { LegacyGame } from '../legacy/bridge';

type Toggle = 'toggleInstructions' | 'toggleHintGuide';

const toggle = (game: LegacyGame | null, method: Toggle, show: boolean) =>
    (game?.[method] as ((s: boolean) => void) | undefined)?.call(game, show);

/** Renders into a legacy-layout slot (`.rx-slot` in index.html) when it exists. */
function Slot({ id, children }: { id: string; children: ReactNode }) {
    const [el] = useState(() => document.getElementById(id));
    return el ? createPortal(children, el) : null;
}

/**
 * How to Play (left) and Hint Guide (right) cards, plus the pills that bring
 * them back once hidden. They keep the legacy ids/classes, so the theme CSS
 * and the desktop/phone layout rules in style.css apply unchanged.
 */
export function GuidePanels() {
    const game = useGameInstance();
    const { panels } = useHeader();

    return (
        <>
            <Slot id="rx-panel-toggles">
                <div className="panel-toggle-row">
                    <button
                        type="button"
                        id="show-instructions-btn"
                        className={`panel-toggle-tab left-tab${panels.instructions ? ' hidden' : ''}`}
                        onClick={() => toggle(game, 'toggleInstructions', true)}
                        title="Show How to Play"
                    >
                        📖 How to Play
                    </button>
                    <button
                        type="button"
                        id="show-hints-btn"
                        className={`panel-toggle-tab right-tab${panels.hints ? ' hidden' : ''}`}
                        onClick={() => toggle(game, 'toggleHintGuide', true)}
                        title="Show Hint Guide"
                    >
                        💡 Hint Guide
                    </button>
                </div>
            </Slot>

            <Slot id="rx-instructions-panel">
                <GuidePanel
                    id="instructions-panel"
                    title="How to Play"
                    shown={panels.instructions}
                    from={-12}
                    onHide={() => toggle(game, 'toggleInstructions', false)}
                    extra={
                        <button type="button" className="rx-updates-btn" onClick={() => game?.openChangelogModal()}>
                            Updates
                        </button>
                    }
                >
                    <li>
                        <span className="step-num">1</span>
                        <div><strong>Solve the Scramble:</strong> Drag-and-drop or tap tiles to place them on the highlighted grid slots.</div>
                    </li>
                    <li>
                        <span className="step-num">2</span>
                        <div><strong>Get Hints:</strong> Click <em>Definition</em> (free) to reveal the word's meaning, or <em>Hint</em> to lock a correct tile (costs 10 pts).</div>
                    </li>
                    <li>
                        <span className="step-num">3</span>
                        <div>
                            <strong>Submit:</strong> Complete the word and click <em>Submit</em> to advance levels! Build a <strong>Win Streak</strong> for bonus points: +10 (1–5), +20 (6–10), +30 (11–15), +50 (16+).
                        </div>
                    </li>
                </GuidePanel>
            </Slot>

            <Slot id="rx-hint-panel">
                <GuidePanel
                    id="hint-info-panel"
                    title="Hint Guide"
                    shown={panels.hints}
                    from={12}
                    onHide={() => toggle(game, 'toggleHintGuide', false)}
                >
                    <li>
                        <span className="step-num">1</span>
                        <div><strong>First Letter Only:</strong> The hint only reveals and locks the first letter of the word to keep the scramble challenging.</div>
                    </li>
                    <li>
                        <span className="step-num">2</span>
                        <div><strong>Cost &amp; Logic:</strong> Each hint costs <strong>10 points</strong>. If the word is wrong, the hint stays on the board.</div>
                    </li>
                    <li>
                        <span className="step-num">3</span>
                        <div><strong>Persistence:</strong> Locked hints will not return to the rack on a Reset or wrong submission.</div>
                    </li>
                </GuidePanel>
            </Slot>
        </>
    );
}

interface GuidePanelProps {
    id: 'instructions-panel' | 'hint-info-panel';
    title: string;
    shown: boolean;
    /** Horizontal offset (px) the card slides in from. */
    from: number;
    onHide: () => void;
    extra?: ReactNode;
    children: ReactNode;
}

function GuidePanel({ id, title, shown, from, onHide, extra, children }: GuidePanelProps) {
    return (
        // Remounting on show replays the entrance; while hidden the element
        // stays in the DOM (display:none via .hidden-panel) like the legacy card.
        <m.div
            key={shown ? 'shown' : 'hidden'}
            id={id}
            className={`${id} rx-guide-panel${shown ? '' : ' hidden-panel'}`}
            initial={shown ? { opacity: 0, x: from } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
            <div className="rx-guide-head">
                <h3>{title}</h3>
                <div className="rx-guide-actions">
                    {extra}
                    <button type="button" className="panel-hide-btn" onClick={onHide} title={`Hide ${title}`}>
                        ✕ Hide
                    </button>
                </div>
            </div>
            <ul>{children}</ul>
        </m.div>
    );
}
