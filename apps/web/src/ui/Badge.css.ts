import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.sm,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: vars.color.bgElement,
  color: vars.color.textSecondary,
  borderRadius: vars.radius,
  padding: "1px 6px",
  display: "inline-block",
});

export const tone = styleVariants({
  up: { color: vars.color.up },
  down: { color: vars.color.down },
  accent: { color: vars.color.accent },
  solid: { background: vars.color.down, color: vars.color.bgCanvas },
});
