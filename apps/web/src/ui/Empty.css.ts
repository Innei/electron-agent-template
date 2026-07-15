import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  padding: "40px 0",
  textAlign: "center",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.md,
});
