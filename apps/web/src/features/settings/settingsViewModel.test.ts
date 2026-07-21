import { describe, expect, it } from "vitest";
import { deriveSettingsViewModel } from "./settingsViewModel";
import type { AiSettings, Catalog, RoleSetting, UsageToday } from "./types";

const custom = (provider: string, modelId: string): RoleSetting => ({
  mode: "custom",
  provider,
  modelId,
  thinkingLevel: "off",
  stale: false,
});

const inherit: RoleSetting = { mode: "inherit", provider: null, modelId: null, thinkingLevel: null, stale: false };
const disabled: RoleSetting = { mode: "disabled", provider: null, modelId: null, thinkingLevel: null, stale: false };

const roles = {
  primary: custom("deepseek", "deepseek-v4"),
  chat: inherit,
};

const settings: AiSettings = {
  roles,
  credentials: [
    { provider: "deepseek", kind: "api_key", masked: "sk-••••9A2F", updatedAt: "2026-07-10", ok: true },
  ],
  masterKey: "ready",
};

const catalog: Catalog = {
  providers: [
    {
      id: "deepseek",
      name: "DeepSeek",
      auth: { kind: "api_key", status: "configured" },
      models: [{ id: "deepseek-v4", name: "DeepSeek V4", thinkingLevels: ["off"] }],
    },
    {
      id: "anthropic",
      name: "Anthropic",
      auth: { kind: "api_key", status: "missing" },
      models: [{ id: "claude-opus", name: "Claude Opus", thinkingLevels: ["off", "high"] }],
    },
    {
      id: "openai-codex",
      name: "OpenAI Codex",
      auth: { kind: "oauth", status: "missing" },
      models: [{ id: "gpt-5.4", name: "GPT-5.4", thinkingLevels: ["off", "high"] }],
    },
  ],
};

const usage: UsageToday = {
  roles: {
    chat: { calls: 28, cost: 0.64 },
  },
  total: { calls: 28, cost: 0.64 },
};

describe("deriveSettingsViewModel", () => {
  it("resolves an inherited role from the primary model", () => {
    const view = deriveSettingsViewModel({ settings, catalog, usage, roles });

    expect(view.roles.chat.effectiveLabel).toBe("DeepSeek V4 · No thinking");
    expect(view.issues).toEqual([]);
    expect(view.summary.statusLabel).toBe("All configured");
  });

  it("flags a provider without credentials", () => {
    const chatOnAnthropic = { ...roles, chat: custom("anthropic", "claude-opus") };
    const view = deriveSettingsViewModel({
      settings: { ...settings, roles: chatOnAnthropic },
      catalog,
      usage,
      roles: chatOnAnthropic,
    });

    expect(view.issues.map((issue) => issue.id)).toEqual(["missing-auth-anthropic"]);
    expect(view.roles.chat.effectiveLabel).toBe("Anthropic has no credentials — this role is paused");
    expect(view.summary.statusLabel).toBe("1 issues to resolve");
  });

  it("reports one missing-primary issue for all inherited roles", () => {
    const missingPrimaryRoles = { ...roles, primary: disabled };
    const view = deriveSettingsViewModel({
      settings: { ...settings, roles: missingPrimaryRoles },
      catalog,
      usage,
      roles: missingPrimaryRoles,
    });

    expect(view.issues.map((issue) => issue.id)).toEqual(["missing-primary"]);
    expect(view.roles.chat.effectiveLabel).toBe("Primary model unset — this role is paused");
  });

  it("sorts master-key errors ahead of stale custom models", () => {
    const staleRoles = { ...roles, chat: { ...custom("anthropic", "claude-opus"), stale: true } };
    const view = deriveSettingsViewModel({
      settings: { ...settings, roles: staleRoles, masterKey: "invalid" },
      catalog,
      usage,
      roles: staleRoles,
    });

    expect(view.issues.map((issue) => issue.id)).toEqual(["master-key-invalid", "stale-model-chat"]);
    expect(view.summary.statusTone).toBe("down");
  });

  it("reports missing Codex login only when an enabled role uses Codex", () => {
    const codexRoles = { ...roles, chat: custom("openai-codex", "gpt-5.4") };
    const view = deriveSettingsViewModel({
      settings: { ...settings, roles: codexRoles },
      catalog,
      usage,
      roles: codexRoles,
    });

    expect(view.issues.map((issue) => issue.id)).toEqual(["missing-auth-openai-codex"]);
    expect(view.roles.chat.tone).toBe("warning");
  });

  it("keeps configuration usable when today's usage cannot load", () => {
    const view = deriveSettingsViewModel({ settings, catalog, usage: null, roles });

    expect(view.summary.usageLabel).toBe("Unavailable");
    expect(view.roles.chat.usageLabel).toBe("Today —");
  });
});
