import { Router } from "../PageRouter";
import { ContextMenuHost, ModalHost } from "../ui";
import { DesktopTitlebar } from "./DesktopTitlebar";
import { LinkHoverStatus } from "./LinkHoverStatus";
import { useTabsController } from "./tabsController";

export function DesktopShell() {
  const controller = useTabsController();

  return (
    <>
      <DesktopTitlebar controller={controller} />
      <div className="desktop-content" key={controller.activeTab.id}>
        <Router />
      </div>
      <LinkHoverStatus />
      <ModalHost />
      <ContextMenuHost />
    </>
  );
}
