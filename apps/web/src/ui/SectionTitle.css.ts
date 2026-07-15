import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  fontSize: vars.fontSize.sm,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: vars.color.textSecondary,
  fontWeight: 500,
  marginTop: 16,
  marginBottom: 8,
});
