import { Fragment, useCallback } from 'react';
import * as m from 'motion/react-m';
import { Modal } from './Modal';
import { CHANGELOG } from '../data/changelog';
import { ui, useModalOpen } from '../store/ui';
import { whenGameReady } from '../legacy/bridge';

/** Renders `*emphasis*` spans from the changelog data. */
function RichText({ text }: { text: string }) {
    const parts = text.split(/\*(.+?)\*/g);
    return (
        <>
            {parts.map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>))}
        </>
    );
}

export function ChangelogModal() {
    const open = useModalOpen('changelog');
    const close = useCallback(() => {
        void whenGameReady().then((g) => g.sound.play('select'));
        ui.close('changelog');
    }, []);

    return (
        <Modal open={open} onClose={close} panelClassName="changelog-modal rx-changelog" labelledBy="rx-changelog-title">
            <h3 id="rx-changelog-title">Game Updates</h3>
            <div className="changelog-content">
                {CHANGELOG.map((v, i) => (
                    <m.div
                        key={v.version}
                        className="changelog-version"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        // Only the first few cards are visible on open; stagger those
                        // and let the rest appear instantly so scrolling never waits.
                        transition={{ delay: i < 4 ? 0.08 + i * 0.06 : 0, duration: 0.28 }}
                    >
                        <h4>{v.version}{v.title && ` - ${v.title}`}</h4>
                        <ul>
                            {v.items.map((item, j) => (
                                <li key={j}>
                                    {item.label && <strong>{item.label}:</strong>} <RichText text={item.text} />
                                </li>
                            ))}
                        </ul>
                    </m.div>
                ))}
            </div>
            <m.button className="changelog-close-btn" onClick={close} whileTap={{ scale: 0.97 }}>
                Close
            </m.button>
        </Modal>
    );
}
