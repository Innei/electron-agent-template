import type { HTMLAttributes } from "react";
import * as s from "./ErrorBox.css";

export function ErrorBox({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[s.root, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
