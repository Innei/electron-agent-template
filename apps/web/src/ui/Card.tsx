import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import * as s from "./Card.css";

type CardProps = {
  link?: boolean;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function Card({ link, href, className, children, ...rest }: CardProps) {
  const cls = [s.root, link || href ? s.link : null, className].filter(Boolean).join(" ");

  if (link || href) {
    return (
      <a className={cls} href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <div className={cls} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {children}
    </div>
  );
}
