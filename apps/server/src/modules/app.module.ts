import { Module } from "@tsuki-hono/common";
import { AssistantModule } from "./assistant/assistant.module.js";
import { HealthModule } from "./health/health.module.js";
import { NotesModule } from "./notes/notes.module.js";
import { SettingsModule } from "./settings/settings.module.js";

@Module({
  imports: [HealthModule, AssistantModule, NotesModule, SettingsModule],
})
export class AppModule {}
