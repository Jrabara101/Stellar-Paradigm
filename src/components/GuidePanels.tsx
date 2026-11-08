import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import * as m from 'motion/react-m';
import { Modal } from './Modal';
import { ui, type ModalId } from '../store/ui';
import { playSound } from '../legacy/sound';
import { useGameInstance } from '../legacy/useGame';

/** Renders into a legacy-layout slot (`.rx-slot` in index.html) when it exists. */
function Slot({ id, children }: { id: string; children: ReactNode }) {
    const [el] = useState(() => document.getElementById(id));
    return el ? createPortal(children, el) : null;
}

const open = (id: ModalId) => {
    playSound('select');
    ui.open(id);
};

/**
 * How to Play / Hint Guide. The two pills always sit side by side above the
 * board; each opens its guide as a pop-up (bottom sheet on phones), so the
 * game layout never shifts. Both start closed on every visit.
 */
export function GuidePanels() {
    const game = useGameInstance();

    return (
        <>
            <Slot id="rx-panel-toggles">
                <div className="panel-toggle-row">
                    <button
                        type="button"
                        id="rx-how-to-play-btn"
                        className="panel-toggle-tab left-tab"
                        onClick={() => open('howToPlay')}
                        aria-haspopup="dialog"
                    >
                        📖 How to Play
                    </button>
                    <button
                        type="button"
                        id="rx-hint-guide-btn"
                        className="panel-toggle-tab right-tab"
                        onClick={() => open('hintGuide')}
                        aria-haspopup="dialog"
                    >
                        💡 Hint Guide
                    </button>
                </div>
            </Slot>

            <GuideModal
                id="howToPlay"
                title="How to Play"
                tone="how"
                extra={
                    <button
                        type="button"
                        className="rx-updates-btn"
                        onClick={() => {
                            ui.close('howToPlay');
                            game?.openChangelogModal();
                        }}
                    >
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
            </GuideModal>

            <GuideModal id="hintGuide" title="Hint Guide" tone="hint">
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
            </GuideModal>
        </>
    );
}

interface GuideModalProps {
    id: 'howToPlay' | 'hintGuide';
    title: string;
    /** Accent: mustard for How to Play, turquoise for the Hint Guide. */
    tone: 'how' | 'hint';
    extra?: ReactNode;
    children: ReactNode;
}

function GuideModal({ id, title, tone, extra, children }: GuideModalProps) {
    const titleId = `rx-${id}-title`;
    const close = () => {
        playSound('select');
        ui.close(id);
    };
    return (
        <Modal id={id} panelClassName={`rx-guide-modal rx-guide-modal--${tone}`} labelledBy={titleId}>
            <div className="rx-guide-head">
                <h3 id={titleId}>{title}</h3>
                <div className="rx-guide-actions">{extra}</div>
            </div>
            <ul className="rx-guide-steps">{children}</ul>
            <m.button type="button" className="rx-guide-close" onClick={close} whileTap={{ scale: 0.97 }}>
                Got it
            </m.button>
        </Modal>
    );
}
