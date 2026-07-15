import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import * as s from "./Modal.css";
import { ScrollArea } from "./ScrollArea";

export function Modal({ title, onClose, children }: { title: ReactNode; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.panel} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className={s.head}>
          <span className={s.title}>{title}</span>
          <button className={s.close} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <ScrollArea className={s.body} contentClassName={s.bodyContent}>
          {children}
        </ScrollArea>
      </div>
    </div>
  );
}
