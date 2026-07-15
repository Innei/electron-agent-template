import { useEffect, useSyncExternalStore } from "react";
import { ContextMenu } from "@base-ui/react/context-menu";
import { resolveShortcutDisplay } from "./accelerator";
import * as s from "./ContextMenu.css";
import {
  hasContextMenuSubmenu,
  isContextMenuDivider,
  type ContextMenuItem,
} from "./types";
import {
  closeWebContextMenu,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updateLastPointer,
} from "./webHost";

export function ContextMenuHost() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const handler = (event: PointerEvent | MouseEvent) => updateLastPointer(event);
    window.addEventListener("pointerdown", handler, true);
    window.addEventListener("contextmenu", handler, true);
    return () => {
      window.removeEventListener("pointerdown", handler, true);
      window.removeEventListener("contextmenu", handler, true);
    };
  }, []);

  if (!state.open && state.items.length === 0) return null;

  return (
    <ContextMenu.Root
      open={state.open}
      onOpenChange={(open) => {
        if (!open) closeWebContextMenu();
      }}
    >
      <ContextMenu.Portal>
        <ContextMenu.Positioner
          className={s.positioner}
          anchor={state.anchor ?? undefined}
          side="bottom"
          align="start"
          sideOffset={2}
        >
          <ContextMenu.Popup className={s.popup}>
            {state.items.map((item, i) => (
              <MenuNode key={itemKey(item, i)} item={item} index={i} />
            ))}
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function MenuNode({ item, index }: { item: ContextMenuItem; index: number }) {
  if (item.visible === false) return null;

  if (isContextMenuDivider(item)) {
    return <ContextMenu.Separator className={s.separator} />;
  }

  if (hasContextMenuSubmenu(item)) {
    return (
      <ContextMenu.SubmenuRoot>
        <ContextMenu.SubmenuTrigger
          className={[s.item, s.submenuTrigger].join(" ")}
          disabled={item.disabled}
        >
          {item.icon ? <span className={s.itemIcon}>{item.icon}</span> : null}
          <span className={s.itemLabel}>{item.label}</span>
          <span className={s.submenuChevron} aria-hidden>
            ›
          </span>
        </ContextMenu.SubmenuTrigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner
            className={s.positioner}
            side="right"
            align="start"
            sideOffset={4}
          >
            <ContextMenu.Popup className={s.popup}>
              {item.submenu.map((child, i) => (
                <MenuNode key={itemKey(child, i)} item={child} index={i} />
              ))}
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.SubmenuRoot>
    );
  }

  const shortcut = resolveShortcutDisplay(item);
  return (
    <ContextMenu.Item
      className={[s.item, item.danger ? s.itemDanger : null].filter(Boolean).join(" ")}
      disabled={item.disabled}
      onClick={() => item.onClick?.()}
    >
      {item.icon ? <span className={s.itemIcon}>{item.icon}</span> : null}
      <span className={s.itemLabel}>{item.label}</span>
      {shortcut ? <span className={s.itemShortcut}>{shortcut}</span> : null}
    </ContextMenu.Item>
  );
}

function itemKey(item: ContextMenuItem, index: number): string {
  if (item.key) return item.key;
  if (isContextMenuDivider(item)) return `divider-${index}`;
  return `item-${index}`;
}
