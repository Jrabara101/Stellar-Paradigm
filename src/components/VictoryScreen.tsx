import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { useVictory, type Breakdown } from '../store/victory';
import { useGameInstance } from '../legacy/useGame';
import type { LegacyGame } from '../legacy/bridge';

const call = (game: LegacyGame | null, name: string) => (game?.[name] as (() => void) | undefined)?.call(game);

// The entrance runs on CSS keyframes (react.css: .vx-title / .vx-rise /
// .vx-slide), started by the overlay's `active` class. They animate only
// transform + opacity, so the GPU plays them without any per-frame work on
// the main thread; the Motion version spun up a dozen JS animations in the
// same frame the overlay appeared. Same choreography: children stagger by
// 0.12s after 0.15s, the score rows stagger again inside the breakdown.
const STAGGER = 0.12;
const LEAD = 0.15;
const at = (i: number): CSSProperties => ({ '--d': `${(LEAD + i * STAGGER).toFixed(2)}s` }) as CSSProperties;
const rowAt = (parent: number, j: number): CSSProperties =>
    ({ '--d': `${(LEAD + parent * STAGGER + LEAD + j * STAGGER).toFixed(2)}s` }) as CSSProperties;

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
            {/* Re-adding `active` restarts the CSS entrance; on close the content
                stays put while the overlay fades out. */}
            <div className="victory-box">
                {/* data-text feeds the opacity-only glow layer (h2::after in style.css). */}
                <h2 id="victory-title" className="vx-title" style={at(0)} data-text={daily ? content.title : 'Spectacular!'}>
                    {daily ? content.title : 'Spectacular!'}
                </h2>
                <p className="vx-rise" style={at(1)}>
                    {daily ? content.subtitle : 'You have unscrambled the atomic matrix.'}
                </p>

                {daily ? (
                    <div className="daily-share-block vx-rise" style={{ display: 'flex', ...at(2) }}>
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
                    </div>
                ) : (
                    <>
                        <ScoreBreakdown breakdown={breakdown} open={open} />
                        <button type="button" className="victory-btn vx-rise" style={at(3)} onClick={() => call(game, 'generateVictoryCard')}>
                            🖼️ Share Card
                        </button>
                        <button ref={primaryRef} type="button" className="victory-btn vx-rise" style={at(4)} onClick={() => call(game, 'nextLevel')}>
                            Next Scramble
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function ScoreBreakdown({ breakdown, open }: { breakdown: Breakdown | null; open: boolean }) {
    if (!breakdown) return <div className="victory-score-breakdown" id="victory-breakdown" />;
    const { basePoints, streakBonus, combo, streakLabel, winStreak, achievements } = breakdown;
    const total = basePoints + streakBonus;
    let j = 0;
    return (
        <div className="victory-score-breakdown" id="victory-breakdown">
            <div className="breakdown-row vx-slide" style={rowAt(2, j++)}>
                <span>Word Solved{combo > 1 ? ` (${combo}x combo)` : ''}</span>
                <span>+{basePoints}</span>
            </div>
            {streakBonus > 0 && (
                <div className="breakdown-row streak-row vx-slide" style={rowAt(2, j++)}>
                    <span>{streakLabel} x{winStreak}</span>
                    <span>+{streakBonus}</span>
                </div>
            )}
            {achievements.map((label) => (
                <div key={label} className="breakdown-row achievement-row vx-slide" style={rowAt(2, j++)}>
                    <span>{label}</span>
                    <span>NEW!</span>
                </div>
            ))}
            <div className="breakdown-divider vx-rise" style={rowAt(2, j++)} />
            <div className="breakdown-row total-row vx-slide" style={rowAt(2, j++)}>
                <span>Points Earned</span>
                <span>+<CountUp to={total} run={open} /></span>
            </div>
        </div>
    );
}

/**
 * Counts up to `to` once `run` turns on (shows the final value under reduced
 * motion). Writes the number straight into its text node each frame instead
 * of re-rendering React ~40 times while the overlay animates in.
 */
function CountUp({ to, run }: { to: number; run: boolean }) {
    const ref = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        if (ref.current) ref.current.textContent = String(to);
    }, [to]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (!run || reduce) {
            el.textContent = String(to);
            return;
        }
        let frame = 0;
        let shown = -1;
        const start = performance.now() + 450; // land after the rows above
        const duration = 650;
        const tick = (now: number) => {
            const t = Math.min(1, Math.max(0, (now - start) / duration));
            const v = Math.round(to * (1 - Math.pow(1 - t, 3)));
            if (v !== shown) {
                el.textContent = String(v);
                shown = v;
            }
            if (t < 1) frame = requestAnimationFrame(tick);
        };
        el.textContent = '0';
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [to, run]);

    return <span ref={ref} className="vx-count" />;
}
