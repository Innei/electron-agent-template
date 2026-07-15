export type RoleMode = "custom" | "disabled" | "inherit";
export type Role = "chat";

export interface RoleSetting {
  mode: RoleMode;
  provider: string | null;
  modelId: string | null;
  thinkingLevel: string | null;
  stale: boolean;
}

export type AiRoles = Record<Role | "primary", RoleSetting>;

export interface CredentialEntry {
  provider: string;
  kind: "api_key" | "oauth";
  masked: string | null;
  updatedAt: string;
  ok: boolean;
}

export type MasterKeyStatus = "ready" | "missing" | "invalid";

export interface AiSettings {
  roles: AiRoles;
  credentials: CredentialEntry[];
  masterKey: MasterKeyStatus;
}

export interface RoleUsage {
  calls: number;
  cost: number;
}

export interface UsageToday {
  roles: Record<Role, RoleUsage>;
  total: RoleUsage;
}

export interface CatalogModel {
  id: string;
  name: string;
  thinkingLevels: string[];
}

export interface CatalogAuth {
  kind: "api_key" | "oauth";
  status: "configured" | "missing" | "error";
}

export interface CatalogProvider {
  id: string;
  name: string;
  auth: CatalogAuth;
  models: CatalogModel[];
}

export interface Catalog {
  providers: CatalogProvider[];
}

export const ROLES: Role[] = ["chat"];

export const ROLE_LABEL: Record<Role, string> = {
  chat: "Assistant",
};

export const CODEX_PROVIDER = "openai-codex";

export const THINKING_LABEL: Record<string, string> = {
  off: "No thinking",
  minimal: "Minimal",
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Extra high",
};

export function thinkingLabel(level: string | null): string {
  return level ? (THINKING_LABEL[level] ?? level) : THINKING_LABEL.off;
}
