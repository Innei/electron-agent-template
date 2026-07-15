import type { HTMLAttributes } from "react";
import * as s from "./Dot.css";

type DotProps = {
  tone?: "accent" | "ok" | "up" | "down";
  pulse?: boolean;
} & HTMLAttributes<HTMLSpanElement>;

export function Dot({ tone, pulse, className, ...rest }: DotProps) {
  const cls = [s.root, tone ? s.tone[tone] : null, pulse ? s.pulse : null, className]
    .filter(Boolean)
    .join(" ");

  return <span className={cls} {...rest} />;
}
