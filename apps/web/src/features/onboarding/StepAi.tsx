import { type ReactNode, useState } from "react";
import { errorMessage } from "../../lib/api";
import { useQuery } from "../../lib/apiHooks";
import { client } from "../../lib/client";
import { defaultThinkingLevel, firstModelId, saveRole } from "../settings/roleShared";
import { CODEX_PROVIDER, type Catalog } from "../settings/types";
import { Button, Card, Input, Select } from "../../ui";
import { CodexLogo, KeyLogo } from "./brandLogos";
import { credActions, testResult, testResultFail } from "../settings/settings.css";
import * as s from "./StepAi.css";

const CODEX_INSTALL_COMMAND = "npm install -g @openai/codex";
const CODEX_INSTALL_URL = "https://github.com/openai/codex";

function fetchCatalog(): Promise<Catalog> {
  return client.settings.getCatalog() as Promise<Catalog>;
}

async function connectPrimary(catalog: Catalog, providerId: string): Promise<void> {
  const modelId = firstModelId(catalog, providerId);
  if (!modelId) throw new Error("No models available from this provider yet; pick one later in Settings");
  const thinkingLevel = defaultThinkingLevel(catalog, providerId, modelId);
  await saveRole("primary", { mode: "custom", provider: providerId, modelId, thinkingLevel, stale: false });
}

interface ProviderRow {
  key: string;
  logo: ReactNode;
  name: string;
  tag: string | null;
  sub: string;
  recommended: boolean;
  action: { label: string; accent: boolean; onClick: () => void };
}

export function StepAi({ onNext }: { onNext: () => void }) {
  const { data: catalog, loading } = useQuery<Catalog>("onboarding.catalog", fetchCatalog);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiProvider, setApiProvider] = useState("");
  const [apiKey, setApiKey] = useState("");

  if (loading || !catalog) {
    return (
      <Card className={s.card}>
        <h1>Set up AI</h1>
        <p className={s.explainer}>Detecting local AI environment…</p>
      </Card>
    );
  }

  const codexReady = catalog.providers.find((p) => p.id === CODEX_PROVIDER)?.auth.status === "configured";
  const apiProviders = catalog.providers.filter((p) => p.auth.kind === "api_key");
  const effectiveApiProvider = apiProvider || apiProviders[0]?.id || "";

  const finish = async (tag: string, connect: () => Promise<void>) => {
    setBusy(tag);
    setError(null);
    try {
      await connect();
      onNext();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  };

  const useCodex = () => finish("codex", () => connectPrimary(catalog, CODEX_PROVIDER));
  const skip = () => finish("skip", async () => {});

  const saveApiKey = () =>
    finish("apikey", async () => {
      await client.settings.putCredential({ provider: effectiveApiProvider, key: apiKey });
      await connectPrimary(await fetchCatalog(), effectiveApiProvider);
    });

  const codexRow: ProviderRow = {
    key: "codex",
    logo: <CodexLogo />,
    name: "codex",
    tag: codexReady ? "Detected · Recommended" : null,
    sub: codexReady ? "Reuses your local codex CLI login" : "Install the codex CLI to use its local quota",
    recommended: codexReady,
    action: codexReady
      ? { label: busy === "codex" ? "Configuring…" : "Use", accent: true, onClick: useCodex }
      : { label: "Install", accent: false, onClick: () => setShowInstall((v) => !v) },
  };
  const apiKeyRow: ProviderRow = {
    key: "apikey",
    logo: <KeyLogo />,
    name: "API Key",
    tag: null,
    sub: "openai · anthropic · google",
    recommended: false,
    action: { label: "Enter key", accent: false, onClick: () => setShowApiKey((v) => !v) },
  };
  const rows = codexReady ? [codexRow, apiKeyRow] : [apiKeyRow, codexRow];

  return (
    <Card className={s.card}>
      <h1>Set up AI</h1>
      <p className={s.explainer}>
        The assistant needs a model provider. You can skip this and configure it in Settings at any time.
      </p>

      <div className={s.list}>
        {rows.map((row) => (
          <div key={row.key} className={[s.prow, row.recommended ? s.prowRec : null].filter(Boolean).join(" ")}>
            {row.logo}
            <div className={s.prowMain}>
              <div className={s.prowName}>
                {row.name}
                {row.tag ? <span className={s.recTag}>{row.tag}</span> : null}
              </div>
              <div className={s.prowSub}>{row.sub}</div>
            </div>
            <Button accent={row.action.accent} disabled={busy !== null} onClick={row.action.onClick}>
              {row.action.label}
            </Button>
          </div>
        ))}
      </div>

      {showInstall ? (
        <div className={s.install}>
          <p className={s.explainer}>After installing and logging in to codex, it will be detected here automatically.</p>
          <pre className={s.cliCommand}><code>{CODEX_INSTALL_COMMAND}</code></pre>
          <div className={credActions}>
            <Button onClick={() => void navigator.clipboard.writeText(CODEX_INSTALL_COMMAND)}>Copy command</Button>
            <Button onClick={() => window.open(CODEX_INSTALL_URL, "_blank", "noopener,noreferrer")}>Install docs</Button>
          </div>
        </div>
      ) : null}

      {showApiKey && apiProviders.length > 0 ? (
        <div className={s.apiKey}>
          <Select
            value={effectiveApiProvider}
            options={apiProviders.map((p) => ({ value: p.id, label: p.name }))}
            onChange={setApiProvider}
          />
          <Input
            autoComplete="off"
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="API key"
          />
          <Button accent disabled={busy !== null || !effectiveApiProvider || !apiKey} onClick={saveApiKey}>
            {busy === "apikey" ? "Saving…" : "Save and use"}
          </Button>
        </div>
      ) : null}

      {error ? <div className={`${testResult} ${testResultFail}`}>{error}</div> : null}

      <div className={s.skipRow}>
        <button className={s.skipLink} disabled={busy !== null} onClick={skip}>
          Skip — configure later in Settings
        </button>
      </div>
    </Card>
  );
}
