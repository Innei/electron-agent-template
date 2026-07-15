import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createDb } from "../src/db/index.js";
import { appMeta, aiRoleSettings, notes, providerCredentials } from "../src/db/schema.js";

describe("schema migrations", () => {
  it("applies cleanly on a fresh file-backed db and keeps tables usable", async () => {
    const dir = mkdtempSync(join(tmpdir(), "schema-"));
    const dbPath = join(dir, "app.db");
    try {
      const db = createDb(dbPath);

      const tables = db.all<{ name: string }>(sql`select name from sqlite_master where type = 'table'`);
      const tableNames = tables.map((t) => t.name);
      expect(tableNames).toEqual(
        expect.arrayContaining([
          "ai_role_settings",
          "provider_credentials",
          "app_meta",
          "ai_usage",
          "chat_messages",
          "assistant_sessions",
          "notes",
        ]),
      );

      await db.insert(aiRoleSettings).values({
        role: "chat",
        mode: "custom",
        provider: "anthropic",
        modelId: "claude-sonnet-5",
        thinkingLevel: "medium",
        updatedAt: "2026-07-10T00:00:00.000Z",
      });
      const roleRows = await db.select().from(aiRoleSettings);
      expect(roleRows).toEqual([
        {
          role: "chat",
          mode: "custom",
          provider: "anthropic",
          modelId: "claude-sonnet-5",
          thinkingLevel: "medium",
          updatedAt: "2026-07-10T00:00:00.000Z",
        },
      ]);

      await db.insert(providerCredentials).values({
        provider: "anthropic",
        secret: "v1:iv:tag:ct",
        updatedAt: "2026-07-10T00:00:00.000Z",
      });
      const credentialRows = await db.select().from(providerCredentials);
      expect(credentialRows).toEqual([
        { provider: "anthropic", secret: "v1:iv:tag:ct", updatedAt: "2026-07-10T00:00:00.000Z" },
      ]);

      await db.insert(appMeta).values({ key: "env_import_v1", value: "done" });
      const metaRows = await db.select().from(appMeta);
      expect(metaRows).toEqual([{ key: "env_import_v1", value: "done" }]);

      await db.insert(notes).values({
        id: "1",
        title: "hello",
        body: "world",
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      });
      expect(await db.select().from(notes)).toHaveLength(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
