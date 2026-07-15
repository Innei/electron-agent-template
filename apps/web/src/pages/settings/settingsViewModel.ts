import {
  ROLE_LABEL,
  ROLES,
  thinkingLabel,
  type AiSettings,
  type Catalog,
  type Role,
  type RoleSetting,
  type RoleUsage,
  type UsageToday,
} from "./types";

export type SettingsIssueTone = "warning" | "error";

export interface SettingsIssue {
  id: string;
  title: string;
  detail: string;
  targetId: string;
  tone: SettingsIssueTone;
  priority: number;
}

export interface RoleView {
  effectiveLabel: string;
  tone: "default" | "muted" | "warning" | "error";
  usageLabel: string;
}

export interface SettingsViewModel {
  summary: {
    statusLabel: string;
    statusTone: "up" | "accent" | "down";
    enabledLabel: string;
    usageLabel: string;
  };
  roles: Record<Role, RoleView>;
  issues: SettingsIssue[];
}

const formatUsage = (usage: RoleUsage | undefined): string =>
  !usage || (usage.calls === 0 && usage.cost === 0)
    ? "Today —"
    : `Today $` + usage.cost.toFixed(2) + ` · ` + usage.calls + ` calls`;

export function deriveSettingsViewModel(input: {
  settings: AiSettings;
  catalog: Catalog;
  usage: UsageToday | null;
  roles: AiSettings["roles"];
}): SettingsViewModel {
  const providers = new Map(input.catalog.providers.map((provider) => [provider.id, provider]));
  const issues: SettingsIssue[] = [];
  const missingPrimaryRoles: Role[] = [];
  const stalePrimaryRoles: Role[] = [];
  const authRoles = new Map<string, Role[]>();
  const roleViews = {} as Record<Role, RoleView>;

  if (input.settings.masterKey === "invalid") {
    issues.push({
      id: "master-key-invalid",
      title: "Master key error",
      detail: "Stored credentials cannot be decrypted; reset and re-enter them.",
      targetId: "settings-provider-panel",
      tone: "error",
      priority: 0,
    });
  }

  const validateSetting = (role: Role, setting: RoleSetting, inherited: boolean): RoleView => {
    const provider = setting.provider ? providers.get(setting.provider) : undefined;
    const model = provider?.models.find((entry) => entry.id === setting.modelId);
    const thinkingValid = Boolean(
      setting.thinkingLevel && model?.thinkingLevels.includes(setting.thinkingLevel),
    );

    if (setting.stale || !provider || !model || !thinkingValid) {
      if (inherited) {
        stalePrimaryRoles.push(role);
      } else {
        issues.push({
          id: `stale-model-` + role,
          title: ROLE_LABEL[role] + " model is stale",
          detail: "The selected model or thinking level is no longer in the catalog; pick a new one.",
          targetId: `settings-role-` + role,
          tone: "warning",
          priority: 1,
        });
      }
      return {
        effectiveLabel: "Model no longer in catalog — pick another",
        tone: "warning",
        usageLabel: formatUsage(input.usage?.roles[role]),
      };
    }

    if (provider.auth.status !== "configured") {
      const usedBy = authRoles.get(provider.id) ?? [];
      if (!usedBy.includes(role)) usedBy.push(role);
      authRoles.set(provider.id, usedBy);
      return {
        effectiveLabel: provider.name + " has no credentials — this role is paused",
        tone: provider.auth.status === "error" ? "error" : "warning",
        usageLabel: formatUsage(input.usage?.roles[role]),
      };
    }

    return {
      effectiveLabel: model.name + " · " + thinkingLabel(setting.thinkingLevel),
      tone: "default",
      usageLabel: formatUsage(input.usage?.roles[role]),
    };
  };

  for (const role of ROLES) {
    const setting = input.roles[role];
    if (setting.mode === "disabled") {
      roleViews[role] = {
        effectiveLabel: "Disabled — no calls will be made",
        tone: "muted",
        usageLabel: formatUsage(input.usage?.roles[role]),
      };
      continue;
    }

    if (setting.mode === "inherit") {
      const primary = input.roles.primary;
      if (
        primary.mode !== "custom" ||
        !primary.provider ||
        !primary.modelId ||
        !primary.thinkingLevel
      ) {
        missingPrimaryRoles.push(role);
        roleViews[role] = {
          effectiveLabel: "Primary model unset — this role is paused",
          tone: "warning",
          usageLabel: formatUsage(input.usage?.roles[role]),
        };
      } else {
        roleViews[role] = validateSetting(role, primary, true);
      }
      continue;
    }

    roleViews[role] = validateSetting(role, setting, false);
  }

  if (stalePrimaryRoles.length > 0) {
    issues.push({
      id: "stale-model-primary",
      title: "Primary model is stale",
      detail: stalePrimaryRoles.map((role) => ROLE_LABEL[role]).join(", ") + " follows the primary model.",
      targetId: "settings-role-primary",
      tone: "warning",
      priority: 1,
    });
  }

  for (const [providerId, roles] of authRoles) {
    const provider = providers.get(providerId);
    if (!provider) continue;
    const authError = provider.auth.status === "error";
    const skipForInvalidMasterKey =
      input.settings.masterKey === "invalid" && provider.auth.kind === "api_key";
    if (skipForInvalidMasterKey) continue;
    issues.push({
      id: (authError ? "auth-error-" : "missing-auth-") + providerId,
      title: provider.name + (authError ? " auth error" : " has no credentials"),
      detail: roles.map((role) => ROLE_LABEL[role]).join(", ") + " depends on this provider.",
      targetId: `settings-provider-` + providerId,
      tone: authError ? "error" : "warning",
      priority: 2,
    });
  }

  if (missingPrimaryRoles.length > 0) {
    issues.push({
      id: "missing-primary",
      title: "Primary model unset",
      detail: missingPrimaryRoles.map((role) => ROLE_LABEL[role]).join(", ") + " follows the primary model.",
      targetId: "settings-role-primary",
      tone: "warning",
      priority: 3,
    });
  }

  issues.sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id));

  const enabledCount = ROLES.filter((role) => input.roles[role].mode !== "disabled").length;

  return {
    summary: {
      statusLabel: issues.length === 0 ? "All configured" : issues.length + " issues to resolve",
      statusTone: issues.some((issue) => issue.tone === "error")
        ? "down"
        : issues.length
          ? "accent"
          : "up",
      enabledLabel: enabledCount + "/" + ROLES.length + " roles enabled",
      usageLabel: input.usage
        ? "$" + input.usage.total.cost.toFixed(2) + " · " + input.usage.total.calls + " calls"
        : "Unavailable",
    },
    roles: roleViews,
    issues,
  };
}
