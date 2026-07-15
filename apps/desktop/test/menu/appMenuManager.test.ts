import { describe, expect, it, vi } from "vitest";
import { buildAppMenuTemplate, createAppMenuManager } from "../../src/menu/appMenuManager.js";
import type { MenuActionDeps } from "../../src/menu/types.js";

function makeDeps(overrides: Partial<MenuActionDeps> = {}): MenuActionDeps {
  return {
    selectDataRoot: vi.fn(),
    openSettings: vi.fn(),
    openLogs: vi.fn(),
    openChat: vi.fn(),
    checkForUpdates: vi.fn(),
    newTab: vi.fn(),
    closeTab: vi.fn(),
    nextTab: vi.fn(),
    prevTab: vi.fn(),
    ...overrides,
  };
}

function asSubmenu(item: Electron.MenuItemConstructorOptions): Electron.MenuItemConstructorOptions[] {
  const submenu = item.submenu;
  if (!Array.isArray(submenu)) throw new Error("expected array submenu");
  return submenu;
}

function findByLabel(
  items: Electron.MenuItemConstructorOptions[],
  label: string,
): Electron.MenuItemConstructorOptions {
  const found = items.find((item) => item.label === label);
  if (!found) throw new Error(`missing label: ${label}`);
  return found;
}

function findByRole(
  items: Electron.MenuItemConstructorOptions[],
  role: string,
): Electron.MenuItemConstructorOptions {
  const found = items.find((item) => item.role === role);
  if (!found) throw new Error(`missing role: ${role}`);
  return found;
}

describe("buildAppMenuTemplate", () => {
  it("builds app / edit / view / go / window / help top-level sections", () => {
    const template = buildAppMenuTemplate("MyApp", makeDeps());
    expect(template.map((item) => item.label ?? item.role)).toEqual([
      "MyApp",
      "Edit",
      "View",
      "Go",
      "Window",
      "Help",
    ]);
  });

  it("puts the assistant in the go menu and wires clicks to deps", () => {
    const deps = makeDeps();
    const goMenu = asSubmenu(buildAppMenuTemplate("MyApp", deps)[3]);
    expect(findByLabel(goMenu, "Assistant").accelerator).toBe("CmdOrCtrl+L");
    findByLabel(goMenu, "Assistant").click?.(undefined as never, undefined as never, undefined as never);
    expect(deps.openChat).toHaveBeenCalledOnce();
  });

  it("keeps about, check updates, settings, and quit in the app menu", () => {
    const deps = makeDeps();
    const appMenu = asSubmenu(buildAppMenuTemplate("MyApp", deps)[0]);
    expect(findByRole(appMenu, "about").role).toBe("about");
    expect(findByLabel(appMenu, "Check for Updates…").label).toBe("Check for Updates…");
    expect(findByLabel(appMenu, "Settings…")).toMatchObject({
      label: "Settings…",
      accelerator: "CmdOrCtrl+,",
    });
    expect(findByRole(appMenu, "quit").role).toBe("quit");
    expect(appMenu.some((item) => item.label === "Open Logs…")).toBe(false);
    expect(appMenu.some((item) => item.label === "Choose Data Directory…")).toBe(false);
  });

  it("wires app menu clicks to deps", () => {
    const deps = makeDeps();
    const appMenu = asSubmenu(buildAppMenuTemplate("MyApp", deps)[0]);
    findByLabel(appMenu, "Check for Updates…").click?.(undefined as never, undefined as never, undefined as never);
    findByLabel(appMenu, "Settings…").click?.(undefined as never, undefined as never, undefined as never);
    expect(deps.checkForUpdates).toHaveBeenCalledOnce();
    expect(deps.openSettings).toHaveBeenCalledOnce();
  });

  it("puts logs and the data directory picker in the help menu", () => {
    const deps = makeDeps();
    const helpMenu = asSubmenu(buildAppMenuTemplate("MyApp", deps)[5]);
    findByLabel(helpMenu, "Open Logs…").click?.(undefined as never, undefined as never, undefined as never);
    findByLabel(helpMenu, "Choose Data Directory…").click?.(
      undefined as never,
      undefined as never,
      undefined as never,
    );
    expect(deps.openLogs).toHaveBeenCalledOnce();
    expect(deps.selectDataRoot).toHaveBeenCalledOnce();
  });

  it("includes tab actions and avoids role close on close-tab", () => {
    const deps = makeDeps();
    const windowMenu = asSubmenu(buildAppMenuTemplate("MyApp", deps)[4]);
    const closeTab = findByLabel(windowMenu, "Close Tab");
    expect(closeTab).toMatchObject({
      label: "Close Tab",
      accelerator: "CmdOrCtrl+W",
    });
    expect(closeTab.role).toBeUndefined();
    expect(findByLabel(windowMenu, "New Tab").accelerator).toBe("CmdOrCtrl+T");
    expect(findByRole(windowMenu, "minimize").role).toBe("minimize");
    expect(findByRole(windowMenu, "front").role).toBe("front");
  });
});

describe("createAppMenuManager", () => {
  it("builds and installs via the injected seams", () => {
    const setApplicationMenu = vi.fn();
    const built = { fake: true } as unknown as Electron.Menu;
    const buildFromTemplate = vi.fn(() => built);
    const manager = createAppMenuManager({
      appName: "MyApp",
      deps: makeDeps(),
      setApplicationMenu,
      buildFromTemplate,
    });
    manager.install();
    expect(buildFromTemplate).toHaveBeenCalledOnce();
    expect(setApplicationMenu).toHaveBeenCalledWith(built);
    manager.rebuild();
    expect(setApplicationMenu).toHaveBeenCalledTimes(2);
  });
});
