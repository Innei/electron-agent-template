import type { InputHTMLAttributes } from "react";
import * as s from "./Input.css";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={[s.root, className].filter(Boolean).join(" ")} {...rest} />;
}
