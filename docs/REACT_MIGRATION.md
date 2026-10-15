# React + Vite migration

The game is being moved from one big vanilla-JS file (`script.js`, ~4.3k
lines) to React + TypeScript + Vite, **in stages**. After each stage the app
is still playable and deployable, on the web and on Android.

## How it works during the port

```
index.html            Vite entry. Still holds the legacy markup for unported surfaces.
public/               Legacy runtime, served untouched at the same relative paths:
                      script.js, stellar.js, style.css, themes.css, wordbank.js,
                      scramble-board.*, qrcode.js, sw.js, icons/, fonts/ …
src/                  New React + TS code (bundled + hashed by Vite)
  main.tsx            Mounts React into #react-root, installs overrides, native init, SW
  legacy/bridge.ts    Typed handle on window.game + whenGameReady()
  legacy/overrides.ts Re-points ported game.* methods at React
  store/ui.ts         Modal stack (Escape / Android back close the top one)
  components/Modal.tsx Shared Motion modal: spring on desktop, drag-to-dismiss sheet ≤520px
  native/index.ts     Capacitor: back button, haptics, system bars, splash
```

**To port a surface:**
1. Build the component in `src/components/`, using the legacy CSS class for the panel so
   all themes' `--teak-*` tokens keep working.
2. Override its `game.openX/closeX` in `legacy/overrides.ts`, so every existing caller
   (inline `onclick`, the entrance sequence, other scripts) reaches React.
3. Delete its markup from `index.html`.
4. If it is a modal, add its id to `ModalId` in `store/ui.ts`. Escape and Android back
   then work automatically.

Keep the `modal-backdrop active` classes on React backdrops: `wallet-guide.js` waits for
any `.modal-backdrop.active` to close before it auto-opens.

## Stages

| Stage | Scope | Status |
|---|---|---|
| 1 | Vite + React + TS toolchain, legacy moved to `public/`, CI/CD/Vercel build `dist/`, Capacitor on `dist/`, native back/haptics/system bars/splash, Changelog modal ported | **done** |
| 2 | Remaining 14 modals: onboarding, audio, effects, API settings, get-app, category, theme / chip / tile-effect pickers, leaderboard, credentials | next |
| 3 | Header + ☰ menu, loading screen, victory screen, with Motion-choreographed victory sequence | |
| 4 | Game engine to TS modules (scoring, word picking, daily, streaks, sound, particles); React board with layout-animated tiles instead of body-positioned absolute tiles | |
| 5 | `stellar.js` to a TS module; bundle stellar-sdk + wallets-kit from npm (no esm.sh, works offline in the APK); Scramble Board port | |
| 6 | Empty `public/` of legacy JS; service worker via Workbox; delete `www/` | |

## Commands

```bash
npm run dev            # Vite dev server (also reachable from a phone on the LAN)
npm run build          # typecheck + production build to dist/
npm run preview        # serve dist/
npm run android:sync   # build + cap sync android
npm run android:open   # open in Android Studio
npm run android:apk    # build + sync + gradlew assembleDebug
```

If Gradle fails with `resource layout/abc_… not found`, run `gradlew clean` first (stale build cache).

## Android notes

- Target SDK 36 (Android 16) is always edge-to-edge, and `@capacitor/status-bar`'s
  `backgroundColor`/`overlaysWebView` no longer have any effect. The app uses Capacitor 8's
  `SystemBars` (light icons), the injected `--safe-area-inset-*` variables, and a
  `.rx-statusbar-scrim` strip painted with the theme's `--teak-dark`.
- `launchAutoHide` is off, so the splash waits for the game shell. `initNative()` always
  hides it in a `finally`, plus a 6 s fallback.
- The service worker is web-only. Inside the APK every asset is already local.
