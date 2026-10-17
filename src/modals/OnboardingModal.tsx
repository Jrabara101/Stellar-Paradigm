import { useCallback } from 'react';
import { Modal } from '../components/Modal';
import { ui } from '../store/ui';
import { playSound } from '../legacy/sound';

/** First-visit "how to play" card. Dismissing it hands off to the category picker. */
export function OnboardingModal() {
    const dismiss = useCallback(() => {
        playSound('select');
        ui.close('onboarding');
        localStorage.setItem('ws_onboarding_seen', 'true');
        // Let a brand-new player pick a category right away instead of silently
        // defaulting to General (mismatched-category words are what make
        // definitions look "broken" to a first-timer).
        window.setTimeout(() => window.game?.openCategoryModal(true), 300);
    }, []);

    return (
        <Modal
            id="onboarding"
            panelClassName="theme-modal"
            panelStyle={{ maxWidth: 420, textAlign: 'center' }}
            labelledBy="rx-onboarding-title"
            onDismiss={dismiss}
        >
            <h3 id="rx-onboarding-title">Welcome to Word Scramble! 👋</h3>
            <p className="rx-copy">
                Drag or tap the wooden tiles onto the highlighted board slots to unscramble the word. Stuck? Use{' '}
                <strong>Hint</strong> (locks a letter, -10pts) or <strong>Definition</strong> (free) for help.
            </p>
            <p className="rx-copy">
                <strong>No wallet needed to play!</strong> Jump right in — connect one anytime to save your score on-chain and
                earn badges.
            </p>
            <button type="button" className="theme-close-btn" onClick={dismiss}>
                Got It — Let&apos;s Play!
            </button>
        </Modal>
    );
}
