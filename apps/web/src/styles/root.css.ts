import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./theme.css";

globalStyle("*", {
  boxSizing: "border-box",
});

globalStyle("body", {
  margin: 0,
  fontFamily: vars.font.ui,
  background: vars.color.bgCanvas,
  color: vars.color.textPrimary,
});

globalStyle("a", {
  color: vars.color.textPrimary,
  textDecoration: "none",
});

globalStyle("a:hover", {
  color: vars.color.accent,
});

globalStyle(":focus-visible", {
  outline: vars.focus.outline,
  outlineOffset: "2px",
});
