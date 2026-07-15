import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const fullpage = style({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export const page = style({
  maxWidth: 900,
  margin: "0 auto",
  padding: "24px 20px 60px",
});

globalStyle(`${page} > h1`, {
  fontSize: vars.fontSize.xl,
  fontWeight: 600,
  color: vars.color.textPrimary,
  margin: "0 0 4px",
});

export const noteBlock = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textSecondary,
  marginTop: 6,
  lineHeight: 1.4,
});

export const icon = style({
  verticalAlign: -2,
});
