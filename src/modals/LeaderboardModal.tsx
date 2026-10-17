import { useEffect, useState } from 'react';
import * as m from 'motion/react-m';
import { Modal } from '../components/Modal';
import { ui, useModalOpen } from '../store/ui';
import { requestRefresh, useRefreshKey } from '../store/refresh';
import { useGameInstance } from '../legacy/useGame';
import { playSound } from '../legacy/sound';
import type { LegacyGame } from '../legacy/bridge';

interface Row {
    rank: number;
    address: string;
    fullAddress?: string;
    score: number;
    level: number;
    isCurrentPlayer?: boolean;
}

type View =
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'ready'; rows: Row[] };

// Shown when the chain returns nothing, so the board never looks dead.
const FALLBACK_ROWS: Row[] = [
    { rank: 1, address: 'GBX2...9P2K', score: 850, level: 9 },
    { rank: 2, address: 'GA7T...5W3M', score: 620, level: 7 },
    { rank: 3, address: 'GCT5...1V4X', score: 410, level: 5 },
];

const rerank = (rows: Row[]) => rows.sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));

function personalBest(game: LegacyGame) {
    const addr = window.stellarWallet?.address ?? null;
    const localScore = parseInt(localStorage.getItem(game._pbKey(addr)) || '0', 10);
    const localLevel = parseInt(localStorage.getItem(game._pbLevelKey(addr)) || '1', 10);
    // The current session counts if it beats what's stored.
    return { score: Math.max(localScore, game.score), level: Math.max(localLevel, game.level) };
}

/** Port of the legacy refreshLeaderboard(): on-chain entries merged with the player's personal best. */
async function loadLeaderboard(game: LegacyGame): Promise<{ rows: Row[]; pb: { score: number; level: number } }> {
    const wallet = window.stellarWallet;
    const pb = personalBest(game);
    const entries = wallet ? await wallet.fetchLeaderboard() : [];
    const playerAddr = wallet?.address ?? null;

    // The on-chain entry is the authoritative personal-best baseline.
    if (playerAddr && entries.length > 0) {
        const mine = entries.find((e) => e.address === playerAddr);
        if (mine && mine.score > pb.score) {
            pb.score = mine.score;
            pb.level = Math.max(pb.level, mine.level);
        }
    }

    if (!entries.length) {
        if (pb.score <= 0) return { rows: FALLBACK_ROWS, pb };
        const you = playerAddr && wallet ? wallet._short(playerAddr) : 'YOU (Local)';
        return { rows: rerank([...FALLBACK_ROWS, { rank: 0, address: you, score: pb.score, level: pb.level, isCurrentPlayer: true }]), pb };
    }

    const short = (a: string) => (wallet ? wallet._short(a) : a);
    const rows: Row[] = entries.map((e) => {
        const isCurrentPlayer = !!playerAddr && e.address === playerAddr;
        return {
            rank: e.rank,
            address: isCurrentPlayer ? `YOU (${short(e.address)})` : short(e.address),
            fullAddress: e.address,
            score: e.score,
            level: e.level,
            isCurrentPlayer,
        };
    });
    if (playerAddr && pb.score > 0 && !rows.some((r) => r.isCurrentPlayer)) {
        rows.push({ rank: 0, address: `YOU (${short(playerAddr)})`, fullAddress: playerAddr, score: pb.score, level: pb.level, isCurrentPlayer: true });
        return { rows: rerank(rows), pb };
    }
    return { rows, pb };
}

export function LeaderboardModal() {
    const game = useGameInstance();
    const open = useModalOpen('leaderboard');
    const refreshKey = useRefreshKey('leaderboard');
    const [view, setView] = useState<View>({ status: 'loading' });
    const [pb, setPb] = useState({ score: 0, level: 1 });

    useEffect(() => {
        if (!open || !game) return;
        let cancelled = false;
        setView({ status: 'loading' });
        setPb(personalBest(game));
        loadLeaderboard(game).then(
            (res) => {
                if (cancelled) return;
                setPb(res.pb);
                setView({ status: 'ready', rows: res.rows });
            },
            (err) => {
                console.error('Error refreshing leaderboard:', err);
                if (!cancelled) setView({ status: 'error' });
            },
        );
        return () => {
            cancelled = true;
        };
    }, [open, game, refreshKey]);

    const walletMap = window.StellarWallet?.getWalletMap() ?? {};
    const connected = !!window.stellarWallet?.connected;

    return (
        <Modal id="leaderboard" panelClassName="leaderboard-modal" labelledBy="rx-leaderboard-title">
            <h3 id="rx-leaderboard-title">Atomic Leaderboard</h3>
            <div className="leaderboard-subtitle">On-Chain Soroban Scores</div>

            <div className="leaderboard-container">
                {view.status === 'loading' && (
                    <div className="leaderboard-loading">
                        <div className="spinner" />
                        <span>Retrieving blockchain ledger...</span>
                    </div>
                )}
                {view.status === 'error' && (
                    <div className="leaderboard-error">
                        <span className="material-symbols-outlined error-icon">warning</span>
                        <span className="error-msg">Failed to connect to network.</span>
                        <button type="button" className="leaderboard-retry-btn" onClick={() => requestRefresh('leaderboard')}>
                            Retry
                        </button>
                    </div>
                )}
                {view.status === 'ready' && view.rows.length === 0 && (
                    <div className="leaderboard-empty">
                        <span className="material-symbols-outlined empty-icon">leaderboard</span>
                        <span className="empty-msg">
                            No entries found on-chain.
                            <br />
                            Be the first to submit a score!
                        </span>
                    </div>
                )}
                {view.status === 'ready' && view.rows.length > 0 && (
                    <div className="leaderboard-table-wrapper" style={{ display: 'block' }}>
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '15%' }}>Rank</th>
                                    <th style={{ width: '50%' }}>Player</th>
                                    <th style={{ width: '20%' }}>Score</th>
                                    <th style={{ width: '15%' }}>Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {view.rows.map((r, i) => {
                                    const walletId = r.fullAddress ? walletMap[r.fullAddress] : undefined;
                                    const rankClass = r.rank <= 3 ? `rank-${r.rank}` : 'rank-other';
                                    return (
                                        <m.tr
                                            key={`${r.rank}-${r.address}`}
                                            className={r.isCurrentPlayer ? 'current-player-row' : undefined}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: Math.min(i, 12) * 0.035, duration: 0.22 }}
                                        >
                                            <td className={rankClass}>
                                                <span className="rank-badge">{r.rank}</span>
                                            </td>
                                            <td>
                                                <span className="player-addr">{r.address}</span>
                                                {walletId && window.StellarWallet && (
                                                    <span className="wallet-tag">{window.StellarWallet.walletLabel(walletId)}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="player-score">{r.score}</span>
                                            </td>
                                            <td>
                                                <span className="player-level">Lv {r.level}</span>
                                            </td>
                                        </m.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="personal-best-box">
                <div className="pb-title">
                    <span className="material-symbols-outlined pb-icon">emoji_events</span>
                    <span>YOUR PERSONAL BEST</span>
                </div>
                <div className="pb-stats">
                    <span className="pb-stat-item">
                        Score: <strong>{pb.score.toString().padStart(3, '0')}</strong>
                    </span>
                    <span className="pb-stat-item">
                        Level: <strong>{pb.level}</strong>
                    </span>
                </div>
            </div>

            {/* Always shown; the contract enforces admin auth on the actual call. */}
            <div className="admin-reset-panel" style={{ display: 'block' }}>
                <div className="admin-reset-title">Admin Controls</div>
                <button type="button" className="reset-leaderboard-btn" onClick={() => game?.confirmAdminReset()}>
                    Reset Entire Leaderboard
                </button>
            </div>

            <div className="leaderboard-actions">
                <m.button
                    type="button"
                    className="leaderboard-refresh-btn"
                    onClick={() => requestRefresh('leaderboard')}
                    whileTap={{ y: 3, boxShadow: '0 0px 0 #00bfa5' }}
                >
                    Refresh
                </m.button>
                {connected && (
                    <button type="button" className="reset-score-btn" style={{ display: 'inline-block' }} onClick={() => game?.confirmSelfReset()}>
                        Reset My Score
                    </button>
                )}
                <button
                    type="button"
                    className="theme-close-btn"
                    style={{ marginTop: 0, width: 'auto' }}
                    onClick={() => {
                        playSound('select');
                        ui.close('leaderboard');
                    }}
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}
