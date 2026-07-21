import { useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { errorMessage } from "../../lib/api";
import { client } from "../../lib/client";
import { icon } from "../../styles/layout.css";
import { Button, Select, Spinner } from "../../ui";
import { RoleModeControl } from "./RoleModeControl";
import {
  defaultCustom,
  defaultThinkingLevel,
  firstModelId,
  providerKeyReady,
  providerLabel,
  saveRole,
  selectableProviders,
} from "./roleShared";
import type { RoleView } from "./settingsViewModel";
import {
  ROLE_LABEL,
  thinkingLabel,
  type Catalog,
  type CredentialEntry,
  type Role,
  type RoleMode,
  type RoleSetting,
} from "./types";
import { useSaveQueue } from "./useSaveQueue";
import * as s from "./settings.css";

export function RoleRow({
  role,
  initial,
  draft,
  catalog,
  credentials,
  view,
  onDraftChange,
}: {
  role: Role;
  initial: RoleSetting;
  draft: RoleSetting;
  catalog: Catalog;
  credentials: CredentialEntry[];
  view: RoleView;
  onDraftChange: (next: RoleSetting) => void;
}) {
  const [failure, setFailure] = useState<{ message: string; retrySnapshot: RoleSetting } | null>(null);
  const [testState, setTestState] = useState<{ status: "idle" | "busy" | "ok" | "fail"; text?: string }>({
    status: "idle",
  });
  const [editing, setEditing] = useState(
    () => initial.mode === "custom" && (!initial.provider || !initial.modelId || !initial.thinkingLevel),
  );

  const queue = useSaveQueue<RoleSetting>({
    initial,
    save: (snapshot) => saveRole(role, snapshot),
    onError: (err, rolledBackTo, retrySnapshot) => {
      onDraftChange(rolledBackTo ?? initial);
      setFailure({ message: errorMessage(err), retrySnapshot });
    },
  });

  const push = (next: RoleSetting) => {
    onDraftChange(next);
    setFailure(null);
    setTestState({ status: "idle" });
    queue.push(next);
  };

  const setMode = (mode: RoleMode) => {
    if (mode === draft.mode) return;
    setEditing(mode === "custom");
    if (mode === "custom" && (!draft.provider || !draft.modelId)) {
      push(defaultCustom(catalog));
      return;
    }
    if (mode !== "custom") {
      push({ mode, provider: null, modelId: null, thinkingLevel: null, stale: false });
      return;
    }
    push({ ...draft, mode });
  };

  const setProvider = (provider: string) => {
    const modelId = firstModelId(catalog, provider);
    push({
      mode: "custom",
      provider,
      modelId,
      thinkingLevel: defaultThinkingLevel(catalog, provider, modelId),
      stale: false,
    });
  };

  const setModelId = (modelId: string) => {
    push({
      ...draft,
      modelId,
      thinkingLevel: defaultThinkingLevel(catalog, draft.provider ?? "", modelId),
    });
  };

  const setThinkingLevel = (thinkingLevel: string) => {
    push({ ...draft, thinkingLevel });
  };

  const provider = draft.provider ? catalog.providers.find((p) => p.id === draft.provider) : null;
  const models = provider?.models ?? [];
  const model = draft.modelId ? models.find((m) => m.id === draft.modelId) : null;
  const thinkingLevels = model?.thinkingLevels ?? [];
  const computedStale = draft.mode === "custom" && Boolean(draft.modelId) && !model;
  const keyMissing =
    draft.mode === "custom" && Boolean(draft.provider) && !providerKeyReady(draft.provider!, credentials, catalog);
  const complete =
    draft.mode === "custom" && Boolean(draft.provider) && Boolean(draft.modelId) && Boolean(draft.thinkingLevel);

  const runTest = async () => {
    if (!draft.provider || !draft.modelId || !draft.thinkingLevel) return;
    setTestState({ status: "busy" });
    try {
      const res = await client.settings.testConnection({
        provider: draft.provider,
        modelId: draft.modelId,
        thinkingLevel: draft.thinkingLevel,
      });
      if (!res.ok) throw new Error(res.hint ? `${res.error} (${res.hint})` : res.error);
      setTestState({ status: "ok", text: `Passed · ${res.latencyMs}ms` });
    } catch (err) {
      setTestState({ status: "fail", text: errorMessage(err) });
    }
  };

  const effectiveTone =
    view.tone === "muted" || view.tone === "warning" || view.tone === "error"
      ? s.roleEffectiveTone[view.tone]
      : null;

  return (
    <div
      className={[s.assignmentRow, draft.mode === "disabled" ? s.assignmentRowDisabled : null].filter(Boolean).join(" ")}
      id={"settings-role-" + role}
    >
      <div className={s.roleSummary}>
        <div className={s.roleCopy}>
          <div className={s.roleHeading}>
            <span className={s.roleName}>{ROLE_LABEL[role]}</span>
            <span className={s.roleUsage}>{view.usageLabel}</span>
          </div>
          <div className={[s.roleEffective, effectiveTone].filter(Boolean).join(" ")}>
            {view.effectiveLabel}
            {draft.mode === "custom" && !editing ? (
              <button className={s.roleEdit} type="button" onClick={() => setEditing(true)}>
                Edit
              </button>
            ) : null}
          </div>
        </div>
        <div className={s.roleActions}>
          <RoleModeControl role={role} value={draft.mode} onChange={setMode} />
          <span
            className={failure ? `${s.roleStatus} ${s.roleStatusRollback}` : s.roleStatus}
            aria-live="polite"
          >
            {queue.flushing() ? (
              <Spinner aria-label="Saving" />
            ) : failure ? (
              <>
                <TriangleAlert size={12} className={icon} /> Unsaved
              </>
            ) : (
              <Check size={12} className={icon} aria-label="Saved" />
            )}
          </span>
        </div>
      </div>

      {draft.mode === "custom" && editing && (
        <div className={s.roleEditor}>
          <div className={s.roleEditorControls}>
            <Select
              className={s.select}
              value={draft.provider ?? ""}
              options={selectableProviders(catalog, draft.provider).map((p) => ({
                value: p.id,
                label: providerLabel(catalog, p.id),
              }))}
              onChange={setProvider}
            />
            <Select
              className={s.selectWide}
              value={draft.modelId ?? ""}
              options={models.map((m) => ({ value: m.id, label: m.name }))}
              onChange={setModelId}
            />
            <Select
              className={s.select}
              value={draft.thinkingLevel ?? "off"}
              options={thinkingLevels.map((t) => ({ value: t, label: thinkingLabel(t) }))}
              onChange={setThinkingLevel}
            />
            <Button disabled={!complete || testState.status === "busy"} onClick={runTest}>
              Test model
            </Button>
            <button
              className={`${s.roleEdit} ${s.roleEditDone}`}
              type="button"
              disabled={!complete}
              onClick={() => setEditing(false)}
            >
              Done
            </button>
          </div>
          <div className={s.roleEditorStatus} aria-live="polite">
            {testState.status === "busy" ? <Spinner aria-label="Testing" /> : null}
            {testState.status === "ok" ? (
              <span className={`${s.testResult} ${s.testResultOk}`}>{testState.text}</span>
            ) : null}
            {testState.status === "fail" ? (
              <span className={`${s.testResult} ${s.testResultFail}`}>{testState.text}</span>
            ) : null}
            {computedStale ? <span className={s.roleWarning}>Model is no longer in the catalog; pick another</span> : null}
            {keyMissing ? <span className={s.roleWarning}>No credentials configured for this provider</span> : null}
          </div>
        </div>
      )}

      {failure ? (
        <div className={s.saveError} role="alert">
          <span>{failure.message}</span>
          <Button onClick={() => push(failure.retrySnapshot)}>Retry</Button>
        </div>
      ) : null}
    </div>
  );
}
