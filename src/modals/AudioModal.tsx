import { Modal } from '../components/Modal';
import { Switch } from '../components/Switch';
import { ui } from '../store/ui';
import { act, useGame } from '../legacy/useGame';
import { playSound } from '../legacy/sound';

/** Music / SFX enable toggles + volume sliders, layered on the header mute icon. */
export function AudioModal() {
    const game = useGame();
    const sound = game?.sound;

    return (
        <Modal id="audio" panelClassName="theme-modal" labelledBy="rx-audio-title">
            <h3 id="rx-audio-title">🔊 Audio Settings</h3>
            <div className="modal-scroll-body">
                <div className="effects-settings-container rx-settings-list rx-audio-list">
                    <div className="rx-audio-group rx-fx-divider">
                        <div className="toggle-container">
                            <div className="toggle-label">
                                <span className="rx-toggle-title">🎵 Music</span>
                                <span className="toggle-description rx-toggle-desc">The background bossa nova loop</span>
                            </div>
                            <Switch
                                checked={!!sound?.musicEnabled}
                                label="Music"
                                onChange={(on) =>
                                    act(() => {
                                        sound?.setMusicEnabled(on);
                                        playSound('select');
                                    })
                                }
                            />
                        </div>
                        <VolumeSlider
                            label="Music volume"
                            value={sound?.musicVolumePct ?? 100}
                            onChange={(pct) => act(() => sound?.setMusicVolume(pct))}
                        />
                    </div>

                    <div className="rx-audio-group">
                        <div className="toggle-container">
                            <div className="toggle-label">
                                <span className="rx-toggle-title">🔔 Sound Effects</span>
                                <span className="toggle-description rx-toggle-desc">Tile drops, wins, achievements, and UI clicks</span>
                            </div>
                            <Switch
                                checked={!!sound?.sfxEnabled}
                                label="Sound effects"
                                onChange={(on) =>
                                    act(() => {
                                        // Flip first, so enabling plays the confirmation blip and disabling doesn't.
                                        sound?.setSfxEnabled(on);
                                        if (on) playSound('select');
                                    })
                                }
                            />
                        </div>
                        <VolumeSlider
                            label="Sound effects volume"
                            value={sound?.sfxVolumePct ?? 100}
                            onChange={(pct) => act(() => sound?.setSfxVolume(pct))}
                        />
                    </div>
                </div>
            </div>
            <button
                type="button"
                className="theme-close-btn"
                style={{ marginTop: 20 }}
                onClick={() => {
                    playSound('select');
                    ui.close('audio');
                }}
            >
                Close Menu
            </button>
        </Modal>
    );
}

function VolumeSlider({ label, value, onChange }: { label: string; value: number; onChange: (pct: number) => void }) {
    return (
        <label className="rx-volume-row">
            Volume
            <input
                type="range"
                className="audio-volume-slider"
                min={0}
                max={100}
                step={5}
                value={value}
                aria-label={label}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
            />
            <span className="rx-volume-val">{value}%</span>
        </label>
    );
}
