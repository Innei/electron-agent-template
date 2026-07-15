import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const SYSTEM_POLICY_FILE = join("prompts", "system-policy.md");

export function loadSystemPolicy(rootDir: string): string | null {
  const file = join(rootDir, SYSTEM_POLICY_FILE);
  if (!existsSync(file)) return null;
  const text = readFileSync(file, "utf8").trim();
  return text || null;
}

export function composeWithPolicy(policyText: string | null, systemPrompt: string): string {
  if (!policyText) return systemPrompt;
  return [policyText, "", "---", "", systemPrompt].join("\n");
}
