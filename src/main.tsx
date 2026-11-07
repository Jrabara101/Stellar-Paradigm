import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { App } from './App';
import { whenGameReady } from './legacy/bridge';
import { installOverrides } from './legacy/overrides';
import { patchLegacyPrototype } from './legacy/prototype';
import { initNative, isNative } from './native';
import './styles/react.css';

// Before DOMContentLoaded builds the game (script.js is deferred ahead of us).
patchLegacyPrototype();

const host = document.createElement('div');
host.id = 'react-root';
document.body.appendChild(host);
// Commit the first render synchronously: the loading overlay lives in React
// and must already be in the DOM when DOMContentLoaded builds the game and
// shows it (a scheduled render left the board uncovered for ~150ms).
const root = createRoot(host);
flushSync(() =>
    root.render(
        <StrictMode>
            <App />
        </StrictMode>,
    ),
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
