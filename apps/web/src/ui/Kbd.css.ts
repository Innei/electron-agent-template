import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  color: "inherit",
  fontFamily: vars.font.mono,
  fontSize: "inherit",
  fontWeight: 400,
  lineHeight: 1,
  verticalAlign: "-1px",
});

globalStyle(`${root} svg`, {
  width: "1em",
  height: "1em",
  strokeWidth: 1.8,
});
