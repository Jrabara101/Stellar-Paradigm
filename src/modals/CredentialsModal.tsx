import { useEffect, useState } from 'react';
import * as m from 'motion/react-m';
import { Modal } from '../components/Modal';
import { ui, useModalOpen } from '../store/ui';
import { requestRefresh, useRefreshKey } from '../store/refresh';
import { playSound } from '../legacy/sound';
import type { Credential } from '../legacy/bridge';

type View =
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'no-wallet' }
    | { status: 'ready'; credentials: Credential[] };

/** stellar.expert link for the credential contract on whichever network is active. */
function verifyUrl() {
    const cfg = window.STELLAR_CONFIG;
    const network = cfg?.rpcUrl?.includes('testnet') ? 'testnet' : 'public';
    return `https://stellar.expert/explorer/${network}/contract/${cfg?.credentialContractId ?? ''}`;
}

/** The player's on-chain (soulbound) vocabulary credentials. */
export function CredentialsModal() {
    const open = useModalOpen('credentials');
    const refreshKey = useRefreshKey('credentials');
    const [view, setView] = useState<View>({ status: 'loading' });

    useEffect(() => {
        if (!open) return;
        const wallet = window.stellarWallet;
        if (!wallet || !wallet.connected || !wallet.address) {
            setView({ status: 'no-wallet' });
            return;
        }
        let cancelled = false;
        setView({ status: 'loading' });
        wallet.fetchCredentials().then(
            (list) => {
                if (!cancelled) setView({ status: 'ready', credentials: [...(list ?? [])].sort((a, b) => b.timestamp - a.timestamp) });
            },
            (err) => {
                console.error('Error refreshing credentials:', err);
                if (!cancelled) setView({ status: 'error' });
            },
        );
        return () => {
            cancelled = true;
        };
    }, [open, refreshKey]);

    return (
        <Modal id="credentials" panelClassName="leaderboard-modal credentials-modal" labelledBy="rx-credentials-title">
            <h3 id="rx-credentials-title">My Credentials</h3>
            <div className="leaderboard-subtitle">On-Chain Vocabulary Credentials</div>

            <div className="leaderboard-container">
                {view.status === 'loading' && (
                    <div className="leaderboard-loading">
                        <div className="spinner" />
                        <span>Retrieving your credentials...</span>
                    </div>
                )}
                {view.status === 'error' && (
                    <div className="leaderboard-error">
                        <span className="material-symbols-outlined error-icon">warning</span>
                        <span className="error-msg">Failed to connect to network.</span>
                        <button type="button" className="leaderboard-retry-btn" onClick={() => requestRefresh('credentials')}>
                            Retry
                        </button>
                    </div>
                )}
                {view.status === 'no-wallet' && (
                    <div className="leaderboard-empty">
                        <span className="material-symbols-outlined empty-icon">account_balance_wallet</span>
                        <span className="empty-msg">Connect your wallet to view your credentials.</span>
                    </div>
                )}
                {view.status === 'ready' && view.credentials.length === 0 && (
                    <div className="leaderboard-empty">
                        <span className="material-symbols-outlined empty-icon">school</span>
                        <span className="empty-msg">
                            No credentials yet.
                            <br />
                            Score 90+ in a category to earn one!
                        </span>
                    </div>
                )}
                {view.status === 'ready' && view.credentials.length > 0 && (
                    <div className="credentials-list-wrapper" style={{ display: 'block' }}>
                        <div className="credentials-list">
                            {view.credentials.map((c, i) => (
                                <m.div
                                    key={c.id}
                                    className="credential-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(i, 8) * 0.05, duration: 0.24 }}
                                >
                                    <div className="credential-badge">{c.cefrLevel}</div>
                                    <div className="credential-info">
                                        <div className="credential-subject">
                                            {c.subject} — Score {c.score}
                                        </div>
                                        <div className="credential-meta">
                                            {c.timestamp ? `Issued ${new Date(c.timestamp * 1000).toLocaleDateString()}` : ''}
                                        </div>
                                        <div className="credential-id">ID: {c.id.slice(0, 16)}...</div>
                                    </div>
                                    <a className="credential-verify-link" href={verifyUrl()} target="_blank" rel="noopener noreferrer">
                                        Verify
                                    </a>
                                </m.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="leaderboard-actions">
                <button type="button" className="leaderboard-refresh-btn" onClick={() => requestRefresh('credentials')}>
                    Refresh
                </button>
                <button
                    type="button"
                    className="theme-close-btn"
                    style={{ marginTop: 0, width: 'auto' }}
                    onClick={() => {
                        playSound('select');
                        ui.close('credentials');
                    }}
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}
