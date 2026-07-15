export interface AiUsageSummary {
  date: string;
  runs: number;
  calls: number;
  total_tokens: number;
  cost_total: number;
  by_layer: Record<string, { runs: number; total_tokens: number; cost_total: number }>;
}
