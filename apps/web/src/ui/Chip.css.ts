import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  fontSize: vars.fontSize.base,
  height: vars.controlH,
  boxSizing: "border-box",
  padding: "0 10px",
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
  color: vars.color.textPrimary,
  cursor: "pointer",
  userSelect: "none",
  background: "transparent",
  display: "inline-flex",
  alignItems: "center",
  textDecoration: "none",
  selectors: {
    "&:hover": {
      borderColor: vars.color.accent,
      color: vars.color.accent,
    },
    "&:focus-visible": {
      outline: "none",
      borderColor: vars.focus.border,
      boxShadow: vars.focus.ring,
    },
  },
});

export const active = style({
  color: vars.color.accent,
  borderColor: vars.color.accent,
});
