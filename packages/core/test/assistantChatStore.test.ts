import type { AgentMessage } from "@earendil-works/pi-agent-core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  appendAssistantMessages,
  createAssistantSession,
  deleteAssistantSession,
  getAssistantSession,
  listAssistantMessages,
  listAssistantSessions,
} from "../src/ai/assistantChatStore.js";
import { createDb, type Db } from "../src/db/index.js";

const ZERO_USAGE = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
  totalTokens: 0,
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
};

let db: Db;

function assistant(text: string): AgentMessage {
  return {
    role: "assistant",
    content: [{ type: "text", text }],
    api: "anthropic-messages",
    provider: "anthropic",
    model: "test-model",
    usage: ZERO_USAGE,
    stopReason: "stop",
    timestamp: Date.now(),
  };
}

function user(text: string): AgentMessage {
  return { role: "user", content: text, timestamp: Date.now() };
}

beforeEach(() => {
  db = createDb(":memory:");
});

afterEach(() => {});

describe("assistant chat store", () => {
  it("creates a session and gets it back", async () => {
    const created = await createAssistantSession({ title: "New session" }, db);
    expect(created.title).toBe("New session");
    const fetched = await getAssistantSession(created.id, db);
    expect(fetched).toEqual(created);
  });

  it("returns null for an unknown session id", async () => {
    expect(await getAssistantSession("does-not-exist", db)).toBeNull();
  });

  it("appends messages, bumps updatedAt, and lists them in order", async () => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const session = await createAssistantSession({ title: "Session" }, db);
    const before = session.updatedAt;
    await sleep(5);
    await appendAssistantMessages(session.id, [user("hello")], db);
    const afterFirst = await getAssistantSession(session.id, db);
    expect(afterFirst!.updatedAt > before).toBe(true);

    await appendAssistantMessages(session.id, [assistant("Hello, how can I help")], db);
    const messages = await listAssistantMessages(session.id, db);
    expect(messages.map((row) => row.role)).toEqual(["user", "assistant"]);
    expect(messages[0].payload).toMatchObject({ role: "user", content: "hello" });
  });

  it("lists sessions ordered by updatedAt desc", async () => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const first = await createAssistantSession({ title: "First" }, db);
    await sleep(5);
    const second = await createAssistantSession({ title: "Second" }, db);
    await sleep(5);
    await appendAssistantMessages(first.id, [user("chat more")], db);

    const sessions = await listAssistantSessions(db);
    expect(sessions.map((s) => s.id)).toEqual([first.id, second.id]);
  });

  it("deletes a session and its messages without touching other sessions", async () => {
    const target = await createAssistantSession({ title: "To delete" }, db);
    const other = await createAssistantSession({ title: "To keep" }, db);
    await appendAssistantMessages(target.id, [user("message to delete")], db);
    await appendAssistantMessages(other.id, [user("message to keep")], db);

    await deleteAssistantSession(target.id, db);

    expect(await getAssistantSession(target.id, db)).toBeNull();
    expect(await listAssistantMessages(target.id, db)).toEqual([]);
    expect(await listAssistantMessages(other.id, db)).toHaveLength(1);
  });
});
