import { useEffect, useMemo, useState } from "react";
import { errorMessage } from "../../api";
import { useQuery } from "../../apiHooks";
import { client } from "../../client";
import { navigate, useQueryParam } from "../../router";
import { fullpage } from "../../styles/layout.css";
import * as s from "./assistant.css";
import { Button, Empty, Spinner } from "../../ui";
import { useTitle } from "../../useTitle";
import { saveRole } from "../settings/roleShared";
import type { AiSettings, Catalog } from "../settings/types";
import { AssistantConversation } from "./AssistantConversation";
import { AssistantSessionList } from "./AssistantSessionList";
import {
  assistantModelLabels,
  buildAssistantModelChoices,
  resolveAssistantModelValue,
  roleSettingForAssistantModel,
} from "./assistantModels";
import { resolveActiveSessionId } from "./assistantPageState.js";
import { useAssistantSessions } from "./useAssistantSessions";

function assistantRoute(id: string | null): string {
  return id ? `/chat?session=${encodeURIComponent(id)}` : "/chat";
}

export function AssistantChatPage() {
  useTitle("Assistant");
  const { sessions, loading, error, refresh, create, remove } = useAssistantSessions();
  const requestedId = useQueryParam("session");
  const activeId = resolveActiveSessionId(requestedId, sessions);

  const aiSettingsQuery = useQuery<AiSettings>("settings.getAi", () => client.settings.getAi());
  const catalogQuery = useQuery<Catalog>("settings.getCatalog", () => client.settings.getCatalog());
  const aiSettings = aiSettingsQuery.data;
  const catalog = catalogQuery.data;
  const [pendingModelValue, setPendingModelValue] = useState<string | null>(null);
  const [modelSaving, setModelSaving] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const modelChoices = useMemo(() => (catalog ? buildAssistantModelChoices(catalog) : []), [catalog]);
  const configuredModelValue = aiSettings ? resolveAssistantModelValue(aiSettings.roles) : "";
  const selectedModelValue = pendingModelValue ?? configuredModelValue;
  const modelLabels = useMemo(() => (catalog ? assistantModelLabels(catalog) : {}), [catalog]);
  const mentionCandidates = useMemo(() => [], []);

  useEffect(() => {
    if (loading) return;
    if (activeId !== requestedId) navigate(assistantRoute(activeId), { replace: true });
  }, [activeId, requestedId, loading]);

  useEffect(() => {
    if (!modelSaving && pendingModelValue && pendingModelValue === configuredModelValue) {
      setPendingModelValue(null);
    }
  }, [configuredModelValue, modelSaving, pendingModelValue]);

  const handleModelChange = async (value: string) => {
    if (modelSaving || value === selectedModelValue) return;
    const choice = modelChoices.find((entry) => entry.value === value);
    if (!choice) return;
    setPendingModelValue(value);
    setModelSaving(true);
    setModelError(null);
    try {
      await saveRole("chat", roleSettingForAssistantModel(choice));
      aiSettingsQuery.reload();
    } catch (error) {
      setPendingModelValue(null);
      setModelError(errorMessage(error));
    } finally {
      setModelSaving(false);
    }
  };

  const handleCreate = async () => {
    const created = await create();
    navigate(assistantRoute(created.id));
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  return (
    <div className={`${fullpage} ${s.page}`}>
      <AssistantSessionList
        sessions={sessions}
        activeId={activeId}
        loading={loading}
        error={error}
        onSelect={(id) => navigate(assistantRoute(id))}
        onCreate={() => void handleCreate()}
        onDelete={(id) => void handleDelete(id)}
      />
      <div className={s.main}>
        {activeId ? (
          <AssistantConversation
            key={activeId}
            sessionId={activeId}
            refreshSessions={refresh}
            mentionCandidates={mentionCandidates}
            modelChoices={modelChoices}
            selectedModelValue={selectedModelValue}
            modelSaving={modelSaving}
            modelError={modelError}
            modelLabels={modelLabels}
            onModelChange={(value) => void handleModelChange(value)}
          />
        ) : loading ? (
          <div className={s.sidebarState}>
            <Spinner /> Loading sessions…
          </div>
        ) : (
          <Empty className={s.empty}>
            <p>Pick a session, or create a new one to start chatting</p>
            <Button accent onClick={() => void handleCreate()}>
              New session
            </Button>
          </Empty>
        )}
      </div>
    </div>
  );
}
