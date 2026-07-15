import { Popover } from "@base-ui/react/popover";
import { House, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { Kbd } from "../ui";
import * as s from "./NewTabLauncher.css";

interface NewTabLauncherProps {
  onOpenChat(): void;
  onOpenHome(): void;
}

export function NewTabLauncher({ onOpenChat, onOpenHome }: NewTabLauncherProps) {
  const [open, setOpen] = useState(false);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={[s.trigger, open ? s.triggerActive : null].filter(Boolean).join(" ")}
        aria-label="New tab"
        title="New tab"
      >
        <span className={s.visual}>
          <Plus size={13} />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className={s.positioner}
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
        >
          <Popover.Popup className={s.popup} aria-label="New tab">
            <div className={s.menu}>
              <button type="button" className={s.menuItem} onClick={() => run(onOpenHome)}>
                <House size={14} aria-hidden />
                <span>Notes</span>
              </button>
              <button type="button" className={s.menuItem} onClick={() => run(onOpenChat)}>
                <MessageCircle size={14} aria-hidden />
                <span>Assistant</span>
                <Kbd keys={["mod", "L"]} />
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
