import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  position: "fixed",
  left: 0,
  bottom: 0,
  zIndex: 90,
  maxWidth: "60vw",
  padding: "3px 10px",
  background: vars.color.bgElement,
  border: `1px solid ${vars.color.border}`,
  borderLeft: "none",
  borderBottom: "none",
  borderTopRightRadius: vars.radius,
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: 11,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  pointerEvents: "none",
  opacity: 0,
  transition: "opacity 120ms ease",
});

export const visible = style({
  opacity: 1,
});
