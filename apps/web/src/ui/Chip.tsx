import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import * as s from "./Chip.css";

type ChipProps = {
  active?: boolean;
} & AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonHTMLAttributes<HTMLButtonElement>;

export function Chip({ active, href, className, children, ...rest }: ChipProps) {
  const cls = [s.root, active ? s.active : null, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <a className={cls} href={href} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
