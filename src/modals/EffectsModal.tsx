import { Fragment } from 'react';
import * as m from 'motion/react-m';
import { Modal } from '../components/Modal';
import { Switch } from '../components/Switch';
import { EFFECT_TOGGLES, TILE_EFFECTS, VICTORY_PREVIEWS } from '../data/pickers';
import { ui } from '../store/ui';
import { act, useGame } from '../legacy/useGame';
import { playSound } from '../legacy/sound';

export function EffectsModal() {
    const game = useGame();
    const settings = game?.effectsSettings ?? {};
    const tileEffectName = TILE_EFFECTS.find((t) => t.id === game?.currentTileEffect)?.name ?? 'None';

    return (
        <Modal id="effects" panelClassName="theme-modal" labelledBy="rx-effects-title">
            <h3 id="rx-effects-title">Visual Effects Menu</h3>
            {/* Everything between the title and the close button scrolls, so the
                title stays put and "Close Menu" is always reachable. */}
            <div className="modal-scroll-body">
                <div className="effects-settings-container rx-settings-list">
                    {EFFECT_TOGGLES.map((t) => (
                        <Fragment key={t.key}>
                            <div className={`toggle-container${t.key === 'performanceMode' ? ' rx-fx-divider' : ''}`}>
                                <div className="toggle-label">
                                    <span className="rx-toggle-title">{t.title}</span>
                                    <span className="toggle-description rx-toggle-desc">{t.description}</span>
                                </div>
                                <Switch
                                    checked={!!settings[t.key]}
                                    label={t.title}
                                    onChange={() => game && act(() => game.toggleEffect(t.key))}
                                />
                            </div>
                            {t.key === 'performanceMode' && (
                                <div className="toggle-container rx-fx-divider">
                                    <div className="toggle-label">
                                        <span className="rx-toggle-title">Tile Letter Styling</span>
                                        <span className="toggle-description rx-toggle-desc">
                                            Select visual skins &amp; custom animations for every tile letter
                                        </span>
                                    </div>
                                    <m.button
                                        type="button"
                                        className="customize-btn-tag rx-mustard-btn"
                                        onClick={() => game?.openTileEffectsModal()}
                                        whileTap={{ y: 3, boxShadow: '0 0px 0 var(--mustard-dark)' }}
                                    >
                                        Tile Effect: {tileEffectName}
                                    </m.button>
                                </div>
                            )}
                        </Fragment>
                    ))}
                </div>

                <h4 className="rx-section-heading">Victory Preview Buttons</h4>
                <div className="preview-buttons-grid rx-preview-grid">
                    {VICTORY_PREVIEWS.map((p) => (
                        <m.button
                            key={p.type}
                            type="button"
                            className={`preview-btn rx-preview-btn${p.type === 'all' ? ' preview-all-btn' : ''}`}
                            onClick={() => game?.previewVictoryEffect(p.type)}
                            whileTap={{ y: 3 }}
                        >
                            {p.label}
                        </m.button>
                    ))}
                </div>
            </div>

            <button
                type="button"
                className="theme-close-btn"
                style={{ marginTop: 20 }}
                onClick={() => {
                    playSound('select');
                    ui.close('effects');
                }}
            >
                Close Menu
            </button>
        </Modal>
    );
}
