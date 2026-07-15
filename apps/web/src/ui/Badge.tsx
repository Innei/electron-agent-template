import type { HTMLAttributes } from "react";
import * as s from "./Badge.css";

type BadgeProps = {
  tone?: "up" | "down" | "accent" | "solid";
} & HTMLAttributes<HTMLSpanElement>;

export function Badge({ tone, className, children, ...rest }: BadgeProps) {
  const cls = [s.root, tone ? s.tone[tone] : null, className].filter(Boolean).join(" ");

  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
