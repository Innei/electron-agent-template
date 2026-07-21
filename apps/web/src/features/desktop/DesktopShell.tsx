import { RouterProvider } from "react-router";
import { ContextMenuHost, ModalHost } from "../../ui";
import * as s from "./DesktopShell.css";
import { DesktopTitlebar } from "./DesktopTitlebar";
import { LinkHoverStatus } from "./LinkHoverStatus";
import { useTabsController } from "./tabsController";

export function DesktopShell() {
  const controller = useTabsController();

  return (
    <>
      <DesktopTitlebar controller={controller} />
      <div className={s.content} key={controller.activeTab.id}>
        <RouterProvider router={controller.activeRouter} />
      </div>
      <LinkHoverStatus />
      <ModalHost />
      <ContextMenuHost />
    </>
  );
}
