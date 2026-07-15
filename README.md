# electron-agent-template

A batteries-included template for building a local-first desktop + web app with an embedded AI agent:

- **`packages/core`** — the kernel: SQLite (better-sqlite3 + drizzle) persistence, typed API contracts, a realtime hub, and an agent conversation engine (pi-ai / pi-agent-core) with encrypted provider credentials.
- **`apps/server`** — a thin HTTP host (Hono + NestJS-style modules/DI via Tsuki) that wraps the kernel and serves REST + WebSocket.
- **`apps/desktop`** — an Electron shell that embeds the *same* kernel in the main process and exposes it over typed IPC (`electron-ipc-decorator`); ships with Sparkle auto-updates, tabs, native menus, deep links, file logging, and keychain-wrapped secrets.
- **`apps/web`** — Vite + React UI that picks its transport by environment: HTTP + WebSocket in the browser, IPC + MessagePort inside Electron. The same page code runs in both.

Two example features walk the full stack and are meant to be copied (or deleted):

- **notes** — CRUD on SQLite, exposed over REST *and* IPC from one service, with realtime change push.
- **assistant** — a minimal streaming agent chat with tool use (read-only bash + read-file), session persistence, and per-model settings.

## Getting started

```bash
git clone <this repo> my-app && cd my-app
node scripts/init.mjs     # one-shot rename: scope, product name, bundle id, repo slug
pnpm install
pnpm dev                  # browser mode: web (vite) + server on http://localhost:5199
pnpm dev:desktop          # electron mode: web (vite) + desktop shell, no server process
```

`pnpm dev` needs no build step — the Vite dev server proxies API calls to the server process.
Production form: `pnpm --filter @app/web build && pnpm start` (single process serving the built web app), or `pnpm package:desktop` for a distributable dmg.

## Everyday commands

| Command | What it does |
|---|---|
| `pnpm dev` | web + server, browser at `http://localhost:5199` |
| `pnpm dev:desktop` | web + Electron shell over IPC |
| `pnpm -r typecheck` / `pnpm -r test` | all packages |
| `pnpm package:desktop` | build a local dmg/zip (unsigned/ad-hoc) |
| `pnpm release:desktop:dry-run` | full local rehearsal of the release pipeline |

## Documentation

- [docs/architecture.md](docs/architecture.md) — the four layers, dual transport, realtime paths, data dirs
- [docs/add-a-module.md](docs/add-a-module.md) — add a feature by copying the notes example layer by layer
- [docs/release.md](docs/release.md) — secrets, Sparkle keys, and the tag → build → publish pipeline
- [docs/remove-examples.md](docs/remove-examples.md) — file lists for deleting the notes / assistant examples
