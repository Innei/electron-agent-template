import { assistantChatTurnState, onAssistantChatEvent } from "../ai/assistantChat.js";
import type { ChatEvent } from "../ai/displayMessages.js";
import type { Connection } from "./connection.js";
import { onNotesChanged } from "../modules/notes/notes.events.js";

const MAX_CHANNELS_PER_SOCKET = 16;

export interface WsSub {
  op: "sub";
  key: string;
  kind: "assistant-chat" | "notes";
  id?: string;
}

export interface WsUnsub {
  op: "unsub";
  key: string;
}

export type WsClientMessage = WsSub | WsUnsub;

export function parseWsMessage(raw: unknown): WsClientMessage | null {
  if (typeof raw !== "object" || raw === null) return null;
  const msg = raw as Record<string, unknown>;
  if (typeof msg.key !== "string" || !msg.key || msg.key.length > 200) return null;
  if (msg.op === "unsub") return { op: "unsub", key: msg.key };
  if (msg.op !== "sub") return null;
  if (msg.kind === "assistant-chat") {
    if (typeof msg.id !== "string" || !msg.id) return null;
    return { op: "sub", key: msg.key, kind: "assistant-chat", id: msg.id };
  }
  if (msg.kind === "notes") {
    return { op: "sub", key: msg.key, kind: "notes" };
  }
  return null;
}

function attachConversation(
  key: string,
  push: (envelope: string) => void,
  subscribe: (key: string, listener: (event: ChatEvent) => void) => () => void,
  turnState: (key: string) => { busy: boolean; partial: string },
): () => void {
  const unsub = subscribe(key, (event) => push(JSON.stringify({ type: "event", event })));
  const { busy, partial } = turnState(key);
  push(JSON.stringify({ type: "init", busy, partial }));
  return unsub;
}

function attachNotes(push: (envelope: string) => void): () => void {
  const unsub = onNotesChanged((event) => push(JSON.stringify({ type: "changed", ...event })));
  push(JSON.stringify({ type: "init" }));
  return unsub;
}

async function attachChannel(msg: WsSub, push: (envelope: string) => void): Promise<() => void> {
  if (msg.kind === "assistant-chat")
    return attachConversation(msg.id as string, push, onAssistantChatEvent, assistantChatTurnState);
  return attachNotes(push);
}

export function handleConnection(conn: Connection): void {
  const subs = new Map<string, () => void>();
  let closed = false;

  const send = (key: string, envelope: string) => {
    if (!closed) conn.send(`{"key":${JSON.stringify(key)},"payload":${envelope}}`);
  };

  const handle = async (raw: string) => {
    let msg: WsClientMessage | null;
    try {
      msg = parseWsMessage(JSON.parse(raw));
    } catch {
      return;
    }
    if (!msg || closed) return;
    if (msg.op === "unsub") {
      subs.get(msg.key)?.();
      subs.delete(msg.key);
      return;
    }
    if (subs.has(msg.key) || subs.size >= MAX_CHANNELS_PER_SOCKET) return;
    subs.set(msg.key, () => {});
    try {
      const unsub = await attachChannel(msg, (envelope) => send(msg.key, envelope));
      if (closed || !subs.has(msg.key)) {
        unsub();
        return;
      }
      subs.set(msg.key, unsub);
    } catch (err) {
      subs.delete(msg.key);
      send(
        msg.key,
        JSON.stringify({ type: "status", degraded: true, error: err instanceof Error ? err.message : String(err) }),
      );
    }
  };

  conn.onMessage((raw) => {
    void handle(raw);
  });
  conn.onClose(() => {
    closed = true;
    for (const unsub of subs.values()) unsub();
    subs.clear();
  });
}
