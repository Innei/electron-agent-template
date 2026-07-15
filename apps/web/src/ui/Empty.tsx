import type { HTMLAttributes } from "react";
import * as s from "./Empty.css";

export function Empty({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[s.root, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
