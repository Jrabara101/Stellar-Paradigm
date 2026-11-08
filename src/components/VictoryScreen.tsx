import { useEffect, useRef, useState } from 'react';
import * as m from 'motion/react-m';
import { useReducedMotion, type Variants } from 'motion/react';
import { useVictory, type Breakdown } from '../store/victory';
import { useGameInstance } from '../legacy/useGame';
import type { LegacyGame } from '../legacy/bridge';

const call = (game: LegacyGame | null, name: string) => (game?.[name] as (() => void) | undefined)?.call(game);

// The overlay itself fades with the legacy .victory-screen CSS; Motion only
// choreographs what happens inside the box once it is up.
const sequence: Variants = {
    hidden: {},
    shown: { transition: { delayChildren: 0.15, staggerChildren: 0.12 } },
};
const title: Variants = {
    hidden: { opacity: 0, y: -28, scale: 0.85 },
    shown: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 18 } },
};
const rise: Variants = {
    hidden: { opacity: 0, y: 12 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};
const slide: Variants = {
    hidden: { opacity: 0, x: -14 },
    shown: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

/** Win overlay: shown by script.js through game.victoryScreen (see store/victory.ts). */
export function VictoryScreen() {
    const game = useGameInstance();
    const { open, glow, content, breakdown, seq } = useVictory();
    const primaryRef = useRef<HTMLButtonElement>(null);
    const daily = content.kind === 'daily';

    // Hand keyboard focus to the main action once the sequence has played.
    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => primaryRef.current?.focus({ preventScroll: true }), 900);
        return () => window.clearTimeout(t);
    }, [open, seq]);

    return (
        <div
            id="victory-screen"
            className={`victory-screen${open ? ' active' : ''}${glow ? ' victory-glow-active' : ''}`}
            role={open ? 'dialog' : undefined}
            aria-modal={open || undefined}
            aria-labelledby="victory-title"
            aria-hidden={!open}
            inert={!open}
        >
            {/* Each open bumps seq, remounting the box so the sequence replays;
                on close the content stays put while the overlay fades out. */}
            <m.div key={seq} className="victory-box" variants={sequence} initial="hidden" animate="shown">
                {/* data-text feeds the opacity-only glow layer (h2::after in style.css). */}
                <m.h2 id="victory-title" variants={title} data-text={daily ? content.title : 'Spectacular!'}>
                    {daily ? content.title : 'Spectacular!'}
                </m.h2>
                <m.p variants={rise}>{daily ? content.subtitle : 'You have unscrambled the atomic matrix.'}</m.p>

                {daily ? (
                    <m.div className="daily-share-block" style={{ display: 'flex' }} variants={rise}>
                        <div className="daily-emoji-grid">{content.emojiGrid}</div>
                        <button ref={primaryRef} type="button" className="victory-btn" onClick={() => call(game, 'shareDailyResult')}>
                            📤 Share Result
                        </button>
                        <button type="button" className="victory-btn" onClick={() => call(game, 'generateVictoryCard')}>
                            🖼️ Share Card
                        </button>
                        <button type="button" className="daily-exit-btn" onClick={() => game?.exitDailyChallenge()}>
                            Back to Regular Play
                        </button>
                    </m.div>
                ) : (
                    <>
                        <ScoreBreakdown breakdown={breakdown} open={open} />
                        <m.button variants={rise} type="button" className="victory-btn" onClick={() => call(game, 'generateVictoryCard')}>
                            🖼️ Share Card
                        </m.button>
                        <m.button ref={primaryRef} variants={rise} type="button" className="victory-btn" onClick={() => call(game, 'nextLevel')}>
                            Next Scramble
                        </m.button>
                    </>
                )}
            </m.div>
        </div>
    );
}

function ScoreBreakdown({ breakdown, open }: { breakdown: Breakdown | null; open: boolean }) {
    if (!breakdown) return <div className="victory-score-breakdown" id="victory-breakdown" />;
    const { basePoints, streakBonus, combo, streakLabel, winStreak, achievements } = breakdown;
    const total = basePoints + streakBonus;
    return (
        <m.div className="victory-score-breakdown" id="victory-breakdown" variants={sequence}>
            <m.div className="breakdown-row" variants={slide}>
                <span>Word Solved{combo > 1 ? ` (${combo}x combo)` : ''}</span>
                <span>+{basePoints}</span>
            </m.div>
            {streakBonus > 0 && (
                <m.div className="breakdown-row streak-row" variants={slide}>
                    <span>{streakLabel} x{winStreak}</span>
                    <span>+{streakBonus}</span>
                </m.div>
            )}
            {achievements.map((label) => (
                <m.div key={label} className="breakdown-row achievement-row" variants={slide}>
                    <span>{label}</span>
                    <span>NEW!</span>
                </m.div>
            ))}
            <m.div className="breakdown-divider" variants={rise} />
            <m.div className="breakdown-row total-row" variants={slide}>
                <span>Points Earned</span>
                <span>+<CountUp to={total} run={open} /></span>
            </m.div>
        </m.div>
    );
}

/** Counts up to `to` once `run` turns on (shows the final value under reduced motion). */
function CountUp({ to, run }: { to: number; run: boolean }) {
    const reduce = useReducedMotion();
    const [value, setValue] = useState(to);
    useEffect(() => {
        if (!run || reduce) {
            setValue(to);
            return;
        }
        let frame = 0;
        const start = performance.now() + 450; // land after the rows above
        const duration = 650;
        const tick = (now: number) => {
            const t = Math.min(1, Math.max(0, (now - start) / duration));
            setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
            if (t < 1) frame = requestAnimationFrame(tick);
        };
        setValue(0);
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [to, run, reduce]);
    return <>{value}</>;
}
