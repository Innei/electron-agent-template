import type { MenuItemConstructorOptions } from "electron";
import type { MenuActionDeps } from "../types.js";

export function buildWindowSection(deps: MenuActionDeps): MenuItemConstructorOptions {
  return {
    label: "Window",
    submenu: [
      {
        label: "New Tab",
        accelerator: "CmdOrCtrl+T",
        click: () => deps.newTab(),
      },
      {
        label: "Close Tab",
        accelerator: "CmdOrCtrl+W",
        click: () => deps.closeTab(),
      },
      { type: "separator" },
      {
        label: "Next Tab",
        accelerator: "CmdOrCtrl+Shift+]",
        click: () => deps.nextTab(),
      },
      {
        label: "Previous Tab",
        accelerator: "CmdOrCtrl+Shift+[",
        click: () => deps.prevTab(),
      },
      { type: "separator" },
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" },
    ],
  };
}
