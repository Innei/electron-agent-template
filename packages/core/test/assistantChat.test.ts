import type { AgentEvent, AgentMessage } from "@earendil-works/pi-agent-core";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AiAgentFactory } from "../src/ai/agentSession.js";
import {
  abortAssistantChatTurn,
  assistantChatTurnState,
  onAssistantChatEvent,
  runAssistantChatTurn,
} from "../src/ai/assistantChat.js";
import { createAssistantSession, listAssistantMessages, sumAssistantSessionUsage } from "../src/ai/assistantChatStore.js";
import type { ChatEvent } from "../src/ai/displayMessages.js";
import type { AiModel } from "../src/ai/models.js";
import { createDb, type Db } from "../src/db/index.js";

const model = { provider: "anthropic", id: "test-model" } as unknown as AiModel;
const ZERO_USAGE = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
  totalTokens: 0,
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
};

let root: string;
let db: Db;

function write(path: string, content: string): void {
  const absolute = join(root, path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content);
}

function assistant(text: string, usage = ZERO_USAGE): AgentMessage {
  return {
    role: "assistant",
    content: [{ type: "text", text }],
    api: "anthropic-messages",
    provider: "anthropic",
    model: "test-model",
    usage,
    stopReason: "stop",
    timestamp: Date.now(),
  };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "assistant-chat-test-"));
  db = createDb(":memory:");
  write(".claude/skills/trading-discipline/SKILL.md", "---\nname: trading-discipline\ndescription: test\n---\nTest discipline.");
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("assistant chat", () => {
  it("runs a happy-path turn and persists messages", async () => {
    const session = await createAssistantSession({ title: "New conversation" }, db);
    const factory: AiAgentFactory = (config) => {
      const state = { messages: [...(config.messages ?? [])] };
      return {
        prompt: async (text) => {
          state.messages.push({ role: "user", content: text, timestamp: Date.now() });
          state.messages.push(assistant("Hello, I am the assistant."));
        },
        abort: () => undefined,
        state,
      };
    };

    const result = await runAssistantChatTurn(session.id, "hello", {
      model,
      rootDir: root,
      db,
      agentFactory: factory,
      policyText: "# trading-discipline\nTest discipline.",
    });
    expect(result.started).toBe(true);
    if (result.started) await result.done;

    const messages = await listAssistantMessages(session.id, db);
    expect(messages.map((row) => row.role)).toEqual(["user", "assistant"]);
  });

  it("rejects when no model is configured", async () => {
    const session = await createAssistantSession({ title: "New conversation" }, db);
    const result = await runAssistantChatTurn(session.id, "hello", {
      model: null,
      rootDir: root,
      db,
      policyText: "# trading-discipline\nTest discipline.",
    });
    expect(result).toEqual({ started: false, reason: "no_model" });
  });

  it("rejects when the session does not exist", async () => {
    const result = await runAssistantChatTurn("missing-session", "hello", {
      model,
      rootDir: root,
      db,
      policyText: "# trading-discipline\nTest discipline.",
    });
    expect(result).toEqual({ started: false, reason: "not_found" });
  });

  it("locks the session while a turn is in flight", async () => {
    const session = await createAssistantSession({ title: "New conversation" }, db);
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let signalStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => {
      signalStarted = resolve;
    });
    const factory: AiAgentFactory = (config) => ({
      prompt: async () => {
        signalStarted();
        await gate;
      },
      abort: () => undefined,
      state: { messages: [...(config.messages ?? [])] },
    });
    const deps = { model, rootDir: root, db, agentFactory: factory, policyText: "# trading-discipline\nTest discipline." };

    const first = await runAssistantChatTurn(session.id, "first message", deps);
    expect(first.started).toBe(true);
    await started;
    expect(assistantChatTurnState(session.id).busy).toBe(true);
    expect(await runAssistantChatTurn(session.id, "second message", deps)).toEqual({ started: false, reason: "busy" });

    release();
    if (first.started) await first.done;
    expect(assistantChatTurnState(session.id)).toEqual({ busy: false, partial: "" });
  });

  it("streams deltas live, broadcasts aborted, and persists the partial through the injected db", async () => {
    const session = await createAssistantSession({ title: "New conversation" }, db);
    const events: ChatEvent[] = [];
    const unsub = onAssistantChatEvent(session.id, (event) => events.push(event));

    let rejectPrompt: ((err: Error) => void) | undefined;
    const factory: AiAgentFactory = (config) => {
      let listener: ((event: AgentEvent) => void) | undefined;
      return {
        prompt: () =>
          new Promise((_resolve, reject) => {
            rejectPrompt = reject;
            listener?.({ type: "message_start", message: assistant("") });
            const message = assistant("partial answer");
            listener?.({
              type: "message_update",
              message,
              assistantMessageEvent: { type: "text_delta", contentIndex: 0, delta: "partial answer", partial: message as never },
            });
            queueMicrotask(() => {
              expect(abortAssistantChatTurn(session.id)).toBe(true);
            });
          }),
        abort: () => rejectPrompt?.(new Error("aborted")),
        subscribe: (l) => {
          listener = l;
          return () => {
            listener = undefined;
          };
        },
        state: { messages: [...(config.messages ?? [])] },
      };
    };

    const result = await runAssistantChatTurn(session.id, "tell me", {
      model,
      rootDir: root,
      db,
      agentFactory: factory,
      policyText: "# trading-discipline\nTest discipline.",
    });
    expect(result.started).toBe(true);
    if (result.started) await result.done;
    unsub();

    expect(events).toEqual([{ event: "delta", text: "partial answer" }, { event: "aborted" }]);
    const messages = await listAssistantMessages(session.id, db);
    expect(messages.map((row) => row.role)).toEqual(["user", "assistant"]);
    expect(messages[1].payload).toMatchObject({
      role: "assistant",
      content: [{ type: "text", text: "partial answer" }],
      stopReason: "aborted",
    });
  });

  it("exposes exactly the read-only bash/read-file tool set", async () => {
    const session = await createAssistantSession({ title: "New conversation" }, db);
    let capturedToolNames: string[] = [];
    const factory: AiAgentFactory = (config) => {
      capturedToolNames = config.tools.map((tool) => tool.name);
      const state = { messages: [...(config.messages ?? [])] };
      return {
        prompt: async () => {
          state.messages.push(assistant("okay"));
        },
        abort: () => undefined,
        state,
      };
    };

    const result = await runAssistantChatTurn(session.id, "hello", {
      model,
      rootDir: root,
      db,
      agentFactory: factory,
      policyText: "# trading-discipline\nTest discipline.",
    });
    expect(result.started).toBe(true);
    if (result.started) await result.done;

    expect([...capturedToolNames].sort()).toEqual(["bash", "read_file"].sort());
  });

  it("includes the policy text and the own prompt in the system prompt", async () => {
    const session = await createAssistantSession({ title: "New conversation" }, db);
    let capturedSystemPrompt = "";
    const factory: AiAgentFactory = (config) => {
      capturedSystemPrompt = config.systemPrompt ?? "";
      const state = { messages: [...(config.messages ?? [])] };
      return {
        prompt: async () => {
          state.messages.push(assistant("okay"));
        },
        abort: () => undefined,
        state,
      };
    };

    const result = await runAssistantChatTurn(session.id, "hello", {
      model,
      rootDir: root,
      db,
      agentFactory: factory,
      policyText: "# trading-discipline\nTest discipline marker.",
    });
    expect(result.started).toBe(true);
    if (result.started) await result.done;

    expect(capturedSystemPrompt).toContain("Test discipline marker.");
    expect(capturedSystemPrompt).toContain("built-in assistant");
  });

  it("runs with the default prompt when no policy file exists", async () => {
    const emptyRoot = mkdtempSync(join(tmpdir(), "assistant-chat-nopolicy-"));
    const session = await createAssistantSession({ title: "New conversation" }, db);
    let capturedSystemPrompt = "";
    const factory: AiAgentFactory = (config) => {
      capturedSystemPrompt = config.systemPrompt ?? "";
      const state = { messages: [...(config.messages ?? [])] };
      return {
        prompt: async () => {
          state.messages.push(assistant("okay"));
        },
        abort: () => undefined,
        state,
      };
    };

    const result = await runAssistantChatTurn(session.id, "hello", {
      model,
      rootDir: emptyRoot,
      db,
      agentFactory: factory,
    });
    expect(result.started).toBe(true);
    if (result.started) await result.done;
    expect(capturedSystemPrompt).toContain("built-in assistant");
    rmSync(emptyRoot, { recursive: true, force: true });
  });

  it("sums per-session usage across persisted assistant messages", async () => {
    const session = await createAssistantSession({ title: "Usage session" }, db);
    const usageA = { ...ZERO_USAGE, totalTokens: 100, cost: { ...ZERO_USAGE.cost, total: 0.5 } };
    const usageB = { ...ZERO_USAGE, totalTokens: 250, cost: { ...ZERO_USAGE.cost, total: 1.25 } };
    const factory: AiAgentFactory = (config) => {
      const state = { messages: [...(config.messages ?? [])] };
      return {
        prompt: async (text) => {
          state.messages.push({ role: "user", content: text, timestamp: Date.now() });
          state.messages.push(assistant("first answer", usageA));
        },
        abort: () => undefined,
        state,
      };
    };
    const deps = { model, rootDir: root, db, agentFactory: factory, policyText: "# trading-discipline\nTest discipline." };

    const first = await runAssistantChatTurn(session.id, "first question", deps);
    expect(first.started).toBe(true);
    if (first.started) await first.done;

    const factory2: AiAgentFactory = (config) => {
      const state = { messages: [...(config.messages ?? [])] };
      return {
        prompt: async (text) => {
          state.messages.push({ role: "user", content: text, timestamp: Date.now() });
          state.messages.push(assistant("second answer", usageB));
        },
        abort: () => undefined,
        state,
      };
    };
    const second = await runAssistantChatTurn(session.id, "second question", { ...deps, agentFactory: factory2 });
    expect(second.started).toBe(true);
    if (second.started) await second.done;

    const total = await sumAssistantSessionUsage(session.id, db);
    expect(total).toEqual({ totalTokens: 350, costTotal: 1.75, calls: 2 });
  });

  it("sumAssistantSessionUsage ignores messages without usage fields", async () => {
    const session = await createAssistantSession({ title: "No-usage session" }, db);
    const factory: AiAgentFactory = (config) => {
      const state = { messages: [...(config.messages ?? [])] };
      return {
        prompt: async (text) => {
          state.messages.push({ role: "user", content: text, timestamp: Date.now() });
          state.messages.push({ role: "assistant", content: [{ type: "text", text: "no usage data" }], timestamp: Date.now() } as AgentMessage);
        },
        abort: () => undefined,
        state,
      };
    };
    const result = await runAssistantChatTurn(session.id, "quick question", {
      model,
      rootDir: root,
      db,
      agentFactory: factory,
      policyText: "# trading-discipline\nTest discipline.",
    });
    expect(result.started).toBe(true);
    if (result.started) await result.done;

    const total = await sumAssistantSessionUsage(session.id, db);
    expect(total).toEqual({ totalTokens: 0, costTotal: 0, calls: 0 });
  });
});
