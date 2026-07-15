import type { AgentMessage } from "@earendil-works/pi-agent-core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AiAgentFactory } from "../src/ai/agentSession.js";
import { assistantChatTurnState } from "../src/ai/assistantChat.js";
import { appendAssistantMessages, listAssistantMessages } from "../src/ai/assistantChatStore.js";
import type { AiModel } from "../src/ai/models.js";
import { createDb, type Db } from "../src/db/index.js";
import { ClientError } from "../src/errors.js";
import { assistantChatService, setAssistantChatDepsForTests } from "../src/modules/assistant/assistantChat.service.js";

const model = { provider: "anthropic", id: "test-model" } as unknown as AiModel;
const USAGE = {
  input: 10,
  output: 5,
  cacheRead: 0,
  cacheWrite: 0,
  totalTokens: 15,
  cost: { input: 0.01, output: 0.02, cacheRead: 0, cacheWrite: 0, total: 0.03 },
};

function assistantMessage(text: string): AgentMessage {
  return {
    role: "assistant",
    content: [{ type: "text", text }],
    api: "anthropic-messages",
    provider: "anthropic",
    model: "test-model",
    usage: USAGE,
    stopReason: "stop",
    timestamp: Date.now(),
  };
}

let db: Db;

beforeEach(() => {
  db = createDb(":memory:");
});

afterEach(() => setAssistantChatDepsForTests(null));

describe("assistantChatService session lifecycle", () => {
  it("creates a session with a default title when omitted", async () => {
    setAssistantChatDepsForTests({ model, db });
    const { session } = await assistantChatService.createSession({});
    expect(session.title).toBe("New conversation");

    const { sessions } = await assistantChatService.listSessions();
    expect(sessions.map((s) => s.id)).toEqual([session.id]);
  });

  it("falls back to the default title when the given title is blank", async () => {
    setAssistantChatDepsForTests({ model, db });
    const { session } = await assistantChatService.createSession({ title: "   " });
    expect(session.title).toBe("New conversation");
  });

  it("keeps a custom title", async () => {
    setAssistantChatDepsForTests({ model, db });
    const { session } = await assistantChatService.createSession({ title: "Custom title" });
    expect(session.title).toBe("Custom title");
  });

  it("deletes a session and its messages", async () => {
    setAssistantChatDepsForTests({ model, db });
    const { session } = await assistantChatService.createSession({});
    await assistantChatService.deleteSession({ id: session.id });
    const { sessions } = await assistantChatService.listSessions();
    expect(sessions).toHaveLength(0);
    await expect(assistantChatService.getChat({ id: session.id })).rejects.toMatchObject({
      name: "ClientError",
      status: 404,
    });
  });

  it("rejects deleting an unknown session", async () => {
    setAssistantChatDepsForTests({ model, db });
    await expect(assistantChatService.deleteSession({ id: "missing" })).rejects.toMatchObject({
      name: "ClientError",
      status: 404,
    });
  });

  it("aborts an in-flight turn before deleting the session", async () => {
    let started: () => void = () => {};
    const startedPromise = new Promise<void>((resolve) => {
      started = resolve;
    });
    let rejectPrompt: ((err: Error) => void) | undefined;
    const factory: AiAgentFactory = (config) => ({
      prompt: () =>
        new Promise((_resolve, reject) => {
          rejectPrompt = reject;
          started();
        }),
      abort: () => rejectPrompt?.(new Error("aborted")),
      state: { messages: [...(config.messages ?? [])] },
    });
    setAssistantChatDepsForTests({
      model,
      db,
      rootDir: process.cwd(),
      agentFactory: factory,
      policyText: "# trading-discipline\nTest discipline.",
    });
    const { session } = await assistantChatService.createSession({});
    void assistantChatService.postMessage({ id: session.id, text: "first message" });
    await startedPromise;

    await assistantChatService.deleteSession({ id: session.id });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(assistantChatTurnState(session.id).busy).toBe(false);
    const messages = await listAssistantMessages(session.id, db);
    expect(messages).toHaveLength(0);
  });
});

describe("assistantChatService getChat", () => {
  it("rejects an unknown session", async () => {
    setAssistantChatDepsForTests({ model, db });
    await expect(assistantChatService.getChat({ id: "missing" })).rejects.toThrow(ClientError);
    await expect(assistantChatService.getChat({ id: "missing" })).rejects.toMatchObject({ status: 404 });
  });

  it("sums usage across persisted turns", async () => {
    setAssistantChatDepsForTests({ model, db });
    const { session } = await assistantChatService.createSession({});
    await appendAssistantMessages(
      session.id,
      [{ role: "user", content: "hello", timestamp: Date.now() }, assistantMessage("answer one")],
      db,
    );

    const state = await assistantChatService.getChat({ id: session.id });
    expect(state.messages.map((m) => m.kind)).toEqual(["user", "assistant"]);
    expect(state.messages[1]?.meta).toEqual({
      provider: "anthropic",
      model: "test-model",
      totalTokens: USAGE.totalTokens,
      costTotal: USAGE.cost.total,
    });
    expect(state.usage).toEqual({ totalTokens: USAGE.totalTokens, costTotal: USAGE.cost.total, calls: 1 });
  });
});

describe("assistantChatService postMessage result mapping", () => {
  it("maps an unknown session to 404", async () => {
    setAssistantChatDepsForTests({ model, db });
    const result = await assistantChatService.postMessage({ id: "missing", text: "hello" });
    expect(result).toEqual({ status: 404, body: { error: "Session not found" } });
  });

  it("maps a missing model to 503", async () => {
    setAssistantChatDepsForTests({ model: null, db });
    const { session } = await assistantChatService.createSession({});
    const result = await assistantChatService.postMessage({ id: session.id, text: "hello" });
    expect(result).toEqual({ status: 503, body: { error: "No follow-up model configured; set one in /settings" } });
  });

  it("rejects blank text before touching the engine", async () => {
    setAssistantChatDepsForTests({ model, db });
    const { session } = await assistantChatService.createSession({});
    await expect(assistantChatService.postMessage({ id: session.id, text: "   " })).rejects.toThrow();
  });

  it("maps busy to 409 while a turn is in flight", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let started: () => void = () => {};
    const startedPromise = new Promise<void>((resolve) => {
      started = resolve;
    });
    const factory: AiAgentFactory = (config) => ({
      prompt: async () => {
        started();
        await gate;
      },
      abort: () => undefined,
      state: { messages: [...(config.messages ?? [])] },
    });
    setAssistantChatDepsForTests({
      model,
      db,
      rootDir: process.cwd(),
      agentFactory: factory,
      policyText: "# trading-discipline\nTest discipline.",
    });
    const { session } = await assistantChatService.createSession({});
    const first = await assistantChatService.postMessage({ id: session.id, text: "first message" });
    expect(first.status).toBe(202);
    await startedPromise;
    const second = await assistantChatService.postMessage({ id: session.id, text: "second message" });
    expect(second).toEqual({ status: 409, body: { error: "Still answering the previous message" } });
    release();
  });
});

describe("assistantChatService abortChat", () => {
  it("returns false when nothing is running", async () => {
    setAssistantChatDepsForTests({ model, db });
    const { session } = await assistantChatService.createSession({});
    const result = await assistantChatService.abortChat({ id: session.id });
    expect(result).toEqual({ ok: false });
  });

  it("returns true when a running turn is aborted", async () => {
    let started: () => void = () => {};
    const startedPromise = new Promise<void>((resolve) => {
      started = resolve;
    });
    let rejectPrompt: ((err: Error) => void) | undefined;
    const factory: AiAgentFactory = (config) => ({
      prompt: () =>
        new Promise((_resolve, reject) => {
          rejectPrompt = reject;
          started();
        }),
      abort: () => rejectPrompt?.(new Error("aborted")),
      state: { messages: [...(config.messages ?? [])] },
    });
    setAssistantChatDepsForTests({
      model,
      db,
      rootDir: process.cwd(),
      agentFactory: factory,
      policyText: "# trading-discipline\nTest discipline.",
    });
    const { session } = await assistantChatService.createSession({});
    void assistantChatService.postMessage({ id: session.id, text: "first message" });
    await startedPromise;
    const result = await assistantChatService.abortChat({ id: session.id });
    expect(result).toEqual({ ok: true });
  });
});
