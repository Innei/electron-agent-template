import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  padding: 14,
  background: vars.color.bgSurface,
  border: `1px solid ${vars.color.down}`,
  color: vars.color.down,
  borderRadius: vars.radius,
  fontSize: vars.fontSize.md,
});
