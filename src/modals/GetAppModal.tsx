import { useEffect, useRef, useState } from 'react';
import { Modal } from '../components/Modal';
import { ui, useModalOpen } from '../store/ui';
import { useGameInstance } from '../legacy/useGame';
import { playSound } from '../legacy/sound';

/** The debug APK's GitHub Release URL, defined once on the legacy game class. */
export function apkUrl(): string {
    const ctor = window.game?.constructor as unknown as { ANDROID_APK_URL?: string } | undefined;
    return ctor?.ANDROID_APK_URL ?? '';
}

/** QR code + direct download link for the Android APK. */
export function GetAppModal() {
    const game = useGameInstance();
    const open = useModalOpen('getApp');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [qrFailed, setQrFailed] = useState(false);
    const url = apkUrl();

    useEffect(() => {
        if (!open || !game || !url) return;
        let cancelled = false;
        // qrcode.js (~55KB) is lazy-loaded on first open by the legacy helper.
        game._ensureQRCodeLib().then(
            () => {
                const canvas = canvasRef.current;
                if (cancelled || !canvas || !window.qrcode) return;
                const qr = window.qrcode(0, 'M');
                qr.addData(url);
                qr.make();
                const count = qr.getModuleCount();
                const scale = 6;
                const margin = 2;
                const size = (count + margin * 2) * scale;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#000000';
                for (let row = 0; row < count; row++) {
                    for (let col = 0; col < count; col++) {
                        if (qr.isDark(row, col)) ctx.fillRect((col + margin) * scale, (row + margin) * scale, scale, scale);
                    }
                }
            },
            () => {
                if (!cancelled) setQrFailed(true);
            },
        );
        return () => {
            cancelled = true;
        };
    }, [open, game, url]);

    return (
        <Modal id="getApp" panelClassName="get-app-modal" labelledBy="rx-get-app-title">
            <h3 id="rx-get-app-title">Get the Android App</h3>
            <div className="get-app-subtitle">Scan with your phone camera to download the APK</div>

            <div className="get-app-qr-wrapper">
                {qrFailed ? (
                    'QR code unavailable — use the download button below.'
                ) : (
                    <canvas ref={canvasRef} className="get-app-qr-canvas" data-url={url} aria-label="QR code for the Android APK download" />
                )}
            </div>

            <div className="get-app-note">
                Debug build — you may need to enable <strong>&quot;Install from unknown sources&quot;</strong> on your Android device.
            </div>

            <a className="get-app-download-btn" href={url} target="_blank" rel="noopener noreferrer" download>
                ⬇️ Download APK
            </a>
            <button
                type="button"
                className="theme-close-btn"
                style={{ marginTop: 10 }}
                onClick={() => {
                    playSound('select');
                    ui.close('getApp');
                }}
            >
                Close
            </button>
        </Modal>
    );
}
