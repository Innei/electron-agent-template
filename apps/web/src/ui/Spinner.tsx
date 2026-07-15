import type { HTMLAttributes } from "react";
import * as s from "./Spinner.css";

export function Spinner({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={[s.root, className].filter(Boolean).join(" ")} {...rest} />;
}
