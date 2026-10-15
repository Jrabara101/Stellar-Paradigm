import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Stage 1 of the React port: the legacy game (script.js, stellar.js, the CSS,
// Scramble Board, wordbank…) is served untouched from public/ at the same
// relative paths it always used, so its lazy loaders keep working. New React
// code lives in src/ and is bundled + hashed by Vite.

// Images the legacy code loads from folders that live outside public/ (theme
// picker previews, wallet-guide screenshots). Discovered by scanning the
// legacy sources rather than hard-coded, so a newly added theme preview is
// picked up automatically. Dev needs nothing: Vite serves the project root.
const EXTERNAL_ASSET_RE = /(?:Word Scramble Boards Inspired|screenshots)\/[^'"`)\n]+?\.(?:png|jpe?g|webp|svg)/g;

function copyLegacyAssets(): Plugin {
    let outDir = 'dist';
    return {
        name: 'copy-legacy-assets',
        apply: 'build',
        configResolved(config) {
            outDir = config.build.outDir;
        },
        closeBundle() {
            const sources = ['index.html', ...readdirSync('public').filter((f) => /\.(js|css)$/.test(f)).map((f) => join('public', f))];
            const found = new Set<string>();
            for (const file of sources) {
                for (const match of readFileSync(file, 'utf8').matchAll(EXTERNAL_ASSET_RE)) found.add(match[0]);
            }
            const missing: string[] = [];
            for (const rel of found) {
                if (!existsSync(rel)) { missing.push(rel); continue; }
                const dest = join(outDir, rel);
                mkdirSync(dirname(dest), { recursive: true });
                copyFileSync(rel, dest);
            }
            if (missing.length) {
                this.error(`Referenced assets not found:\n  ${missing.join('\n  ')}`);
            }
            this.info?.(`copied ${found.size} legacy assets`);
        },
    };
}

export default defineConfig({
    plugins: [react(), copyLegacyAssets()],
    // Relative base so the same dist/ works on surge, Vercel and inside the
    // Capacitor WebView (https://localhost/).
    base: './',
    build: {
        outDir: 'dist',
        target: 'es2022',
        sourcemap: false,
    },
    // Scan only the React entry for dependency pre-bundling: the scanner
    // ignores `vite-ignore` and would choke on the legacy stellar.js tag.
    optimizeDeps: {
        entries: ['src/main.tsx'],
    },
    server: {
        port: 5173,
        host: true, // reachable from a phone on the same Wi-Fi for device testing
    },
});
