import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import type { Ref, UIEvent, ReactNode } from "react";
import * as s from "./ScrollArea.css";

type Orientation = "vertical" | "horizontal";

export function ScrollArea({
  children,
  className,
  viewportClassName,
  contentClassName,
  orientation = "vertical",
  viewportRef,
  onScroll,
}: {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
  contentClassName?: string;
  orientation?: Orientation;
  viewportRef?: Ref<HTMLDivElement>;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
}) {
  return (
    <BaseScrollArea.Root
      className={[s.root, className].filter(Boolean).join(" ")}
      data-orientation={orientation}
    >
      <BaseScrollArea.Viewport
        ref={viewportRef}
        onScroll={onScroll}
        className={[s.viewport, viewportClassName].filter(Boolean).join(" ")}
      >
        <BaseScrollArea.Content
          style={orientation === "vertical" ? { minWidth: 0, width: "100%" } : undefined}
          className={contentClassName}
        >
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar orientation={orientation} className={s.scrollbar}>
        <BaseScrollArea.Thumb className={s.thumb} />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  );
}
