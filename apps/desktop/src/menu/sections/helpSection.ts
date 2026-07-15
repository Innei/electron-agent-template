import type { MenuItemConstructorOptions } from "electron";
import type { MenuActionDeps } from "../types.js";

export function buildHelpSection(deps: MenuActionDeps): MenuItemConstructorOptions {
  return {
    role: "help",
    label: "Help",
    submenu: [
      {
        label: "Open Logs…",
        click: () => deps.openLogs(),
      },
      { type: "separator" },
      {
        label: "Choose Data Directory…",
        click: () => deps.selectDataRoot(),
      },
    ],
  };
}
