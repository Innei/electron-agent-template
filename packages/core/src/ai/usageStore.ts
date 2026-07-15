import { asc, desc, eq } from "drizzle-orm";
import type { AiUsageSummary } from "../../../shared/types.js";
import { getDb, type Db } from "../db/index.js";
import { aiUsage } from "../db/schema.js";
import { nextSnowflake } from "../db/snowflake.js";

export interface AiUsageRecord {
  ts: string;
  layer: string;
  scope: string;
  model: string;
  origin?: string;
  calls: number;
  total_tokens: number;
  input: number;
  output: number;
  cache_read: number;
  cache_write: number;
  cost_total: number;
}

export function localDay(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toRecord(row: typeof aiUsage.$inferSelect): AiUsageRecord {
  return {
    ts: row.ts,
    layer: row.layer,
    scope: row.scope,
    model: row.model,
    ...(row.origin != null ? { origin: row.origin } : {}),
    calls: row.calls,
    total_tokens: row.totalTokens,
    input: row.input,
    output: row.output,
    cache_read: row.cacheRead,
    cache_write: row.cacheWrite,
    cost_total: row.costTotal,
  };
}

export async function listUsage(date: string, db: Db = getDb()): Promise<AiUsageRecord[]> {
  const rows = await db.select().from(aiUsage).where(eq(aiUsage.day, date)).orderBy(asc(aiUsage.ts), asc(aiUsage.id));
  return rows.map(toRecord);
}

export async function listUsageDates(limit = 30, db: Db = getDb()): Promise<string[]> {
  const rows = await db.selectDistinct({ date: aiUsage.day }).from(aiUsage).orderBy(desc(aiUsage.day)).limit(limit);
  return rows.map((r) => r.date);
}

export async function appendUsage(record: AiUsageRecord, db: Db = getDb()): Promise<void> {
  await db.insert(aiUsage).values({
    id: nextSnowflake(),
    ts: record.ts,
    day: localDay(new Date(record.ts)),
    layer: record.layer,
    scope: record.scope,
    model: record.model,
    origin: record.origin ?? null,
    calls: record.calls,
    totalTokens: record.total_tokens,
    input: record.input,
    output: record.output,
    cacheRead: record.cache_read,
    cacheWrite: record.cache_write,
    costTotal: record.cost_total,
  });
}

export function summarizeUsage(date: string, records: AiUsageRecord[]): AiUsageSummary {
  const summary: AiUsageSummary = {
    date,
    runs: records.length,
    calls: 0,
    total_tokens: 0,
    cost_total: 0,
    by_layer: {},
  };
  for (const record of records) {
    summary.calls += record.calls;
    summary.total_tokens += record.total_tokens;
    summary.cost_total += record.cost_total;
    const layer = summary.by_layer[record.layer] ?? { runs: 0, total_tokens: 0, cost_total: 0 };
    layer.runs += 1;
    layer.total_tokens += record.total_tokens;
    layer.cost_total += record.cost_total;
    summary.by_layer[record.layer] = layer;
  }
  return summary;
}
