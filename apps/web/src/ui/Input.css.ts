import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  background: vars.color.bgElement,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.base,
  height: vars.controlH,
  boxSizing: "border-box",
  padding: "0 10px",
  selectors: {
    "&:focus-visible": {
      outline: "none",
      borderColor: vars.focus.border,
      boxShadow: vars.focus.ring,
    },
  },
});
