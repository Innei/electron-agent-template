import { useState } from "react";
import { errorMessage } from "../../api";
import { client } from "../../client";
import { Button, Dot, Input, openModal, SectionTitle, Select } from "../../ui";
import {
  CODEX_PROVIDER,
  type AiSettings,
  type Catalog,
  type CatalogProvider,
  type CredentialEntry,
} from "./types";

const CODEX_STATUS_LABEL: Record<string, string> = {
  configured: "Signed in",
  missing: "Not signed in; run codex in a terminal to sign in",
  error: "Sign-in state error",
};

function ResetCredentialsDialog({
  closeModal,
  onChanged,
}: {
  closeModal: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = async () => {
    setBusy(true);
    setError(null);
    try {
      await client.settings.resetCredentials();
      onChanged();
      closeModal();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="settings-reset-confirm">
      <p>This clears all saved keys; they must be re-entered. Continue?</p>
      {error ? <div className="settings-test-result settings-test-result--fail">{error}</div> : null}
      <div className="settings-cred-actions">
        <Button disabled={busy} onClick={closeModal}>
          Cancel
        </Button>
        <Button accent disabled={busy} onClick={reset}>
          {busy ? "Resetting…" : "Reset"}
        </Button>
      </div>
    </div>
  );
}

function credentialMeta(credential: CredentialEntry | undefined): string {
  if (!credential) return "No API key saved yet";
  if (!credential.ok) return "Saved credential cannot be decrypted";
  return (credential.masked ?? "Saved") + " · updated " + credential.updatedAt.slice(0, 10);
}

function providerState(credential: CredentialEntry | undefined): {
  label: string;
  tone: "up" | "accent" | "muted";
} {
  if (!credential) return { label: "Not configured", tone: "muted" };
  if (!credential.ok) return { label: "Needs re-entry", tone: "accent" };
  return { label: "Saved", tone: "up" };
}

function ProviderAuthRow({
  provider,
  credential,
  editing,
  editKey,
  busy,
  error,
  onStartEdit,
  onEditKey,
  onSave,
  onCancel,
  onDelete,
}: {
  provider: CatalogProvider;
  credential: CredentialEntry | undefined;
  editing: boolean;
  editKey: string;
  busy: boolean;
  error: string | null;
  onStartEdit: () => void;
  onEditKey: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const state = providerState(credential);

  return (
    <div className="settings-provider-row" id={"settings-provider-" + provider.id}>
      <div className="settings-provider-head">
        <span className="settings-provider-name">{provider.name}</span>
        <span className={"settings-provider-state settings-provider-state--" + state.tone}>
          <Dot tone={state.tone === "muted" ? undefined : state.tone} />
          {state.label}
        </span>
      </div>
      <div className="settings-provider-meta">{credentialMeta(credential)}</div>
      {editing ? (
        <div className="settings-provider-editor">
          <Input
            autoComplete="off"
            type="password"
            value={editKey}
            onChange={(event) => onEditKey(event.target.value)}
            placeholder="API key"
          />
          <Button disabled={busy || !editKey} onClick={onSave}>
            {busy ? "Saving…" : "Save"}
          </Button>
          <Button disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="settings-provider-actions">
          <Button onClick={onStartEdit}>{credential ? "Update key" : "Add key"}</Button>
          {credential ? (
            <Button disabled={busy} onClick={onDelete}>
              {busy ? "Deleting…" : "Delete"}
            </Button>
          ) : null}
        </div>
      )}
      {error ? (
        <div className="settings-provider-error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function CodexAuthRow({ provider }: { provider: CatalogProvider }) {
  const tone =
    provider.auth.status === "configured" ? "up" : provider.auth.status === "error" ? "down" : "accent";

  return (
    <div className="settings-provider-row" id={"settings-provider-" + provider.id}>
      <div className="settings-provider-head">
        <span className="settings-provider-name">{provider.name}</span>
        <span className={"settings-provider-state settings-provider-state--" + tone}>
          <Dot tone={tone} />
          {CODEX_STATUS_LABEL[provider.auth.status]}
        </span>
      </div>
      <div className="settings-provider-meta">Uses the local Codex sign-in state; no key is saved on this page</div>
    </div>
  );
}

const formatUsd = (value: number) => `$${value.toFixed(value < 1 ? 4 : 2)}`;

export function ProviderCredentialsSection({
  settings,
  catalog,
  usedProviderIds,
  onChanged,
}: {
  settings: AiSettings;
  catalog: Catalog;
  usedProviderIds: string[];
  onChanged: () => void;
}) {
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [editKey, setEditKey] = useState("");
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [addProvider, setAddProvider] = useState("");
  const [addKey, setAddKey] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const setProviderError = (provider: string, error: string | null) => {
    setErrors((current) => ({ ...current, [provider]: error }));
  };

  const startEdit = (provider: string) => {
    setEditingProvider(provider);
    setEditKey("");
    setProviderError(provider, null);
  };

  const cancelEdit = (provider: string) => {
    setEditingProvider(null);
    setEditKey("");
    setProviderError(provider, null);
  };

  const saveCredential = async (provider: string) => {
    if (!editKey) return;
    setBusyProvider(provider);
    setProviderError(provider, null);
    try {
      await client.settings.putCredential({ provider, key: editKey });
      setEditingProvider(null);
      setEditKey("");
      onChanged();
    } catch (err) {
      setProviderError(provider, errorMessage(err));
    } finally {
      setBusyProvider(null);
    }
  };

  const addCredential = async (provider: string) => {
    if (!provider || !addKey) return;
    setAddBusy(true);
    setAddError(null);
    try {
      await client.settings.putCredential({ provider, key: addKey });
      setAddProvider("");
      setAddKey("");
      onChanged();
    } catch (err) {
      setAddError(errorMessage(err));
    } finally {
      setAddBusy(false);
    }
  };

  const deleteCredential = async (provider: string) => {
    setBusyProvider(provider);
    setProviderError(provider, null);
    try {
      await client.settings.deleteCredential({ provider });
      onChanged();
    } catch (err) {
      setProviderError(provider, errorMessage(err));
    } finally {
      setBusyProvider(null);
    }
  };

  const handleReset = () => {
    openModal({
      title: "Reset All Credentials",
      body: (closeModal) => <ResetCredentialsDialog closeModal={closeModal} onChanged={onChanged} />,
    });
  };

  const credentials = new Map(settings.credentials.map((credential) => [credential.provider, credential]));
  const usedProviders = new Set(usedProviderIds);
  const visibleProviders = catalog.providers.filter(
    (provider) =>
      provider.id === CODEX_PROVIDER ||
      credentials.has(provider.id) ||
      usedProviders.has(provider.id),
  );
  const availableToAdd = catalog.providers.filter(
    (provider) =>
      provider.auth.kind === "api_key" &&
      !credentials.has(provider.id) &&
      !usedProviders.has(provider.id),
  );
  const effectiveAddProvider = addProvider || availableToAdd[0]?.id || "";
  const apiKeyCount = settings.credentials.filter(
    (credential) => credential.kind === "api_key" && credential.ok,
  ).length;
  const codex = catalog.providers.find((provider) => provider.id === CODEX_PROVIDER);
  const codexSummary =
    codex?.auth.status === "configured"
      ? "Codex signed in"
      : codex?.auth.status === "error"
        ? "Codex sign-in error"
        : "Codex not signed in";

  return (
    <section id="settings-provider-panel">
      <div className="settings-card-heading">
        <SectionTitle>Providers & Credentials</SectionTitle>
        <span className="settings-conn-summary">
          {apiKeyCount + " keys · " + codexSummary}
        </span>
      </div>
      {settings.masterKey === "invalid" ? (
        <div className="settings-warning-strip">
          <span>Master key error; saved credentials cannot be decrypted</span>
          <Button onClick={handleReset}>Reset all credentials</Button>
        </div>
      ) : null}
      <div className="settings-provider-list">
        {visibleProviders.map((provider) =>
          provider.id === CODEX_PROVIDER || provider.auth.kind === "oauth" ? (
            <CodexAuthRow key={provider.id} provider={provider} />
          ) : (
            <ProviderAuthRow
              key={provider.id}
              provider={provider}
              credential={credentials.get(provider.id)}
              editing={editingProvider === provider.id}
              editKey={editingProvider === provider.id ? editKey : ""}
              busy={busyProvider === provider.id}
              error={errors[provider.id] ?? null}
              onStartEdit={() => startEdit(provider.id)}
              onEditKey={setEditKey}
              onSave={() => saveCredential(provider.id)}
              onCancel={() => cancelEdit(provider.id)}
              onDelete={() => deleteCredential(provider.id)}
            />
          ),
        )}
        {availableToAdd.length > 0 ? (
          <div className="settings-provider-add">
            <Select
              className="settings-provider-add-select"
              value={effectiveAddProvider}
              options={availableToAdd.map((provider) => ({ value: provider.id, label: provider.name }))}
              onChange={setAddProvider}
            />
            <Input
              autoComplete="off"
              type="password"
              value={addKey}
              onChange={(event) => setAddKey(event.target.value)}
              placeholder="API key"
            />
            <Button
              disabled={addBusy || !effectiveAddProvider || !addKey}
              onClick={() => addCredential(effectiveAddProvider)}
            >
              {addBusy ? "Saving…" : "Add provider"}
            </Button>
            {addError ? (
              <div className="settings-provider-error" role="alert">
                {addError}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
