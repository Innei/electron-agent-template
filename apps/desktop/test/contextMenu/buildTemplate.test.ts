import { describe, expect, it, vi } from "vitest";
import { buildNativeContextMenuTemplate } from "../../src/shell/contextMenu/buildTemplate.js";

describe("buildNativeContextMenuTemplate", () => {
  it("maps items, dividers, accelerators, and checkbox/radio types", () => {
    const onSelect = vi.fn();
    const template = buildNativeContextMenuTemplate(
      [
        {
          type: "item",
          key: "open",
          label: "Open",
          enabled: true,
          accelerator: "CmdOrCtrl+O",
        },
        { type: "divider", key: "d1" },
        {
          type: "item",
          key: "copy",
          label: "Copy",
          enabled: false,
          checked: true,
        },
        {
          type: "item",
          key: "radio-a",
          label: "View A",
          enabled: true,
          radioGroup: "view",
          checked: true,
        },
      ],
      onSelect,
    );

    expect(template[0]).toMatchObject({
      label: "Open",
      enabled: true,
      type: "normal",
      accelerator: "CmdOrCtrl+O",
    });
    expect(template[1]).toEqual({ type: "separator" });
    expect(template[2]).toMatchObject({
      label: "Copy",
      enabled: false,
      type: "checkbox",
      checked: true,
    });
    expect(template[3]).toMatchObject({
      label: "View A",
      type: "radio",
      checked: true,
    });

    (template[0] as { click?: () => void }).click?.();
    expect(onSelect).toHaveBeenCalledWith("open");
  });

  it("maps nested submenus and routes leaf clicks by key", () => {
    const onSelect = vi.fn();
    const template = buildNativeContextMenuTemplate(
      [
        {
          type: "submenu",
          key: "more",
          label: "More",
          enabled: true,
          items: [
            { type: "item", key: "export", label: "Export", enabled: true },
            { type: "divider", key: "d" },
            { type: "item", key: "share", label: "Share", enabled: true },
          ],
        },
      ],
      onSelect,
    );

    expect(template[0]).toMatchObject({ label: "More", enabled: true });
    const submenu = (template[0] as { submenu?: Electron.MenuItemConstructorOptions[] }).submenu;
    expect(submenu).toHaveLength(3);
    expect(submenu?.[0]).toMatchObject({ label: "Export" });
    expect(submenu?.[1]).toEqual({ type: "separator" });
    (submenu?.[0] as { click?: () => void }).click?.();
    expect(onSelect).toHaveBeenCalledWith("export");
  });
});
