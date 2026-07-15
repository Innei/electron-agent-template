import type { HTMLAttributes } from "react";
import * as s from "./SectionTitle.css";

export function SectionTitle({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[s.root, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
