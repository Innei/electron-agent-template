import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "../../lib/apiHooks";
import { client } from "../../lib/client";
import { navigate } from "../../router";
import { icon, noteBlock, page } from "../../styles/layout.css";
import { Button, Card, ErrorBox, SectionTitle } from "../../ui";
import { useTitle } from "../../lib/useTitle";
import { DataRootSection } from "./DataRootSection";
import { DiagnosticsSection } from "./DiagnosticsSection";
import { ProviderCredentialsSection } from "./ProviderCredentialsSection";
import { RoleModelsCard } from "./RoleModelsCard";
import { SettingsStatusStrip } from "./SettingsStatusStrip";
import { deriveSettingsViewModel } from "./settingsViewModel";
import type { AiRoles, AiSettings, Catalog, Role, RoleSetting, UsageToday } from "./types";
import * as s from "./settings.css";

function SettingsWorkspace({
  settings,
  catalog,
  usage,
  usageError,
  reloadUsage,
  reloadAll,
}: {
  settings: AiSettings;
  catalog: Catalog;
  usage: UsageToday | null;
  usageError: string | null;
  reloadUsage: () => void;
  reloadAll: () => void;
}) {
  const [roleDrafts, setRoleDrafts] = useState<AiRoles>(() => settings.roles);
  const updateRoleDraft = (role: Role | "primary", next: RoleSetting) => {
    setRoleDrafts((current) => ({ ...current, [role]: next }));
  };
  const view = deriveSettingsViewModel({ settings, catalog, usage, roles: roleDrafts });
  const usedProviderIds = Array.from(
    new Set(
      Object.values(roleDrafts).flatMap((setting) =>
        setting.mode === "custom" && setting.provider ? [setting.provider] : [],
      ),
    ),
  );

  return (
    <>
      <SettingsStatusStrip summary={view.summary} usageError={usageError} onRetryUsage={reloadUsage} />
      <div className={s.workspace}>
        <div className={s.column}>
          <RoleModelsCard
            initialRoles={settings.roles}
            roles={roleDrafts}
            catalog={catalog}
            credentials={settings.credentials}
            view={view}
            onDraftChange={updateRoleDraft}
          />
          <Card className={s.cardFlush}>
            <ProviderCredentialsSection
              settings={settings}
              catalog={catalog}
              usedProviderIds={usedProviderIds}
              onChanged={reloadAll}
            />
          </Card>
        </div>
        <div className={s.column}>
          <Card className={s.cardFlush}>
            <div className={s.cardHeading}>
              <SectionTitle>Connections</SectionTitle>
            </div>
            <DataRootSection />
            <DiagnosticsSection />
          </Card>
        </div>
      </div>
    </>
  );
}

function SettingsBackLink() {
  return (
    <a
      className={s.backLink}
      href="/"
      onClick={(event) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (window.history.length > 1) window.history.back();
        else navigate("/");
      }}
    >
      <ArrowLeft className={icon} size={13} /> Back
    </a>
  );
}

export function SettingsPage() {
  useTitle("Settings");
  const { data: settings, error: settingsError, reload: reloadSettings } = useQuery<AiSettings>(
    "settings.getAi",
    () => client.settings.getAi(),
  );
  const { data: catalog, error: catalogError, reload: reloadCatalog } = useQuery<Catalog>(
    "settings.getCatalog",
    () => client.settings.getCatalog(),
  );
  const { data: usage, error: usageError, reload: reloadUsage } = useQuery<UsageToday>(
    "settings.getUsageToday",
    () => client.settings.getUsageToday(),
  );
  const reloadAll = () => {
    reloadSettings();
    reloadCatalog();
  };

  if (settingsError || catalogError) {
    return (
      <div className={`${page} ${s.settingsPage}`}>
        <SettingsBackLink />
        <h1>Settings</h1>
        <ErrorBox className={s.loadError}>
          <span>{settingsError ?? catalogError}</span>
          <Button
            onClick={() => {
              reloadSettings();
              reloadCatalog();
            }}
          >
            Retry
          </Button>
        </ErrorBox>
      </div>
    );
  }

  if (!settings || !catalog) {
    return (
      <div className={`${page} ${s.settingsPage}`}>
        <SettingsBackLink />
        <h1>Settings</h1>
        <div className={noteBlock}>Loading…</div>
      </div>
    );
  }

  return (
    <div className={`${page} ${s.settingsPage}`}>
      <SettingsBackLink />
      <h1>Settings</h1>
      <div className={s.pageSubtitle}>AI models, providers, and usage</div>
      <SettingsWorkspace
        settings={settings}
        catalog={catalog}
        usage={usage}
        usageError={usageError}
        reloadUsage={reloadUsage}
        reloadAll={reloadAll}
      />
    </div>
  );
}
