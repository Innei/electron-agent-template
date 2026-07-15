import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const anchor = style({
  display: "inline-flex",
  alignItems: "baseline",
  minWidth: 0,
  maxWidth: "100%",
});

export const positioner = style({
  zIndex: 1000,
});

export const panel = style({
  maxWidth: "min(320px, calc(100vw - 16px))",
  width: "max-content",
  padding: "6px 8px",
  background: "rgba(20, 20, 20, 0.98)",
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.45,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: 0,
  whiteSpace: "pre-line",
  boxShadow: "0 4px 14px rgba(10, 10, 10, 0.5)",
});
