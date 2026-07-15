import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const trigger = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  height: vars.controlH,
  boxSizing: "border-box",
  padding: "0 9px",
  background: vars.color.bgElement,
  color: vars.color.textSecondary,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
  fontSize: vars.fontSize.base,
  fontVariantNumeric: "tabular-nums",
  cursor: "pointer",
  whiteSpace: "nowrap",
  selectors: {
    "&:hover": {
      color: vars.color.textPrimary,
      background: vars.color.bgHover,
    },
    "&[data-popup-open]": {
      color: vars.color.textPrimary,
      background: vars.color.bgHover,
    },
    "&[disabled]": {
      color: vars.color.textMuted,
      cursor: "default",
      opacity: 0.7,
    },
    "&:focus-visible": {
      outline: "none",
      borderColor: vars.focus.border,
      boxShadow: vars.focus.ring,
    },
  },
});

export const icon = style({
  display: "inline-flex",
  color: vars.color.textSecondary,
});

export const positioner = style({
  zIndex: 60,
});

export const popup = style({
  minWidth: "var(--anchor-width)",
  background: vars.color.bgSurface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  boxShadow: "0 6px 20px rgb(0 0 0 / 0.35)",
  padding: 3,
  maxHeight: "min(320px, var(--available-height))",
  overflowY: "auto",
});

export const item = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  minHeight: 26,
  padding: "4px 8px",
  borderRadius: vars.radius,
  fontSize: vars.fontSize.sm,
  fontVariantNumeric: "tabular-nums",
  color: vars.color.textSecondary,
  cursor: "pointer",
  whiteSpace: "nowrap",
  selectors: {
    "&[data-highlighted]": {
      color: vars.color.textPrimary,
      background: vars.color.bgHover,
    },
    "&[data-selected]": {
      color: vars.color.textPrimary,
    },
    "&:focus-visible": {
      outline: "none",
    },
  },
});

export const itemCheck = style({
  display: "inline-flex",
  color: vars.color.accent,
});
