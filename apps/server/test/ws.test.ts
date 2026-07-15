import { createServer, type Server } from "node:http";
import { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WebSocket from "ws";
import type { Connection } from "../../../packages/core/src/realtime/connection.js";

vi.mock("../../../packages/core/src/ai/assistantChat.js", () => ({
  onAssistantChatEvent: vi.fn(),
  assistantChatTurnState: vi.fn(),
}));

const { parseWsMessage, handleConnection } = await import("../../../packages/core/src/realtime/channelProtocol.js");
const { attachWs } = await import("../src/realtime/wsHost.js");
const { emitNotesChanged } = await import("../../../packages/core/src/modules/notes/notes.events.js");
const { onAssistantChatEvent, assistantChatTurnState } = (await import(
  "../../../packages/core/src/ai/assistantChat.js"
)) as unknown as {
  onAssistantChatEvent: ReturnType<typeof vi.fn>;
  assistantChatTurnState: ReturnType<typeof vi.fn>;
};

class FakeConnection implements Connection {
  sent: string[] = [];
  private messageListeners: ((text: string) => void)[] = [];
  private closeListeners: (() => void)[] = [];

  send(text: string): void {
    this.sent.push(text);
  }
  onMessage(cb: (text: string) => void): void {
    this.messageListeners.push(cb);
  }
  onClose(cb: () => void): void {
    this.closeListeners.push(cb);
  }
  emitMessage(text: string): void {
    for (const cb of this.messageListeners) cb(text);
  }
  emitClose(): void {
    for (const cb of this.closeListeners) cb();
  }
}

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("parseWsMessage", () => {
  it("parses notes and assistant-chat subs and rejects unknown kinds", () => {
    expect(parseWsMessage({ op: "sub", key: "n", kind: "notes" })).toEqual({ op: "sub", key: "n", kind: "notes" });
    expect(parseWsMessage({ op: "sub", key: "a", kind: "assistant-chat", id: "s1" })).toEqual({
      op: "sub",
      key: "a",
      kind: "assistant-chat",
      id: "s1",
    });
    expect(parseWsMessage({ op: "sub", key: "a", kind: "assistant-chat" })).toBeNull();
    expect(parseWsMessage({ op: "sub", key: "q", kind: "quotes" })).toBeNull();
    expect(parseWsMessage({ op: "unsub", key: "n" })).toEqual({ op: "unsub", key: "n" });
    expect(parseWsMessage(null)).toBeNull();
  });
});

describe("handleConnection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notes channel replays init then pushes change events until unsub", async () => {
    const conn = new FakeConnection();
    handleConnection(conn);

    conn.emitMessage(JSON.stringify({ op: "sub", key: "n1", kind: "notes" }));
    await flush();
    expect(conn.sent).toHaveLength(1);
    expect(JSON.parse(conn.sent[0])).toEqual({ key: "n1", payload: { type: "init" } });

    emitNotesChanged({ noteId: "42", action: "created" });
    await flush();
    expect(conn.sent).toHaveLength(2);
    expect(JSON.parse(conn.sent[1])).toEqual({
      key: "n1",
      payload: { type: "changed", noteId: "42", action: "created" },
    });

    conn.emitMessage(JSON.stringify({ op: "unsub", key: "n1" }));
    emitNotesChanged({ noteId: "42", action: "deleted" });
    await flush();
    expect(conn.sent).toHaveLength(2);
  });

  it("assistant-chat channel replays turn state then forwards events", async () => {
    let listener: ((event: unknown) => void) | undefined;
    onAssistantChatEvent.mockImplementation((_id: string, cb: (event: unknown) => void) => {
      listener = cb;
      return () => {
        listener = undefined;
      };
    });
    assistantChatTurnState.mockReturnValue({ busy: true, partial: "half" });

    const conn = new FakeConnection();
    handleConnection(conn);
    conn.emitMessage(JSON.stringify({ op: "sub", key: "c1", kind: "assistant-chat", id: "s1" }));
    await flush();

    expect(JSON.parse(conn.sent[0])).toEqual({ key: "c1", payload: { type: "init", busy: true, partial: "half" } });

    listener?.({ event: "delta", text: "hi" });
    expect(JSON.parse(conn.sent[1])).toEqual({
      key: "c1",
      payload: { type: "event", event: { event: "delta", text: "hi" } },
    });
  });

  it("cleans up all channels on close", async () => {
    const unsub = vi.fn();
    onAssistantChatEvent.mockImplementation(() => unsub);
    assistantChatTurnState.mockReturnValue({ busy: false, partial: "" });

    const conn = new FakeConnection();
    handleConnection(conn);
    conn.emitMessage(JSON.stringify({ op: "sub", key: "c1", kind: "assistant-chat", id: "s1" }));
    await flush();
    conn.emitClose();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it("ignores duplicate keys and enforces the channel cap", async () => {
    const conn = new FakeConnection();
    handleConnection(conn);
    for (let i = 0; i < 20; i += 1) {
      conn.emitMessage(JSON.stringify({ op: "sub", key: `k${i}`, kind: "notes" }));
    }
    await flush();
    expect(conn.sent.length).toBeLessThanOrEqual(16);
  });
});

describe("attachWs", () => {
  let server: Server;
  let url: string;

  beforeEach(async () => {
    server = createServer();
    attachWs(server, "/api/ws");
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    url = `ws://127.0.0.1:${port}/api/ws`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("upgrades on the ws path and serves a notes sub end to end", async () => {
    const client = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      client.on("open", resolve);
      client.on("error", reject);
    });

    const received: string[] = [];
    client.on("message", (data) => received.push(String(data)));
    client.send(JSON.stringify({ op: "sub", key: "n1", kind: "notes" }));

    await vi.waitFor(() => {
      if (received.length === 0) throw new Error("no message yet");
    });
    expect(JSON.parse(received[0])).toEqual({ key: "n1", payload: { type: "init" } });

    await new Promise<void>((resolve) => {
      client.on("close", () => resolve());
      client.close();
    });
  });
});
