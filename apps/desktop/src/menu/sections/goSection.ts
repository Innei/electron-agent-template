import type { MenuItemConstructorOptions } from "electron";
import type { MenuActionDeps } from "../types.js";

export function buildGoSection(deps: MenuActionDeps): MenuItemConstructorOptions {
  return {
    label: "Go",
    submenu: [
      {
        label: "Assistant",
        accelerator: "CmdOrCtrl+L",
        click: () => deps.openChat(),
      },
    ],
  };
}
