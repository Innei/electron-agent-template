import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  fontFamily: vars.font.mono,
  fontVariantNumeric: "tabular-nums",
});

export const up = style({
  color: vars.color.up,
});

export const down = style({
  color: vars.color.down,
});
