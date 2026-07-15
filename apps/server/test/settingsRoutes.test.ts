import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { MutableModels } from "@earendil-works/pi-ai";
import { getSupportedThinkingLevels } from "@earendil-works/pi-ai";
import { builtinModels } from "@earendil-works/pi-ai/providers/all";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createCredentialStore, type AppCredentialStore } from "../../../packages/core/src/ai/credentialStore.js";
import { SINGLE_KEY_PROVIDERS } from "../../../packages/core/src/ai/modelsRuntime.js";
import { createSecretBox, type SecretBox } from "../../../packages/core/src/ai/secretBox.js";
import { createSettingsStore, type SettingsStore } from "../../../packages/core/src/ai/settingsStore.js";
import { createDb, type Db } from "../../../packages/core/src/db/index.js";
import { aiUsage, providerCredentials } from "../../../packages/core/src/db/schema.js";
import { localDay } from "../../../packages/core/src/ai/usageStore.js";
import { setSettingsDepsForTests } from "../src/modules/settings/settings.controller.js";
import { tsukiRequest } from "./helpers.js";

const catalog = builtinModels();
const CHAT_PROVIDER = "anthropic";
const CHAT_MODEL_ID = "claude-sonnet-4-5";
const chatFixtureModel = catalog.getModel(CHAT_PROVIDER, CHAT_MODEL_ID);
if (!chatFixtureModel) throw new Error("fixture model anthropic/claude-sonnet-4-5 not in catalog");
const chatThinkingLevel = getSupportedThinkingLevels(chatFixtureModel)[0];

function stubModels(completeSimple: MutableModels["completeSimple"], credentials: AppCredentialStore): MutableModels {
  const base = builtinModels({ credentials });
  return {
    getProviders: base.getProviders.bind(base),
    getProvider: base.getProvider.bind(base),
    getModels: base.getModels.bind(base),
    getModel: base.getModel.bind(base),
    refresh: base.refresh.bind(base),
    getAuth: base.getAuth.bind(base),
    stream: base.stream.bind(base),
    complete: base.complete.bind(base),
    streamSimple: base.streamSimple.bind(base),
    completeSimple,
    setProvider: base.setProvider.bind(base),
    deleteProvider: base.deleteProvider.bind(base),
    clearProviders: base.clearProviders.bind(base),
  };
}

interface TestCtx {
  dir: string;
  db: Db;
  secretBox: SecretBox;
  credentials: AppCredentialStore;
  settingsStore: SettingsStore;
  models: MutableModels;
}

function makeCtx(): TestCtx {
  const dir = mkdtempSync(join(tmpdir(), "settings-routes-"));
  const db = createDb(join(dir, "app.db"));
  const secretBox = createSecretBox(join(dir, "master.key"));
  const codexAuthPath = join(dir, "codex-auth.json");
  const credentials = createCredentialStore(db, secretBox, { codexAuthPath });
  const settingsStore = createSettingsStore(db);
  const models = builtinModels({ credentials });
  return { dir, db, secretBox, credentials, settingsStore, models };
}

function applyCtx(ctx: TestCtx, overrides: Partial<TestCtx & { testTimeoutMs: number; models: MutableModels }> = {}): void {
  setSettingsDepsForTests({
    settingsStore: ctx.settingsStore,
    credentials: ctx.credentials,
    secretBox: ctx.secretBox,
    models: overrides.models ?? ctx.models,
    db: ctx.db,
    testTimeoutMs: overrides.testTimeoutMs ?? 5_000,
  });
}

const BASE = "/api/settings";

async function get(path: string): Promise<Response> {
  return tsukiRequest(`${BASE}${path}`);
}

async function del(path: string): Promise<Response> {
  return tsukiRequest(`${BASE}${path}`, { method: "DELETE" });
}

async function put(path: string, payload?: unknown): Promise<Response> {
  return tsukiRequest(`${BASE}${path}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
}

async function post(path: string, payload?: unknown): Promise<Response> {
  return tsukiRequest(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}

let ctx: TestCtx;

beforeEach(() => {
  ctx = makeCtx();
  applyCtx(ctx);
});

afterEach(() => {
  setSettingsDepsForTests(null);
  rmSync(ctx.dir, { recursive: true, force: true });
});

describe("envelope", () => {
  it("GET /ai returns default roles, empty credentials, and a masterKey status, wrapped in {ok, data}", async () => {
    const res = await get("/ai");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.credentials).toEqual([]);
    expect(typeof body.data.masterKey).toBe("string");
    expect(body.data.roles.primary).toMatchObject({ mode: "disabled", stale: false });
    expect(body.data.roles.chat).toMatchObject({ mode: "inherit", stale: false });
  });
});

describe("PUT/DELETE /ai/roles/:role", () => {
  it("rejects an unknown role", async () => {
    const res = await put("/ai/roles/bogus", { mode: "disabled" });
    expect(res.status).toBe(400);
    expect((await res.json()).ok).toBe(false);
  });

  it("rejects inherit mode on the primary role and accepts it on task roles", async () => {
    const rejected = await put("/ai/roles/primary", { mode: "inherit" });
    expect(rejected.status).toBe(400);
    const accepted = await put("/ai/roles/chat", { mode: "inherit" });
    expect(accepted.status).toBe(200);
    expect((await accepted.json()).data).toMatchObject({ role: "chat", mode: "inherit" });
  });

  it("rejects an unknown provider", async () => {
    const res = await put("/ai/roles/chat", {
      mode: "custom",
      provider: "not-a-provider",
      modelId: "x",
      thinkingLevel: "off",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a model not in the catalog", async () => {
    const res = await put("/ai/roles/chat", {
      mode: "custom",
      provider: CHAT_PROVIDER,
      modelId: "no-such-model",
      thinkingLevel: "off",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a thinkingLevel the model does not support", async () => {
    const res = await put("/ai/roles/chat", {
      mode: "custom",
      provider: CHAT_PROVIDER,
      modelId: CHAT_MODEL_ID,
      thinkingLevel: "not-a-level",
    });
    expect(res.status).toBe(400);
  });

  it("persists a valid custom setting and returns it", async () => {
    const res = await put("/ai/roles/chat", {
      mode: "custom",
      provider: CHAT_PROVIDER,
      modelId: CHAT_MODEL_ID,
      thinkingLevel: chatThinkingLevel,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual({
      role: "chat",
      mode: "custom",
      provider: CHAT_PROVIDER,
      modelId: CHAT_MODEL_ID,
      thinkingLevel: chatThinkingLevel,
    });
    expect(ctx.settingsStore.getRole("chat")).toMatchObject({
      mode: "custom",
      provider: CHAT_PROVIDER,
      modelId: CHAT_MODEL_ID,
    });
  });

  it("DELETE sets the role to disabled", async () => {
    ctx.settingsStore.setRole("chat", {
      mode: "custom",
      provider: CHAT_PROVIDER,
      modelId: CHAT_MODEL_ID,
      thinkingLevel: chatThinkingLevel,
    });
    const res = await del("/ai/roles/chat");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { role: "chat", mode: "disabled" } });
    expect(ctx.settingsStore.getRole("chat")).toMatchObject({ mode: "disabled", provider: null });
  });
});

describe("PUT/DELETE /ai/credentials/:provider", () => {
  it("rejects setting an api key for openai-codex", async () => {
    const res = await put("/ai/credentials/openai-codex", { key: "x" });
    expect(res.status).toBe(400);
    expect((await res.json()).hint).toMatch(/codex/i);
  });

  it("rejects an empty key", async () => {
    const res = await put("/ai/credentials/deepseek", { key: "" });
    expect(res.status).toBe(400);
  });

  it("sets an api key, encrypts it in the DB, and returns a masked tail", async () => {
    const res = await put("/ai/credentials/deepseek", { key: "sk-real-secret-9876" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.provider).toBe("deepseek");
    expect(body.data.masked.endsWith("9876")).toBe(true);

    const row = ctx.db.select().from(providerCredentials).where(eq(providerCredentials.provider, "deepseek")).get();
    expect(row?.secret.startsWith("v1:")).toBe(true);
  });

  it("DELETE removes a credential", async () => {
    ctx.credentials.setApiKey("deepseek", "sk-real-secret-9876");
    const res = await del("/ai/credentials/deepseek");
    expect(res.status).toBe(200);
    await expect(ctx.credentials.read("deepseek")).resolves.toBeUndefined();
  });

  it("DELETE openai-codex is rejected", async () => {
    const res = await del("/ai/credentials/openai-codex");
    expect(res.status).toBe(400);
  });
});

describe("GET /ai/catalog", () => {
  it("only lists the allowlisted providers plus OAuth providers", async () => {
    const res = await get("/ai/catalog");
    expect(res.status).toBe(200);
    const ids = (await res.json()).data.providers.map((p: { id: string }) => p.id).sort();
    const expected = [...SINGLE_KEY_PROVIDERS, "openai-codex"].sort();
    expect(ids).toEqual(expected);
  });

  it("shows configured for a provider with a stored key, missing for codex with no auth file", async () => {
    ctx.credentials.setApiKey(CHAT_PROVIDER, "sk-real-secret-9876");
    const res = await get("/ai/catalog");
    const providers = (await res.json()).data.providers as { id: string; auth: { kind: string; status: string } }[];
    const anthropic = providers.find((p) => p.id === CHAT_PROVIDER);
    expect(anthropic?.auth).toEqual({ kind: "api_key", status: "configured" });
    const codex = providers.find((p) => p.id === "openai-codex");
    expect(codex?.auth).toEqual({ kind: "oauth", status: "missing" });
  });

  it("carries a non-empty thinkingLevels array for each catalog model", async () => {
    const res = await get("/ai/catalog");
    const providers = (await res.json()).data.providers as { id: string; models: { thinkingLevels: string[] }[] }[];
    const anthropic = providers.find((p) => p.id === CHAT_PROVIDER);
    expect(anthropic?.models.length).toBeGreaterThan(0);
    for (const model of anthropic?.models ?? []) {
      expect(model.thinkingLevels.length).toBeGreaterThan(0);
    }
  });
});

describe("POST /ai/test", () => {
  it("returns a latencyMs on success", async () => {
    const models = stubModels(async () => ({ role: "assistant" }) as never, ctx.credentials);
    applyCtx(ctx, { models });
    const res = await post("/ai/test", {
      provider: CHAT_PROVIDER,
      modelId: CHAT_MODEL_ID,
      thinkingLevel: chatThinkingLevel,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.data.latencyMs).toBe("number");
    expect(body.data.ok).toBe(true);
  });

  it("redacts a plaintext key that leaks into the upstream error message", async () => {
    ctx.credentials.setApiKey(CHAT_PROVIDER, "sk-real-secret-9876");
    const models = stubModels(async () => {
      throw new Error("upstream rejected key sk-real-secret-9876");
    }, ctx.credentials);
    applyCtx(ctx, { models });
    const res = await post("/ai/test", {
      provider: CHAT_PROVIDER,
      modelId: CHAT_MODEL_ID,
      thinkingLevel: chatThinkingLevel,
    });
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.hint).toContain("[redacted]");
    expect(body.hint).not.toContain("sk-real-secret-9876");
  });

  it("times out with a 504 and a stable timeout category", async () => {
    const models = stubModels(() => new Promise(() => {}), ctx.credentials);
    applyCtx(ctx, { models, testTimeoutMs: 50 });
    const res = await post("/ai/test", {
      provider: CHAT_PROVIDER,
      modelId: CHAT_MODEL_ID,
      thinkingLevel: chatThinkingLevel,
    });
    expect(res.status).toBe(504);
    expect((await res.json()).error).toBe("timeout");
  });
});

describe("POST /ai/reset-credentials", () => {
  it("wipes all credentials and rotates the master key", async () => {
    ctx.credentials.setApiKey("deepseek", "sk-one-secret-1111");
    ctx.credentials.setApiKey("openai", "sk-two-secret-2222");
    const oldRow = ctx.db.select().from(providerCredentials).where(eq(providerCredentials.provider, "deepseek")).get();
    if (!oldRow) throw new Error("unreachable");

    const res = await post("/ai/reset-credentials");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { reset: true } });

    expect(ctx.credentials.list()).toEqual([]);
    expect(() => ctx.secretBox.decrypt("deepseek", oldRow.secret)).toThrow();
  });
});

describe("no-plaintext sweep", () => {
  it("never echoes a stored plaintext key across GET /ai, GET /ai/catalog, or a failed /ai/test", async () => {
    const canary = "sk-plaintext-canary-1234";
    ctx.credentials.setApiKey(CHAT_PROVIDER, canary);

    const models = stubModels(async () => {
      throw new Error(`upstream said: ${canary}`);
    }, ctx.credentials);
    applyCtx(ctx, { models });

    const getAi = await get("/ai");
    const getCatalog = await get("/ai/catalog");
    const testRes = await post("/ai/test", {
      provider: CHAT_PROVIDER,
      modelId: CHAT_MODEL_ID,
      thinkingLevel: chatThinkingLevel,
    });

    for (const res of [getAi, getCatalog, testRes]) {
      expect(JSON.stringify(await res.json())).not.toContain(canary);
    }
  });
});

describe("GET /ai/usage-today", () => {
  function insertUsage(layer: string, origin: string | null, calls: number, cost: number, date: string) {
    ctx.db
      .insert(aiUsage)
      .values({
        id: `${layer}-${origin ?? "none"}-${date}-${Math.abs(cost * 1000) | 0}-${calls}`,
        ts: new Date().toISOString(),
        day: date,
        layer,
        scope: "test",
        model: "anthropic/claude-sonnet-4-5",
        origin,
        calls,
        totalTokens: 100,
        input: 50,
        output: 50,
        cacheRead: 0,
        cacheWrite: 0,
        costTotal: cost,
      })
      .run();
  }

  it("groups today's usage into the chat role and totals everything", async () => {
    const today = localDay();
    insertUsage("chat", null, 4, 0.04, today);
    insertUsage("assistant", null, 2, 0.2, today);
    insertUsage("mystery-layer", null, 1, 1.0, today);
    insertUsage("chat", null, 9, 9.0, "2000-01-01");

    const res = await get("/ai/usage-today");
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.roles.chat.calls).toBe(6);
    expect(data.roles.chat.cost).toBeCloseTo(0.24, 10);
    expect(data.total.calls).toBe(7);
    expect(data.total.cost).toBeCloseTo(1.24, 10);
  });

  it("returns zeros with no usage rows", async () => {
    const res = await get("/ai/usage-today");
    const { data } = await res.json();
    expect(data.roles.chat).toEqual({ calls: 0, cost: 0 });
    expect(data.total).toEqual({ calls: 0, cost: 0 });
  });
});
