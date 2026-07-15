import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  display: "flex",
  flex: "0 0 auto",
  minHeight: 0,
});

export const content = style({
  flex: "1 1 auto",
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
});

export const handle = style({
  position: "relative",
  zIndex: 2,
  flex: "0 0 8px",
  width: 8,
  minWidth: 8,
  cursor: "col-resize",
  touchAction: "none",
  outline: "none",
  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 3,
      width: 1,
      background: vars.color.border,
      transition: "background-color 120ms ease, box-shadow 120ms ease",
    },
    "&:hover::after": {
      background: vars.color.accent,
      boxShadow: "0 0 0 1px rgba(255, 176, 0, 0.16)",
    },
    "&:focus-visible::after": {
      background: vars.color.accent,
      boxShadow: "0 0 0 1px rgba(255, 176, 0, 0.16)",
    },
    "&[data-dragging]::after": {
      background: vars.color.accent,
      boxShadow: "0 0 0 1px rgba(255, 176, 0, 0.16)",
    },
  },
});
