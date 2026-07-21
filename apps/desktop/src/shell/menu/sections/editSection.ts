import type { MenuItemConstructorOptions } from "electron";

export function buildEditSection(): MenuItemConstructorOptions {
  return {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "pasteAndMatchStyle" },
      { role: "delete" },
      { role: "selectAll" },
      { type: "separator" },
      {
        label: "Speech",
        submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
      },
    ],
  };
}
