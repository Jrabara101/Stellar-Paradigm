import { useEffect, useLayoutEffect, useState } from 'react';
import { useLoading } from '../store/loading';

const STATUS_PHRASES = [
    'Accessing server core...',
    'Querying word database...',
    'Retrieving definitions...',
    'Compiling board matrix...',
    'Scrambling wooden tiles...',
];
const TILES = ['L', 'O', 'A', 'D', 'I', 'N', 'G'];

/**
 * Full-screen "mahogany board" shown while a level loads. The real work is
 * the task passed to runLoadingScreen(); the bar is a paced simulation that
 * creeps toward 90% and jumps to 100% when the task settles.
 */
export function LoadingScreen() {
    const { active, done, seq } = useLoading();
    // Tagged with the run they belong to, so a new run never shows the last one's values.
    const [run, setRun] = useState({ seq, progress: 0, phrase: -1 });
    const { progress, phrase } = run.seq === seq ? run : { progress: 0, phrase: -1 };

    useEffect(() => {
        if (!active || done) return;
        const bar = window.setInterval(() => {
            setRun((r) => {
                const p = r.seq === seq ? r.progress : 0;
                // Slower near the end for tension
                return { ...(r.seq === seq ? r : { seq, phrase: -1 }), progress: Math.min(90, p + Math.random() * (p > 85 ? 0.3 : 4)) };
            });
        }, 100);
        const status = window.setInterval(() => {
            setRun((r) => (r.seq === seq ? { ...r, phrase: r.phrase + 1 } : { seq, progress: 0, phrase: 0 }));
        }, 400);
        return () => {
            window.clearInterval(bar);
            window.clearInterval(status);
        };
    }, [active, done, seq]);

    // The overlay starts active, so it can take over from index.html's static boot cover.
    useLayoutEffect(() => {
        document.getElementById('boot-cover')?.remove();
    }, []);

    const pct = done ? 100 : Math.floor(progress);
    const statusText = done ? 'Completed!' : phrase < 0 ? 'Initializing...' : STATUS_PHRASES[phrase % STATUS_PHRASES.length];

    return (
        <div
            id="loading-screen"
            className={`loading-screen${active ? ' active' : ''}`}
            role={active ? 'status' : undefined}
            aria-live="polite"
            aria-hidden={!active}
            inert={!active}
        >
            <main>
                <div className="mahogany-frame">
                    <div className="frame-shadow" />
                    <h1 className="loading-title">
                        WORD
                        <br />
                        SCRAMBLE
                    </h1>
                    <div className="tiles-container" aria-hidden="true">
                        {TILES.map((letter, i) => (
                            <div key={i} className="loading-tile tile-anim" style={{ animationDelay: `${i * 0.1}s` }}>
                                {letter}
                            </div>
                        ))}
                    </div>
                    <div className="orbit-container" aria-hidden="true">
                        <div className="orbit-1" />
                        <div className="orbit-2" />
                        <div className="orbit-center">
                            <div className="nucleus" />
                        </div>
                    </div>
                    <div className="progress-wrapper">
                        <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                            <div className="progress-fill" id="loading-progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="progress-info">
                            <span id="loading-status-text">{statusText}</span>
                            <span id="loading-progress-percent">{pct}%</span>
                        </div>
                    </div>
                </div>
                <div className="tip-container">
                    <span className="tip-icon" aria-hidden="true">lightbulb</span>
                    <p className="tip-text">
                        DID YOU KNOW? <br />
                        Longer words grant bonus multipliers! Try to bridge multiple grid slots for massive score boosts.
                    </p>
                </div>
            </main>
        </div>
    );
}
