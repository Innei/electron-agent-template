import { assistantRoutes, type AssistantApi } from "./assistant.js";
import { healthRoutes, type HealthApi } from "./health.js";
import { notesRoutes, type NotesApi } from "./notes.js";
import { settingsRoutes, type SettingsApi } from "./settings.js";

export interface AppApi {
  assistant: AssistantApi;
  notes: NotesApi;
  settings: SettingsApi;
  health: HealthApi;
}

export const allRoutes = {
  assistant: assistantRoutes,
  notes: notesRoutes,
  settings: settingsRoutes,
  health: healthRoutes,
};

export * from "./assistant.js";
export * from "./defineRoutes.js";
export * from "./health.js";
export * from "./notes.js";
export * from "./settings.js";
