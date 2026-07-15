import type { ButtonHTMLAttributes } from "react";
import * as s from "./Button.css";

type ButtonProps = {
  accent?: boolean;
  state?: "busy" | "done" | "failed";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ accent, state, className, children, ...rest }: ButtonProps) {
  const cls = [s.root, accent ? s.accent : null, state ? s.state[state] : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
