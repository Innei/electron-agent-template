import type { HTMLAttributes } from "react";
import * as s from "./Num.css";

type NumProps = {
  value: number;
  diff?: boolean;
  digits?: number;
  suffix?: string;
} & HTMLAttributes<HTMLSpanElement>;

export function Num({ value, diff, digits = 2, suffix, className, ...rest }: NumProps) {
  const tone = diff ? (value >= 0 ? s.up : s.down) : null;
  const sign = diff && value >= 0 ? "+" : "";
  const cls = [s.root, tone, className].filter(Boolean).join(" ");

  return (
    <span className={cls} {...rest}>
      {sign}
      {value.toFixed(digits)}
      {suffix}
    </span>
  );
}
