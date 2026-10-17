import { useEffect, useState, type ReactNode } from 'react';
import { Modal } from '../components/Modal';
import { ui, useModalOpen } from '../store/ui';
import { useGameInstance } from '../legacy/useGame';
import { playSound } from '../legacy/sound';
import type { ApiSettings } from '../legacy/bridge';

const EMPTY: ApiSettings = { wordsEnabled: false, wordsKey: '', wordnikEnabled: false, wordnikKey: '' };

/** Optional WordsAPI / Wordnik keys (stored locally in the browser). */
export function ApiSettingsModal() {
    const game = useGameInstance();
    const open = useModalOpen('apiSettings');
    const [form, setForm] = useState<ApiSettings>(EMPTY);

    // Start from the saved settings every time it opens; Cancel discards edits.
    useEffect(() => {
        if (open && game) setForm({ ...game.apiSettings });
    }, [open, game]);

    const save = () => {
        if (!game) return;
        playSound('select');
        const next = { ...form, wordsKey: form.wordsKey.trim(), wordnikKey: form.wordnikKey.trim() };
        game.apiSettings = next;
        localStorage.setItem('ws_api_words_enabled', String(next.wordsEnabled));
        localStorage.setItem('ws_api_words_key', next.wordsKey);
        localStorage.setItem('ws_api_wordnik_enabled', String(next.wordnikEnabled));
        localStorage.setItem('ws_api_wordnik_key', next.wordnikKey);
        // Drop the pre-fetched word so the next level already uses the new APIs.
        game.prefetchedData = null;
        ui.close('apiSettings');
        window.stellarWallet?._showStatus('API Settings saved!', 'success');
    };

    const cancel = () => {
        playSound('select');
        ui.close('apiSettings');
    };

    return (
        <Modal id="apiSettings" panelClassName="theme-modal api-settings-modal" panelStyle={{ maxWidth: 440 }} labelledBy="rx-api-title">
            <h3 id="rx-api-title">API Settings</h3>
            <p className="rx-api-intro">
                Enable WordsAPI and Wordnik API to load longer words (up to 10 letters) and fetch rich dictionary descriptions for
                hints. API keys are stored locally in your browser.
            </p>

            <div className="rx-api-sections">
                <ApiSection
                    label="Enable WordsAPI"
                    enabled={form.wordsEnabled}
                    keyValue={form.wordsKey}
                    placeholder="Enter RapidAPI Key"
                    onEnabled={(v) => setForm({ ...form, wordsEnabled: v })}
                    onKey={(v) => setForm({ ...form, wordsKey: v })}
                    help={
                        <>
                            Get a key on{' '}
                            <a href="https://rapidapi.com/wordsapi/api/wordsapi/" target="_blank" rel="noopener noreferrer">
                                RapidAPI WordsAPI
                            </a>
                        </>
                    }
                    divider
                />
                <ApiSection
                    label="Enable Wordnik API"
                    enabled={form.wordnikEnabled}
                    keyValue={form.wordnikKey}
                    placeholder="Enter Wordnik API Key"
                    onEnabled={(v) => setForm({ ...form, wordnikEnabled: v })}
                    onKey={(v) => setForm({ ...form, wordnikKey: v })}
                    help={
                        <>
                            Register for a key on{' '}
                            <a href="https://developer.wordnik.com/" target="_blank" rel="noopener noreferrer">
                                Wordnik Portal
                            </a>
                        </>
                    }
                />
            </div>

            <div className="rx-api-actions">
                <button type="button" className="theme-close-btn rx-api-save" onClick={save}>
                    Save &amp; Apply
                </button>
                <button type="button" className="theme-close-btn" onClick={cancel}>
                    Cancel
                </button>
            </div>
        </Modal>
    );
}

interface ApiSectionProps {
    label: string;
    enabled: boolean;
    keyValue: string;
    placeholder: string;
    help: ReactNode;
    divider?: boolean;
    onEnabled: (v: boolean) => void;
    onKey: (v: string) => void;
}

function ApiSection({ label, enabled, keyValue, placeholder, help, divider, onEnabled, onKey }: ApiSectionProps) {
    return (
        <div className={`api-config-section${divider ? ' rx-api-divider' : ''}`}>
            <label className="api-checkbox-label rx-api-check">
                <input type="checkbox" checked={enabled} onChange={(e) => onEnabled(e.target.checked)} /> {label}
            </label>
            <div className="rx-api-field">
                <input
                    type="password"
                    className="api-key-input rx-api-input"
                    placeholder={placeholder}
                    autoComplete="off"
                    value={keyValue}
                    onChange={(e) => onKey(e.target.value)}
                />
                <span className="rx-api-help">{help}</span>
            </div>
        </div>
    );
}
