import { join } from "node:path";
import { app, BrowserWindow, dialog } from "electron";
import { dataRoot, dataRootStatus } from "../boot/env.js";
import { markDataRootRestartPending } from "./restartState.js";
import { createDataRootFileStore } from "./store.js";
import { validateDataRootCandidate } from "./validate.js";

function messageBox(
  win: BrowserWindow | null,
  options: Electron.MessageBoxOptions,
): Promise<Electron.MessageBoxReturnValue> {
  return win ? dialog.showMessageBox(win, options) : dialog.showMessageBox(options);
}

function openDialog(
  win: BrowserWindow | null,
  options: Electron.OpenDialogOptions,
): Promise<Electron.OpenDialogReturnValue> {
  return win ? dialog.showOpenDialog(win, options) : dialog.showOpenDialog(options);
}

function getStore() {
  return createDataRootFileStore(join(app.getPath("userData"), "data-root.json"));
}

async function promptRestart(win: BrowserWindow | null, title: string): Promise<void> {
  const choice = await messageBox(win, {
    type: "info",
    buttons: ["Later", "Restart Now"],
    defaultId: 1,
    cancelId: 0,
    title,
    message: "Data directory setting saved. Restart the app for it to take effect.",
  });
  if (choice.response === 1) {
    app.relaunch();
    app.quit();
  }
}

async function noteEnvOverrideIfNeeded(win: BrowserWindow | null, title: string): Promise<void> {
  if (dataRootStatus.mode !== "env") return;
  await messageBox(win, {
    type: "warning",
    title,
    message:
      "The current data directory is overridden by the APP_PROJECT_ROOT environment variable. This setting will be saved to preferences and takes effect on the next launch after the environment variable is removed.",
  });
}

async function runSelectDataRootFlowUnsafe(win: BrowserWindow | null): Promise<void> {
  const title = "Choose Data Directory";

  if (!app.isPackaged) {
    await messageBox(win, {
      type: "info",
      title,
      message: "Development mode already uses the repository directory; no setup needed.",
    });
    return;
  }

  await noteEnvOverrideIfNeeded(win, title);

  const picked = await openDialog(win, {
    title: "Choose Data Directory (Project Root)",
    properties: ["openDirectory"],
  });
  if (picked.canceled || picked.filePaths.length === 0) return;
  const candidate = picked.filePaths[0];

  const validation = validateDataRootCandidate(candidate, dataRoot);
  if (!validation.ok) {
    if (validation.reason === "needs-confirm-scaffold") {
      const choice = await messageBox(win, {
        type: "question",
        buttons: ["Cancel", "Confirm"],
        defaultId: 1,
        cancelId: 0,
        title,
        message:
          "This directory is not empty and has no data/ folder yet. Confirming will create the app data structure here. Continue?",
      });
      if (choice.response !== 1) return;
    } else {
      const messages = {
        self: "The selected directory is already the active data directory; nothing to change.",
        "not-dir": "The selected path does not exist or is not a folder.",
        "not-writable": "The selected directory is not writable and cannot be used as the data directory.",
      } as const;
      await messageBox(win, {
        type: "warning",
        title,
        message: messages[validation.reason],
      });
      return;
    }
  }

  await getStore().setPath(candidate);
  markDataRootRestartPending();
  await promptRestart(win, title);
}

async function runResetDataRootFlowUnsafe(win: BrowserWindow | null): Promise<void> {
  const title = "Restore Default Data Directory";

  if (!app.isPackaged) {
    await messageBox(win, {
      type: "info",
      title,
      message: "Development mode already uses the repository directory; no setup needed.",
    });
    return;
  }

  await noteEnvOverrideIfNeeded(win, title);

  await getStore().clear();
  markDataRootRestartPending();
  await promptRestart(win, title);
}

export async function runSelectDataRootFlow(win: BrowserWindow | null): Promise<void> {
  try {
    await runSelectDataRootFlowUnsafe(win);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[desktop] select-data-root failed", error);
    await messageBox(win, {
      type: "error",
      title: "Choose Data Directory",
      message: `Failed to save setting: ${message}`,
    });
  }
}

export async function runResetDataRootFlow(win: BrowserWindow | null): Promise<void> {
  try {
    await runResetDataRootFlowUnsafe(win);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[desktop] reset-data-root failed", error);
    await messageBox(win, {
      type: "error",
      title: "Restore Default Data Directory",
      message: `Failed to restore: ${message}`,
    });
  }
}
