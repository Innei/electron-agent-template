import { AssistantChatPage } from "./pages/assistant/AssistantChatPage";
import { LogsPage } from "./pages/logViewer/LogsPage";
import { NotesPage } from "./pages/notes/NotesPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { routePathname, useRoute } from "./router";

export function Router() {
  const route = useRoute();
  const pathname = routePathname(route);

  if (pathname === "/chat") return <AssistantChatPage />;
  if (pathname === "/settings") return <SettingsPage />;
  if (pathname === "/logs") return <LogsPage />;
  return <NotesPage />;
}
