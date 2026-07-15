import type { AgentMessage } from "@earendil-works/pi-agent-core";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [index("notes_updated").on(t.updatedAt)],
);

export const aiUsage = sqliteTable(
  "ai_usage",
  {
    id: text("id").primaryKey(),
    ts: text("ts").notNull(),
    day: text("day").notNull(),
    layer: text("layer").notNull(),
    scope: text("scope").notNull(),
    model: text("model").notNull(),
    origin: text("origin"),
    calls: integer("calls").notNull(),
    totalTokens: integer("total_tokens").notNull(),
    input: integer("input").notNull(),
    output: integer("output").notNull(),
    cacheRead: integer("cache_read").notNull(),
    cacheWrite: integer("cache_write").notNull(),
    costTotal: real("cost_total").notNull(),
  },
  (t) => [index("ai_usage_day").on(t.day)],
);

export const chatMessages = sqliteTable(
  "chat_messages",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    ts: text("ts").notNull(),
    role: text("role").notNull(),
    payload: text("payload", { mode: "json" }).$type<AgentMessage>().notNull(),
  },
  (t) => [index("chat_messages_session").on(t.sessionId)],
);

export const assistantSessions = sqliteTable(
  "assistant_sessions",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [index("assistant_sessions_updated").on(t.updatedAt)],
);

export const aiRoleSettings = sqliteTable("ai_role_settings", {
  role: text("role").primaryKey(),
  mode: text("mode").notNull(),
  provider: text("provider"),
  modelId: text("model_id"),
  thinkingLevel: text("thinking_level"),
  updatedAt: text("updated_at").notNull(),
});

export const providerCredentials = sqliteTable("provider_credentials", {
  provider: text("provider").primaryKey(),
  secret: text("secret").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
