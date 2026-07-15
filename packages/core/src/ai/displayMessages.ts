import type { AgentMessage } from "@earendil-works/pi-agent-core";
import type { ConversationEvent } from "./conversationEngine.js";
import { stringifyPayload, textOf } from "./conversationShared.js";
import type { ConversationMessageRow } from "./conversationStore.js";
import { isUsage } from "./usage.js";

export type ChatEvent = ConversationEvent;

export interface ChatDisplayMessage {
  id: string;
  ts: string;
  kind: "user" | "assistant" | "tool";
  text?: string;
  label?: string;
  input?: string;
  output?: string;
  meta?: {
    provider: string;
    model: string;
    totalTokens: number;
    costTotal: number;
  };
}

function toolResultText(message: Extract<AgentMessage, { role: "toolResult" }>): string {
  return message.content.map(textOf).join("");
}

export function toDisplayMessages(rows: ConversationMessageRow[]): ChatDisplayMessage[] {
  const outputs = new Map<string, string>();
  for (const row of rows) {
    const message = row.payload;
    if (message.role === "toolResult") outputs.set(message.toolCallId, toolResultText(message));
  }

  const out: ChatDisplayMessage[] = [];
  for (const row of rows) {
    const message = row.payload;
    if (message.role === "user") {
      const text = typeof message.content === "string" ? message.content : message.content.map(textOf).join("");
      out.push({ id: row.id, ts: row.ts, kind: "user", text });
      continue;
    }
    if (message.role === "assistant") {
      let lastTextIndex = -1;
      for (let idx = message.content.length - 1; idx >= 0; idx -= 1) {
        if (message.content[idx]?.type === "text") {
          lastTextIndex = idx;
          break;
        }
      }
      const usage = isUsage(message.usage) ? message.usage : null;
      const meta =
        usage && (usage.totalTokens > 0 || usage.cost.total > 0)
          ? {
              provider: message.provider,
              model: message.model,
              totalTokens: usage.totalTokens,
              costTotal: usage.cost.total,
            }
          : undefined;
      message.content.forEach((block, idx) => {
        const id = idx === 0 ? row.id : `${row.id}:${idx}`;
        if (block.type === "text") {
          out.push({
            id,
            ts: row.ts,
            kind: "assistant",
            text: block.text,
            ...(idx === lastTextIndex && meta ? { meta } : {}),
          });
        } else if (block.type === "toolCall") {
          out.push({
            id,
            ts: row.ts,
            kind: "tool",
            label: block.name,
            input: stringifyPayload(block.arguments),
            output: stringifyPayload(outputs.get(block.id)),
          });
        }
      });
    }
  }
  return out;
}
