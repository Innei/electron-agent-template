# Add a module

Copy the notes example layer by layer. For a feature `things`:

1. **Schema** — `packages/core/src/db/schema.ts`: add the `things` table, then
   `cd packages/core && ./node_modules/.bin/drizzle-kit generate --name things`.
2. **Contract** — `packages/core/src/contract/things.ts`: the `ThingsApi` interface +
   `thingsRoutes = defineRoutes<ThingsApi>("things", {...})`. Register both in
   `contract/index.ts` (`AppApi`, `allRoutes`, re-export).
3. **Service** — `packages/core/src/modules/things/things.service.ts`: implement `ThingsApi`
   against `getDb()`. Emit realtime events from a sibling `things.events.ts` if the UI should
   react live.
4. **Server** — `apps/server/src/modules/things/`: a Tsuki controller that delegates to the
   service and returns `{ ok: true, data }`; register the module in `modules/app.module.ts`.
5. **Desktop IPC** — `apps/desktop/src/ipc/thingsIpc.ts`: one `@IpcMethod()` per contract method
   wrapping the same service in `toEnvelope`; register in `ipc/index.ts` and `ipc/groups.ts`.
6. **Realtime (optional)** — add a channel kind in
   `packages/core/src/realtime/channelProtocol.ts` and mirror it in `apps/web/src/wsHub.ts`.
7. **Web** — a page under `apps/web/src/pages/things/` using `client.things.*` (works over both
   transports for free) and `subscribeChannel` for live updates; route it in `PageRouter.tsx`.
8. **Tests** — service tests in `packages/core/test`, route tests in `apps/server/test`
   (see `host-smoke.test.ts` / `ws.test.ts` for harnesses).
