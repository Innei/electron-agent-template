import { AssistantIpc } from "./assistantIpc.js";
import { HealthIpc } from "./healthIpc.js";
import { NotesIpc } from "./notesIpc.js";
import { SettingsIpc } from "./settingsIpc.js";

export const ipcServiceClasses = [AssistantIpc, NotesIpc, SettingsIpc, HealthIpc] as const;
