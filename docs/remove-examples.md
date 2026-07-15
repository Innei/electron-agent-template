# Removing the examples

## notes

`node scripts/init.mjs` offers to do this automatically. Manually: delete

- `packages/core/src/contract/notes.ts`
- `packages/core/src/modules/notes/`
- `apps/server/src/modules/notes/`
- `apps/desktop/src/ipc/notesIpc.ts`
- `apps/web/src/pages/notes/`

and unregister notes from `packages/core/src/contract/index.ts`,
`packages/core/src/realtime/channelProtocol.ts`, `apps/server/src/modules/app.module.ts`,
`apps/desktop/src/ipc/index.ts`, `apps/desktop/src/ipc/groups.ts`, `apps/web/src/PageRouter.tsx`,
`apps/web/src/wsHub.ts`. Drop the `notes` table from `packages/core/src/db/schema.ts` and
regenerate migrations. Related tests: `packages/core` schema test, `apps/server`
`host-smoke.test.ts` / `ws.test.ts`, `apps/web` client tests.

## assistant

The assistant doubles as the template's AI example; removing it also removes the reason for the
`ai/` layer. If you truly don't need AI, delete:

- `packages/core/src/ai/` and `packages/core/src/contract/assistant.ts`
- `packages/core/src/modules/assistant/`, `apps/server/src/modules/assistant/`
- `apps/desktop/src/ipc/assistantIpc.ts`, `apps/web/src/pages/assistant/`
- the settings AI sections (`apps/web/src/pages/settings/*`), onboarding StepAi,
  and the `assistant-chat` channel in `channelProtocol.ts` / `wsHub.ts`
- `ai_*`, `chat_messages`, `assistant_sessions`, `provider_credentials` tables in the schema

Expect to prune `@earendil-works/pi-ai` / `pi-agent-core` from `packages/core/package.json`.
