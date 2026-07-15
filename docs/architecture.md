# Architecture

## Layout

```
apps/
  desktop/      Electron shell (main process embeds the kernel)
  server/       HTTP host (Hono + Tsuki modules/DI), serves REST + WS + built web app
  web/          Vite + React renderer, transport-agnostic
packages/
  core/         the kernel: db, contracts, services, realtime, ai
  shared/       small cross-package types/helpers (imported by relative path)
```

There is no build step between packages: server (vite-node), desktop (tsdown bundle), and web (vite)
all consume `packages/core` as raw TypeScript source via relative imports.

## The contract is the seam

`packages/core/src/contract/` defines every API as a typed interface plus a route table
(`defineRoutes`). Everything else is generated or derived from it:

- `apps/server` controllers implement the routes over HTTP (`/api/<group>/...`).
- `apps/desktop/src/ipc/*Ipc.ts` expose the *same* core services over typed IPC channels
  (`<group>.<method>`), wrapped in the same `TransportEnvelope`.
- `apps/web/src/client` builds the client from `allRoutes`: `createIpcClient()` when running
  inside Electron (detected via the preload bridge), else `createHttpClient()`. Page code only
  ever sees `client.<group>.<method>()`.

Route metadata supports three response shapes: enveloped (default), `raw: "body"` (response body
is the return value), and `raw: "statusBody"` (caller branches on HTTP status — used by chat send).

## Realtime

One WebSocket (`/api/ws`, `packages/core/src/realtime/channelProtocol.ts`) multiplexes channels
by `{op:"sub"|"unsub", key, kind}`. In Electron the same protocol runs over a `MessagePort`
(`apps/web/src/portTransport.ts` + `apps/desktop/src/realtime`), so `subscribeChannel` in the web
app is transport-agnostic. Channels in the template: `notes` (change events) and `assistant-chat`
(streaming deltas / tool events / turn state).

## Data & processes

- **Browser mode** (`pnpm dev`): vite dev server on :5199 proxies `/api` to the server process
  (kernel port :5200, `HOST_MODE=dev`). Production `pnpm start` is one process on :5199.
- **Desktop mode**: no server process. `apps/desktop/src/main.ts` boots the kernel in the Electron
  main process; the renderer talks IPC. The packaged app points `APP_PROJECT_ROOT` at
  `userData` and `APP_MIGRATIONS_DIR` at the bundled drizzle folder.
- **Data dir**: `DATA_DIR` (default `<repo>/data`, overridable via `APP_DATA_DIR`) holds
  `app.db` (SQLite, WAL) and `ai-secret.key`. Migrations run automatically on first `getDb()`.
- **Migrations**: edit `packages/core/src/db/schema.ts`, then
  `cd packages/core && ./node_modules/.bin/drizzle-kit generate --name <name>`.

## AI layer

`packages/core/src/ai/` carries the agent plumbing:

- `initAiSettings` boots the runtime: env import (`AI_CHAT_MODEL=provider/model[:thinking]`),
  role settings (roles: `primary` + `chat`), encrypted credential store (`secretBox` — plaintext
  keyfile in dev, Electron `safeStorage`-wrapped in packaged builds).
- `conversationEngine` + `assistantChat` implement a streaming, abortable, persisted agent turn
  loop with tools (`agentTools.ts`). The system prompt composes an optional app-wide policy file
  (`prompts/system-policy.md` under the project root) with the assistant's own prompt.
- `usage.ts` / `usageStore.ts` log per-call token/cost usage; the settings page shows today's totals.
