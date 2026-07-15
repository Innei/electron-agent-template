# Desktop app

Electron shell that embeds the kernel (`packages/core`) in the main process and serves the web
UI (`apps/web`) over a privileged `app://` scheme. The renderer reaches the kernel through typed
IPC (`electron-ipc-decorator`) and a MessagePort realtime bridge — no HTTP server process.

- Dev: `pnpm dev:desktop` from the repo root (Vite dev server + Electron with `ELECTRON_DEV=1`).
- Package: `pnpm package:desktop` (dmg + zip, ad-hoc signed).
- Updates: Sparkle, fed by `appcast.xml` on the latest GitHub Release — see `docs/release.md`.
- Native modules: better-sqlite3 is rebuilt for Electron's ABI via `scripts/ensureDevNative.mjs`
  (dev) and `pnpm rebuild-native` (packaging); the Sparkle bridge (`native/sparkle-bridge`)
  vendors Sparkle.framework at build time via `fetch-sparkle.sh`.
- Data: packaged builds live in `~/Library/Application Support/<productName>/` (`app.db`,
  logs in `~/Library/Logs/<productName>/`); the data dir can be changed from Settings.
