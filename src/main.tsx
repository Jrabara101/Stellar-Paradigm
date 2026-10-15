import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { whenGameReady } from './legacy/bridge';
import { installOverrides } from './legacy/overrides';
import { initNative, isNative } from './native';
import './styles/react.css';

const host = document.createElement('div');
host.id = 'react-root';
document.body.appendChild(host);
createRoot(host).render(
    <StrictMode>
        <App />
    </StrictMode>,
);

// Overrides must land before the entrance-load sequence opens the changelog
// (~1s after construction), which DOMContentLoaded comfortably beats.
void whenGameReady().then(installOverrides);
void initNative();

// Service worker: web only. Inside the Capacitor app every asset is already
// local, and a SW would only risk serving a stale shell after an APK update.
if (!isNative && 'serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {
            /* non-fatal — the game works fine without it */
        });
    });
}
