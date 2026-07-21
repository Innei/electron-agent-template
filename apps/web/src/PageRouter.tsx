import { AssistantChatPage } from "./features/assistant/AssistantChatPage";
import { LogsPage } from "./features/logs/LogsPage";
import { NotesPage } from "./features/notes/NotesPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { routePathname, useRoute } from "./router";

export function Router() {
  const route = useRoute();
  const pathname = routePathname(route);

  if (pathname === "/chat") return <AssistantChatPage />;
  if (pathname === "/settings") return <SettingsPage />;
  if (pathname === "/logs") return <LogsPage />;
  return <NotesPage />;
}
