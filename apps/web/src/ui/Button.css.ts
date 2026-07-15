import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  background: vars.color.bgElement,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.base,
  height: vars.controlH,
  boxSizing: "border-box",
  padding: "0 14px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  selectors: {
    "&:hover:not([disabled])": {
      borderColor: vars.color.accent,
    },
    "&[disabled]": {
      color: vars.color.textMuted,
      borderColor: vars.color.borderStrong,
      cursor: "default",
    },
    "&:focus-visible": {
      outline: "none",
      borderColor: vars.focus.border,
      boxShadow: vars.focus.ring,
    },
  },
});

export const accent = style({
  color: vars.color.accent,
  borderColor: vars.color.accent,
});

export const state = styleVariants({
  busy: { color: vars.color.textSecondary, cursor: "wait" },
  done: { color: vars.color.up, borderColor: vars.color.up },
  failed: { color: vars.color.accent },
});
