import type { AgentTool } from "@earendil-works/pi-agent-core";
import type { Db } from "../db/index.js";
import { PROJECT_ROOT } from "../env.js";
import { buildBashTool, buildReadFileTool, createDefaultExec, type ExecFn } from "./agentTools.js";
import type { AiAgentFactory } from "./agentSession.js";
import {
  appendAssistantMessages,
  type AssistantSession,
  getAssistantSession,
  listAssistantMessages,
} from "./assistantChatStore.js";
import type { ChatEvent } from "./displayMessages.js";
import { type ConversationPreparedTurn, createConversationEngine } from "./conversationEngine.js";
import { composeWithPolicy, loadSystemPolicy } from "./promptPolicy.js";
import type { AiModel } from "./models.js";

export interface AssistantChatDeps {
  model: AiModel | null;
  rootDir?: string;
  db?: Db;
  agentFactory?: AiAgentFactory;
  timeoutMs?: number;
  policyText?: string | null;
  exec?: ExecFn;
}

export type AssistantChatStartResult =
  | { started: false; reason: "busy" | "no_model" | "not_found" }
  | { started: true; done: Promise<void> };

const OWN_PROMPT = [
  "You are the built-in assistant of this application.",
  "You have a read-only bash tool and a read-file tool scoped to the app root.",
  "Answer concisely; cite file paths when you reference repository content.",
].join("\n");

function buildSystemPrompt(policyText: string | null): string {
  return composeWithPolicy(policyText, OWN_PROMPT);
}

function prepareTurn(
  sessionId: string,
  session: AssistantSession,
  model: AiModel,
  deps: AssistantChatDeps,
): ConversationPreparedTurn {
  const rootDir = deps.rootDir ?? PROJECT_ROOT;
  return {
    model,
    agentFactory: deps.agentFactory,
    timeoutMs: deps.timeoutMs,
    store: {
      getSession: () => getAssistantSession(sessionId, deps.db),
      createSession: () => Promise.resolve(session),
      listMessages: (id) => listAssistantMessages(id, deps.db),
      appendMessages: (id, messages) => appendAssistantMessages(id, messages, deps.db),
    },
    buildTurn: async () => {
      const policyText = deps.policyText !== undefined ? deps.policyText : loadSystemPolicy(rootDir);
      const exec = deps.exec ?? createDefaultExec(rootDir);
      const tools: AgentTool[] = [buildBashTool(exec), buildReadFileTool(rootDir)];
      return {
        scope: "assistant",
        origin: "assistant",
        systemPrompt: buildSystemPrompt(policyText),
        tools,
      };
    },
  };
}

const engine = createConversationEngine<AssistantChatDeps, "no_model" | "not_found">({
  layer: "assistant",
  logLabels: {
    persistFailure: "assistant chat: failed to persist partial response",
    preTurnFailure: "assistant chat: turn failed before model execution",
  },
  prepare: async (sessionId, _text, deps) => {
    if (!deps.model) return { ok: false, reason: "no_model" };
    const session = await getAssistantSession(sessionId, deps.db);
    if (!session) return { ok: false, reason: "not_found" };
    return { ok: true, turn: prepareTurn(sessionId, session, deps.model, deps) };
  },
});

export function onAssistantChatEvent(sessionId: string, listener: (event: ChatEvent) => void): () => void {
  return engine.onEvent(sessionId, listener);
}

export function assistantChatTurnState(sessionId: string): { busy: boolean; partial: string } {
  return engine.turnState(sessionId);
}

export function abortAssistantChatTurn(sessionId: string): boolean {
  return engine.abort(sessionId);
}

export function runAssistantChatTurn(
  sessionId: string,
  text: string,
  deps: AssistantChatDeps,
): Promise<AssistantChatStartResult> {
  return engine.run(sessionId, text, deps);
}
